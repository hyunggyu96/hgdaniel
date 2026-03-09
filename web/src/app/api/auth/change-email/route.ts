import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromNextRequest } from '@/lib/authSession';
import { verifyPassword } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

function getRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!url || !token) return null;
    return new Redis({ url, token });
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed, retryAfterMs } = await rateLimit(`change-email:${ip}`, { maxRequests: 5, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
            );
        }

        const user = await getAuthUserFromNextRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const password = String(body?.password || '');
        const newEmail = String(body?.newEmail || '').trim().toLowerCase();
        const emailCode = String(body?.emailCode || '').trim();

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
        }

        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
        }

        // Verify email code via Redis
        const redis = getRedis();
        if (redis) {
            if (!emailCode) {
                return NextResponse.json({ error: 'Email verification code is required' }, { status: 400 });
            }
            const redisKey = `email-verify:${newEmail}`;
            const storedCode = await redis.get<string>(redisKey);
            if (!storedCode || storedCode !== emailCode) {
                return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
            }
            await redis.del(redisKey);
        }

        // Fetch stored password hash
        const { data: account } = await supabaseAdmin
            .from('accounts')
            .select('id, password_hash')
            .eq('id', user.id)
            .single();

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Verify password
        const valid = await verifyPassword(password, account.password_hash);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
        }

        // Check email uniqueness
        const { data: existingEmail } = await supabaseAdmin
            .from('accounts')
            .select('id')
            .eq('email', newEmail)
            .neq('id', user.id)
            .maybeSingle();

        if (existingEmail) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }

        // Update email
        const { error: updateError } = await supabaseAdmin
            .from('accounts')
            .update({ email: newEmail })
            .eq('id', user.id);

        if (updateError) {
            console.error('[auth/change-email] update error:', updateError);
            return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[auth/change-email] error', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
