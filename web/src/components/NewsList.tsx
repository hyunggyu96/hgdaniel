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
        <div className="flex-1 space-y-12">
            <div className="pt-8 md:pt-12 px-4 md:px-6 lg:px-12">
                <div className="flex flex-col gap-4 mb-4">
                    <h1 className="text-2xl md:text-3xl lg:text-5xl font-black uppercase tracking-tighter text-white leading-tight">
                        {showCollections ? 'Collections' : selectedCategory ? selectedCategory : 'Market Intelligence'}
                    </h1>
                    <div className="flex items-start gap-2">
                        <span className="relative flex h-2 w-2 mt-1 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3182f6]"></span>
                        </span>
                        <div className="text-[10px] font-bold text-white/40 uppercase leading-relaxed font-mono">
                            <span className="tracking-[0.4em] mr-2">{selectedCategory ? `Active Tracking:` : `Real-time Analysis`}</span>
                            {selectedCategory && (
                                <span className="tracking-tight text-white/50">
                                    {CATEGORIES_CONFIG.find(c => c.label === selectedCategory)?.keywords.join(', ')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-6 lg:px-12 pb-24">
                {showCollections ? (
                    <CollectionsView allNews={allNews} today={today} />
                ) : selectedCategory || searchQuery ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-0 max-w-7xl">
                        {paginatedNews.map((article) => (
                            <NewsRow key={article.id} article={article} today={today} />
                        ))}
                    </div>
                ) : (
                    /* � UNIFIED CATEGORY GRID WITH PREMIUM EFFECTS */
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                        {Object.keys(newsByCategory).map((category) => (
                            <div key={category} className="group/section flex flex-col gap-6 bg-white/[0.03] p-6 rounded-[24px] border border-white/5 hover:border-[#3182f6]/30 hover:bg-white/[0.05] transition-all duration-500 relative overflow-hidden h-full">
                                {/* Subtle Glow Effect for EVERY category */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/0 group-hover/section:bg-blue-500/10 blur-[60px] rounded-full transition-all duration-700" />

                                {/* HEADER: Fixed minimum height leads to perfect alignment */}
                                <div className="flex items-start justify-between min-h-[85px] border-b border-white/10 pb-4 relative z-10">
                                    <div className="space-y-1.5 flex-1 pr-4">
                                        <h3 className="text-xl md:text-2xl font-black uppercase text-white tracking-widest leading-[1.1] group-hover/section:text-[#3182f6] transition-colors break-words">
                                            {category}
                                        </h3>
                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Strategic Sector</p>
                                    </div>
                                    <div className="shrink-0 pt-1">
                                        <Link href={`/?category=${encodeURIComponent(category)}`} className="text-[9px] font-black text-[#3182f6] opacity-40 group-hover/section:opacity-100 hover:bg-[#3182f6] hover:text-white px-3 py-1.5 rounded-full border border-[#3182f6]/30 transition-all uppercase tracking-widest leading-none">
                                            Explore
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 relative z-10">
                                    {newsByCategory[category].slice(0, 10).map((article: any) => (
                                        <NewsCard key={article.id} article={article} today={today} />
                                    ))}
                                    {(!newsByCategory[category] || newsByCategory[category].length === 0) && (
                                        <div className="py-12 text-center text-white/5 text-[10px] uppercase font-bold tracking-widest italic">Awaiting Market Updates...</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!showCollections && (selectedCategory || searchQuery) && totalPages > 1 && (
                    <div className="mt-24 flex items-center justify-center gap-4">
                        {currentPage > 1 && (
                            <Link href={`/?${selectedCategory ? `category=${encodeURIComponent(selectedCategory)}&` : ''}${searchQuery ? `search=${encodeURIComponent(searchQuery)}&` : ''}page=${currentPage - 1}`} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-[#3182f6] transition-all"><ChevronLeft className="w-5 h-5" /></Link>
                        )}
                        <span className="text-white/50 text-sm font-bold">Page {currentPage} of {totalPages}</span>
                        {currentPage < totalPages && (
                            <Link href={`/?${selectedCategory ? `category=${encodeURIComponent(selectedCategory)}&` : ''}${searchQuery ? `search=${encodeURIComponent(searchQuery)}&` : ''}page=${currentPage + 1}`} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-[#3182f6] transition-all"><ChevronRight className="w-5 h-5" /></Link>
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
        <div className="group/card flex flex-col gap-1.5 pb-3 border-b border-white/[0.03] last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
                <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white/80 group-hover/card:text-[#3182f6] transition-colors leading-tight line-clamp-2">
                    {article.title}
                </a>
                <div className={`shrink-0 text-[9px] font-mono font-bold text-right ${isToday ? 'text-blue-400' : 'text-white/20'}`}>{dateStr}</div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                    {uniqueKeywords.slice(0, 3).map((k, i) => (
                        <span key={i} className="text-[8px] font-bold text-blue-400/80 bg-blue-400/5 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-blue-400/10">{k}</span>
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
        <article className={`group py-3 px-4 hover:bg-white/[0.03] border-b border-white/5 flex flex-col gap-2 transition-all ${isToday ? 'bg-blue-400/[0.03]' : ''}`}>
            <div className="flex items-center justify-between text-[10px] font-mono font-black">
                <span className={isToday ? 'text-blue-400' : 'text-white/30'}>{dateStr} {timeStr}</span>
                {isToday && <span className="text-[8px] bg-red-600 px-1 py-0.5 rounded text-white">NEW</span>}
            </div>
            <div className="flex gap-3 items-start">
                <CollectionButton newsLink={article.link} newsTitle={article.title} size={16} />
                <div className="flex-1 min-w-0">
                    <a href={article.link} target="_blank" rel="noopener noreferrer" className="block"><h3 className="text-sm md:text-base font-bold text-white group-hover:text-[#3182f6] truncate transition-colors">{article.title}</h3></a>
                    <p className="text-[11px] text-white/40 truncate mt-1">{summaryText}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5 pl-7">
                {uniqueKeywords.map((k, i) => (
                    <span key={i} className="text-[9px] font-black text-blue-100/50 bg-white/5 px-2 py-0.5 rounded border border-white/5 group-hover:border-blue-400/30 group-hover:text-blue-400 transition-all uppercase tracking-tighter">{k}</span>
                ))}
            </div>
        </article>
    );
});
