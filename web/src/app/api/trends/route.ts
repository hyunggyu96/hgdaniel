
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// supabase client (server-side)
// supabase client (server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey || 'placeholder_key'
);

export async function GET() {
    try {
        // 최근 30일 데이터 가져오기 (날짜 내림차순)
        const { data: articles, error } = await supabase
            .from('articles')
            .select('keyword, published_at')
            .order('published_at', { ascending: true });

        if (error) throw error;

        // 데이터 가공: 날짜별 + 키워드별 카운트
        // 결과 형식: [{ date: '2025-12-01', '필러': 2, '톡신': 5 }, ...]
        const trendMap: Record<string, any> = {};
        const keywordsSet = new Set<string>();

        articles?.forEach((item) => {
            // 날짜 포맷 (YYYY-MM-DD)
            const date = new Date(item.published_at).toISOString().split('T')[0];
            const keyword = item.keyword || '기타';

            keywordsSet.add(keyword);

            if (!trendMap[date]) {
                trendMap[date] = { date };
            }

            if (!trendMap[date][keyword]) {
                trendMap[date][keyword] = 0;
            }
            trendMap[date][keyword] += 1;
        });

        // 배열로 변환 및 정렬
        const trendData = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

        // 빈 날짜나 키워드 채우기 (0으로)
        const allKeywords = Array.from(keywordsSet);
        trendData.forEach(day => {
            allKeywords.forEach(k => {
                if (!day[k]) day[k] = 0;
            });
        });

        return NextResponse.json({ data: trendData, categories: allKeywords });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
