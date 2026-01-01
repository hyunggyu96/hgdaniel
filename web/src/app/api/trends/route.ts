import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
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
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - rangeDays);
        const startDateStr = startDate.toISOString();

        const { data: articles, error } = await supabase
            .from('articles')
            .select('keyword, main_keywords, title, description, published_at')
            .gte('published_at', startDateStr)
            .order('published_at', { ascending: true })
            .limit(5000);

        if (error) throw error;

        // 1. 날짜별/카테고리별 초기 데이터 구조 생성
        const trendMap: Record<string, Record<string, number>> = {};

        // 날짜 배열 생성 (KST 기준)
        const dateLabels: string[] = [];
        for (let i = rangeDays - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
            dateLabels.push(dateStr);
            trendMap[dateStr] = {};

            // 모든 카테고리 0으로 초기화
            CATEGORIES_CONFIG.forEach(cat => {
                trendMap[dateStr][cat.label] = 0;
            });
        }

        // 2. 기사별로 카테고리 판별 및 카운팅
        articles?.forEach((article) => {
            const pubDate = new Date(article.published_at);
            const dateKey = pubDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

            if (!trendMap[dateKey]) return; // 범위 밖 날짜 무시

            // 카테고리 스코어링 로직 (NewsList와 동일하게 적용)
            let bestCategory: string | null = null;
            let highestScore = 0;

            CATEGORIES_CONFIG.forEach(config => {
                let score = 0;

                // Keyword Match (V2.0: 완화된 로직)
                const mainKeyword = article.keyword || '';
                // Exact Match가 아니라도, 포함되면 점수 부여
                if (mainKeyword && config.keywords.some(k => mainKeyword.includes(k))) score += 100;

                // article.title이 null일 수 있음
                const title = article.title || '';
                if (config.keywords.some(k => title.includes(k))) score += 50;

                // description 점수도 추가 (데이터가 적을 때 보완)
                const desc = article.description || '';
                if (config.keywords.some(k => desc.includes(k))) score += 20;

                if (score > highestScore) {
                    highestScore = score;
                    bestCategory = config.label;
                }
            });

            // Rule Refinement (Frontend와 100% 동일하게): 
            // Corporate News로 분류됐어도, 제품 키워드 점수가 있으면 제품 카테고리 우선!
            if (bestCategory === 'Corporate News') {
                let bestProductCategory: string | null = null;
                let maxProductScore = 0;

                CATEGORIES_CONFIG.forEach(config => {
                    if (config.label !== 'Corporate News') {
                        // 여기서도 점수 다시 계산 필요하지만, 위에서 저장해둔 score map이 없으므로 간이 계산
                        // (하지만 위 루프에서 categoryScores 맵을 만드는 게 정석임)
                        // 성능상 간단히: 제품 키워드가 1개라도 있으면 제품으로 변경
                        const kws = config.keywords || [];
                        const hasProductKeyword = kws.some(k =>
                            (article.keyword && article.keyword.includes(k)) ||
                            (article.title && article.title.includes(k))
                        );

                        if (hasProductKeyword) {
                            bestCategory = config.label; // 덮어쓰기
                        }
                    }
                });
            }

            if (bestCategory) {
                trendMap[dateKey][bestCategory] += 1;
            }
        });

        const allKeywords = CATEGORIES_CONFIG.map(c => c.label);

        // 3. 차트용 데이터 포맷으로 변환
        const trendData = dateLabels.map(date => ({
            date: date.substring(5), // MM-DD 형식으로 축약
            ...trendMap[date]
        }));

        return NextResponse.json({ data: trendData, categories: allKeywords }, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200'
            }
        });
    } catch (e: any) {
        console.error("Trend API Error:", e);
        Sentry.captureException(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
