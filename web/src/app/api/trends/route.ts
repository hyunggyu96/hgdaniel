import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { CATEGORIES_CONFIG } from '@/lib/constants';

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

                // Keyword Match
                const mainKeyword = article.keyword; // DB의 keyword 필드 사용
                if (mainKeyword && config.keywords.some(k => mainKeyword === k)) score += 100;
                if (article.title && config.keywords.some(k => article.title.startsWith(k))) score += 50;
                if (article.title && config.keywords.some(k => article.title.includes(k))) score += 20;

                if (score > highestScore) {
                    highestScore = score;
                    bestCategory = config.label;
                }
            });

            if (bestCategory) {
                trendMap[dateKey][bestCategory] += 1;
            }
        });

        // 카테고리 순서: 빈도순 정렬 대신 설정 파일의 고정 순서 사용 (사용자 요청 반영)
        // const allKeywords = Object.keys(keywordCounts).sort((a, b) => keywordCounts[b] - keywordCounts[a]); 
        const allKeywords = CATEGORIES_CONFIG.map(c => c.label);

        // 3. 차트용 데이터 포맷으로 변환
        const trendData = dateLabels.map(date => ({
            date: date.substring(5), // MM-DD 형식으로 축약
            ...trendMap[date]
        }));

        return NextResponse.json({ data: trendData, categories: allKeywords });
    } catch (e: any) {
        console.error("Trend API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
