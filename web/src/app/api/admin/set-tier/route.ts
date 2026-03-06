import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromNextRequest } from '@/lib/authSession';
import { requireAdmin } from '@/lib/adminGuard';
import { rateLimit, getClientIp } from '@/lib/rateLimit';
import type { Tier } from '@/lib/authSession';

const VALID_TIERS: Tier[] = ['free', 'pro', 'enterprise'];

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed, retryAfterMs } = rateLimit(`admin:${ip}`, { maxRequests: 10, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
            );
        }

        const user = await getAuthUserFromNextRequest(request);
        const denied = requireAdmin(user);
        if (denied) return denied;

        const body = await request.json();
        const { username, tier } = body;

        if (!username || !VALID_TIERS.includes(tier)) {
            return NextResponse.json({ error: 'Invalid input. Provide username and tier (free/pro/enterprise)' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('accounts')
            .update({ tier })
            .eq('username', username)
            .select('id, username, tier')
            .maybeSingle();

        if (error || !data) {
            console.error('[admin/set-tier] Error:', error);
            return NextResponse.json({ error: 'Operation failed' }, { status: 400 });
        }

        return NextResponse.json({ ok: true, user: data });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
