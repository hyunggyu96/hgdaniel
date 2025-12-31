'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useNews() {
    const { data, error, isLoading, mutate } = useSWR('/api/news', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60000, // 1분 동안 중복 요청 방지
        refreshInterval: 60000, // 1분마다 자동 갱신
    });

    return {
        news: data?.data || [],
        isLoading,
        isError: error,
        mutate, // 수동 갱신용
    };
}
