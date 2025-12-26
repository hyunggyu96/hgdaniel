
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
        // 최근 30일 이내의 데이터만 가져오기
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

        const { data: articles, error } = await supabase
            .from('articles')
            .select('keyword, published_at')
            .gte('published_at', thirtyDaysAgoStr)
            .order('published_at', { ascending: true })
            .limit(5000); // 1000개 제한 해제 (최대 5000개까지 확장)

        if (error) throw error;

        const trendMap: Record<string, any> = {};
        const keywordsSet = new Set<string>();

        articles?.forEach((item) => {
            // KST 날짜 변환 (YYYY-MM-DD 형식 추출)
            const d = new Date(item.published_at);
            d.setHours(d.getHours() + 9);
            const date = d.toISOString().split('T')[0];

            const keyword = (item.keyword || '기타').trim();
            if (keyword) keywordsSet.add(keyword);

            if (!trendMap[date]) {
                trendMap[date] = { date };
            }

            if (!trendMap[date][keyword]) {
                trendMap[date][keyword] = 0;
            }
            trendMap[date][keyword] += 1;
        });

        // 30일치 날짜를 모두 생성하여 빈 데이터(0) 채우기
        const trendData: any[] = [];
        const allKeywords = Array.from(keywordsSet);

        // 오늘 날짜(KST) 구하기
        const nowKst = new Date();
        nowKst.setHours(nowKst.getHours() + 9);

        for (let i = 29; i >= 0; i--) {
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
