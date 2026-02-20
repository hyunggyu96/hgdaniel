'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, Trash2 } from 'lucide-react';
import { useCollection } from './CollectionContext';
import { useUser } from './UserContext';
import { useLanguage } from './LanguageContext';
import CollectionButton from './CollectionButton';
import ExportCollectionsButton from './ExportCollectionsButton';
import { fmtDateKST, toDateKey } from '@/lib/utils';

interface CollectionsViewProps {
    allNews: any[];
    today: string;
}

interface PaperCollectionRow {
    item_key: string;
    title?: string | null;
    url?: string | null;
    metadata?: Record<string, any> | null;
    created_at?: string;
}

interface PaperCollectionItem {
    itemKey: string;
    title: string;
    journal: string;
    publicationDate: string;
    link: string;
    createdAt: string;
}

export default function CollectionsView({ allNews, today }: CollectionsViewProps) {
    const { collections, isLoading } = useCollection();
    const { userId } = useUser();
    const { language } = useLanguage();
    const isEnglish = language === 'en';

    const [paperRows, setPaperRows] = useState<PaperCollectionRow[]>([]);
    const [paperLoading, setPaperLoading] = useState(false);

    const collectedNews = allNews.filter((article) => collections.includes(article.link));
    const visibleLinks = new Set(collectedNews.map((article) => article.link));
    const missingCollectionLinks = collections.filter((link) => !visibleLinks.has(link));

    const paperItems = useMemo<PaperCollectionItem[]>(() => {
        return paperRows.map((row) => {
            const metadata = row.metadata || {};
            return {
                itemKey: String(row.item_key),
                title: String(metadata.title || row.title || (isEnglish ? 'Untitled paper' : '제목 없음 논문')),
                journal: String(metadata.journal || ''),
                publicationDate: String(metadata.publication_date || ''),
                link: String(metadata.link || row.url || ''),
                createdAt: String(row.created_at || ''),
            };
        });
    }, [paperRows, isEnglish]);

    useEffect(() => {
        const loadPaperCollections = async () => {
            if (!userId) {
                setPaperRows([]);
                return;
            }

            setPaperLoading(true);
            try {
                const res = await fetch('/api/collections?type=paper', { cache: 'no-store' });
                if (!res.ok) {
                    setPaperRows([]);
                    return;
                }
                const data = await res.json();
                if (!Array.isArray(data)) {
                    setPaperRows([]);
                    return;
                }
                setPaperRows(data);
            } catch (error) {
                console.error('[CollectionsView] failed to load paper collections', error);
                setPaperRows([]);
            } finally {
                setPaperLoading(false);
            }
        };

        void loadPaperCollections();
    }, [userId]);

    const handleRemovePaper = async (itemKey: string) => {
        const snapshot = paperRows;
        setPaperRows((prev) => prev.filter((row) => row.item_key !== itemKey));

        try {
            const res = await fetch('/api/collections', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'paper', itemKey }),
            });

            if (!res.ok) {
                setPaperRows(snapshot);
            }
        } catch (error) {
            console.error('[CollectionsView] failed to remove paper', error);
            setPaperRows(snapshot);
        }
    };

    const getHostLabel = (link: string) => {
        try {
            return new URL(link).hostname.replace(/^www\./, '');
        } catch {
            return link;
        }
    };

    const noCollections =
        collectedNews.length === 0 &&
        missingCollectionLinks.length === 0 &&
        paperItems.length === 0 &&
        !paperLoading;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-0 max-w-7xl animate-pulse">
                {[1, 2, 3, 4].map((idx) => (
                    <div key={idx} className="h-24 bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800 mx-3 my-1.5 rounded-lg" />
                ))}
            </div>
        );
    }

    if (noCollections) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6 animate-in fade-in duration-500">
                <span className="text-4xl mb-4">Bookmarks</span>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    {isEnglish ? 'No Collections Yet' : '아직 컬렉션이 없습니다'}
                </h2>
                <p className="text-muted-foreground text-center max-w-md">
                    {isEnglish
                        ? 'Click the star icon on news or papers to save them to your collections.'
                        : '뉴스나 논문의 별 아이콘을 눌러 컬렉션에 저장해보세요.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {collectedNews.length > 0 && (
                <div className="flex justify-center">
                    <ExportCollectionsButton collectedNews={collectedNews} />
                </div>
            )}

            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black tracking-tight text-foreground">
                        {isEnglish ? 'News Collections' : '뉴스 컬렉션'} ({collectedNews.length + missingCollectionLinks.length})
                    </h2>
                </div>

                {collectedNews.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-0 max-w-7xl">
                        {collectedNews.map((article) => {
                            const pubDate = article.published_at ? new Date(article.published_at) : null;
                            const isToday = toDateKey(pubDate) === today;
                            const { dateStr, timeStr } = fmtDateKST(pubDate);

                            return (
                                <article
                                    key={article.id}
                                    className={`group py-1.5 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 flex gap-2 items-start ${isToday ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                                >
                                    <CollectionButton newsLink={article.link} newsTitle={article.title} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-[9px] h-4 mb-1">
                                            <span className={`font-mono font-bold tracking-tight text-[10px] ${isToday ? 'text-blue-500' : 'text-gray-400'}`}>
                                                {dateStr} <span className="text-[9px] font-medium opacity-80 ml-0.5">{timeStr}</span>
                                            </span>
                                        </div>
                                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="block group/link">
                                            <h3 className="text-sm md:text-base font-bold text-foreground leading-tight group-hover/link:text-[#3182f6] truncate">
                                                {article.title}
                                            </h3>
                                        </a>
                                        {article.description && (
                                            <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug font-medium line-clamp-1">
                                                {article.description}
                                            </p>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {missingCollectionLinks.length > 0 && (
                    <div className="max-w-7xl rounded-2xl border border-amber-200/70 bg-amber-50/60 dark:bg-amber-900/10 px-4 py-3">
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2">
                            {isEnglish
                                ? `${missingCollectionLinks.length} bookmarked links are outside the current feed window. Link-only view is shown.`
                                : `${missingCollectionLinks.length}개의 북마크 링크가 현재 피드 범위를 벗어나 링크만 표시됩니다.`}
                        </p>
                        <div className="space-y-1">
                            {missingCollectionLinks.map((link) => (
                                <article
                                    key={link}
                                    className="group py-1.5 px-2 rounded-lg hover:bg-amber-100/60 dark:hover:bg-amber-900/20 transition-colors flex gap-2 items-start"
                                >
                                    <CollectionButton newsLink={link} newsTitle={link} />
                                    <a href={link} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-[#3182f6] transition-colors">
                                            {getHostLabel(link)}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground truncate">{link}</p>
                                    </a>
                                </article>
                            ))}
                        </div>
                    </div>
                )}

                {collectedNews.length === 0 && missingCollectionLinks.length === 0 && !paperLoading && (
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-4 text-sm text-gray-500 dark:text-gray-400">
                        {isEnglish ? 'No saved news yet.' : '저장된 뉴스가 아직 없습니다.'}
                    </div>
                )}
            </section>

            <section className="space-y-3">
                <h2 className="text-lg font-black tracking-tight text-foreground">
                    {isEnglish ? 'Paper Collections' : '논문 컬렉션'} ({paperItems.length})
                </h2>

                {paperLoading ? (
                    <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                        {isEnglish ? 'Loading saved papers...' : '저장한 논문을 불러오는 중...'}
                    </div>
                ) : paperItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-7xl">
                        {paperItems.map((paper) => (
                            <article
                                key={paper.itemKey}
                                className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex items-start gap-3"
                            >
                                <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    {paper.link ? (
                                        <a href={paper.link} target="_blank" rel="noopener noreferrer" className="block">
                                            <h3 className="text-sm font-bold text-foreground hover:text-[#3182f6] transition-colors line-clamp-2">
                                                {paper.title}
                                            </h3>
                                        </a>
                                    ) : (
                                        <h3 className="text-sm font-bold text-foreground line-clamp-2">{paper.title}</h3>
                                    )}

                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                        {[paper.journal, paper.publicationDate].filter(Boolean).join(' | ') || (isEnglish ? 'No metadata' : '메타데이터 없음')}
                                    </p>
                                </div>

                                <button
                                    onClick={() => void handleRemovePaper(paper.itemKey)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    aria-label={isEnglish ? 'Remove paper from collection' : '논문 컬렉션에서 제거'}
                                    title={isEnglish ? 'Remove' : '제거'}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-4 text-sm text-gray-500 dark:text-gray-400">
                        {isEnglish
                            ? 'No saved papers yet. Bookmark papers from Insights to see them here.'
                            : '저장된 논문이 아직 없습니다. 인사이트에서 논문을 북마크하면 여기에 표시됩니다.'}
                    </div>
                )}
            </section>
        </div>
    );
}
