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

        // 넉넉하게 14일 전부터 조회 (timezone 이슈 방지)
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - (rangeDays * 2));
        const startDateStr = startDate.toISOString();

        // DB에서 category 포함하여 조회
        const { data: articles, error } = await supabase
            .from('articles')
            .select('published_at, category')
            .neq('category', 'NOISE')  // 노이즈 기사 제외
            .not('category', 'is', null)  // category가 null인 것 제외
            .gte('published_at', startDateStr)
            .order('published_at', { ascending: true })
            .limit(10000);

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

        // 2. 기사별로 DB category 값 그대로 카운팅 (단순화!)
        articles?.forEach((article) => {
            const pubDateUTC = new Date(article.published_at);
            const dateKey = getKSTDateKey(pubDateUTC);

            // 범위 밖 날짜 무시
            if (!trendMap[dateKey]) return;

            // DB에 저장된 category 값 그대로 사용
            const category = article.category;

            // category가 유효한 Config label인지 확인
            if (category && trendMap[dateKey][category] !== undefined) {
                trendMap[dateKey][category] += 1;
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
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (e: any) {
        console.error("Trend API Error:", e);
        Sentry.captureException(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
