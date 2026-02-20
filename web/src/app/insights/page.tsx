"use client";

import { useState, useEffect, useCallback } from "react";
import { Text } from "@tremor/react";
import { SearchIcon, BookOpen, Calendar, Users, ArrowUpRight, Filter, GraduationCap, Bot, Lock, Bookmark } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import AskAiTab from "@/components/ask-ai/AskAiTab";
import { useUser } from "@/components/UserContext";
import LoginButton from "@/components/LoginButton";
import { toast } from "sonner";

interface Paper {
    id: string;
    title: string;
    abstract: string;
    authors: string[];
    publication_date: string;
    journal: string;
    link: string;
    keywords: string[];
    isBookmarked?: boolean;
}

const KEYWORDS = [
    'botulinum toxin',
    'HA filler',
    'dermal filler',
    'PN (polynucleotide)',
    'PDRN (polydeoxyribonucleotide)',
    'exosome',
    'PLLA',
    'PCL (polycaprolactone)',
    'PDLLA',
    'CaHA',
    'HIFU',
    'RF (radiofrequency)'
];

export default function InsightsPage() {
    const { t } = useLanguage();
    const { userId } = useUser();
    const [activeTab, setActiveTab] = useState<'search' | 'ask-ai'>('search');

    if (!userId) {
        return (
            <main className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-12 flex items-center justify-center transition-colors duration-300">
                <div className="flex flex-col items-center justify-center max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 text-center space-y-6 animate-fade-in-up">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center animate-pulse-slow">
                        <Lock className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                            {t('insights_login_required') || 'Login Required'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                            {t('insights_login_desc') || 'Access to advanced AI insights and research tools is restricted to registered members.'}
                        </p>
                    </div>

                    <div className="w-full pt-2 flex justify-center transform scale-110">
                        <LoginButton />
                    </div>

                    <div className="text-xs text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800 w-full uppercase tracking-wider font-semibold">
                        Secure Access • Aesthetic Intelligence
                    </div>
                </div>
            </main>
        );
    }
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeyword, setSelectedKeyword] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Bookmarking Logic
    useEffect(() => {
        if (!userId) return;
        const stored = localStorage.getItem(`hg_bookmarks_${userId}`);
        if (stored) {
            try {
                // Ensure synchronization if papers are already loaded
                // But normally we sync when rendering or setting papers
            } catch (e) {
                console.error("Failed to parse bookmarks", e);
            }
        }
    }, [userId]);

    const toggleBookmark = (paper: Paper) => {
        if (!userId) return;

        const storageKey = `hg_bookmarks_${userId}`;
        const stored = localStorage.getItem(storageKey);
        let bookmarks: Paper[] = stored ? JSON.parse(stored) : [];

        const exists = bookmarks.find(b => b.id === paper.id);

        if (exists) {
            bookmarks = bookmarks.filter(b => b.id !== paper.id);
            toast.info("Removed from bookmarks");
        } else {
            bookmarks.push({ ...paper, isBookmarked: true });
            toast.success("Saved to your bookmarks");
        }

        localStorage.setItem(storageKey, JSON.stringify(bookmarks));

        // Update local state to reflect UI change immediately
        setPapers(prev => prev.map(p =>
            p.id === paper.id ? { ...p, isBookmarked: !exists } : p
        ));
    };

    const fetchPapers = useCallback(async (targetPage: number) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: targetPage.toString(),
                limit: "20",
                keyword: selectedKeyword,
                query: searchQuery
            });

            const res = await fetch(`/api/insights?${params.toString()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const result = await res.json();

            if (result.error) throw new Error(result.error);

            // Sync with bookmarks
            let fetchedPapers: Paper[] = result.data || [];
            if (userId) {
                const stored = localStorage.getItem(`hg_bookmarks_${userId}`);
                if (stored) {
                    const bookmarks: Paper[] = JSON.parse(stored);
                    fetchedPapers = fetchedPapers.map(p => ({
                        ...p,
                        isBookmarked: bookmarks.some(b => b.id === p.id)
                    }));
                }
            }

            setPapers(fetchedPapers);
            setTotalPages(result.pagination?.totalPages || 1);
            setTotalCount(result.pagination?.total || 0);
        } catch (err) {
            console.error("Failed to fetch papers:", err);
            setError(t('insights_error'));
            setPapers([]);
        } finally {
            setLoading(false);
        }
    }, [selectedKeyword, searchQuery, t]);

    // Fetch when keyword changes — reset to page 1
    useEffect(() => {
        if (activeTab === 'search') {
            setPage(1);
            fetchPapers(1);
        }
    }, [selectedKeyword, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchPapers(1);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
            fetchPapers(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const Highlight = ({ text, keyword }: { text: string, keyword: string }) => {
        if (!keyword || !text) return <>{text}</>;
        const parts = text.split(new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === keyword.toLowerCase() ?
                        <span key={i} className="bg-yellow-200 text-slate-900 font-semibold rounded-[2px] px-0.5 mx-0.5">{part}</span> :
                        part
                )}
            </span>
        );
    };

    return (
        <main className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-12 pb-24 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-lg animate-fade-in">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 px-6 py-5 md:px-8 md:py-6">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                            <GraduationCap className="w-7 h-7 text-blue-200" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                {t('insights_title')}
                            </h2>
                            <p className="text-indigo-100 text-sm md:text-base font-light leading-relaxed">
                                {t('insights_desc')}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-[10px] font-semibold backdrop-blur-sm">
                                    {totalCount.toLocaleString()} Papers Indexed
                                </span>
                                <span className="text-[10px] text-indigo-300">
                                    updated daily
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 w-fit">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'search'
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-gray-900 shadow-md'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        <SearchIcon className="w-4 h-4" />
                        {t('ask_ai_tab_search') || 'Paper Search'}
                    </button>

                    {userId ? (
                        <button
                            onClick={() => setActiveTab('ask-ai')}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'ask-ai'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Bot className="w-4 h-4" />
                            {t('ask_ai_tab_ai') || 'Ask AI'}
                        </button>
                    ) : (
                        <div className="relative group">
                            <button
                                disabled
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800/50"
                            >
                                <Lock className="w-3.5 h-3.5" />
                                {t('ask_ai_tab_ai') || 'Ask AI'}
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white bg-slate-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Login required
                            </div>
                        </div>
                    )}
                </div>

                {/* Tab Content */}
                {activeTab === 'search' ? (
                    // Paper Search Tab (existing content)
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Sidebar Filters */}
                        <aside className="w-full lg:w-64 shrink-0 space-y-4">
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 lg:sticky lg:top-8">
                                <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100 font-semibold px-1">
                                    <Filter className="w-4 h-4 text-blue-600" />
                                    <span>Categories</span>
                                </div>

                                <div className="flex flex-wrap lg:flex-col gap-2">
                                    <button
                                        onClick={() => setSelectedKeyword("")}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left ${selectedKeyword === ""
                                            ? 'bg-slate-800 text-white shadow-md'
                                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {t('insights_all_topics')}
                                    </button>

                                    {KEYWORDS.map(kw => (
                                        <button
                                            key={kw}
                                            onClick={() => setSelectedKeyword(kw)}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize text-left ${selectedKeyword === kw
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-700 hover:text-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/20'
                                                }`}
                                        >
                                            {kw}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <section className="flex-1 min-w-0 space-y-6">

                            {/* Search Bar */}
                            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                                <form onSubmit={handleSearch} className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <SearchIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-12 pr-32 py-3 bg-transparent border-none rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-0"
                                        placeholder={t('insights_search_placeholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-xs font-bold uppercase tracking-wider"
                                    >
                                        {t('search')}
                                    </button>
                                </form>
                            </div>

                            {/* Results List */}
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse">
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex gap-2">
                                                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                                    </div>
                                                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                                                        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-red-100 dark:border-red-900/30 shadow-sm p-8 text-center">
                                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-2xl">⚠️</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Error Loading Data</h3>
                                    <Text className="text-gray-500 mb-6 max-w-md">{error}</Text>
                                    <button
                                        onClick={() => fetchPapers(page)}
                                        className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 transition-colors text-sm font-medium shadow-sm"
                                    >
                                        {t('retry')}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fade-in-up">
                                    {papers.length > 0 ? (
                                        papers.map((paper) => (
                                            <div
                                                key={paper.id}
                                                className="group relative bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900 transition-all duration-300"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                                    <div className="flex-1 space-y-2.5">
                                                        {/* Top Meta */}
                                                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                                                            <span className="flex items-center gap-1 text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-800">
                                                                <BookOpen className="w-3 h-3" />
                                                                {paper.journal || 'Journal'}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                                <Calendar className="w-3 h-3" />
                                                                {paper.publication_date || 'N/A'}
                                                            </span>
                                                        </div>

                                                        {/* Title */}
                                                        <a href={paper.link} target="_blank" rel="noopener noreferrer" className="block outline-none">
                                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                                                <Highlight text={paper.title} keyword={searchQuery} />
                                                            </h3>
                                                        </a>

                                                        {/* Abstract */}
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 transition-all duration-500">
                                                            <Highlight text={paper.abstract} keyword={searchQuery} />
                                                        </p>

                                                        {/* Footer Meta */}
                                                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mt-1 border-t border-gray-50">
                                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                                                <span className="font-semibold text-gray-700 dark:text-gray-300 italic truncate max-w-[200px] md:max-w-md">
                                                                    {paper.authors?.slice(0, 3).map((author, idx) => (
                                                                        <span key={idx}>
                                                                            <Highlight text={author} keyword={searchQuery} />
                                                                            {idx < Math.min(paper.authors.length, 3) - 1 ? ", " : ""}
                                                                        </span>
                                                                    ))}
                                                                    {paper.authors?.length > 3 && " et al."}
                                                                </span>
                                                            </div>

                                                            {/* Keywords */}
                                                            <div className="hidden md:flex gap-1.5">
                                                                {paper.keywords?.slice(0, 3).map(k => (
                                                                    <span key={k} className="text-[10px] text-gray-500 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">
                                                                        #{k}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="flex flex-col gap-2 shrink-0">
                                                        <a
                                                            href={paper.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:scale-105"
                                                            title="View Original Paper"
                                                        >
                                                            <ArrowUpRight className="w-4 h-4" />
                                                        </a>
                                                        {userId && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleBookmark(paper);
                                                                }}
                                                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all shadow-sm group-hover:scale-105 ${paper.isBookmarked
                                                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'
                                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                                                                    }`}
                                                                title={paper.isBookmarked ? "Remove from bookmarks" : "Bookmark this paper"}
                                                            >
                                                                <Bookmark className={`w-4 h-4 ${paper.isBookmarked ? 'fill-current' : ''}`} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                                            <SearchIcon className="w-12 h-12 text-gray-200 mb-4" />
                                            <Text className="text-gray-500 font-medium mb-1">{t('insights_no_papers')}</Text>
                                            <p className="text-sm text-gray-400">{t('insights_no_papers_hint')}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pagination */}
                            {papers.length > 0 && (
                                <div className="flex justify-center items-center gap-6 pt-8 pb-4">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 1 || loading}
                                        className="flex items-center px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        ← {t('insights_previous')}
                                    </button>
                                    <div className="flex flex-col items-center">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Page {page}
                                        </span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                            of {totalPages}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page === totalPages || loading}
                                        className="flex items-center px-5 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {t('insights_next')} →
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                ) : (
                    // Ask AI Tab
                    <AskAiTab />
                )}
            </div>
        </main>
    );
}
