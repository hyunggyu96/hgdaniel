"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import CollectionButton from './CollectionButton';
import CollectionsView from './CollectionsView';
import { LayoutGrid, Clock, ChevronRight } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { fmtDateKST, getYesterdayStr, toDateKey, uniqueKws } from '@/lib/utils';
import { useLanguage } from './LanguageContext';
import dynamic from 'next/dynamic';

const TrendChartCompact = dynamic(() => import('./TrendChartCompact'), {
    ssr: false,
    loading: () => <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-[280px] animate-pulse" />,
});

interface Props {
    allNews: any[];
    newsByCategory: Record<string, any[]>;
    filteredNews: any[];
    selectedCategory: string | null;
    searchQuery: string | null;
    showCollections: boolean;
    today: string;
    isLandingPage: boolean;
    CATEGORIES_CONFIG: any[];
    newsDaysLimit?: number | null;
    showBadges: boolean;
    setShowBadges: (fn: (prev: boolean) => boolean) => void;
    showKeywords: boolean;
    setShowKeywords: (fn: (prev: boolean) => boolean) => void;
    viewMode: 'category' | 'time';
    setViewMode: (mode: 'category' | 'time') => void;
    classicLayout: boolean;
    setClassicLayout: (fn: (prev: boolean) => boolean) => void;
}

// Shared yesterday string (computed once per render cycle)
const YESTERDAY = getYesterdayStr();

// --- Shared sub-components ---

function DateBadge({ isToday, isYesterday }: { isToday: boolean; isYesterday: boolean }) {
    if (isToday) return <span className="text-[8px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded tracking-tighter uppercase inline-block leading-none shrink-0 border border-red-400/50">NEW</span>;
    if (isYesterday) return <span className="text-[8px] font-black text-amber-900 bg-amber-400 px-1.5 py-0.5 rounded tracking-tighter uppercase inline-block leading-none shrink-0 border border-amber-300/50">YDAY</span>;
    return null;
}

function InlineBadge({ isToday, isYesterday }: { isToday: boolean; isYesterday: boolean }) {
    if (isToday) return <span className="text-[8px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded mr-1.5 align-middle">NEW</span>;
    if (isYesterday) return <span className="text-[8px] font-black text-amber-900 bg-amber-400 px-1.5 py-0.5 rounded mr-1.5 align-middle">YDAY</span>;
    return null;
}

function KwBadges({ kws, max, size = 'sm' }: { kws: string[]; max: number; size?: 'sm' | 'xs' }) {
    const cls = size === 'xs'
        ? "text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded uppercase tracking-tight border border-blue-200 dark:border-blue-800"
        : "text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded uppercase tracking-tight border border-blue-200 dark:border-blue-800";
    return (
        <>
            {kws.slice(0, max).map((k, i) => (
                <span key={i} className={cls}>{k}</span>
            ))}
        </>
    );
}

function TimeLabel({ dateStr, timeStr, isToday, isYesterday, size = 'sm' }: { dateStr: string; timeStr: string; isToday: boolean; isYesterday: boolean; size?: 'sm' | 'md' }) {
    const textSize = size === 'md' ? 'text-[11px]' : 'text-[9px]';
    return (
        <span className={`${textSize} font-mono font-bold ${isToday ? 'text-red-500' : isYesterday ? 'text-amber-500' : 'text-gray-300'}`}>
            {dateStr} {timeStr}
        </span>
    );
}

function LoadMore({ remaining, onClick }: { remaining: number; onClick: () => void }) {
    return (
        <div className="mt-8 flex justify-center">
            <button
                onClick={onClick}
                className="group px-8 py-3 bg-white dark:bg-gray-800 hover:bg-[#3182f6] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-[#3182f6] rounded-full transition-all duration-300 transform hover:-translate-y-0.5"
            >
                <span className="text-[14px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors">
                    Load More ({remaining})
                </span>
            </button>
        </div>
    );
}

// --- Tag extraction ---

