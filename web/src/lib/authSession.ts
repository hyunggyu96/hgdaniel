import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, parseCookieHeader, verifySessionToken } from './auth';
import { supabaseAdmin } from './supabaseAdmin';

export type AuthUser = {
    id: string;
    username: string;
};

async function getUserFromSessionToken(token?: string | null): Promise<AuthUser | null> {
    const payload = verifySessionToken(token);
    if (!payload) return null;

    const { data, error } = await supabaseAdmin
        .from('accounts')
        .select('id, username')
        .eq('id', payload.uid)
        .eq('username', payload.un)
        .maybeSingle();

    if (error || !data) return null;
    return { id: data.id, username: data.username };
}

export async function getAuthUserFromCookieHeader(cookieHeader?: string | null) {
    const cookies = parseCookieHeader(cookieHeader);
    return getUserFromSessionToken(cookies[SESSION_COOKIE_NAME]);
}

export async function getAuthUserFromNextRequest(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
    return getUserFromSessionToken(token);
}
