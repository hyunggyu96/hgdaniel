import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed } = await rateLimit(`check-username:${ip}`, { maxRequests: 20, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const username = String(body?.username || '').trim().toLowerCase();

        if (!username || !/^[a-z0-9._-]{3,32}$/.test(username)) {
            return NextResponse.json({ available: false, error: 'Invalid username format' }, { status: 400 });
        }

        const { data: existing } = await supabaseAdmin
            .from('accounts')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        return NextResponse.json({ available: !existing });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
