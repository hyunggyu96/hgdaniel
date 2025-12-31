import { NextResponse } from 'next/server';
import { getNews } from '@/lib/api';
import * as Sentry from "@sentry/nextjs";

// API도 60초 캐싱 (프론트엔드와 동일)
export const revalidate = 60;

export async function GET() {
    try {
        const news = await getNews();
        return NextResponse.json({
            data: news,
            timestamp: new Date().toISOString(),
            cached: true
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
            }
        });
    } catch (error) {
        console.error('[API /api/news] Error:', error);
        Sentry.captureException(error);
        return NextResponse.json(
            { error: 'Failed to fetch news', timestamp: new Date().toISOString() },
            { status: 500 }
        );
    }
}
