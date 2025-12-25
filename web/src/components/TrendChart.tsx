'use client';

import dynamic from 'next/dynamic';

const TrendChartInner = dynamic(() => import('./TrendChartInner'), {
    ssr: false,
    loading: () => <div className="h-80 w-full animate-pulse bg-gray-100/5 rounded-lg flex items-center justify-center text-gray-400">트렌드 차트 로딩 중...</div>
});

export default function TrendChart() {
    return <TrendChartInner />;
}
