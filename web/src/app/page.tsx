'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import NewsList from '@/components/NewsList';
import CategoryTabs from '@/components/CategoryTabs';

export default function Page() {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams?.get('category') || null;
    const currentPage = parseInt(searchParams?.get('page') || '1', 10);
    const searchQuery = searchParams?.get('search') || undefined;
    const showCollections = searchParams?.get('collections') === 'true';

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
