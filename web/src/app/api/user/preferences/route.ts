import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromNextRequest } from '@/lib/authSession';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUserFromNextRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { data } = await supabaseAdmin
            .from('accounts')
            .select('preferences')
            .eq('id', user.id)
            .single();

        return NextResponse.json({ preferences: data?.preferences || {} });
    } catch (error) {
        console.error('[user/preferences] GET error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthUserFromNextRequest(request);
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();
        const updates = body?.preferences;
        if (!updates || typeof updates !== 'object') {
            return NextResponse.json({ error: 'Invalid preferences' }, { status: 400 });
        }

        // Fetch current preferences and merge
        const { data: current } = await supabaseAdmin
            .from('accounts')
            .select('preferences')
            .eq('id', user.id)
            .single();

        const merged = { ...(current?.preferences || {}), ...updates };

        const { error: updateError } = await supabaseAdmin
            .from('accounts')
            .update({ preferences: merged })
            .eq('id', user.id);

        if (updateError) {
            console.error('[user/preferences] update error:', updateError);
            return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
        }

        return NextResponse.json({ ok: true, preferences: merged });
    } catch (error) {
        console.error('[user/preferences] PUT error', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
