import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));
    const companyId = searchParams.get('company_id');
    const companyName = searchParams.get('company_name');
    const status = searchParams.get('status') || 'all';
    const query = searchParams.get('query') || '';
    const ingredientType = searchParams.get('ingredient_type') || '';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = supabase
        .from('nedrug_products')
        .select('*', { count: 'exact' })
        .order('permit_date', { ascending: false })
        .range(from, to);

    if (companyId) {
        dbQuery = dbQuery.eq('company_id', parseInt(companyId));
    }
    if (companyName) {
        dbQuery = dbQuery.ilike('company_name', `%${companyName}%`);
    }
    if (status === 'active') {
        dbQuery = dbQuery.eq('status', 'active');
    } else if (status === 'cancelled') {
        dbQuery = dbQuery.eq('status', 'cancelled');
    }
    if (ingredientType) {
        dbQuery = dbQuery.eq('ingredient_type', ingredientType);
    }
    if (query) {
        const sanitized = query.replace(/[%_\\]/g, '\\$&').slice(0, 200);
        dbQuery = dbQuery.or(
            `item_name.ilike.%${sanitized}%,item_eng_name.ilike.%${sanitized}%,company_name.ilike.%${sanitized}%,export_names.ilike.%${sanitized}%,ingredient.ilike.%${sanitized}%`
        );
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
            totalPages: count ? Math.ceil(count / limit) : 0,
        },
    });
}
