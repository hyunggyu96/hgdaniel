"use client";

import { useState, useCallback } from "react";
import { SearchIcon, BookOpen, Calendar, Check, Loader2, X } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { INSIGHTS_KEYWORDS } from "@/lib/insightsKeywords";

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

interface PaperSelectorProps {
    selectedPapers: Paper[];
    onPapersSelected: (papers: Paper[]) => void;
    maxPapers?: number;
    disabled?: boolean;
}

export default function PaperSelector({
    selectedPapers,
    onPapersSelected,
    maxPapers = 20,
    disabled = false,
}: PaperSelectorProps) {
    const { t } = useLanguage();
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedKeyword, setSelectedKeyword] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const selectedIds = new Set(selectedPapers.map(p => p.id));

    const fetchPapers = useCallback(async (targetPage: number, keyword: string, query: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: targetPage.toString(),
                limit: "10",
                keyword,
                query,
            });
            const res = await fetch(`/api/insights?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const result = await res.json();
            setPapers(result.data || []);
            setTotalPages(result.pagination?.totalPages || 1);
        } catch {
            setPapers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = () => {
        setPage(1);
        fetchPapers(1, selectedKeyword, searchQuery);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleKeywordClick = (kw: string) => {
        const newKw = selectedKeyword === kw ? "" : kw;
        setSelectedKeyword(newKw);
        setPage(1);
        fetchPapers(1, newKw, searchQuery);
    };

    const togglePaper = (paper: Paper) => {
        if (disabled) return;
        if (selectedIds.has(paper.id)) {
            onPapersSelected(selectedPapers.filter(p => p.id !== paper.id));
        } else if (selectedPapers.length < maxPapers) {
            onPapersSelected([...selectedPapers, paper]);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchPapers(newPage, selectedKeyword, searchQuery);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search inputs wrapper */}
            <div className="space-y-3">
                {/* Search bar */}
                <div className="relative group">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 transition-all"
                        placeholder="Search papers by title or abstract..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(""); handleSearch(); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            aria-label="Clear search"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Keyword tags */}
                <div className="flex flex-wrap gap-1.5">
                    {INSIGHTS_KEYWORDS.map(kw => (
                        <button
                            key={kw}
                            onClick={() => handleKeywordClick(kw)}
                            className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all border ${selectedKeyword === kw
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600'
                                }`}
                        >
                            {kw}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected status */}
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Results</span>
                {selectedPapers.length > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        {selectedPapers.length} / {maxPapers} selected
                    </span>
                )}
            </div>

            {/* Results list */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mb-2 text-blue-500" />
                        <span className="text-xs">Searching papers...</span>
                    </div>
                ) : papers.length > 0 ? (
                    papers.map((paper) => {
                        const isSelected = selectedIds.has(paper.id);
                        const canSelect = !isSelected && selectedPapers.length >= maxPapers;
                        return (
                            <button
                                key={paper.id}
                                onClick={() => togglePaper(paper)}
                                disabled={disabled || canSelect}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${isSelected
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/30 shadow-sm'
                                    : canSelect
                                        ? 'border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed bg-slate-50'
                                        : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${isSelected
                                        ? 'bg-blue-600 border-blue-600 shadow-sm'
                                        : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                                        }`}>
                                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="px-1.5 py-0.5 rounded-[4px] bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                                                {paper.journal || 'Journal'}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {paper.publication_date || 'N/A'}
                                            </span>
                                        </div>
                                        <h4 className={`text-sm font-bold leading-snug line-clamp-2 ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                                            {paper.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                            {paper.abstract}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })
                ) : papers.length === 0 && !loading && (searchQuery || selectedKeyword) ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <span className="text-2xl mb-2 block">🔍</span>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No papers found</p>
                        <p className="text-xs text-slate-400 mt-1">Try different keywords</p>
                    </div>
                ) : (
                    <div className="text-center py-12 opacity-60">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">Search for papers</p>
                        <p className="text-xs text-slate-400 mt-1">Select context for AI analysis</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {papers.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || loading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ←
                    </button>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 min-w-[60px] text-center">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || loading}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}
