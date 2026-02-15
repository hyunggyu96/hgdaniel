"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Text } from "@tremor/react";
import { SearchIcon, BookOpen, Calendar, Users, ArrowUpRight, Filter, GraduationCap } from "lucide-react";

import { useLanguage } from "@/components/LanguageContext";

interface Paper {
    id: string;
    title: string;
    abstract: string;
    authors: string[];
    publication_date: string;
    journal: string;
    link: string;
    keywords: string[];
}

const KEYWORDS = [
    'botulinum toxin',
    'HA filler',
    'dermal filler',
    'polynucleotide(PN)',
    'polydeoxyribonucleotide (pdrn)',
    'exosome',
    'PLLA',
    'PDLLA',
    'CaHA'
];

export default function InsightsPage() {
    const { t } = useLanguage();
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedKeyword, setSelectedKeyword] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

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

            setPapers(result.data || []);
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
        setPage(1);
        fetchPapers(1);
    }, [selectedKeyword]); // eslint-disable-line react-hooks/exhaustive-deps

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

    return (
        <main className="min-h-screen bg-gray-50/50 p-6 md:p-12 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">

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

                {/* Search & Filter Section */}
                <div className="sticky top-4 z-20 space-y-4">
                    <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/50 ring-1 ring-gray-100">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative w-full mb-4">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900"
                                placeholder={t('insights_search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-xs font-bold uppercase tracking-wider"
                            >
                                {t('search')}
                            </button>
                        </form>

                        {/* Keyword Chips */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="h-4 w-px bg-gray-200 shrink-0 mx-1" />
                            <button
                                onClick={() => setSelectedKeyword("")}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${selectedKeyword === ""
                                    ? 'bg-slate-800 text-white shadow-md scale-105'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {t('insights_all_topics')}
                            </button>
                            {KEYWORDS.map(kw => (
                                <button
                                    key={kw}
                                    onClick={() => setSelectedKeyword(kw)}
                                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 capitalize ${selectedKeyword === kw
                                        ? 'bg-blue-600 text-white shadow-md scale-105 border-transparent'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30'
                                        }`}
                                >
                                    {kw}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-70">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <Text className="mt-4 text-gray-500 font-medium animate-pulse">{t('insights_loading')}</Text>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm p-8 text-center">
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Data</h3>
                        <Text className="text-gray-500 mb-6 max-w-md">{error}</Text>
                        <button
                            onClick={() => fetchPapers(page)}
                            className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium shadow-sm"
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
                                    className="group relative bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:translate-y-[-2px] hover:border-blue-100 transition-all duration-300"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="flex-1 space-y-3">
                                            {/* Top Meta */}
                                            <div className="flex flex-wrap items-center gap-3 text-xs">
                                                <span className="flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    {paper.journal || 'Journal'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {paper.publication_date || 'N/A'}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <a href={paper.link} target="_blank" rel="noopener noreferrer" className="block outline-none">
                                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">
                                                    {paper.title}
                                                </h3>
                                            </a>

                                            {/* Abstract */}
                                            <p className="text-sm md:text-base text-gray-600 leading-relaxed line-clamp-3 md:line-clamp-2 md:group-hover:line-clamp-4 transition-all duration-500">
                                                {paper.abstract}
                                            </p>

                                            {/* Footer Meta */}
                                            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 mt-1 border-t border-gray-50">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="italic truncate max-w-[200px] md:max-w-md">
                                                        {paper.authors?.slice(0, 3).join(", ")} {paper.authors?.length > 3 && "et al."}
                                                    </span>
                                                </div>

                                                {/* Keywords (Visible on desktop) */}
                                                <div className="hidden md:flex gap-2">
                                                    {paper.keywords?.slice(0, 3).map(k => (
                                                        <span key={k} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                            #{k}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <a
                                            href={paper.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:scale-110"
                                            title="View Original Paper"
                                        >
                                            <ArrowUpRight className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
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
                            className="flex items-center px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            ← {t('insights_previous')}
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-semibold text-gray-900">
                                Page {page}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                                of {totalPages}
                            </span>
                        </div>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages || loading}
                            className="flex items-center px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {t('insights_next')} →
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
