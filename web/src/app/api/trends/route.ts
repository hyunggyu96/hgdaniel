
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
        // 최근 7일 이내의 데이터만 가져오기 (과부하 방지)
        const rangeDays = 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - rangeDays);
        const startDateStr = startDate.toISOString();

        const { data: articles, error } = await supabase
            .from('articles')
            .select('keyword, published_at')
            .gte('published_at', startDateStr)
            .order('published_at', { ascending: true })
            .limit(3000);

        if (error) throw error;

        const trendMap: Record<string, any> = {};

        articles?.forEach((item) => {
            // KST 날짜 변환 (YYYY-MM-DD 형식 추출)
            const d = new Date(item.published_at);
            d.setHours(d.getHours() + 9);
            const date = d.toISOString().split('T')[0];

            const keyword = (item.keyword || '기타').trim();

            if (!trendMap[date]) {
                trendMap[date] = { date };
            }

            if (!trendMap[date][keyword]) {
                trendMap[date][keyword] = 0;
            }
            trendMap[date][keyword] += 1;
        });

        // 카테고리별 전체 언급 횟수 계산 및 정렬 (가장 많이 언급된 순서로)
        const keywordCounts: Record<string, number> = {};
        articles?.forEach(item => {
            const k = (item.keyword || '기타').trim();
            keywordCounts[k] = (keywordCounts[k] || 0) + 1;
        });

        const allKeywords = Object.keys(keywordCounts).sort((a, b) => keywordCounts[b] - keywordCounts[a]);

        // 7일치 날짜를 모두 생성하여 빈 데이터(0) 채우기
        const trendData: any[] = [];

        // 오늘 날짜(KST) 구하기
        const nowKst = new Date();
        nowKst.setHours(nowKst.getHours() + 9);

        for (let i = rangeDays - 1; i >= 0; i--) {
            const d = new Date(nowKst);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const dayData = trendMap[dateStr] || { date: dateStr };
            allKeywords.forEach(k => {
                if (!dayData[k]) dayData[k] = 0;
            });
            trendData.push(dayData);
        }

        return NextResponse.json({ data: trendData, categories: allKeywords });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
