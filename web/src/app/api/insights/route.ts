import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const keyword = searchParams.get('keyword') || '';
    const query = searchParams.get('query') || ''; // General search query

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = supabase
        .from('pubmed_papers')
        .select('*', { count: 'exact' })
        .order('publication_date', { ascending: false })
        .range(from, to);

    if (keyword) {
        // Filter by tagged keyword (array contains)
        // dbQuery = dbQuery.contains('keywords', [keyword]); 
        // Note: 'keywords' column is text[]. .contains is correct.
        // But for broader search, user might want title search.
        dbQuery = dbQuery.contains('keywords', [keyword]);
    }

    if (query) {
        // Simple text search on title or abstract
        dbQuery = dbQuery.or(`title.ilike.%${query}%,abstract.ilike.%${query}%`);
    }

    const { data, error, count } = await dbQuery;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: count ? Math.ceil(count / limit) : 0
        }
    });
}
