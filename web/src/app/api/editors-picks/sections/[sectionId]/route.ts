import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromNextRequest } from '@/lib/authSession';
import { requireAdmin } from '@/lib/adminGuard';

export async function PUT(request: NextRequest, { params }: { params: { sectionId: string } }) {
    const user = await getAuthUserFromNextRequest(request);
    const denied = requireAdmin(user);
    if (denied) return denied;

    const sectionId = parseInt(params.sectionId);
    if (isNaN(sectionId)) {
        return NextResponse.json({ error: 'Invalid section ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const updates: Record<string, any> = {};

        if (body.name !== undefined) {
            const name = String(body.name).trim();
            if (!name) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 });
            updates.name = name;
        }
        if (body.color !== undefined) {
            updates.color = String(body.color);
        }
        if (body.display_order !== undefined) {
            updates.display_order = parseInt(body.display_order);
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('editors_picks_sections')
            .update(updates)
            .eq('id', sectionId)
            .select('*')
            .single();

        if (error || !data) {
            console.error('[editors-picks] update section error:', error);
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }

        return NextResponse.json({ section: data });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { sectionId: string } }) {
    const user = await getAuthUserFromNextRequest(request);
    const denied = requireAdmin(user);
    if (denied) return denied;

    const sectionId = parseInt(params.sectionId);
    if (isNaN(sectionId)) {
        return NextResponse.json({ error: 'Invalid section ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('editors_picks_sections')
        .delete()
        .eq('id', sectionId);

    if (error) {
        console.error('[editors-picks] delete section error:', error);
        return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
