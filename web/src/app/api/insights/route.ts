import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function sanitizeSearchQuery(input: string): string {
    return input.replace(/[%_\\]/g, '\\$&').slice(0, 200);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
    const keyword = searchParams.get('keyword') || '';
    const query = searchParams.get('query') || '';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const supabase = createClient(supabaseUrl, supabaseKey);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = supabase
        .from('pubmed_papers')
        .select('*', { count: 'exact' })
        .order('publication_date', { ascending: false })
        .range(from, to);

    if (keyword) {
        dbQuery = dbQuery.contains('keywords', [keyword]);
    }

    if (query) {
        const sanitized = sanitizeSearchQuery(query);
        dbQuery = dbQuery.or(`title.ilike.%${sanitized}%,abstract.ilike.%${sanitized}%`);
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
