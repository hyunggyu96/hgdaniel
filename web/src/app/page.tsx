'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import SideBar from '@/components/SideBar';
import NewsList from '@/components/NewsList';
import dynamic_next from 'next/dynamic';

const TrendChart = dynamic_next(() => import('@/components/TrendChart'), {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse bg-gray-100 rounded-2xl border border-gray-200" />
});

export default function Page() {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams?.get('category') || null;
    const currentPage = parseInt(searchParams?.get('page') || '1', 10);
    const searchQuery = searchParams?.get('search') || undefined;
    const showCollections = searchParams?.get('collections') === 'true';
    const isLandingPage = !selectedCategory && !searchQuery && !showCollections;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

    return (
        <div className="flex min-h-screen bg-background">
            {/* Client Component: SideBar */}
            <SideBar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(prev => !prev)} />

            {/* Client Component: NewsList (with SWR) */}
            <main className="flex-1">
                {/* Sidebar toggle */}
                <button
                    onClick={() => setSidebarCollapsed(prev => !prev)}
                    className="hidden lg:flex items-center gap-1.5 mx-4 mt-3 mb-1 px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    {sidebarCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
                    {sidebarCollapsed ? 'Menu' : 'Hide'}
                </button>
                <NewsList
                    selectedCategory={selectedCategory}
                    currentPage={currentPage}
                    searchQuery={searchQuery}
                    showCollections={showCollections}
                />
                {/* TrendChart only on Landing Page */}
                {isLandingPage && (
                    <div className="px-4 md:px-6 lg:px-12 pb-24 text-foreground">
                        <TrendChart />
                    </div>
                )}
            </main>
        </div>
    );
}
