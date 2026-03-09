import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { CATEGORIES_CONFIG } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// KST 변환 유틸리티
function toKST(date: Date) {
    return new Date(date.getTime() + (9 * 60 * 60 * 1000));
}

function toKSTDateString(date: Date) {
    const kst = toKST(date);
    const y = kst.getUTCFullYear();
    const m = String(kst.getUTCMonth() + 1).padStart(2, '0');
    const d = String(kst.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function toKSTTimeSlot(date: Date) {
    const kst = toKST(date);
    const h = String(kst.getUTCHours()).padStart(2, '0');
    const m = String(Math.floor(kst.getUTCMinutes() / 10) * 10).padStart(2, '0');
    return `${h}:${m}`;
}

const allKeywords = CATEGORIES_CONFIG.map(c => c.label);
const cacheHeaders = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

// ─── Daily mode (기존 7일) ───
async function handleDaily() {
    const rangeDays = 7;
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - rangeDays - 1);

    const { data: articles, error } = await supabase
        .from('articles')
        .select('published_at, category')
        .neq('category', 'NOISE')
        .gte('published_at', startDate.toISOString())
        .order('published_at', { ascending: false })
        .limit(5000);

    if (error) throw error;

    const trendMap: Record<string, Record<string, number>> = {};
    const dateLabels: string[] = [];

    for (let i = rangeDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = toKSTDateString(d);
        dateLabels.push(dateStr);
        trendMap[dateStr] = {};
        CATEGORIES_CONFIG.forEach(cat => { trendMap[dateStr][cat.label] = 0; });
    }

    articles?.forEach((article) => {
        const dateKey = toKSTDateString(new Date(article.published_at));
        if (!trendMap[dateKey]) return;
        const cat = article.category;
        if (cat && trendMap[dateKey][cat] !== undefined) {
            trendMap[dateKey][cat] += 1;
        }
    });

    const trendData = dateLabels.map(date => ({
        date: date.substring(5),
        ...trendMap[date]
    }));

    return NextResponse.json({ data: trendData, categories: allKeywords, mode: 'daily' }, { headers: cacheHeaders });
}

// ─── Hourly mode (10분 단위, 오늘 vs 어제) ───
async function handleHourly() {
    const now = new Date();
    const kstNow = toKST(now);

    // 어제 00:00 KST (= UTC 전날 15:00)
    const yesterdayStart = new Date(Date.UTC(
        kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate() - 1, 0, 0, 0
    ));
    yesterdayStart.setTime(yesterdayStart.getTime() - 9 * 60 * 60 * 1000); // KST→UTC

    const { data: articles, error } = await supabase
        .from('articles')
        .select('published_at, category')
        .neq('category', 'NOISE')
        .gte('published_at', yesterdayStart.toISOString())
        .order('published_at', { ascending: false })
        .limit(5000);

    if (error) throw error;

    // 현재 시간의 10분 슬롯
    const currentSlot = toKSTTimeSlot(now);
    const todayDateStr = toKSTDateString(now);
    const yesterdayDateStr = toKSTDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));

    // 타임 슬롯 생성 (00:00 ~ currentSlot)
    const timeSlots: string[] = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 10) {
            const slot = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            timeSlots.push(slot);
            if (slot === currentSlot) break;
        }
        if (timeSlots[timeSlots.length - 1] === currentSlot) break;
    }

    // 오늘/어제 데이터 초기화
    const todayMap: Record<string, Record<string, number>> = {};
    const yesterdayMap: Record<string, Record<string, number>> = {};

    timeSlots.forEach(slot => {
        todayMap[slot] = {};
        yesterdayMap[slot] = {};
        allKeywords.forEach(k => {
            todayMap[slot][k] = 0;
            yesterdayMap[slot][k] = 0;
        });
    });

    // 기사 분류
    articles?.forEach((article) => {
        const pubDate = new Date(article.published_at);
        const dateStr = toKSTDateString(pubDate);
        const slot = toKSTTimeSlot(pubDate);
        const cat = article.category;
        if (!cat || !allKeywords.includes(cat)) return;

        if (dateStr === todayDateStr && todayMap[slot]) {
            todayMap[slot][cat] += 1;
        } else if (dateStr === yesterdayDateStr && yesterdayMap[slot]) {
            yesterdayMap[slot][cat] += 1;
        }
    });

    // 차트 데이터 구성
    const trendData = timeSlots.map(slot => ({
        time: slot,
        ...todayMap[slot],
    }));

    // 어제 데이터 (tooltip 비교용)
    const yesterday: Record<string, Record<string, number>> = {};
    timeSlots.forEach(slot => {
        yesterday[slot] = yesterdayMap[slot];
    });

    return NextResponse.json(
        { data: trendData, yesterday, categories: allKeywords, mode: 'hourly', currentSlot },
        { headers: cacheHeaders }
    );
}

export async function GET(request: NextRequest) {
    try {
        const mode = request.nextUrl.searchParams.get('mode');
        if (mode === 'hourly') {
            return await handleHourly();
        }
        return await handleDaily();
    } catch (e: any) {
        console.error("Trend API Error:", e);
        return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
    }
}
