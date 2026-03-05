import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, parseCookieHeader, verifySessionToken } from './auth';
import { supabaseAdmin } from './supabaseAdmin';

export type Tier = 'free' | 'pro' | 'enterprise';

export type AuthUser = {
    id: string;
    username: string;
    tier: Tier;
    isAdmin: boolean;
};

async function getUserFromSessionToken(token?: string | null): Promise<AuthUser | null> {
    const payload = verifySessionToken(token);
    if (!payload) return null;

    // TODO: After running 20260305000000_editors_picks.sql migration,
    // change to .select('id, username, tier, is_admin') to avoid loading password_hash
    const { data, error } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .eq('id', payload.uid)
        .eq('username', payload.un)
        .maybeSingle();

    if (error || !data) return null;

    // Verify session_version matches — if the user logged in elsewhere, previous sessions are invalidated
    const dbVersion = data.session_version ?? 0;
    const tokenVersion = payload.sv ?? 0;
    if (tokenVersion !== dbVersion) return null;

    return { id: data.id, username: data.username, tier: data.tier || 'free', isAdmin: !!data.is_admin };
}

export async function getAuthUserFromCookieHeader(cookieHeader?: string | null) {
    const cookies = parseCookieHeader(cookieHeader);
    return getUserFromSessionToken(cookies[SESSION_COOKIE_NAME]);
}

export async function getAuthUserFromNextRequest(request: NextRequest) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value || null;
    return getUserFromSessionToken(token);
}
