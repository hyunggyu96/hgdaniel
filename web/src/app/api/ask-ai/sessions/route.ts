import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromCookieHeader } from '@/lib/authSession';

export async function POST(request: Request) {
    try {
        const user = await getAuthUserFromCookieHeader(request.headers.get('cookie'));
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('ask_ai_sessions')
            .insert({ user_id: user.id })
            .select('id, created_at')
            .single();

        if (error) {
            console.error('[sessions] Create error:', error);
            return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
        }

        return NextResponse.json({ session_id: data.id, created_at: data.created_at });
    } catch (err: any) {
        console.error('[sessions] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const user = await getAuthUserFromCookieHeader(request.headers.get('cookie'));
        if (!user) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'session_id required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('ask_ai_sessions')
            .delete()
            .eq('id', sessionId)
            .eq('user_id', user.id);

        if (error) {
            console.error('[sessions] Delete error:', error);
            return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('[sessions] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
