"use client";

import { useState, useEffect } from "react";
import { Card, Title, Text, TextInput, Select, SelectItem, Badge, Grid } from "@tremor/react";
import { SearchIcon } from "lucide-react";

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
    const [papers, setPapers] = useState<Paper[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchPapers = async (resetPage = false) => {
        setLoading(true);
        try {
            const currentPage = resetPage ? 1 : page;
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: "20",
                keyword: selectedKeyword,
                query: searchQuery
            });

            const res = await fetch(`/api/insights?${params.toString()}`);
            const result = await res.json();

            if (result.data) {
                setPapers(result.data);
                setTotalPages(result.pagination.totalPages);
                if (resetPage) setPage(1);
            }
        } catch (error) {
            console.error("Failed to fetch papers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPapers(true);
    }, [selectedKeyword]); // Refetch when keyword changes

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchPapers(true);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            // useEffect dependency on 'page' would trigger loop if we're not careful.
            // Better to just call fetch directly or split useEffect.
            // Let's add 'page' to a separate useEffect for pagination or manually call.
            // For simplicity, let's manually call fetch here:
            // But state update is async.
        }
    };

    // Separate effect for page changes to ensure state is updated first
    useEffect(() => {
        if (page > 1) { // Skip initial load handled by keyword effect
            fetchPapers(false);
        }
    }, [page]);


    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <Title className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Insights & Research
                        </Title>
                        <Text className="text-gray-500 mt-1">
                            Curated aesthetic medicine research database
                        </Text>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-full md:w-64">
                        <Select
                            value={selectedKeyword}
                            onValueChange={setSelectedKeyword}
                            placeholder="Filter by Topic..."
                        >
                            <SelectItem value="">All Topics</SelectItem>
                            {KEYWORDS.map(kw => (
                                <SelectItem key={kw} value={kw}>{kw}</SelectItem>
                            ))}
                        </Select>
                    </div>
                    <form onSubmit={handleSearch} className="flex-1 w-full flex gap-2">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Search title or abstract..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <Text>Loading research papers...</Text>
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
                                                    Read Data
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                                <Text className="text-gray-500 mb-2">No papers found.</Text>
                                <p className="text-sm text-gray-400">Try adjusting your filters or run the data collection script.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {papers.length > 0 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            disabled={page === 1 || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page <span className="font-semibold text-gray-900">{page}</span> of {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages || loading}
                            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
