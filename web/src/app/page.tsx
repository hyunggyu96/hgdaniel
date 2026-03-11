'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useFeedMode } from '@/components/FeedModeContext';
import NewsList from '@/components/NewsList';
import CategoryTabs from '@/components/CategoryTabs';
import SideBar from '@/components/SideBar';
import dynamic from 'next/dynamic';

const TrendChart = dynamic(() => import('@/components/TrendChart'), {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700" />,
});

export default function Page() {
    const searchParams = useSearchParams();
    const { feedMode } = useFeedMode();

    const selectedCategory = searchParams?.get('category') || null;
    const currentPage = parseInt(searchParams?.get('page') || '1', 10);
    const searchQuery = searchParams?.get('search') || undefined;
    const showCollections = searchParams?.get('collections') === 'true';
    const isLandingPage = !selectedCategory && !searchQuery && !showCollections;

    if (feedMode === 'classic') {
        return (
            <div className="flex min-h-screen bg-background">
                <SideBar />
                <main className="flex-1">
                    <NewsList
                        selectedCategory={selectedCategory}
                        currentPage={currentPage}
                        searchQuery={searchQuery}
                        showCollections={showCollections}
                    />
                    {isLandingPage && (
                        <div className="px-4 md:px-6 lg:px-12 pb-24 text-foreground">
                            <TrendChart />
                        </div>
                    )}
                </main>
            </div>
        );
    }

    // AI Newsfeed layout
    return (
        <div className="min-h-screen bg-background">
            <CategoryTabs />
            <main className="max-w-[1600px] mx-auto">
                <NewsList
                    selectedCategory={selectedCategory}
                    currentPage={currentPage}
                    searchQuery={searchQuery}
                    showCollections={showCollections}
                />
            </main>
        </div>
    );
}
