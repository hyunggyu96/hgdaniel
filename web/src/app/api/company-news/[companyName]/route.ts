import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function sanitizeFilterValue(input: string): string {
    return input.replace(/[%_\\(),."']/g, '').slice(0, 100);
}

export async function GET(
    request: Request,
    { params }: { params: { companyName: string } }
) {
    const companyName = sanitizeFilterValue(decodeURIComponent(params.companyName));

    if (!companyName) {
        return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('articles')
            .select('title, published_at, link, id')
            .neq('category', 'NOISE')
            .or(`title.ilike.%${companyName}%,description.ilike.%${companyName}%`)
            .order('published_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('[API/company-news] Supabase Error:', error);
            return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
        }

        // Map to expected format for Analysis Page
        const headlines = (data || []).map(article => ({
            title: article.title,
            date: article.published_at,
            link: article.link, // Assuming source_url is the link
            id: article.id
        }));

        return NextResponse.json({
            headlines,
            total: headlines.length,
            company: companyName
        });

    } catch (error) {
        console.error('[API/company-news] Internal Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
