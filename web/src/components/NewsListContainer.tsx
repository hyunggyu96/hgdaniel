"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import CollectionButton from './CollectionButton';
import CollectionsView from './CollectionsView';
import { LayoutGrid, Clock, Sparkles, Zap } from 'lucide-react';
import { useReducedMotion, useIsLowEndDevice } from '@/hooks/useReducedMotion';

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
}

export default function NewsListContainer({
    allNews, newsByCategory, filteredNews,
    selectedCategory, searchQuery, showCollections, today, isLandingPage, CATEGORIES_CONFIG
}: Props) {
    const ITEMS_PER_PAGE = 20;
    const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
    const [viewMode, setViewMode] = useState<'category' | 'time'>('category');

    // Performance optimizations
    const prefersReducedMotion = useReducedMotion();
    const isLowEndDevice = useIsLowEndDevice();
    const [splineLoaded, setSplineLoaded] = useState(false);

    // User-controlled Light Mode (persisted in localStorage)
    const [lightMode, setLightMode] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lightMode');
            return saved === 'true';
        }
        return false;
    });

    // Toggle Light Mode and save preference
    const toggleLightMode = () => {
        setLightMode(prev => {
            const newValue = !prev;
            localStorage.setItem('lightMode', String(newValue));
            return newValue;
        });
    };

    // Lazy load Spline only on high-end devices after component mount (and not in light mode)
    useEffect(() => {
        if (!isLowEndDevice && !prefersReducedMotion && !lightMode && isLandingPage) {
            // Delay Spline loading to prioritize content rendering
            const timer = setTimeout(() => setSplineLoaded(true), 1000);
            return () => clearTimeout(timer);
        } else {
            setSplineLoaded(false);
        }
    }, [isLowEndDevice, prefersReducedMotion, lightMode, isLandingPage]);

    // Time Mode용 데이터 가공 (카테고리 정보 포함 + 시간순 정렬)
    const timeSortedNews = useMemo(() => {
        if (viewMode !== 'time' || !isLandingPage) return [];

        const flattened: any[] = [];
        Object.entries(newsByCategory).forEach(([category, articles]) => {
            articles.forEach(article => {
                // 중복 방지를 위해 이미 포함된 경우 제외 (혹시 모를 중복 대비)
                if (!flattened.find(a => a.id === article.id)) {
                    flattened.push({ ...article, computedCategory: category });
                }
            });
        });

        // 최신순 정렬
        return flattened.sort((a, b) => {
            return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
        });
    }, [newsByCategory, viewMode, isLandingPage]);

    return (
        <div className="flex-1 space-y-4">
            {/* HERO SECTION */}
            {isLandingPage ? (
                <div className="relative w-full h-[40vh] sm:h-[50vh] min-h-[350px] sm:min-h-[450px] mb-8 overflow-hidden">
                    {/* Background: Spline for high-end, gradient fallback for low-end or light mode */}
                    <div className="absolute inset-0 z-0">
                        {splineLoaded && !isLowEndDevice && !prefersReducedMotion && !lightMode ? (
                            <iframe
                                src='https://my.spline.design/nexbotrobotcharacterconcept-JwuKwrHPzdqqnT2z04erjDBN/'
                                frameBorder='0'
                                width='100%'
                                height='100%'
                                className="w-full h-full mix-blend-multiply opacity-90 grayscale-[0.1]"
                                title="3D Robot Interaction"
                                loading="lazy"
                            />
                        ) : (
                            /* Simple white background for light mode / low-end devices */
                            <div className="w-full h-full bg-white" />
                        )}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background to-transparent pointer-events-none z-10" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 pointer-events-none z-20 px-4">
                        {prefersReducedMotion ? (
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground leading-tight drop-shadow-2xl text-center bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500 mb-6">
                                MARKET INTELLIGENCE
                            </h1>
                        ) : (
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground leading-tight drop-shadow-2xl text-center bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-500 mb-6"
                            >
                                MARKET INTELLIGENCE
                            </motion.h1>
                        )}
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-200 shadow-xl gpu-accelerated">
                            <span className="relative flex h-2 w-2 shrink-0">
                                {!prefersReducedMotion && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-[0.3em]">
                                AI-Powered Analysis
                            </span>
                        </div>
                    </div>


                    {/* View Mode Toggle (Landing Page Only) */}
                    <div className="absolute top-4 left-4 md:left-12 z-30">
                        <div className="flex items-center p-1 bg-white/95 backdrop-blur-md rounded-lg border border-gray-300 shadow-lg">
                            <button
                                onClick={() => setViewMode('category')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-300 ${viewMode === 'category'
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <LayoutGrid size={14} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Category</span>
                            </button>
                            <button
                                onClick={() => setViewMode('time')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-300 ${viewMode === 'time'
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <Clock size={14} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Time</span>
                            </button>
                        </div>
                    </div>

                    {/* Light Mode Toggle (Top Right) */}
                    <div className="absolute top-4 right-4 md:right-12 z-30">
                        <button
                            onClick={toggleLightMode}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border shadow-lg transition-all duration-300 ${lightMode
                                ? 'bg-amber-500 text-white border-amber-400'
                                : 'bg-white/95 backdrop-blur-md text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            title={lightMode ? '3D 모드로 전환' : '라이트 모드로 전환 (성능 향상)'}
                        >
                            <Zap size={14} className={lightMode ? 'fill-current' : ''} />
                            <span className="text-[11px] font-bold uppercase tracking-wider">
                                {lightMode ? 'Light' : '3D'}
                            </span>
                        </button>
                    </div>

                </div>
            ) : (
                <div className="pt-6 md:pt-8 px-4 md:px-6 lg:px-12">
                    <div className="flex flex-col gap-2 mb-2">
                        <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tighter text-foreground leading-tight uppercase">
                            {showCollections ? 'Collections' : selectedCategory ? selectedCategory : 'Market Intelligence'}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-1.5 w-1.5 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3182f6]"></span>
                            </span>
                            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                {selectedCategory ? `ACTIVE TRACKING: ${CATEGORIES_CONFIG.find(c => c.label === selectedCategory)?.keywords.length || 0}` : `Real-time Analysis`}
                            </div>
                        </div>
                        {selectedCategory && (
                            <div className="flex flex-wrap gap-1 mt-2 opacity-50">
                                {CATEGORIES_CONFIG.find(c => c.label === selectedCategory)?.keywords.map((k, i) => (
                                    <span key={i} className="text-[9px] text-muted-foreground border border-gray-200 px-1.5 py-0.5 rounded-full uppercase tracking-tight">{k}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            <div className="px-4 md:px-6 lg:px-12 pb-24">
                {showCollections ? (
                    <CollectionsView allNews={allNews} today={today} />
                ) : selectedCategory || searchQuery ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0 max-w-7xl"
                        >
                            {filteredNews.slice(0, displayCount).map((article) => (
                                <NewsRow key={article.id} article={article} today={today} />
                            ))}
                        </motion.div>

                        {/* Load More Button */}
                        {displayCount < filteredNews.length && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={() => setDisplayCount(prev => prev + ITEMS_PER_PAGE)}
                                    className="group relative px-8 py-3 bg-white hover:bg-[#3182f6] border border-gray-200 hover:border-[#3182f6] rounded-lg transition-all duration-300 overflow-hidden"
                                >
                                    <span className="relative z-10 text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">
                                        Load More ({filteredNews.length - displayCount})
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#3182f6]/0 via-[#3182f6]/10 to-[#3182f6]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (

                    <>
                        {viewMode === 'category' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 relative z-30">
                                {CATEGORIES_CONFIG.map((config, idx) => {
                                    const category = config.label;
                                    const articles = newsByCategory[category] || [];

                                    return (
                                        <motion.div
                                            key={category}
                                            initial={{ opacity: 0, y: 30 }}
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
                                                    <h2 className="text-xl font-black text-foreground tracking-tighter uppercase transition-colors group-hover/link:text-blue-600">
                                                        {category}
                                                    </h2>
                                                    <div className="h-1 w-6 bg-blue-600 rounded-full transition-all duration-500 group-hover/link:w-16 group-hover/link:bg-blue-400" />
                                                </Link>
                                            </div>

                                            <div className="relative z-10 flex flex-col gap-3.5">
                                                <AnimatePresence mode="popLayout">
                                                    {articles.slice(0, 8).map((article: any, i: number) => (
                                                        <motion.div
                                                            key={article.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: (idx * 0.05) + (i * 0.02) }}
                                                        >
                                                            <NewsCard article={article} today={today} />
                                                        </motion.div>
                                                    ))}
                                                </AnimatePresence>
                                                {(articles.length === 0) && (
                                                    <div className="py-12 text-center text-gray-300 text-[9px] uppercase font-bold tracking-[0.3em]">Awaiting Insight</div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-0 w-full"
                            >
                                {timeSortedNews.slice(0, displayCount).map((article: any, i: number) => (
                                    <NewsRow
                                        key={`${article.id}-${i}`}
                                        article={article}
                                        today={today}
                                        category={article.computedCategory} // Pass computed category
                                    />
                                ))}
                                {timeSortedNews.length === 0 && (
                                    <div className="col-span-full text-center py-20 text-muted-foreground">
                                        No news available.
                                    </div>
                                )}
                                {/* Load More Button for Time View */}
                                {displayCount < timeSortedNews.length && (
                                    <div className="col-span-full mt-12 flex justify-center">
                                        <button
                                            onClick={() => setDisplayCount(prev => prev + 20)}
                                            className="group relative px-8 py-3 bg-white hover:bg-[#3182f6] border border-gray-200 hover:border-[#3182f6] rounded-lg transition-all duration-300 overflow-hidden"
                                        >
                                            <span className="relative z-10 text-sm font-medium text-muted-foreground group-hover:text-white transition-colors">
                                                Load More ({timeSortedNews.length - displayCount})
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#3182f6]/0 via-[#3182f6]/10 to-[#3182f6]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </>
                )}
            </div >
        </div >
    );
}

// Internal components for clean rendering
function getTags(article: any) {
    let main: string[] = [];
    let sub: string[] = [];
    let summary: string | null = null;
    let issue_nature: string | null = null;

    if (article.main_keywords && article.main_keywords.length > 0) {
        const firstTag = article.main_keywords[0];
        const match = firstTag.match(/^\[(.*?)(?:\|(.*?))?(?:\|(.*?))?\]$/);
        if (match) {
            main = [match[1].trim()];
            if (match[2]) issue_nature = match[2].trim();
            if (match[3]) summary = match[3].trim();
            sub = article.main_keywords.slice(1);
        } else {
            if (firstTag.startsWith('[') && firstTag.endsWith(']')) {
                const content = firstTag.slice(1, -1);
                const parts = content.split('|').map(s => s.trim());
                main = [parts[0]];
                if (parts.length > 1) issue_nature = parts[1];
                if (parts.length > 2) summary = parts[2];
            } else {
                main = article.main_keywords;
            }
            sub = article.keywords || [];
        }
    } else if (article.keywords) {
        sub = article.keywords;
    }
    main = main.filter(m => m && m !== '-' && m !== '|' && m.trim() !== '');
    if (!issue_nature || issue_nature === '-' || issue_nature === '|' || issue_nature.trim() === '') issue_nature = null;
    if (!summary || summary === '-' || summary === '|' || summary.trim() === '') summary = null;
    return { main, sub, summary, issue_nature };
}

const NewsCard = React.memo(function NewsCard({ article, today }: { article: any, today: string }) {
    const analysis = getTags(article);
    const pubDate = article.published_at ? new Date(article.published_at) : null;
    const articleDate = pubDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const isToday = articleDate === today;

    // 어제 날짜 계산
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const isYesterday = articleDate === yesterdayStr;

    const dateStr = pubDate ? pubDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '';
    const timeStr = pubDate ? pubDate.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }) : '';

    let summaryText = analysis.summary && analysis.summary !== '-' ? analysis.summary : article.description;
    if (summaryText) summaryText = summaryText.replace(/^[\s\-\|]+/, '').trim();

    const uniqueKeywords = Array.from(new Set([...analysis.main, ...analysis.sub].filter(k => k && k !== '기타' && k !== '-' && k !== '|' && k.trim() !== '')));

    return (
        <motion.div
            whileHover={{ x: 2 }}
            className="group/card flex flex-col gap-0.5 pb-1.5 border-b border-gray-100 last:border-0 last:pb-0 relative transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        {isToday && (
                            <span className="text-[8px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded tracking-tighter uppercase inline-block leading-none shrink-0 border border-red-400/50">NEW</span>
                        )}
                        {isYesterday && !isToday && (
                            <span className="text-[8px] font-black text-amber-900 bg-amber-400 px-1.5 py-0.5 rounded tracking-tighter uppercase inline-block leading-none shrink-0 border border-amber-300/50">YDAY</span>
                        )}
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link text-[14px] font-bold text-foreground/90 group-hover/card:text-blue-600 transition-colors leading-tight line-clamp-2 block tracking-tight">
                            {article.title}
                        </a>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between mt-0.5">
                <div className="flex flex-wrap gap-1">
                    {uniqueKeywords.slice(0, 2).map((k, i) => (
                        <span key={i} className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 uppercase tracking-tight group-hover/card:border-blue-300 group-hover/card:text-blue-700 transition-all">
                            {k}
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono font-bold ${isToday ? 'text-red-500' : isYesterday ? 'text-amber-500' : 'text-gray-300'}`}>
                        {dateStr} {timeStr}
                    </span>
                    <CollectionButton newsLink={article.link} newsTitle={article.title} size={14} />
                </div>
            </div>
        </motion.div>
    );
});

const NewsRow = React.memo(function NewsRow({ article, today, category }: { article: any, today: string, category?: string }) {
    const analysis = getTags(article);
    const pubDate = article.published_at ? new Date(article.published_at) : null;
    const articleDate = pubDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const isToday = articleDate === today;

    // 어제 날짜 계산
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const isYesterday = articleDate === yesterdayStr;

    const dateStr = pubDate ? pubDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '';
    const timeStr = pubDate ? pubDate.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }) : '';

    let summaryText = analysis.summary && analysis.summary !== '-' ? analysis.summary : article.description;
    if (summaryText) summaryText = summaryText.replace(/^[\s\-\|]+/, '').trim();

    const uniqueKeywords = Array.from(new Set([...analysis.main, ...analysis.sub].filter(k => k && k !== '기타' && k !== '-' && k !== '|' && k.trim() !== '')));

    // Time View (랜딩페이지) - 넓은 레이아웃
    if (category) {
        return (
            <article className={`group py-3 sm:py-0.5 px-4 bg-white hover:bg-gray-50 border-b border-gray-100 transition-all duration-200 ${isToday ? 'bg-blue-50/30' : ''}`}>

                {/* 1. MOBILE LAYOUT (< sm) */}
                <div className="flex flex-col gap-2 sm:hidden">
                    {/* Top Row: Category (Left) - Date (Right) */}
                    <div className="flex items-center justify-between pb-1 border-b border-dashed border-gray-100/50">
                        <span className="text-[9px] font-black text-white bg-blue-500 px-1.5 py-0.5 rounded uppercase tracking-tight whitespace-nowrap">
                            {category}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-red-500' : isYesterday ? 'text-amber-500' : 'text-gray-400'}`}>
                            {dateStr} {timeStr}
                        </span>
                    </div>

                    {/* Middle Row: Title (Main Content) */}
                    <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                            <CollectionButton newsLink={article.link} newsTitle={article.title} size={16} />
                        </div>
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link flex-1 min-w-0 block">
                            <h3 className="text-[15px] font-bold text-gray-900 leading-snug tracking-tight group-hover:text-[#3182f6] transition-colors line-clamp-2">
                                {isToday && <span className="text-[8px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded mr-1.5 align-middle">NEW</span>}
                                {isYesterday && !isToday && <span className="text-[8px] font-black text-amber-900 bg-amber-400 px-1.5 py-0.5 rounded mr-1.5 align-middle">YDAY</span>}
                                {article.title}
                            </h3>
                        </a>
                    </div>

                    {/* Bottom Row: Keywords */}
                    {uniqueKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5 pl-6">
                            {uniqueKeywords.slice(0, 3).map((k, i) => (
                                <span key={i} className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tight border border-blue-200">
                                    {k}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. DESKTOP LAYOUT (>= sm) */}
                <div className="hidden sm:flex items-start gap-4">
                    {/* Left: Time + Category */}
                    <div className="flex flex-col items-start gap-0.5 w-[140px] shrink-0 pt-0.5">
                        <span className={`text-[11px] font-mono font-bold ${isToday ? 'text-red-500' : isYesterday ? 'text-amber-500' : 'text-gray-500'}`}>
                            {dateStr} {timeStr}
                        </span>
                        <span className="inline-block text-[9px] font-black text-white bg-blue-500 px-1.5 py-0.5 rounded uppercase tracking-tight whitespace-nowrap">
                            {category}
                        </span>
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 min-w-0 w-full">
                        <div className="flex flex-wrap gap-1 mb-0.5">
                            {uniqueKeywords.slice(0, 4).map((k, i) => (
                                <span key={i} className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tight border border-blue-200">{k}</span>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="mt-0">
                                <CollectionButton newsLink={article.link} newsTitle={article.title} size={14} />
                            </div>
                            <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link flex-1 min-w-0 block">
                                <h3 className="text-[13px] font-bold text-inherit group-hover:text-[#3182f6] transition-colors leading-tight truncate">
                                    {isToday && <span className="text-[8px] font-black text-white bg-red-500 px-1 py-0.5 rounded mr-1 align-middle">NEW</span>}
                                    {isYesterday && !isToday && <span className="text-[8px] font-black text-amber-900 bg-amber-400 px-1 py-0.5 rounded mr-1 align-middle">YDAY</span>}
                                    {article.title}
                                </h3>
                            </a>
                        </div>
                    </div>
                </div>
            </article>
        );
    }

    // Category Page - 더 크고 넓은 레이아웃
    return (
        <article className={`group py-3 sm:py-1.5 px-4 bg-white hover:bg-gray-50 border-b border-gray-100 transition-all duration-200 ${isToday ? 'bg-blue-50/30' : ''}`}>
            {/* 1. MOBILE LAYOUT (< sm) - Same as Time View for consistency */}
            <div className="flex flex-col gap-2 sm:hidden">
                {/* Top Row: Date (Right) */}
                <div className="flex items-center justify-end pb-1 border-b border-dashed border-gray-100/50">
                    <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-red-500' : isYesterday ? 'text-amber-500' : 'text-gray-400'}`}>
                        {dateStr} {timeStr}
                    </span>
                </div>

                {/* Middle Row: Title (Main Content) */}
                <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                        <CollectionButton newsLink={article.link} newsTitle={article.title} size={16} />
                    </div>
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link flex-1 min-w-0 block">
                        <h3 className="text-[15px] font-bold text-gray-900 leading-snug tracking-tight group-hover:text-[#3182f6] transition-colors line-clamp-2">
                            {isToday && <span className="text-[8px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded mr-1.5 align-middle">NEW</span>}
                            {isYesterday && !isToday && <span className="text-[8px] font-black text-amber-900 bg-amber-400 px-1.5 py-0.5 rounded mr-1.5 align-middle">YDAY</span>}
                            {article.title}
                        </h3>
                    </a>
                </div>

                {/* Bottom Row: Keywords */}
                {uniqueKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5 pl-6">
                        {uniqueKeywords.slice(0, 3).map((k, i) => (
                            <span key={i} className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tight border border-blue-200">
                                {k}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. DESKTOP LAYOUT (>= sm) - Original Layout */}
            <div className="hidden sm:flex items-start gap-4">
                {/* Left: Time */}
                <div className="flex flex-col items-start gap-0.5 w-[85px] shrink-0 pt-0.5">
                    <span className={`text-[11px] font-mono font-bold ${isToday ? 'text-red-500' : isYesterday ? 'text-amber-500' : 'text-gray-500'}`}>
                        {dateStr} {timeStr}
                    </span>
                </div>
                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-0.5">
                        {uniqueKeywords.slice(0, 4).map((k, i) => (
                            <span key={i} className="text-[9px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tight border border-blue-200">{k}</span>
                        ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="mt-0">
                            <CollectionButton newsLink={article.link} newsTitle={article.title} size={14} />
                        </div>
                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="news-link flex-1 min-w-0 block">
                            <h3 className="text-[13px] font-bold text-inherit group-hover:text-[#3182f6] transition-colors leading-tight truncate">
                                {isToday && <span className="text-[8px] font-black text-white bg-red-500 px-1 py-0.5 rounded mr-1 align-middle">NEW</span>}
                                {isYesterday && !isToday && <span className="text-[8px] font-black text-amber-900 bg-amber-400 px-1 py-0.5 rounded mr-1 align-middle">YDAY</span>}
                                {article.title}
                            </h3>
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
});
