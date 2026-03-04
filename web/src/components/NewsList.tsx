'use client';

import React from 'react';
import { useNews } from '@/hooks/useNews';
import { groupNewsByCategory, CATEGORIES_CONFIG } from '@/lib/constants';
import NewsListContainer from './NewsListContainer';
import { useLanguage } from './LanguageContext';
import { useTier } from '@/hooks/useTier';
import { Lock } from 'lucide-react';

interface NewsListProps {
    selectedCategory?: string | null;
    currentPage?: number;
    searchQuery?: string;
    showCollections?: boolean;
}

export default function NewsList({ selectedCategory, currentPage = 1, searchQuery, showCollections }: NewsListProps) {
    const { news: allNews, isLoading, isError } = useNews();
    const { t } = useLanguage();
    const { config: tierConfig } = useTier();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground text-sm font-medium">{t('loading_news')}</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-2">
                    <p className="text-red-400 text-sm font-medium">{t('failed_news')}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-400 text-xs hover:underline"
                    >
                        {t('retry')}
                    </button>
                </div>
            </div>
        );
    }

    const newsByCategory = groupNewsByCategory(allNews);

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

    // Tier-based date filter: free users only see recent articles
    if (tierConfig.newsDaysLimit) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - tierConfig.newsDaysLimit);
        filteredNews = filteredNews.filter(article => {
            const pubDate = article.published_at ? new Date(article.published_at) : null;
            return pubDate && pubDate >= cutoffDate;
        });
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const isLandingPage = !selectedCategory && !searchQuery && !showCollections;

    return (
        <>
        {tierConfig.newsDaysLimit && (
            <div className="mx-4 mb-3 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-sm text-yellow-400">
                <Lock className="w-4 h-4 flex-shrink-0" />
                <span>{t('tier_news_limited')}</span>
            </div>
        )}
        <NewsListContainer
            allNews={allNews}
            newsByCategory={newsByCategory}
            filteredNews={filteredNews}
            selectedCategory={selectedCategory || null}
            searchQuery={searchQuery || null}
            showCollections={showCollections || false}
            today={today}
            isLandingPage={isLandingPage}
            CATEGORIES_CONFIG={CATEGORIES_CONFIG}
        />
        </>
    );
}