function getTags(article: any) {
    let main: string[] = [];
    let sub: string[] = [];
    let summary: string | null = null;
    let issue_nature: string | null = null;

    if (article.main_keywords?.length > 0) {
        const firstTag = article.main_keywords[0];
        const match = firstTag.match(/^\[(.*?)(?:\|(.*?))?(?:\|(.*?))?\]$/);
        if (match) {
            main = [match[1].trim()];
            if (match[2]) issue_nature = match[2].trim();
            if (match[3]) summary = match[3].trim();
            sub = article.main_keywords.slice(1);
        } else if (firstTag.startsWith('[') && firstTag.endsWith(']')) {
            const parts = firstTag.slice(1, -1).split('|').map((s: string) => s.trim());
            main = [parts[0]];
            if (parts.length > 1) issue_nature = parts[1];
            if (parts.length > 2) summary = parts[2];
            sub = article.keywords || [];
        } else {
            main = article.main_keywords;
            sub = article.keywords || [];
        }
    } else if (article.keywords) {
        sub = article.keywords;
    }

    const empty = (v: string | null) => !v || v === '-' || v === '|' || !v.trim();
    main = main.filter(m => !empty(m));
    if (empty(issue_nature)) issue_nature = null;
    if (empty(summary)) summary = null;
    return { main, sub, summary, issue_nature };
}

function useArticleData(article: any, today: string) {
    const analysis = getTags(article);
    const pubDate = article.published_at ? new Date(article.published_at) : null;
    const dateKey = toDateKey(pubDate);
    const isToday = dateKey === today;
    const isYesterday = dateKey === YESTERDAY && !isToday;
    const { dateStr, timeStr } = fmtDateKST(pubDate);

    let summaryText = analysis.summary && analysis.summary !== '-' ? analysis.summary : article.description;
    if (summaryText) summaryText = summaryText.replace(/^[\s\-\|]+/, '').trim();

    const kws = uniqueKws([analysis.main, analysis.sub]);

    return { isToday, isYesterday, dateStr, timeStr, summaryText, kws };
}

// --- Category Card (Naver-style) ---

function CategoryCard({ category, articles, today, showBadges, showKeywords, index }: {
    category: string;
    articles: any[];
    today: string;
    showBadges: boolean;
    showKeywords: boolean;
    index: number;
}) {
    const { t } = useLanguage();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
            {/* Card Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                <Link
                    href={`/?category=${encodeURIComponent(category)}`}
                    className="group flex items-center gap-2"
                >
                    <h2 className="text-[14px] font-black text-black dark:text-white tracking-tight uppercase group-hover:text-[#3182f6] transition-colors">
                        {category}
                    </h2>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#3182f6] group-hover:translate-x-0.5 transition-all" />
                </Link>
                <span className="text-[10px] font-bold text-muted-foreground bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {articles.length}
                </span>
            </div>

            {/* Article List */}
            <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-700">
                {articles.slice(0, 8).map((article, i) => (
                    <CompactArticleRow
                        key={article.id}
                        article={article}
                        index={i + 1}
                        today={today}
                        showBadges={showBadges}
                        showKeywords={showKeywords}
                    />
                ))}
                {articles.length === 0 && (
                    <div className="py-8 text-center text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">
                        {t('card_no_articles')}
                    </div>
                )}
            </div>

            {/* Footer */}
            {articles.length > 0 && (
                <Link
                    href={`/?category=${encodeURIComponent(category)}`}
                    className="flex items-center justify-center gap-1 py-2 border-t border-gray-100 dark:border-gray-700 text-[11px] font-bold text-[#3182f6] hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                    {t('card_view_all')}
                    <ChevronRight className="w-3 h-3" />
                </Link>
            )}
        </div>
    );
}

