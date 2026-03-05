import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    buildSessionCookie,
    createSessionToken,
    normalizeUsername,
    verifyPassword,
} from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const { allowed, retryAfterMs } = rateLimit(`login:${ip}`, { maxRequests: 10, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many login attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
            );
        }

        const body = await request.json();
        const username = normalizeUsername(String(body?.username || ''));
        const password = String(body?.password || '');

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('accounts')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (error || !data) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const ok = await verifyPassword(password, data.password_hash);
        if (!ok) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Increment session_version to invalidate all previous sessions (single-session enforcement)
        const newVersion = (data.session_version ?? 0) + 1;
        await supabaseAdmin
            .from('accounts')
            .update({ session_version: newVersion })
            .eq('id', data.id);

        const token = createSessionToken(data.id, data.username, newVersion);
        const response = NextResponse.json({
            user: { id: data.id, username: data.username, tier: data.tier || 'free', isAdmin: !!data.is_admin },
        });
        response.headers.set('Set-Cookie', buildSessionCookie(token));
        return response;
    } catch (error) {
        console.error('[auth/login] error', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
