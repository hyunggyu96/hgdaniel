"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Title, Text, Badge } from "@tremor/react";
import { SearchIcon } from "lucide-react";

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
    'Ha filler',
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
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Title className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            {t('insights_title')}
                        </Title>
                        <Text className="text-gray-500 mt-1">
                            {t('insights_desc')}
                        </Text>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-64">
                        <select
                            value={selectedKeyword}
                            onChange={(e) => setSelectedKeyword(e.target.value)}
                            className="block w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out cursor-pointer"
                        >
                            <option value="">{t('insights_all_topics')}</option>
                            {KEYWORDS.map(kw => (
                                <option key={kw} value={kw}>{kw}</option>
                            ))}
                        </select>
                    </div>
                    <form onSubmit={handleSearch} className="flex-1 w-full flex gap-2">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder={t('insights_search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            {t('search')}
                        </button>
                    </form>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <Text>{t('insights_loading')}</Text>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-red-200">
                        <Text className="text-red-600 mb-2">{error}</Text>
                        <button
                            onClick={() => fetchPapers(page)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            {t('retry')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {papers.length > 0 ? (
                            papers.map((paper) => (
                                <Card key={paper.id} className="hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-blue-500">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <a href={paper.link} target="_blank" rel="noopener noreferrer" className="group">
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                    {paper.title}
                                                </h3>
                                            </a>
                                            <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                                <Badge color="blue" size="xs">{paper.journal || 'Journal'}</Badge>
                                                <span className="text-sm text-gray-500">{paper.publication_date}</span>
                                                {paper.keywords && paper.keywords.map(k => (
                                                    <span key={k} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">
                                                        {k}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                                {paper.abstract}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <p className="text-xs text-gray-400 italic">
                                                    {paper.authors && paper.authors.slice(0, 3).join(", ")} {paper.authors && paper.authors.length > 3 && "et al."}
                                                </p>
                                                <a
                                                    href={paper.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    {t('insights_read')}
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                                <Text className="text-gray-500 mb-2">{t('insights_no_papers')}</Text>
                                <p className="text-sm text-gray-400">{t('insights_no_papers_hint')}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {papers.length > 0 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1 || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            {t('insights_previous')}
                        </button>
                        <span className="text-sm text-gray-600">
                            {t('insights_page_info')} <span className="font-semibold text-gray-900">{page}</span> {t('insights_page_of')} {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            {t('insights_next')}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
