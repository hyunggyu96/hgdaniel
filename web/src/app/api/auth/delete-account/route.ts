import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromNextRequest } from '@/lib/authSession';
import { buildClearSessionCookie, verifyPassword } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed, retryAfterMs } = await rateLimit(`delete-account:${ip}`, { maxRequests: 5, windowMs: 60_000 });
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

        if (!password) {
            return NextResponse.json({ error: 'Password is required' }, { status: 400 });
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

        // Delete account
        const { error: deleteError } = await supabaseAdmin
            .from('accounts')
            .delete()
            .eq('id', user.id);

        if (deleteError) {
            console.error('[auth/delete-account] delete error:', deleteError);
            return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
        }

        // Clear session cookie
        const response = NextResponse.json({ ok: true });
        response.headers.set('Set-Cookie', buildClearSessionCookie());
        return response;
    } catch (error) {
        console.error('[auth/delete-account] error', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
