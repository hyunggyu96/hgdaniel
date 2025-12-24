import React from 'react';
import Link from 'next/link';
import { getNews } from '@/lib/api';
import { groupNewsByCategory, CATEGORIES_CONFIG } from '@/lib/constants';
import { TrendingUp, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import CollectionButton from './CollectionButton';
import CollectionsView from './CollectionsView';

interface NewsListProps {
    selectedCategory?: string | null;
    currentPage?: number;
    showCollections?: boolean;
}

// 스키마 변경 대응: article 객체에서 태그 정보 추출
function getTags(article: any) {
    let main: string[] = [];
    let sub: string[] = [];
    let summary: string | null = null;
    let issue_nature: string | null = null;

    // 1. New Schema (keywords, main_keywords)
    if (article.main_keywords && article.main_keywords.length > 0) {
        const firstTag = article.main_keywords[0];
        // Check for encoded format: [Main | Issue | Summary]
        // Allow for loose matching (spaces around pipes)
        const match = firstTag.match(/^\[(.*?)(?:\|(.*?))?(?:\|(.*?))?\]$/);

        if (match) {
            // Extracted from encoded string
            main = [match[1].trim()];
            if (match[2]) issue_nature = match[2].trim();
            if (match[3]) summary = match[3].trim();
            // Rest of main_keywords are actually included keywords
            sub = article.main_keywords.slice(1);
        } else {
            // Fallback: If it starts with [ and ends with ], treat it as a raw tag and clean it
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
    // 2. Legacy Schema (Fallback parsing from summary_bullets)
    else {
        const summaryBullets = article.summary_bullets || [];
        const tagLine = summaryBullets.find((b: string) => b.startsWith("TAGS: ["));
        const keywordLine = summaryBullets.find((b: string) => b.startsWith("KEYWORDS:"));

        // Legacy TAGS format: [Company | Brand | Stock] -> Treat as Main Keywords
        if (tagLine) {
            const match = tagLine.match(/\[(.*?)\]/);
            if (match && match[1]) {
                main = match[1].split('|').map((p: string) => p.trim()).filter((p: string) => p !== '-' && p !== '');
            }
        }
        // Legacy KEYWORDS format -> Sub Keywords
        if (keywordLine) {
            sub = keywordLine.replace("KEYWORDS:", "").split(",").map((k: string) => k.trim());
        }
    }

    // Final Sanitation: Remove meaningless characters
    main = main.filter(m => m && m !== '-' && m !== '|' && m.trim() !== '');
    if (!issue_nature || issue_nature === '-' || issue_nature === '|' || issue_nature.trim() === '') issue_nature = null;
    if (!summary || summary === '-' || summary === '|' || summary.trim() === '') summary = null;

    return { main, sub, summary, issue_nature };
}

function MarketBadge({ main_keywords, sub_keywords, sector }: { main_keywords: string[], sub_keywords: string[], sector: string }) {
    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Sector Badge */}
            <span className="text-[11px] font-black text-white bg-blue-600 px-3 py-1 rounded-lg uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/30">
                {sector || 'NEWS'}
            </span>

            {/* Main Keywords (Top Priority) */}
            {main_keywords.slice(0, 3).map((k, i) => (
                <span key={`main-${i}`} className="text-[10px] font-bold text-white bg-white/10 border border-white/20 px-2.5 py-1 rounded-md uppercase tracking-wide">
                    {k}
                </span>
            ))}

            {/* Sub Keywords (Secondary) */}
            {sub_keywords.slice(0, 2).map((k, i) => (
                <span key={`sub-${i}`} className="text-[10px] font-bold text-white/50 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md uppercase tracking-wide">
                    {k}
                </span>
            ))}
        </div>
    );
}


export default async function NewsList({ selectedCategory, currentPage = 1, searchQuery, showCollections }: NewsListProps & { searchQuery?: string, showCollections?: boolean }) {
    const allNews = await getNews();
    const newsByCategory = groupNewsByCategory(allNews);
    const itemsPerPage = 20;

    // Filter news by category first
    let filteredNews = [];
    if (selectedCategory) {
        filteredNews = newsByCategory[selectedCategory] || [];
    } else {
        filteredNews = allNews;
    }

    // Apply search filter if query exists
    if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredNews = filteredNews.filter(article =>
            article.title?.toLowerCase().includes(query) ||
            article.description?.toLowerCase().includes(query) ||
            article.main_keywords?.some((kw: string) => kw.toLowerCase().includes(query))
        );
    }

    // Filter by collections if requested (client-side filtering will be handled by CollectionsView)
    const isCollectionsView = showCollections;

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

    return (
        <div className="flex-1 space-y-12">
            {/* Header */}
            <div className="pt-8 md:pt-12 px-4 md:px-6 lg:px-12">
                <div className="flex flex-col gap-4 mb-4">
                    <h2 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase tracking-tighter text-white leading-tight">
                        {isCollectionsView ? 'Collections' : selectedCategory ? selectedCategory : 'Market Intelligence'}
                    </h2>
                    <div className="flex items-start gap-2">
                        <span className="relative flex h-2 w-2 mt-1 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3182f6]"></span>
                        </span>
                        <div className="text-[10px] font-bold text-white/40 uppercase leading-relaxed">
                            <span className="tracking-[0.4em] mr-2">
                                {selectedCategory ? `Active Tracking:` : `Real-time Analysis`}
                            </span>
                            {selectedCategory && (
                                <span className="tracking-tight text-white/50">
                                    {CATEGORIES_CONFIG.find(c => c.label === selectedCategory)?.keywords.join(', ')}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-2">
                        Last Updated: {(() => {
                            const latestArticle = allNews.reduce((latest, article) => {
                                const articleDate = article.published_at ? new Date(article.published_at) : new Date(0);
                                const latestDate = latest.published_at ? new Date(latest.published_at) : new Date(0);
                                return articleDate > latestDate ? article : latest;
                            }, allNews[0] || {});

                            const timestamp = latestArticle.published_at
                                ? new Date(latestArticle.published_at).toLocaleString('ko-KR', {
                                    timeZone: 'Asia/Seoul',
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                }).replace(/\. /g, '.').replace(/\.$/, '').replace(', ', ' ')
                                : 'N/A';

                            return timestamp;
                        })()}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="px-4 md:px-6 lg:px-12 pb-24">
                {isCollectionsView ? (
                    <CollectionsView allNews={allNews} today={today} />
                ) : selectedCategory || searchQuery ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-0 max-w-7xl">
                        {paginatedNews.map((article) => (
                            <NewsRow key={article.id} article={article} today={today} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                        {Object.keys(newsByCategory).map((category) => (
                            <div key={category} className="space-y-4 flex flex-col items-center w-full bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                                <div className="w-full text-center border-b border-white/10 pb-4 mb-2">
                                    <Link
                                        href={`/?category=${encodeURIComponent(category)}`}
                                        className="flex flex-col items-center justify-center gap-2 group/header hover:opacity-80 transition-opacity w-full"
                                    >
                                        <h3 className="text-xl font-black uppercase tracking-wider text-white group-hover/header:text-[#3182f6] transition-colors">
                                            {category}
                                        </h3>
                                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover/header:opacity-100 transition-opacity w-full px-2">
                                            <span className="relative flex h-1.5 w-1.5 shrink-0">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3182f6]"></span>
                                            </span>
                                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-tight leading-none truncate max-w-full">
                                                {CATEGORIES_CONFIG.find(c => c.label === category)?.keywords.join(', ')}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                                <div className="w-full flex flex-col gap-3">
                                    {newsByCategory[category].slice(0, 10).map((article: any) => (
                                        <NewsCard key={article.id} article={article} today={today} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination - Only show for category/search views, not collections */}
                {!isCollectionsView && (selectedCategory || searchQuery) && totalPages > 1 && (
                    <div className="mt-24 flex items-center justify-center gap-4">
                        {(currentPage > 1) && (
                            <Link
                                href={`/?${selectedCategory ? `category=${encodeURIComponent(selectedCategory)}&` : ''}${searchQuery ? `search=${encodeURIComponent(searchQuery)}&` : ''}page=${currentPage - 1}`}
                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-[#3182f6] hover:border-[#3182f6] transition-all"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                        )}
                        <span className="text-white/50 text-sm font-bold">Page {currentPage} of {totalPages}</span>
                        {currentPage < totalPages && (
                            <Link
                                href={`/?${selectedCategory ? `category=${encodeURIComponent(selectedCategory)}&` : ''}${searchQuery ? `search=${encodeURIComponent(searchQuery)}&` : ''}page=${currentPage + 1}`}
                                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-[#3182f6] hover:border-[#3182f6] transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}

// 🚀 Ultra Compact Card for Dashboard
const NewsCard = React.memo(function NewsCard({ article, today }: { article: any, today: string }) {
    const analysis = getTags(article);
    const pubDate = article.published_at ? new Date(article.published_at) : null;
    const isToday = pubDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }) === today;
    const dateStr = pubDate ? pubDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '';

    // Fallback logic for summary
    let summaryText = analysis.summary && analysis.summary !== '-' ? analysis.summary : article.description;
    // Clean up unwanted prefix like "- | - | " caused by parsing errors
    if (summaryText) {
        summaryText = summaryText.replace(/^[\s\-\|]+/, '').replace(/^[\s\-\|]+/, '').trim();
    }

    return (
        <div className="group/article flex flex-col gap-0 w-full pb-2 border-b border-dashed border-white/5 last:border-0 last:pb-0 relative pl-3">
            {/* Left accent line */}
            <div className={`absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full transition-colors ${isToday ? 'bg-[#3182f6]' : 'bg-white/10 group-hover/article:bg-blue-500/50'}`} />

            <div className="flex items-start justify-between gap-3">
                <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white/90 group-hover/article:text-[#3182f6] transition-colors leading-snug line-clamp-2"
                >
                    {/* Show Main Keyword if available, else Sector */}


                    {article.title}
                </a>
                <div className={`shrink-0 flex flex-col items-end text-[10px] font-mono font-bold leading-tight w-[52px] text-right ${isToday ? 'text-blue-400' : 'text-white/40'}`}>
                    <span>{dateStr}</span>
                    <span className="text-[9px] font-medium opacity-80">{pubDate ? pubDate.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</span>
                    <div className="mt-1">
                        <CollectionButton newsLink={article.link} />
                    </div>
                </div>
            </div>

            {/* Keywords */}
            {analysis.sub.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {analysis.sub.slice(0, 3).map((k, i) => (
                        <span key={`sub-${i}`} className="text-[8px] text-white/60 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                            {k}
                        </span>
                    ))}
                </div>
            )}

            {(summaryText) && (
                <p className="text-[10px] text-white/40 leading-relaxed line-clamp-1 pr-4">
                    {summaryText}
                </p>
            )}
        </div>
    );
});

// 🚀 Dense Layout Row (Expert 9-column style focus)
const NewsRow = React.memo(function NewsRow({ article, today }: { article: any, today: string }) {
    const analysis = getTags(article);
    const pubDate = article.published_at ? new Date(article.published_at) : null;
    const isToday = pubDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }) === today;
    const dateStr = pubDate ? pubDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '';
    const timeStr = pubDate ? pubDate.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }) : '';

    // Fallback logic for summary
    let summaryText = analysis.summary && analysis.summary !== '-' ? analysis.summary : article.description;
    // Clean up unwanted prefix like "- | - | " caused by parsing errors
    if (summaryText) {
        summaryText = summaryText.replace(/^[\s\-\|]+/, '').replace(/^[\s\-\|]+/, '').trim();
    }

    return (
        <article className={`group py-1.5 px-3 hover:bg-white/[0.03] transition-colors border-b border-white/5 flex flex-col gap-1 relative ${isToday ? 'bg-blue-900/5' : ''}`}>

            {/* Top Row: Meta */}
            <div className="flex items-center gap-2 text-[9px] h-4">
                {/* Col 7: Publishing Time */}
                <span className={`font-mono font-bold tracking-tight text-[10px] ${isToday ? 'text-blue-400' : 'text-white/50'}`}>
                    {dateStr} <span className="text-[9px] font-medium opacity-80 ml-0.5">{timeStr}</span>
                </span>

                {isToday && (
                    <span className="ml-auto text-[8px] font-bold text-white bg-red-600 px-1 py-0.5 rounded shadow-sm">TODAY</span>
                )}
            </div>

            {/* Middle Row: Title & Summary */}
            <div className="flex gap-2 items-start">
                <CollectionButton newsLink={article.link} />
                <div className="flex-1 min-w-0 flex flex-col md:flex-row gap-2 md:items-start md:justify-between">
                    {/* Col 3: Headline */}
                    <div className="flex-1 min-w-0">
                        <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group/link"
                        >
                            <h3 className="text-sm md:text-base font-bold text-white/90 leading-tight group-hover/link:text-[#3182f6] truncate pr-2">
                                {article.title}
                            </h3>
                        </a>

                        {/* Col 9: AI One-line Summary (Fallback to Description if parsing fails) */}
                        <p className="mt-0.5 text-[11px] text-white/50 leading-snug font-medium line-clamp-1">
                            {summaryText}
                        </p>
                    </div>
                </div>

                {/* Bottom Row: Included Keywords */}
                {/* Col 6: Included Keywords */}
                <div className="flex flex-wrap gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    {analysis.sub.length > 0 ? (
                        analysis.sub.map((k, i) => (
                            <span key={i} className="text-[8px] text-white/60 bg-white/5 px-1 py-0.5 rounded border border-white/5">
                                {k}
                            </span>
                        ))
                    ) : (
                        <span className="text-[8px] text-white/20">-</span>
                    )}
                </div>
            </div>
        </article >
    );
});
