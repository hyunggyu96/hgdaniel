'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';
import { useLanguage } from './LanguageContext';
import CollectionCount from './CollectionCount';
import KeywordSuggestionModal from './KeywordSuggestionModal';
import { MessageSquarePlus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function CategoryTabs() {
    const { t } = useLanguage();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isSuggestOpen, setIsSuggestOpen] = useState(false);
    const activeRef = useRef<HTMLAnchorElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const selectedCategory = searchParams?.get('category');
    const isCollections = searchParams?.get('collections') === 'true';
    const searchQuery = searchParams?.get('search');
    const isOverview = !selectedCategory && !isCollections && !searchQuery;

    // Only render on the news page
    if (pathname !== '/') return null;

    // Auto-scroll active tab into view on mobile
    useEffect(() => {
        if (activeRef.current && scrollRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [selectedCategory, isCollections]);

    const tabClass = (active: boolean) =>
        `shrink-0 px-3 py-2 text-[12px] font-bold tracking-tight whitespace-nowrap transition-colors border-b-2 ${
            active
                ? 'border-[#3182f6] text-[#3182f6]'
                : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:border-gray-300'
        }`;

    return (
        <>
            <div className="w-full border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
                <div
                    ref={scrollRef}
                    className="max-w-[1600px] mx-auto px-4 md:px-6 flex items-center gap-0 overflow-x-auto scrollbar-hide"
                >
                    <Link
                        href="/"
                        ref={isOverview ? activeRef : undefined}
                        className={tabClass(isOverview)}
                    >
                        {t('tabs_overview')}
                    </Link>

                    {CATEGORIES.map((category) => (
                        <Link
                            key={category}
                            href={`/?category=${encodeURIComponent(category)}`}
                            ref={selectedCategory === category ? activeRef : undefined}
                            className={tabClass(selectedCategory === category)}
                        >
                            {category}
                        </Link>
                    ))}

                    <Link
                        href="/?collections=true"
                        ref={isCollections ? activeRef : undefined}
                        className={`${tabClass(isCollections)} flex items-center gap-1.5`}
                    >
                        <span>&#11088;</span>
                        {t('tabs_collections')}
                        <CollectionCount />
                    </Link>

                    <button
                        onClick={() => setIsSuggestOpen(true)}
                        className="shrink-0 ml-2 p-1.5 text-muted-foreground hover:text-[#3182f6] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        title={t('tabs_suggest')}
                    >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            <KeywordSuggestionModal
                isOpen={isSuggestOpen}
                onClose={() => setIsSuggestOpen(false)}
            />
        </>
    );
}
