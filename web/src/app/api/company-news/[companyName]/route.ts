import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // No cache for real-time news

export async function GET(
    request: Request,
    { params }: { params: { companyName: string } }
) {
    const companyName = decodeURIComponent(params.companyName);

    // Supabase Client Setup
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Query 'articles' table
        // Filter: Title or content contains companyName
        // Exclude: NOISE
        // Order: Newest first
        // Limit: 10
        const { data, error } = await supabase
            .from('articles')
            .select('title, published_at, link, id')  // Select specific fields needed
            .neq('category', 'NOISE')
            .or(`title.ilike.%${companyName}%,description.ilike.%${companyName}%`) // Search in title OR description
            .order('published_at', { ascending: false })
            .limit(10);

        if (error) {
            console.error('[API/company-news] Supabase Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
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
