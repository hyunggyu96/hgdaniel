import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromNextRequest } from '@/lib/authSession';
import { buildSessionCookie, createSessionToken, hashPassword, validatePassword, verifyPassword } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed, retryAfterMs } = await rateLimit(`change-password:${ip}`, { maxRequests: 5, windowMs: 60_000 });
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
        const currentPassword = String(body?.currentPassword || '');
        const newPassword = String(body?.newPassword || '');

        if (!currentPassword) {
            return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
        }

        const passwordCheck = validatePassword(newPassword);
        if (!passwordCheck.ok) {
            return NextResponse.json({ error: passwordCheck.reason }, { status: 400 });
        }

        // Fetch stored password hash and session_version
        const { data: account } = await supabaseAdmin
            .from('accounts')
            .select('id, username, password_hash, session_version')
            .eq('id', user.id)
            .single();

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        // Verify current password
        const valid = await verifyPassword(currentPassword, account.password_hash);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
        }

        // Hash new password and increment session_version
        const newHash = await hashPassword(newPassword);
        const newVersion = (account.session_version ?? 0) + 1;

        const { error: updateError } = await supabaseAdmin
            .from('accounts')
            .update({ password_hash: newHash, session_version: newVersion })
            .eq('id', user.id);

        if (updateError) {
            console.error('[auth/change-password] update error:', updateError);
            return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
        }

        // Issue new session token so the current session stays alive
        const token = createSessionToken(account.id, account.username, newVersion);
        const response = NextResponse.json({ ok: true });
        response.headers.set('Set-Cookie', buildSessionCookie(token));
        return response;
    } catch (error) {
        console.error('[auth/change-password] error', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
