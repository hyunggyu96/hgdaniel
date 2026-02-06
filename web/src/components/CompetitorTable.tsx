
import { useState } from 'react';
import { Card, Title, Text, TextInput, Badge } from "@tremor/react";

interface CompetitorItem {
    ENTP_NAME: string;
    PRDLST_NM: string;
    PRMSN_DT: string;
    GRADE?: string;
    PERMIT_KIND_NM?: string;
    USE_PURPS_CONT?: string;
    [key: string]: any;
}

interface CompetitorTableProps {
    data: CompetitorItem[];
}

export default function CompetitorTable({ data }: CompetitorTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter logic: Match Search Query AND Filler-related keywords
    const filteredData = data.filter(item => {
        // 1. Mandatory Category Filter (Since we are downloading full DB)
        // Must contain '조직수복용' (Tissue Restorative), '필러' (Filler), '안면' (Facial), '주입' (Injectable)
        // And exclude '치과' (Dental) unless specific
        const name = item.PRDLST_NM || "";
        const entp = item.ENTP_NAME || "";

        const isFillerRelated = (
            name.includes('조직수복용') ||
            name.includes('필러') ||
            name.includes('히알루론산') ||
            (name.includes('주입') && name.includes('안면'))
        ) && !name.includes('치과'); // Basic exclusion, can be refined

        if (!isFillerRelated) return false;

        // 2. User Search Query
        const matchesSearch = (
            entp.toLowerCase().includes(searchQuery.toLowerCase()) ||
            name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return matchesSearch;
    }).sort((a, b) => {
        // Sort by Permit Date Descending
        if (!a.PRMSN_DT) return 1;
        if (!b.PRMSN_DT) return -1;
        return parseInt(b.PRMSN_DT) - parseInt(a.PRMSN_DT);
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    };

    const getStatusBadge = (item: CompetitorItem) => {
        // Check for cancellation fields: RTRCN_DSCTN_DIVS_CD or RTRCN_DSCTN_DT
        const isCanceled = item.RTRCN_DSCTN_DT || item.RTRCN_DSCTN_DIVS_CD;

        if (isCanceled) {
            return <Badge size="xs" color="red">취소 (Canceled)</Badge>;
        }
        return <Badge size="xs" color="green">유효 (Valid)</Badge>;
    };

    return (
        <Card className="overflow-hidden shadow-lg border-0 ring-1 ring-gray-200 sm:rounded-xl bg-white h-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-orange-100 p-1.5 rounded-lg">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">경쟁사 허가 현황</h3>
                        <p className="text-xs text-gray-500">품목: 조직수복용생체재료 (Filler)</p>
                    </div>
                </div>
                <div className="w-full md:w-48">
                    <TextInput
                        placeholder="업체명 검색..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase bg-gray-50">업체명</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase bg-gray-50">제품명</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase bg-gray-50">등급</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase bg-gray-50">상태</th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase bg-gray-50">허가일자</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {currentData.length > 0 ? (
                            currentData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.ENTP_NAME}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]" title={item.PRDLST_NM}>{item.PRDLST_NM}</td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        <Badge size="xs" color="gray">{item.GRADE || '4'}</Badge>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center">
                                        {getStatusBadge(item)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 font-mono">
                                        {formatDate(item.PRMSN_DT)}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="text-xs flex items-center text-gray-500">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </Card>
    );
}
