import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
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
        const { allowed } = await rateLimit(`verify-code:${ip}`, { maxRequests: 10, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
        }

        const body = await request.json();
        const identifier = String(body?.identifier || '').trim().toLowerCase();
        const code = String(body?.code || '').trim().toUpperCase();

        if (!identifier || !code) {
            return NextResponse.json({ error: 'Identifier and code are required' }, { status: 400 });
        }

        const redis = getRedis();
        if (!redis) {
            return NextResponse.json({ error: 'Recovery service is not configured' }, { status: 503 });
        }

        const isEmail = identifier.includes('@');
        const { data: account } = await supabaseAdmin
            .from('accounts')
            .select('id, email')
            .eq(isEmail ? 'email' : 'username', identifier)
            .maybeSingle();

        if (!account || !account.email) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        const redisKey = `${RESET_KEY_PREFIX}${account.email}`;
        const attemptsKey = `${ATTEMPTS_KEY_PREFIX}${account.email}`;

        const attempts = await redis.get<number>(attemptsKey) || 0;
        if (attempts >= MAX_ATTEMPTS) {
            await redis.del(redisKey);
            await redis.del(attemptsKey);
            return NextResponse.json({ error: 'Too many failed attempts. Please request a new code.' }, { status: 400 });
        }

        const storedCode = await redis.get<string>(redisKey);
        if (!storedCode || !safeCompare(storedCode, code)) {
            await redis.incr(attemptsKey);
            await redis.expire(attemptsKey, 300);
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        // Code is valid — do NOT delete it (reset-password will delete it)
        // Update most recent recovery log: code_verified = true
        const { error: logErr } = await supabaseAdmin
            .from('recovery_logs')
            .update({ code_verified: true, updated_at: new Date().toISOString() })
            .eq('account_id', account.id)
            .eq('code_verified', false)
            .order('created_at', { ascending: false })
            .limit(1);
        if (logErr) console.error('[auth/verify-code] log error:', logErr);

        return NextResponse.json({ valid: true });
    } catch (error) {
        console.error('[auth/verify-code] error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
