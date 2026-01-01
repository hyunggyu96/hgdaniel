'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import SideBar from '@/components/SideBar';
import NewsList from '@/components/NewsList';
import dynamic_next from 'next/dynamic';

const TrendChart = dynamic_next(() => import('@/components/TrendChart'), {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse bg-white/5 rounded-2xl border border-white/10" />
});

export default function Page() {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams?.get('category') || null;
    const currentPage = parseInt(searchParams?.get('page') || '1', 10);
    const searchQuery = searchParams?.get('search') || undefined;
    const showCollections = searchParams?.get('collections') === 'true';
    const isLandingPage = !selectedCategory && !searchQuery && !showCollections;

    return (
        <div className="flex min-h-screen bg-[#101012]">
            {/* Client Component: SideBar */}
            <SideBar />

            {/* Client Component: NewsList (with SWR) */}
            <main className="flex-1">
                <NewsList
                    selectedCategory={selectedCategory}
                    currentPage={currentPage}
                    searchQuery={searchQuery}
                    showCollections={showCollections}
                />
                {/* TrendChart only on Landing Page */}
                {isLandingPage && (
                    <div className="px-4 md:px-6 lg:px-12 pb-24 text-white">
                        <TrendChart />
                    </div>
                )}
            </main>
        </div>
    );
}
