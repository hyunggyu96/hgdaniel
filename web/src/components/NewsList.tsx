'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNews } from '@/hooks/useNews';
import { groupNewsByCategory, CATEGORIES_CONFIG } from '@/lib/constants';
import NewsListContainer from './NewsListContainer';
import EditorsPicks from './EditorsPicks';
import { useLanguage } from './LanguageContext';
import { useTier } from '@/hooks/useTier';
import { useUser } from './UserContext';

interface NewsListProps {
    selectedCategory?: string | null;
    currentPage?: number;
    searchQuery?: string;
    showCollections?: boolean;
}

interface DisplayPrefs {
    showBadges: boolean;
    showKeywords: boolean;
    viewMode: 'category' | 'time';
    classicLayout: boolean;
}

const DEFAULT_PREFS: DisplayPrefs = {
    showBadges: false,
    showKeywords: false,
    viewMode: 'category',
    classicLayout: false,
};

export default function NewsList({ selectedCategory, currentPage = 1, searchQuery, showCollections }: NewsListProps) {
    const { news: allNews, isLoading, isError } = useNews();
    const { t } = useLanguage();
    const { config: tierConfig } = useTier();
    const { userId } = useUser();

    const [showBadges, setShowBadges] = useState(false);
    const [showKeywords, setShowKeywords] = useState(false);
    const [viewMode, setViewMode] = useState<'category' | 'time'>('category');
    const [classicLayout, setClassicLayout] = useState(false);
    const [prefsLoaded, setPrefsLoaded] = useState(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load preferences on mount (if logged in)
    useEffect(() => {
        if (!userId) {
            setPrefsLoaded(true);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/user/preferences', { cache: 'no-store' });
                if (!res.ok || cancelled) return;
                const json = await res.json();
                const p = json?.preferences || {};
                if (cancelled) return;
                if (typeof p.showBadges === 'boolean') setShowBadges(p.showBadges);
                if (typeof p.showKeywords === 'boolean') setShowKeywords(p.showKeywords);
                if (p.viewMode === 'category' || p.viewMode === 'time') setViewMode(p.viewMode);
                if (typeof p.classicLayout === 'boolean') setClassicLayout(p.classicLayout);
            } catch {
                // ignore — use defaults
            } finally {
                if (!cancelled) setPrefsLoaded(true);
            }
        })();
        return () => { cancelled = true; };
    }, [userId]);

    // Debounced save preferences on change
    const savePrefs = useCallback((prefs: Partial<DisplayPrefs>) => {
        if (!userId) return;
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            void fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences: prefs }),
            });
        }, 500);
    }, [userId]);

    // Wrap setters to also save
    const handleSetShowBadges = useCallback((fn: (prev: boolean) => boolean) => {
        setShowBadges((prev) => {
            const next = fn(prev);
            savePrefs({ showBadges: next });
            return next;
        });
    }, [savePrefs]);

    const handleSetShowKeywords = useCallback((fn: (prev: boolean) => boolean) => {
        setShowKeywords((prev) => {
            const next = fn(prev);
            savePrefs({ showKeywords: next });
            return next;
        });
    }, [savePrefs]);

    const handleSetViewMode = useCallback((mode: 'category' | 'time') => {
        setViewMode(mode);
        savePrefs({ viewMode: mode });
    }, [savePrefs]);

    const handleSetClassicLayout = useCallback((fn: (prev: boolean) => boolean) => {
        setClassicLayout((prev) => {
            const next = fn(prev);
            savePrefs({ classicLayout: next });
            return next;
        });
    }, [savePrefs]);

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
        {isLandingPage && <EditorsPicks allNews={allNews} showBadges={showBadges} showKeywords={showKeywords} />}
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
            newsDaysLimit={tierConfig.newsDaysLimit || null}
            showBadges={showBadges}
            setShowBadges={handleSetShowBadges}
            showKeywords={showKeywords}
            setShowKeywords={handleSetShowKeywords}
            viewMode={viewMode}
            setViewMode={handleSetViewMode}
            classicLayout={classicLayout}
            setClassicLayout={handleSetClassicLayout}
        />
        </>
    );
}
