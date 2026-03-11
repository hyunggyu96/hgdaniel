'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export interface EditorsPickArticle {
    title: string;
    description: string;
    published_at: string;
    link: string;
    source: string;
}

export interface EditorsPickItem {
    id: number;
    article_link: string;
    display_order: number;
    article: EditorsPickArticle | null;
}

export interface EditorsPickSection {
    id: number;
    name: string;
    color: string;
    display_order: number;
    items: EditorsPickItem[];
}

export function useEditorsPicks() {
    const { data, error, isLoading, mutate } = useSWR<{ sections: EditorsPickSection[] }>(
        '/api/editors-picks',
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 60000,
            refreshInterval: 60000,
        }
    );

    return {
        sections: data?.sections || [],
        isLoading,
        isError: error,
        mutate,
    };
}
