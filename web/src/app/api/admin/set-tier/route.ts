import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Tier } from '@/lib/authSession';

const VALID_TIERS: Tier[] = ['free', 'pro', 'enterprise'];

export async function POST(request: NextRequest) {
    try {
        const adminSecret = process.env.ADMIN_SECRET;
        if (!adminSecret) {
            console.error('[admin/set-tier] ADMIN_SECRET env var is not configured');
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { username, tier, secret } = body;

        if (!secret || secret !== adminSecret) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (!username || !VALID_TIERS.includes(tier)) {
            return NextResponse.json({ error: 'Invalid input. Provide username and tier (free/pro/enterprise)' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('accounts')
            .update({ tier })
            .eq('username', username)
            .select('id, username, tier')
            .single();

        if (error || !data) {
            console.error('[admin/set-tier] Error:', error);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ ok: true, user: data });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
