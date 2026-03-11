import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromNextRequest } from '@/lib/authSession';
import { requireAdmin } from '@/lib/adminGuard';

export async function GET() {
    const { data: sections, error: secErr } = await supabaseAdmin
        .from('editors_picks_sections')
        .select('*')
        .order('display_order', { ascending: true });

    if (secErr) {
        console.error('[editors-picks] sections error:', secErr);
        return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
    }

    if (!sections || sections.length === 0) {
        return NextResponse.json({ sections: [] });
    }

    const sectionIds = sections.map((s: any) => s.id);

    const { data: items, error: itemErr } = await supabaseAdmin
        .from('editors_picks_items')
        .select('*')
        .in('section_id', sectionIds)
        .order('display_order', { ascending: true });

    if (itemErr) {
        console.error('[editors-picks] items error:', itemErr);
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }

    // Collect all unique article links
    const articleLinks = Array.from(new Set((items || []).map((i: any) => i.article_link)));

    let articlesMap: Record<string, any> = {};
    if (articleLinks.length > 0) {
        const { data: articles } = await supabaseAdmin
            .from('articles')
            .select('title, description, published_at, link, source')
            .in('link', articleLinks);

        if (articles) {
            for (const a of articles) {
                articlesMap[a.link] = a;
            }
        }
    }

    // Join in-memory
    const result = sections.map((sec: any) => ({
        id: sec.id,
        name: sec.name,
        color: sec.color,
        display_order: sec.display_order,
        items: (items || [])
            .filter((i: any) => i.section_id === sec.id)
            .map((i: any) => ({
                id: i.id,
                article_link: i.article_link,
                display_order: i.display_order,
                article: articlesMap[i.article_link] || null,
            })),
    }));

    return NextResponse.json({ sections: result }, {
        headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
}

export async function POST(request: NextRequest) {
    const user = await getAuthUserFromNextRequest(request);
    const denied = requireAdmin(user);
    if (denied) return denied;

    try {
        const body = await request.json();
        const name = String(body?.name || '').trim();
        if (!name) {
            return NextResponse.json({ error: 'Section name is required' }, { status: 400 });
        }

        // Check max 3 sections
        const { count } = await supabaseAdmin
            .from('editors_picks_sections')
            .select('*', { count: 'exact', head: true });

        if ((count || 0) >= 3) {
            return NextResponse.json({ error: 'Maximum 3 sections allowed' }, { status: 400 });
        }

        const color = String(body?.color || '#1e3a5f');
        const displayOrder = (count || 0);

        const { data, error } = await supabaseAdmin
            .from('editors_picks_sections')
            .insert({ name, color, display_order: displayOrder })
            .select('*')
            .single();

        if (error) {
            console.error('[editors-picks] create section error:', error);
            return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
        }

        return NextResponse.json({ section: data }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
