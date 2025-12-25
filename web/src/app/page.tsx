import React, { Suspense } from 'react';
import SideBar from '@/components/SideBar';
import NewsList from '@/components/NewsList';
import dynamic_next from 'next/dynamic';
import Loading from './loading';

const TrendChart = dynamic_next(() => import('@/components/TrendChart'), {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse bg-white/5 rounded-2xl border border-white/10" />
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
    searchParams: {
        category?: string;
        page?: string;
        search?: string;
        collections?: string;
    };
}

export default async function Page({ searchParams }: PageProps) {
    const selectedCategory = searchParams.category || null;
    const currentPage = parseInt(searchParams.page || '1', 10);
    const searchQuery = searchParams.search;
    const showCollections = searchParams.collections === 'true';

    return (
        <div className="flex min-h-screen bg-[#101012]">
            {/* Client Component: SideBar */}
            <SideBar />

            {/* Server Component: NewsList */}
            <main className="flex-1">
                <Suspense fallback={<Loading />}>
                    <NewsList
                        selectedCategory={selectedCategory}
                        currentPage={currentPage}
                        searchQuery={searchQuery}
                        showCollections={showCollections}
                    />
                </Suspense>
                {!showCollections && (
                    <div className="px-4 md:px-6 lg:px-12 pb-24 text-white">
                        <TrendChart />
                    </div>
                )}
            </main>
        </div>
    );
}
