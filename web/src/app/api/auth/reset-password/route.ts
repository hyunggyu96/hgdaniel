import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword, validatePassword } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const RESET_KEY_PREFIX = 'pw-reset:';
const ATTEMPTS_KEY_PREFIX = 'pw-reset-attempts:';
const MAX_ATTEMPTS = 5;

function getRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!url || !token) return null;
    return new Redis({ url, token });
}

function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a, 'utf-8'), Buffer.from(b, 'utf-8'));
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed } = await rateLimit(`reset-password:${ip}`, { maxRequests: 5, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const body = await request.json();
        const identifier = String(body?.identifier || '').trim().toLowerCase();
        const code = String(body?.code || '').trim().toUpperCase();
        const newPassword = String(body?.newPassword || '');

        if (!identifier || !code || !newPassword) {
            return NextResponse.json({ error: 'Identifier, code, and new password are required' }, { status: 400 });
        }

        const redis = getRedis();
        if (!redis) {
            return NextResponse.json({ error: 'Recovery service is not configured' }, { status: 503 });
        }

        // Look up account by username or email
        const isEmail = identifier.includes('@');
        const { data: account } = await supabaseAdmin
            .from('accounts')
            .select('id, email, session_version')
            .eq(isEmail ? 'email' : 'username', identifier)
            .maybeSingle();

        if (!account || !account.email) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        const redisKey = `${RESET_KEY_PREFIX}${account.email}`;
        const attemptsKey = `${ATTEMPTS_KEY_PREFIX}${account.email}`;

        // Check per-account attempt lockout
        const attempts = await redis.get<number>(attemptsKey) || 0;
        if (attempts >= MAX_ATTEMPTS) {
            // Too many failed attempts — delete the code entirely
            await redis.del(redisKey);
            await redis.del(attemptsKey);
            return NextResponse.json(
                { error: 'Too many failed attempts. Please request a new code.' },
                { status: 400 },
            );
        }

        // Verify code
        const storedCode = await redis.get<string>(redisKey);
        if (!storedCode || !safeCompare(storedCode, code)) {
            // Increment failed attempts counter (TTL matches code TTL)
            await redis.incr(attemptsKey);
            await redis.expire(attemptsKey, 300);
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        // Delete code BEFORE password update to prevent replay
        await redis.del(redisKey);
        await redis.del(attemptsKey);

        // Validate new password
        const pwCheck = validatePassword(newPassword);
        if (!pwCheck.ok) {
            return NextResponse.json({ error: pwCheck.reason }, { status: 400 });
        }

        // Hash and update password, increment session_version
        const newHash = await hashPassword(newPassword);
        const newVersion = (account.session_version ?? 0) + 1;

        const { error: updateError } = await supabaseAdmin
            .from('accounts')
            .update({ password_hash: newHash, session_version: newVersion })
            .eq('id', account.id);

        if (updateError) {
            console.error('[auth/reset-password] update error:', updateError);
            return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[auth/reset-password] error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
