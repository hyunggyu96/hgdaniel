"use client";

import { useState, useCallback } from "react";
import { SearchIcon, BookOpen, Calendar, Check, Plus, Loader2 } from "lucide-react";
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
    'botulinum toxin', 'HA filler', 'dermal filler',
    'PN (polynucleotide)', 'PDRN (polydeoxyribonucleotide)',
    'exosome', 'PLLA', 'PCL (polycaprolactone)',
    'PDLLA', 'CaHA', 'HIFU', 'RF (radiofrequency)'
];

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchPapers(1, selectedKeyword, searchQuery);
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
        <div className="space-y-3">
            {/* Keyword filters */}
            <div className="flex flex-wrap gap-1.5">
                {KEYWORDS.map(kw => (
                    <button
                        key={kw}
                        onClick={() => handleKeywordClick(kw)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                            selectedKeyword === kw
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        {kw}
                    </button>
                ))}
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    className="w-full pl-9 pr-20 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    placeholder={t('insights_search_placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-slate-800 dark:bg-slate-600 text-white px-3 rounded-md text-xs font-semibold hover:bg-slate-700"
                >
                    {t('search')}
                </button>
            </form>

            {/* Selected count */}
            {selectedPapers.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    {selectedPapers.length}/{maxPapers} {t('ask_ai_papers_selected') || 'papers selected'}
                </div>
            )}

            {/* Results */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
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
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    isSelected
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/30'
                                        : canSelect
                                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
                                }`}
                            >
                                <div className="flex items-start gap-2.5">
                                    <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                            ? 'bg-blue-600 border-blue-600'
                                            : 'border-gray-300 dark:border-gray-600'
                                    }`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="flex items-center gap-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                                <BookOpen className="w-2.5 h-2.5" />
                                                {paper.journal || 'Journal'}
                                            </span>
                                            <span className="flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                                                <Calendar className="w-2.5 h-2.5" />
                                                {paper.publication_date || 'N/A'}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                                            {paper.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                            {paper.abstract}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })
                ) : papers.length === 0 && !loading && (searchQuery || selectedKeyword) ? (
                    <div className="text-center py-6 text-sm text-gray-400">
                        {t('insights_no_papers')}
                    </div>
                ) : (
                    <div className="text-center py-8 text-sm text-gray-400">
                        <SearchIcon className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                        {t('ask_ai_search_papers') || 'Search for papers to add to your context'}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {papers.length > 0 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 pt-1">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1 || loading}
                        className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        ←
                    </button>
                    <span className="text-xs text-gray-500">{page} / {totalPages}</span>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages || loading}
                        className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}
