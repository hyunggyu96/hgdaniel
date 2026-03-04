import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { Tier } from '@/lib/authSession';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';
const VALID_TIERS: Tier[] = ['free', 'pro', 'enterprise'];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, tier, secret } = body;

        if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
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
            return NextResponse.json({ error: error?.message || 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ ok: true, user: data });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
