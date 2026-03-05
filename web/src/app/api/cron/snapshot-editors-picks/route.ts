import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
    // Verify Vercel Cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch current editor's picks sections
    const { data: sections } = await supabaseAdmin
        .from('editors_picks_sections')
        .select('*')
        .order('display_order', { ascending: true });

    if (!sections || sections.length === 0) {
        return NextResponse.json({ message: 'No sections to snapshot' });
    }

    const sectionIds = sections.map((s: any) => s.id);

    const { data: items } = await supabaseAdmin
        .from('editors_picks_items')
        .select('*')
        .in('section_id', sectionIds)
        .order('display_order', { ascending: true });

    // Collect article metadata
    const articleLinks = Array.from(new Set((items || []).map((i: any) => i.article_link)));
    let articlesMap: Record<string, any> = {};
    if (articleLinks.length > 0) {
        const { data: articles } = await supabaseAdmin
            .from('articles')
            .select('title, description, published_at, link, source')
            .in('link', articleLinks);
        if (articles) {
            for (const a of articles) articlesMap[a.link] = a;
        }
    }

    // Build snapshot payload
    const snapshotData = sections.map((sec: any) => ({
        name: sec.name,
        color: sec.color,
        items: (items || [])
            .filter((i: any) => i.section_id === sec.id)
            .map((i: any) => ({
                article_link: i.article_link,
                display_order: i.display_order,
                article: articlesMap[i.article_link] || null,
            })),
    }));

    // Today in KST (UTC+9)
    const kstDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

    // Upsert: one snapshot per day, overwrite if re-run
    const { error } = await supabaseAdmin
        .from('editors_picks_snapshots')
        .upsert(
            { snapshot_date: kstDate, snapshot_data: snapshotData },
            { onConflict: 'snapshot_date' }
        );

    if (error) {
        console.error('[cron/snapshot-editors-picks] error:', error);
        return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Snapshot saved', date: kstDate });
}
