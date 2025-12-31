'use client';

import React from 'react';
import { useNews } from '@/hooks/useNews';
import { groupNewsByCategory, CATEGORIES_CONFIG } from '@/lib/constants';
import NewsListContainer from './NewsListContainer';

interface NewsListProps {
    selectedCategory?: string | null;
    currentPage?: number;
    searchQuery?: string;
    showCollections?: boolean;
}

export default function NewsList({ selectedCategory, currentPage = 1, searchQuery, showCollections }: NewsListProps) {
    const { news: allNews, isLoading, isError } = useNews();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-white/50 text-sm font-medium">Loading news...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-2">
                    <p className="text-red-400 text-sm font-medium">Failed to load news</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-400 text-xs hover:underline"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const newsByCategory = groupNewsByCategory(allNews);
    const itemsPerPage = 20;

    let filteredNews: any[] = [];
    if (selectedCategory) {
        filteredNews = newsByCategory[selectedCategory] || [];
    } else {
        filteredNews = allNews;
    }

    if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredNews = filteredNews.filter(article =>
            article.title?.toLowerCase().includes(query) ||
            article.description?.toLowerCase().includes(query) ||
            article.main_keywords?.some((kw: string) => kw.toLowerCase().includes(query))
        );
    }

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const isLandingPage = !selectedCategory && !searchQuery && !showCollections;

    return (
        <NewsListContainer
            allNews={allNews}
            newsByCategory={newsByCategory}
            paginatedNews={paginatedNews}
            currentPage={currentPage}
            totalPages={totalPages}
            selectedCategory={selectedCategory || null}
            searchQuery={searchQuery || null}
            showCollections={showCollections || false}
            today={today}
            isLandingPage={isLandingPage}
            CATEGORIES_CONFIG={CATEGORIES_CONFIG}
        />
    );
}
