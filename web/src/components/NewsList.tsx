import React, { Suspense } from 'react';
import Link from 'next/link';
import { getNews } from '@/lib/api';
import { groupNewsByCategory, CATEGORIES_CONFIG } from '@/lib/constants';
import { TrendingUp, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import CollectionButton from './CollectionButton';
import CollectionsView from './CollectionsView';

interface NewsListProps {
    selectedCategory?: string | null;
    currentPage?: number;
    searchQuery?: string;
    showCollections?: boolean;
}

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

export default async function NewsList({ selectedCategory, currentPage = 1, searchQuery, showCollections }: NewsListProps) {
    const allNews = await getNews();
    const newsByCategory = groupNewsByCategory(allNews);
    const itemsPerPage = 20;

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

    const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
    const paginatedNews = filteredNews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

    return (
        <div className="flex-1 space-y-8">
            <div className="pt-8 md:pt-10 px-4 md:px-6 lg:px-12">
                <div className="flex flex-col gap-3 mb-4">
                    <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold tracking-tighter text-white leading-tight">
                        {showCollections ? 'Collections' : selectedCategory ? selectedCategory : 'Market Intelligence'}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3182f6]"></span>
                        </span>
                        <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
                            {selectedCategory ? `Active Tracking` : `Real-time Analysis`}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-6 lg:px-12 pb-24">
                {showCollections ? (
                    <CollectionsView allNews={allNews} today={today} />
                ) : selectedCategory || searchQuery ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-0 max-w-7xl">
                        {paginatedNews.map((article) => (
                            <NewsRow key={article.id} article={article} today={today} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Object.keys(newsByCategory).map((category) => (
                            <div key={category} className="group/theme bg-white/[0.03] border border-white/5 rounded-[24px] p-6 relative overflow-hidden transition-all duration-300 hover:border-blue-500/20 flex flex-col gap-5 shadow-xl h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/0 group-hover/theme:bg-blue-500/5 blur-[80px] rounded-full transition-all duration-700" />

                                <div className="relative z-10 w-full text-center min-h-[100px] flex flex-col items-center justify-center border-b border-white/5 pb-4">
                                    <Link href={`/?category=${encodeURIComponent(category)}`} className="group/link flex flex-col items-center gap-1.5">
                                        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase transition-colors group-hover/link:text-[#3182f6]">
                                            {category}
                                        </h2>
                                        <div className="h-0.5 w-10 bg-blue-600 rounded-full" />

                                        <div className="opacity-0 group-hover/theme:opacity-100 transition-all duration-300 transform translate-y-1 group-hover/theme:translate-y-0 mt-2 h-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest whitespace-nowrap">
                                                    {CATEGORIES_CONFIG.find(c => c.label === category)?.keywords.slice(0, 4).join(', ')}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="relative z-10 flex flex-col gap-4">
                                    {newsByCategory[category].slice(0, 6).map((article: any) => (
                                        <NewsCard key={article.id} article={article} today={today} />
                                    ))}
                                    {(!newsByCategory[category] || newsByCategory[category].length === 0) && (
                                        <div className="py-12 text-center text-white/5 text-[9px] uppercase font-bold tracking-widest">Awaiting Updates...</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!showCollections && (selectedCategory || searchQuery) && totalPages > 1 && (
                    <div className="mt-24 flex items-center justify-center gap-4">
                        {currentPage > 1 && (
                            <Link href={`/?${selectedCategory ? `category=${encodeURIComponent(selectedCategory)}&` : ''}${searchQuery ? `search=${encodeURIComponent(searchQuery)}&` : ''}page=${currentPage - 1}`} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-[#3182f6] transition-all"><ChevronLeft className="w-4 h-4" /></Link>
                        )}
                        <span className="text-white/40 text-xs font-medium">Page {currentPage} / {totalPages}</span>
                        {currentPage < totalPages && (
                            <Link href={`/?${selectedCategory ? `category=${encodeURIComponent(selectedCategory)}&` : ''}${searchQuery ? `search=${encodeURIComponent(searchQuery)}&` : ''}page=${currentPage + 1}`} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-[#3182f6] transition-all"><ChevronRight className="w-4 h-4" /></Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const NewsCard = React.memo(function NewsCard({ article, today }: { article: any, today: string }) {
    const analysis = getTags(article);
    const pubDate = article.published_at ? new Date(article.published_at) : null;
    const isToday = pubDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }) === today;
    const dateStr = pubDate ? pubDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '';

    let summaryText = analysis.summary && analysis.summary !== '-' ? analysis.summary : article.description;
    if (summaryText) summaryText = summaryText.replace(/^[\s\-\|]+/, '').trim();

    const uniqueKeywords = Array.from(new Set([...analysis.main, ...analysis.sub].filter(k => k && k !== '기타' && k !== '-' && k !== '|' && k.trim() !== '')));

    return (
        <div className="group/card flex flex-col gap-1 pb-3 border-b border-white/[0.03] last:border-0 last:pb-0 relative">
            {isToday && (
                <div className="mb-0.5">
                    <span className="text-[7px] font-bold text-white bg-red-600 px-1 py-0.5 rounded shadow-sm tracking-tighter uppercase inline-block leading-none">TODAY</span>
                </div>
            )}
            <div className="flex items-start justify-between gap-2">
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-white/90 group-hover/card:text-[#3182f6] transition-colors leading-snug line-clamp-2">
                    {article.title}
                </a>
                <div className={`shrink-0 text-[9px] font-mono font-medium text-right min-w-[40px] ${isToday ? 'text-blue-400' : 'text-white/20'}`}>
                    {dateStr}
                </div>
            </div>
            <div className="flex items-center justify-between mt-1">
                <div className="flex flex-wrap gap-1">
                    {uniqueKeywords.slice(0, 3).map((k, i) => (
                        <span key={i} className="text-[8px] font-medium text-blue-400/80 bg-blue-400/5 px-1.5 py-0.5 rounded border border-blue-400/5 uppercase tracking-tighter">
                            {k}
                        </span>
                    ))}
                </div>
                <CollectionButton newsLink={article.link} newsTitle={article.title} size={16} />
            </div>
        </div>
    );
});

const NewsRow = React.memo(function NewsRow({ article, today }: { article: any, today: string }) {
    const analysis = getTags(article);
    const pubDate = article.published_at ? new Date(article.published_at) : null;
    const isToday = pubDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }) === today;
    const dateStr = pubDate ? pubDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '';
    const timeStr = pubDate ? pubDate.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }) : '';

    let summaryText = analysis.summary && analysis.summary !== '-' ? analysis.summary : article.description;
    if (summaryText) summaryText = summaryText.replace(/^[\s\-\|]+/, '').trim();

    const uniqueKeywords = Array.from(new Set([...analysis.main, ...analysis.sub].filter(k => k && k !== '기타' && k !== '-' && k !== '|' && k.trim() !== '')));

    return (
        <article className={`group py-4 px-6 hover:bg-white/[0.03] border-b border-white/5 flex flex-col gap-1 transition-all ${isToday ? 'bg-blue-400/[0.03]' : ''}`}>
            <div className="flex items-center justify-between text-[10px] font-mono font-medium">
                <span className={isToday ? 'text-blue-400' : 'text-white/30'}>{dateStr} {timeStr}</span>
                {isToday && <span className="text-[8px] bg-red-600 px-1 py-0.5 rounded text-white font-bold">TODAY</span>}
            </div>
            <div className="flex gap-4 items-start">
                <div className="pt-0.5">
                    <CollectionButton newsLink={article.link} newsTitle={article.title} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="block"><h3 className="text-sm md:text-base font-medium text-white group-hover:text-[#3182f6] transition-colors line-clamp-1">{article.title}</h3></a>
                    <p className="text-[11px] text-white/30 truncate mt-0.5 leading-snug">{summaryText}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-1 pl-8">
                {uniqueKeywords.slice(0, 5).map((k, i) => (
                    <span key={i} className="text-[9px] font-medium text-white/20 bg-white/5 px-2 py-0.5 rounded border border-white/5 group-hover:border-blue-400/30 group-hover:text-blue-400 transition-all uppercase tracking-tighter">{k}</span>
                ))}
            </div>
        </article>
    );
});
