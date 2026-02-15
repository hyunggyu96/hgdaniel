import { NextResponse } from 'next/server';
import { getNews } from '@/lib/api';

// API도 60초 캐싱 (프론트엔드와 동일)
// 캐싱 완전 제거 (실시간성 보장)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const news = await getNews();
        return NextResponse.json({
            data: news,
            timestamp: new Date().toISOString(),
            cached: false
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error('[API /api/news] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch news', timestamp: new Date().toISOString() },
            { status: 500 }
        );
    }
}
