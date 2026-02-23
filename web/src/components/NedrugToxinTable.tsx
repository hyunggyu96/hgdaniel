'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from "@tremor/react";
import { ChevronDown, ChevronUp, Search, Pill, Building2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface NedrugProduct {
    id: number;
    std_code: string;
    item_name: string;
    item_eng_name: string;
    company_id: number | null;
    company_name: string;
    company_eng_name: string;
    permit_no: string;
    permit_date: string;
    category: string;
    status: string;
    cancel_status: string;
    cancel_date: string | null;
    ingredient: string;
    ingredient_type: string;
    export_names: string | null;
    is_export_only: boolean;
}

interface NedrugToxinTableProps {
    companyId?: number;
    companyName?: string;
    showFilters?: boolean;
}

export default function NedrugToxinTable({ companyId, companyName, showFilters = true }: NedrugToxinTableProps) {
    const { language } = useLanguage();
    const [items, setItems] = useState<NedrugProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const itemsPerPage = 10;

    const fetchData = useCallback(async (page: number) => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', String(itemsPerPage));
            params.set('ingredient_type', 'botulinum_toxin');
            if (companyId) params.set('company_id', String(companyId));
            if (companyName) params.set('company_name', companyName);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (searchQuery.trim()) params.set('query', searchQuery.trim());

            const res = await fetch(`/api/nedrug-products?${params.toString()}`, {
                headers: { 'Cache-Control': 'no-cache' },
            });
            const result = await res.json();

            if (result.error) {
                setError(result.error);
                return;
            }

            setItems(result.data || []);
            setTotalPages(result.pagination?.totalPages || 0);
            setTotalCount(result.pagination?.total || 0);
        } catch (e) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [companyId, companyName, statusFilter, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
        fetchData(1);
    }, [statusFilter, searchQuery, fetchData]);

    useEffect(() => {
        fetchData(currentPage);
    }, [currentPage]);

    const cleanItemName = (name: string) => {
        // Remove "제품명" prefix and clean up
        return name.replace(/^제품명\s*/, '').trim();
    };

    const t = (ko: string, en: string) => language === 'ko' ? ko : en;

    if (error && !loading) {
        return (
            <div className="text-center py-8 text-red-500 text-sm">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
                        <Pill className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t('보툴리늄 톡신 허가 DB', 'Botulinum Toxin Permit DB')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {companyName || t('전체', 'All')} · {totalCount}{t('건', ' items')}
                            <span className="ml-2 text-gray-400">nedrug.mfds.go.kr</span>
                        </p>
                    </div>
                </div>

                {showFilters && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {/* Status filter */}
                        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                            {(['all', 'active', 'cancelled'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 transition-colors ${
                                        statusFilter === s
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {s === 'all' ? t('전체', 'All') : s === 'active' ? t('정상', 'Active') : t('취소/취하', 'Canceled')}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 md:w-48">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('제품명, 업체명...', 'Product, company...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50">
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {t('제품명', 'Product')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {t('영문명', 'Eng Name')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {t('업체명', 'Company')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">
                                {t('수출명', 'Export Names')}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {t('상태', 'Status')}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {t('허가일', 'Date')}
                            </th>
                            <th className="px-4 py-3 w-8"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={7} className="px-4 py-4">
                                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : items.length > 0 ? (
                            items.map((item) => (
                                <>
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                        onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-[250px]">
                                            <span className="line-clamp-2" title={cleanItemName(item.item_name)}>
                                                {cleanItemName(item.item_name)}
                                            </span>
                                            {item.is_export_only && (
                                                <span className="ml-1 inline-block px-1.5 py-0.5 text-[9px] font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded border border-amber-200 dark:border-amber-800/50">
                                                    {t('수출용', 'Export')}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[180px] truncate" title={item.item_eng_name}>
                                            {item.item_eng_name || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-1">
                                                <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                                                <span className="truncate max-w-[150px]" title={item.company_name}>
                                                    {item.company_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            {item.export_names ? (
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {item.export_names.split(',').map((n, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded border border-violet-100 dark:border-violet-800/50"
                                                        >
                                                            {n.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge size="xs" color={item.status === 'active' ? 'green' : 'red'}>
                                                {item.status === 'active' ? t('정상', 'Active') : t(item.cancel_status, 'Canceled')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                                            {item.permit_date || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">
                                            {expandedRow === item.id
                                                ? <ChevronUp className="w-4 h-4" />
                                                : <ChevronDown className="w-4 h-4" />
                                            }
                                        </td>
                                    </tr>
                                    {expandedRow === item.id && (
                                        <tr key={`${item.id}-detail`} className="bg-gray-50/50 dark:bg-gray-800/30">
                                            <td colSpan={7} className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                            {t('주성분', 'Ingredient')}
                                                        </span>
                                                        <p className="mt-1 text-gray-700 dark:text-gray-300">{item.ingredient || '-'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                            {t('품목기준코드', 'Std Code')}
                                                        </span>
                                                        <p className="mt-1 text-gray-700 dark:text-gray-300 font-mono">{item.std_code}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                            {t('허가번호', 'Permit No.')}
                                                        </span>
                                                        <p className="mt-1 text-gray-700 dark:text-gray-300 font-mono">{item.permit_no}</p>
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                            {t('품목구분', 'Category')}
                                                        </span>
                                                        <p className="mt-1">
                                                            <Badge size="xs" color="gray">{item.category}</Badge>
                                                        </p>
                                                    </div>
                                                    {item.company_eng_name && (
                                                        <div>
                                                            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                                {t('업체 영문명', 'Company (Eng)')}
                                                            </span>
                                                            <p className="mt-1 text-gray-700 dark:text-gray-300">{item.company_eng_name}</p>
                                                        </div>
                                                    )}
                                                    {item.cancel_date && (
                                                        <div>
                                                            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                                {t('취소/취하일자', 'Cancel Date')}
                                                            </span>
                                                            <p className="mt-1 text-red-600 dark:text-red-400">{item.cancel_date}</p>
                                                        </div>
                                                    )}
                                                    {item.export_names && (
                                                        <div className="md:col-span-2">
                                                            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                                {t('수출명 (전체)', 'Export Names (All)')}
                                                            </span>
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {item.export_names.split(',').map((n, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="inline-block px-2 py-0.5 text-[11px] font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full border border-violet-200 dark:border-violet-800/50"
                                                                    >
                                                                        {n.trim()}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                                    {t('데이터가 없습니다.', 'No data found.')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('이전', 'Prev')}
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {t('다음', 'Next')}
                    </button>
                </div>
            )}
        </div>
    );
}
