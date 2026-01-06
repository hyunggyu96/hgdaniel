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
        // [Fix] Timezone 이슈로 데이터가 짤리지 않도록 쿼리 범위는 넉넉하게 14일 전부터 조회
        // (가져온 뒤 코드 레벨에서 정확히 필터링)
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - (rangeDays * 2));
        const startDateStr = startDate.toISOString();

        const { data: articles, error } = await supabase
            .from('articles')
            .select('keyword, main_keywords, title, description, published_at, category') // category 추가
            .neq('category', 'NOISE')  // 노이즈 기사 제외
            .gte('published_at', startDateStr)
            .order('published_at', { ascending: true })
            .limit(10000); // Limit도 2배로 증가

        if (error) throw error;

        // KST 날짜 포맷터 (YYYY-MM-DD)
        const getKSTDateKey = (date: Date) => {
            const kstOffset = 9 * 60 * 60 * 1000; // 9시간 밀리초
            const kstDate = new Date(date.getTime() + kstOffset);
            return kstDate.toISOString().split('T')[0]; // YYYY-MM-DD
        };

        // 1. 날짜별/카테고리별 초기 데이터 구조 생성
        const trendMap: Record<string, Record<string, number>> = {};
        const dateLabels: string[] = [];

        // 오늘 날짜(KST) 구하기
        const nowUTC = new Date();
        const kstNow = new Date(nowUTC.getTime() + (9 * 60 * 60 * 1000));

        for (let i = rangeDays - 1; i >= 0; i--) {
            const d = new Date(kstNow);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD (KST)

            dateLabels.push(dateStr);
            trendMap[dateStr] = {};

            // 모든 카테고리 0으로 초기화
            CATEGORIES_CONFIG.forEach(cat => {
                trendMap[dateStr][cat.label] = 0;
            });
        }

        // 2. 기사별로 카테고리 판별 및 카운팅
        articles?.forEach((article) => {
            // DB Timestring (UTC) -> Date Object
            const pubDateUTC = new Date(article.published_at);

            // UTC+9 계산하여 KST 날짜 키 생성
            const dateKey = getKSTDateKey(pubDateUTC);

            if (!trendMap[dateKey]) return; // 범위 밖 날짜 무시

            // [V3.0] DB에 저장된 정확한 Category 우선 사용 (SSOT)
            if (article.category) {
                // DB Category가 유효한지 확인 (Config에 있는지)
                const isValid = CATEGORIES_CONFIG.some(c => c.label === article.category);
                if (isValid) {
                    trendMap[dateKey][article.category] += 1;
                    return; // 계산 종료
                }
            }

            // [Fallback] DB에 Category가 없으면(구 데이터) 계산 수행
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