function CompactArticleRow({ article, index, today, showBadges, showKeywords }: {
    article: any;
    index: number;
    today: string;
    showBadges: boolean;
    showKeywords: boolean;
}) {
    const { isToday, isYesterday, dateStr, timeStr } = useArticleData(article, today);

    const { kws } = useArticleData(article, today);

    return (
        <div className="group flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 w-4 shrink-0 text-right">{index}</span>
            <div className="shrink-0"><CollectionButton newsLink={article.link} newsTitle={article.title} size={12} /></div>
            {showBadges && <DateBadge isToday={isToday} isYesterday={isYesterday} />}
            {showKeywords && kws.length > 0 && <KwBadges kws={kws} max={2} size="xs" />}
            <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 text-[13px] font-bold text-black dark:text-white group-hover:text-[#3182f6] transition-colors truncate leading-tight"
            >
                {article.title}
            </a>
            <span className="text-[9px] font-mono text-gray-300 dark:text-gray-500 shrink-0">
                {isToday ? timeStr : dateStr}
            </span>
        </div>
    );
}

// --- Classic NewsCard (from main branch) ---

function ClassicNewsCard({ article, today, showBadges = false, showKeywords = false }: { article: any; today: string; showBadges?: boolean; showKeywords?: boolean }) {
    const { isToday, isYesterday, dateStr, timeStr, kws } = useArticleData(article, today);

    return (
        <motion.div
            whileHover={{ x: 2 }}
            className="group/card flex flex-col gap-0.5 relative transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        {showBadges && <DateBadge isToday={isToday} isYesterday={isYesterday} />}
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link text-[14px] font-bold text-foreground/90 group-hover/card:text-blue-600 transition-colors leading-tight line-clamp-2 block tracking-tight">
                            {article.title}
                        </a>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between mt-0.5">
                {showKeywords && (
                    <div className="flex flex-wrap gap-1">
                        {kws.slice(0, 2).map((k, i) => (
                            <span key={i} className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800 uppercase tracking-tight group-hover/card:border-blue-300 group-hover/card:text-blue-700 dark:group-hover/card:text-blue-300 transition-all">
                                {k}
                            </span>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                    <TimeLabel dateStr={dateStr} timeStr={timeStr} isToday={isToday} isYesterday={isYesterday} />
                    <CollectionButton newsLink={article.link} newsTitle={article.title} size={14} />
                </div>
            </div>
        </motion.div>
    );
}

// --- Main component ---

export default function NewsListContainer({
    allNews, newsByCategory, filteredNews,
    selectedCategory, searchQuery, showCollections, today, isLandingPage, CATEGORIES_CONFIG, newsDaysLimit,
    showBadges, setShowBadges, showKeywords, setShowKeywords,
    viewMode, setViewMode, classicLayout, setClassicLayout,
}: Props) {
    const { t } = useLanguage();
    const PAGE_SIZE = 20;
    const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

    const reduceMotion = useReducedMotion();

    const timeSortedNews = useMemo(() => {
        if (viewMode !== 'time' || !isLandingPage) return [];

        const seen = new Set<string>();
        const flat: any[] = [];
        Object.entries(newsByCategory).forEach(([cat, articles]) => {
            articles.forEach(a => {
                if (!seen.has(a.id)) {
                    seen.add(a.id);
                    flat.push({ ...a, computedCategory: cat });
                }
            });
        });

        return flat.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }, [newsByCategory, viewMode, isLandingPage]);

    const loadMore = () => setDisplayCount(prev => prev + PAGE_SIZE);

    return (
        <div className="flex-1 space-y-3">
            {/* Toolbar */}
            {isLandingPage && (
                <div className="px-4 md:px-6 lg:px-8 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-base font-black tracking-tighter text-foreground uppercase">
                            {t('news_section_title')}
                        </h1>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-800">
                            {!reduceMotion && (
                                <span className="relative flex h-1.5 w-1.5 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                                </span>
                            )}
                            {t('news_section_desc')}
                        </div>
                        {newsDaysLimit && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                * {t('tier_news_limited')}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Toggle Buttons */}
                        <button
                            onClick={() => setShowBadges(prev => !prev)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border ${showBadges
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            NEW
                        </button>
                        <button
                            onClick={() => setShowKeywords(prev => !prev)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border ${showKeywords
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            Keywords
                        </button>
                        <button
                            onClick={() => setClassicLayout(prev => !prev)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border ${classicLayout
                                ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                        >
                            {t('display_classic')}
                        </button>

                        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />

                        {/* View Mode Toggle */}
                        <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            {([['category', LayoutGrid, 'Category'], ['time', Clock, 'Time']] as const).map(([mode, Icon, label]) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode as 'category' | 'time')}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all duration-200 ${viewMode === mode
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Icon size={13} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Non-landing page header */}
            {!isLandingPage && !showCollections && (
                <div className="px-4 md:px-6 lg:px-8 pt-4">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-lg font-black tracking-tighter text-foreground uppercase">
                            {selectedCategory || 'Search Results'}
                        </h1>
                        <span className="text-[10px] font-bold text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                            {filteredNews.length}
                        </span>
                    </div>
                </div>
            )}

            <div className="px-4 md:px-6 lg:px-8 pb-16">
                {showCollections ? (
                    <CollectionsView allNews={allNews} today={today} />
                ) : selectedCategory || searchQuery ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0 max-w-7xl">
                            {filteredNews.slice(0, displayCount).map((article) => (
                                <NewsRow key={article.id} article={article} today={today} showBadges={showBadges} showKeywords={showKeywords} />
                            ))}
                        </div>
                        {displayCount < filteredNews.length && (
                            <LoadMore remaining={filteredNews.length - displayCount} onClick={loadMore} />
                        )}
                    </>
                ) : (
                    <>
                        {viewMode === 'category' ? (
                            classicLayout ? (
                                /* Classic (main branch) glass-card grid */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 relative z-30">
                                    {CATEGORIES_CONFIG.map((config, idx) => {
                                        const category = config.label;
                                        const articles = newsByCategory[category] || [];

                                        return (
                                            <motion.div
                                                key={category}
                                                initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: idx * 0.05 }}
                                                className="group/theme glass-card rounded-[24px] p-5 relative overflow-hidden flex flex-col gap-4 h-full"
                                            >
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/0 group-hover/theme:bg-blue-600/10 blur-[80px] rounded-full transition-all duration-700" />

                                                <div className="relative z-10 w-full text-center border-b border-gray-100 pb-4">
                                                    <Link
                                                        href={`/?category=${encodeURIComponent(category)}`}
                                                        prefetch={true}
                                                        className="group/link flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all duration-300 hover:bg-gray-50"
                                                    >
                                                        <h2 className="text-xl font-black text-foreground tracking-tighter uppercase transition-colors group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400">
                                                            {category}
                                                        </h2>
                                                        <div className="h-1 w-6 bg-blue-600 rounded-full transition-all duration-500 group-hover/link:w-16 group-hover/link:bg-blue-400" />
                                                    </Link>
                                                </div>

                                                <div className="relative z-10 flex flex-col divide-y divide-gray-200 dark:divide-gray-700">
                                                    <AnimatePresence mode="popLayout">
                                                        {articles.slice(0, 8).map((article: any, i: number) => (
                                                            <motion.div
                                                                key={article.id}
                                                                initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: (idx * 0.05) + (i * 0.02) }}
                                                                className="py-2.5 first:pt-0 last:pb-0"
                                                            >
                                                                <ClassicNewsCard article={article} today={today} showBadges={showBadges} showKeywords={showKeywords} />
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                    {articles.length === 0 && (
                                                        <div className="py-12 text-center text-gray-300 text-[9px] uppercase font-bold tracking-[0.3em]">Awaiting Insight</div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Naver-style compact grid */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* TrendChart as first card */}
                                    <div className="h-[280px]">
                                        <TrendChartCompact />
                                    </div>

                                    {/* Category Cards */}
                                    {CATEGORIES_CONFIG.map((config, idx) => (
                                        <CategoryCard
                                            key={config.label}
                                            category={config.label}
                                            articles={newsByCategory[config.label] || []}
                                            today={today}
                                            showBadges={showBadges}
                                            showKeywords={showKeywords}
                                            index={idx}
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col gap-0 w-full">
                                {timeSortedNews.slice(0, displayCount).map((article: any, i: number) => (
                                    <NewsRow
                                        key={`${article.id}-${i}`}
                                        article={article}
                                        today={today}
                                        category={article.computedCategory}
                                        showBadges={showBadges}
                                        showKeywords={showKeywords}
                                    />
                                ))}
                                {timeSortedNews.length === 0 && (
                                    <div className="text-center py-20 text-muted-foreground">
                                        No news available.
                                    </div>
                                )}
                                {displayCount < timeSortedNews.length && (
                                    <LoadMore remaining={timeSortedNews.length - displayCount} onClick={loadMore} />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// --- Row component (for time view & category/search pages) ---

const NewsRow = React.memo(function NewsRow({ article, today, category, showBadges = false, showKeywords = false }: { article: any, today: string, category?: string, showBadges?: boolean, showKeywords?: boolean }) {
    const { isToday, isYesterday, dateStr, timeStr, kws } = useArticleData(article, today);

    // Time View (landing page)
    if (category) {
        return (
            <article className={`group py-3 sm:py-0.5 px-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                {/* MOBILE */}
                <div className="flex flex-col gap-2 sm:hidden">
                    <div className="flex items-center justify-between pb-1 border-b border-dashed border-gray-100/50">
                        <span className="text-[9px] font-black text-white bg-blue-500 px-1.5 py-0.5 rounded uppercase tracking-tight whitespace-nowrap">{category}</span>
                        <TimeLabel dateStr={dateStr} timeStr={timeStr} isToday={isToday} isYesterday={isYesterday} size="md" />
                    </div>
                    <div className="flex items-center gap-2">
                        {showBadges && <DateBadge isToday={isToday} isYesterday={isYesterday} />}
                        {showKeywords && kws.length > 0 && <KwBadges kws={kws} max={2} size="xs" />}
                        <div className="mt-0.5 shrink-0"><CollectionButton newsLink={article.link} newsTitle={article.title} size={16} /></div>
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link flex-1 min-w-0 block">
                            <h3 className="text-[16px] font-black text-black dark:text-white leading-snug tracking-tight group-hover:text-[#3182f6] transition-colors truncate">
                                {article.title}
                            </h3>
                        </a>
                    </div>
                </div>

                {/* DESKTOP */}
                <div className="hidden sm:flex items-start gap-4">
                    <div className="flex flex-col items-start gap-0.5 w-[140px] shrink-0 pt-0.5">
                        <TimeLabel dateStr={dateStr} timeStr={timeStr} isToday={isToday} isYesterday={isYesterday} size="md" />
                        <span className="inline-block text-[9px] font-black text-white bg-blue-500 px-1.5 py-0.5 rounded uppercase tracking-tight whitespace-nowrap">{category}</span>
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-1.5">
                            {showBadges && <DateBadge isToday={isToday} isYesterday={isYesterday} />}
                            {showKeywords && kws.length > 0 && <KwBadges kws={kws} max={3} size="xs" />}
                            <div className="mt-0 shrink-0"><CollectionButton newsLink={article.link} newsTitle={article.title} size={15} /></div>
                            <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link flex-1 min-w-0 block">
                                <h3 className="text-[15px] font-extrabold text-black dark:text-white group-hover:text-[#3182f6] transition-colors leading-tight truncate">
                                    {article.title}
                                </h3>
                            </a>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    // Category/search page layout
    return (
        <article className={`group py-3 sm:py-1.5 px-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-all duration-200 ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
            {/* MOBILE */}
            <div className="flex flex-col gap-2 sm:hidden">
                <div className="flex items-center justify-end pb-1 border-b border-dashed border-gray-100/50">
                    <TimeLabel dateStr={dateStr} timeStr={timeStr} isToday={isToday} isYesterday={isYesterday} size="md" />
                </div>
                <div className="flex items-center gap-2">
                    {showBadges && <DateBadge isToday={isToday} isYesterday={isYesterday} />}
                    {showKeywords && kws.length > 0 && <KwBadges kws={kws} max={2} size="xs" />}
                    <div className="mt-0.5 shrink-0"><CollectionButton newsLink={article.link} newsTitle={article.title} size={16} /></div>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link flex-1 min-w-0 block">
                        <h3 className="text-[16px] font-black text-black dark:text-white leading-snug tracking-tight group-hover:text-[#3182f6] transition-colors truncate">
                            {article.title}
                        </h3>
                    </a>
                </div>
            </div>

            {/* DESKTOP */}
            <div className="hidden sm:flex items-start gap-4">
                <div className="flex flex-col items-start gap-0.5 w-[85px] shrink-0 pt-0.5">
                    <TimeLabel dateStr={dateStr} timeStr={timeStr} isToday={isToday} isYesterday={isYesterday} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        {showBadges && <DateBadge isToday={isToday} isYesterday={isYesterday} />}
                        {showKeywords && kws.length > 0 && <KwBadges kws={kws} max={4} size="xs" />}
                        <div className="mt-0 shrink-0"><CollectionButton newsLink={article.link} newsTitle={article.title} size={15} /></div>
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link flex-1 min-w-0 block">
                            <h3 className="text-[15px] font-extrabold text-black dark:text-white group-hover:text-[#3182f6] transition-colors leading-tight truncate">
                                {article.title}
                            </h3>
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
});
