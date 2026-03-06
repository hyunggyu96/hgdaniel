import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    buildSessionCookie,
    createSessionToken,
    hashPassword,
    validatePassword,
    validateUsername,
} from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed, retryAfterMs } = await rateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
            );
        }

        const body = await request.json();
        const usernameRaw = String(body?.username || '');
        const password = String(body?.password || '');

        const usernameCheck = validateUsername(usernameRaw);
        if (!usernameCheck.ok) {
            return NextResponse.json({ error: usernameCheck.reason }, { status: 400 });
        }
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.ok) {
            return NextResponse.json({ error: passwordCheck.reason }, { status: 400 });
        }

        const username = usernameCheck.username;
        const { data: existing } = await supabaseAdmin
            .from('accounts')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);
        const { data, error } = await supabaseAdmin
            .from('accounts')
            .insert({
                username,
                password_hash: passwordHash,
            })
            .select('*')
            .single();

        if (error || !data) {
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
        }

        const token = createSessionToken(data.id, data.username, data.session_version ?? 0);
        const response = NextResponse.json({
            user: { id: data.id, username: data.username, tier: data.tier || 'free', isAdmin: !!data.is_admin },
        });
        response.headers.set('Set-Cookie', buildSessionCookie(token));
        return response;
    } catch (error) {
        console.error('[auth/register] error', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
