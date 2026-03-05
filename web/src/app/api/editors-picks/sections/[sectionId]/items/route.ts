import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromNextRequest } from '@/lib/authSession';
import { requireAdmin } from '@/lib/adminGuard';

export async function POST(request: NextRequest, { params }: { params: { sectionId: string } }) {
    const user = await getAuthUserFromNextRequest(request);
    const denied = requireAdmin(user);
    if (denied) return denied;

    const sectionId = parseInt(params.sectionId);
    if (isNaN(sectionId)) {
        return NextResponse.json({ error: 'Invalid section ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const articleLink = String(body?.article_link || '').trim();
        if (!articleLink) {
            return NextResponse.json({ error: 'article_link is required' }, { status: 400 });
        }

        // Check section exists
        const { data: section } = await supabaseAdmin
            .from('editors_picks_sections')
            .select('id')
            .eq('id', sectionId)
            .single();

        if (!section) {
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }

        // Check max 5 items per section
        const { count } = await supabaseAdmin
            .from('editors_picks_items')
            .select('*', { count: 'exact', head: true })
            .eq('section_id', sectionId);

        if ((count || 0) >= 5) {
            return NextResponse.json({ error: 'Maximum 5 articles per section' }, { status: 400 });
        }

        const displayOrder = (count || 0);

        const { data, error } = await supabaseAdmin
            .from('editors_picks_items')
            .upsert(
                { section_id: sectionId, article_link: articleLink, display_order: displayOrder },
                { onConflict: 'section_id,article_link' }
            )
            .select('*')
            .single();

        if (error) {
            console.error('[editors-picks] add item error:', error);
            return NextResponse.json({ error: 'Failed to add article' }, { status: 500 });
        }

        return NextResponse.json({ item: data }, { status: 201 });
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

    try {
        const body = await request.json();
        const articleLink = String(body?.article_link || '').trim();
        if (!articleLink) {
            return NextResponse.json({ error: 'article_link is required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('editors_picks_items')
            .delete()
            .eq('section_id', sectionId)
            .eq('article_link', articleLink);

        if (error) {
            console.error('[editors-picks] delete item error:', error);
            return NextResponse.json({ error: 'Failed to remove article' }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

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
        const items: { article_link: string; display_order: number }[] = body?.items;
        if (!Array.isArray(items)) {
            return NextResponse.json({ error: 'items array is required' }, { status: 400 });
        }

        // Update each item's display_order
        for (const item of items) {
            await supabaseAdmin
                .from('editors_picks_items')
                .update({ display_order: item.display_order })
                .eq('section_id', sectionId)
                .eq('article_link', item.article_link);
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
