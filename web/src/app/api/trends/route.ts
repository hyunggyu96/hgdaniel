import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { CATEGORIES_CONFIG } from '@/lib/constants';

// Trends API: 실시간 반영을 위해 캐싱 제거
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey || 'placeholder_key'
);

export async function GET() {
    try {
        const rangeDays = 7;
        const now = new Date();

        // 정확히 7일 전부터 조회 (KST 기준, 하루 여유 추가)
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - rangeDays - 1);
        const startDateStr = startDate.toISOString();

        // DB에서 category 포함하여 조회 (최신순 정렬)
        const { data: articles, error } = await supabase
            .from('articles')
            .select('published_at, category')
            .neq('category', 'NOISE')  // 노이즈 기사 제외
            .gte('published_at', startDateStr)
            .order('published_at', { ascending: false })  // 최신순 정렬
            .limit(5000);

        if (error) throw error;

        console.log(`[Trends API] Query from ${startDateStr}, found ${articles?.length || 0} articles`);

        // KST 날짜 포맷터 (YYYY-MM-DD) - UTC를 KST로 정확히 변환
        const toKSTDateString = (date: Date) => {
            const kstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
            const year = kstDate.getUTCFullYear();
            const month = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
            const day = String(kstDate.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // 1. 날짜별/카테고리별 초기 데이터 구조 생성
        const trendMap: Record<string, Record<string, number>> = {};
        const dateLabels: string[] = [];

        // 최근 7일 날짜 라벨 생성 (KST 기준)
        for (let i = rangeDays - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = toKSTDateString(d);

            dateLabels.push(dateStr);
            trendMap[dateStr] = {};

            // 모든 카테고리 0으로 초기화
            CATEGORIES_CONFIG.forEach(cat => {
                trendMap[dateStr][cat.label] = 0;
            });
        }

        console.log(`[Trends API] Date range: ${dateLabels[0]} ~ ${dateLabels[dateLabels.length - 1]}`);

        // 디버깅: 첫 번째 기사의 날짜 변환 확인
        if (articles && articles.length > 0) {
            const firstArticle = articles[0];
            const testDate = new Date(firstArticle.published_at);
            const testKST = toKSTDateString(testDate);
            console.log(`[Trends API DEBUG] First article: published_at=${firstArticle.published_at}, parsed=${testDate.toISOString()}, KST=${testKST}, category=${firstArticle.category}`);
        }

        // 2. 기사별로 DB category 값 그대로 카운팅
        let matchedCount = 0;
        articles?.forEach((article) => {
            const pubDateUTC = new Date(article.published_at);
            const dateKey = toKSTDateString(pubDateUTC);

            // 범위 밖 날짜 무시
            if (!trendMap[dateKey]) return;

            // DB에 저장된 category 값 그대로 사용
            const category = article.category;

            // category가 유효한 Config label인지 확인
            if (category && trendMap[dateKey][category] !== undefined) {
                trendMap[dateKey][category] += 1;
                matchedCount++;
            }
        });

        console.log(`[Trends API] Matched ${matchedCount} articles to trend data`);

        const allKeywords = CATEGORIES_CONFIG.map(c => c.label);

        // 3. 차트용 데이터 포맷으로 변환
        const trendData = dateLabels.map(date => ({
            date: date.substring(5), // MM-DD 형식으로 축약
            ...trendMap[date]
        }));

        return NextResponse.json({ data: trendData, categories: allKeywords }, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (e: any) {
        console.error("Trend API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
