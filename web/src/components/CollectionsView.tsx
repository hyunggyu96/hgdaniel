'use client';

import { useCollection } from './CollectionContext';
import CollectionButton from './CollectionButton';
import ExportCollectionsButton from './ExportCollectionsButton';

interface CollectionsViewProps {
    allNews: any[];
    today: string;
}

export default function CollectionsView({ allNews, today }: CollectionsViewProps) {
    const { collections, isLoading } = useCollection();

    const collectedNews = allNews.filter(article => collections.includes(article.link));

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-0 max-w-7xl animate-pulse">
                {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="h-24 bg-white/5 border-b border-white/5 mx-3 my-1.5 rounded-lg" />
                ))}
            </div>
        );
    }

    if (collectedNews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6 animate-in fade-in duration-500">
                <span className="text-6xl mb-4">⭐</span>
                <h2 className="text-2xl font-bold text-white/90 mb-2">No Collections Yet</h2>
                <p className="text-white/50 text-center max-w-md">
                    Click the star icon on any news article to add it to your collections.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Export Button */}
            <div className="flex justify-center">
                <ExportCollectionsButton collectedNews={collectedNews} />
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-0 max-w-7xl">
                {collectedNews.map((article) => {
                    const pubDate = article.published_at ? new Date(article.published_at) : null;
                    const isToday = pubDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }) === today;
                    const dateStr = pubDate ? pubDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') : '';
                    const timeStr = pubDate ? pubDate.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false }) : '';

                    return (
                        <article key={article.id} className={`group py-1.5 px-3 hover:bg-white/[0.03] transition-colors border-b border-white/5 flex gap-2 items-start ${isToday ? 'bg-blue-900/5' : ''}`}>
                            <CollectionButton newsLink={article.link} newsTitle={article.title} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 text-[9px] h-4 mb-1">
                                    <span className={`font-mono font-bold tracking-tight text-[10px] ${isToday ? 'text-blue-400' : 'text-white/50'}`}>
                                        {dateStr} <span className="text-[9px] font-medium opacity-80 ml-0.5">{timeStr}</span>
                                    </span>
                                </div>
                                <a
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group/link"
                                >
                                    <h3 className="text-sm md:text-base font-bold text-white/90 leading-tight group-hover/link:text-[#3182f6] truncate">
                                        {article.title}
                                    </h3>
                                </a>
                                {article.description && (
                                    <p className="mt-0.5 text-[11px] text-white/50 leading-snug font-medium line-clamp-1">
                                        {article.description}
                                    </p>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
