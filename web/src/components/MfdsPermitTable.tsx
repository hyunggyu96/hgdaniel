'use client';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from "@tremor/react";
import { ChevronDown, ChevronUp, Search, Database, Building2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

interface MfdsProduct {
    id: number;
    permit_number: string;
    permit_number_raw: string;
    company_id: number;
    company_name: string;
    product_category: string;
    permit_date: string;
    status: string;
    cancel_date: string | null;
    brand_names: string | null;
    model_info: string | null;
    model_count: number | null;
    oem_client: string | null;
    manufacturer: string | null;
    manufacturer_country: string | null;
    device_grade: string | null;
}

interface MfdsPermitTableProps {
    companyId?: number;
    companyName?: string;
    showFilters?: boolean;
}

export default function MfdsPermitTable({ companyId, companyName, showFilters = true }: MfdsPermitTableProps) {
    const { language } = useLanguage();
    const [items, setItems] = useState<MfdsProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled'>('active');
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
            if (companyId) params.set('company_id', String(companyId));
            if (companyName) params.set('company_name', companyName);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (searchQuery.trim()) params.set('query', searchQuery.trim());

            const res = await fetch(`/api/mfds-products?${params.toString()}`, {
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

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        if (dateStr.length === 8) {
            return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
        }
        return dateStr;
    };

    const parseBrandNames = (brands: string | null): string[] => {
        if (!brands) return [];
        return brands.split(',').map(b => b.trim()).filter(Boolean).slice(0, 20);
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
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-lg">
                        <Database className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {t('식약처 품목허가 DB', 'MFDS Device Permit DB')}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {companyName || 'All'} · {totalCount}{t('건', ' items')}
                            <span className="ml-2 text-gray-400">data.go.kr</span>
                        </p>
                    </div>
                </div>

                {showFilters && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {/* Status filter */}
                        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
                            {(['active', 'cancelled', 'all'] as const).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-3 py-1.5 transition-colors ${
                                        statusFilter === s
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {s === 'active' ? t('유효', 'Active') : s === 'cancelled' ? t('취소', 'Canceled') : t('전체', 'All')}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 md:w-48">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('브랜드명, 허가번호...', 'Brand, permit...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                {t('허가번호', 'Permit No.')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {t('품목명', 'Category')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {t('브랜드명', 'Brands')}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {t('모델', 'Models')}
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">
                                {t('OEM 위탁자', 'OEM Client')}
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
                                    <td colSpan={8} className="px-4 py-4">
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
                                        <td className="px-4 py-3 text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                            {item.permit_number_raw || item.permit_number}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-[120px] truncate" title={item.product_category}>
                                            {item.product_category}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.brand_names ? (
                                                <div className="flex flex-wrap gap-1 max-w-[250px]">
                                                    {parseBrandNames(item.brand_names).slice(0, 3).map((b, i) => (
                                                        <span
                                                            key={i}
                                                            className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded border border-blue-100 dark:border-blue-800/50"
                                                        >
                                                            {b}
                                                        </span>
                                                    ))}
                                                    {parseBrandNames(item.brand_names).length > 3 && (
                                                        <span className="text-[10px] text-gray-400">
                                                            +{parseBrandNames(item.brand_names).length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300 dark:text-gray-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400 font-mono">
                                            {item.model_count || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 hidden lg:table-cell max-w-[150px] truncate" title={item.oem_client || ''}>
                                            {item.oem_client ? (
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                                                    {item.oem_client}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge size="xs" color={item.status === 'active' ? 'green' : 'red'}>
                                                {item.status === 'active' ? t('유효', 'Valid') : t('취소', 'Canceled')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400 font-mono whitespace-nowrap">
                                            {formatDate(item.permit_date)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400">
                                            {expandedRow === item.id
                                                ? <ChevronUp className="w-4 h-4" />
                                                : <ChevronDown className="w-4 h-4" />
                                            }
                                        </td>
                                    </tr>
                                    {/* Expanded detail row */}
                                    {expandedRow === item.id && (
                                        <tr key={`${item.id}-detail`} className="bg-gray-50/50 dark:bg-gray-800/30">
                                            <td colSpan={8} className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                                    {item.brand_names && (
                                                        <div>
                                                            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                                {t('브랜드명 (전체)', 'Brand Names (All)')}
                                                            </span>
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {parseBrandNames(item.brand_names).map((b, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className="inline-block px-2 py-0.5 text-[11px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800/50"
                                                                    >
                                                                        {b}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.model_info && (
                                                        <div>
                                                            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                                {t('모델 정보', 'Model Info')}
                                                            </span>
                                                            <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed break-all">
                                                                {item.model_info.length > 300
                                                                    ? item.model_info.substring(0, 300) + '...'
                                                                    : item.model_info
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                    {item.oem_client && (
                                                        <div>
                                                            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                                {t('OEM 위탁자', 'OEM Client')}
                                                            </span>
                                                            <p className="mt-1 text-gray-700 dark:text-gray-300">{item.oem_client}</p>
                                                        </div>
                                                    )}
                                                    {item.manufacturer && (
                                                        <div>
                                                            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                                {t('제조원', 'Manufacturer')}
                                                            </span>
                                                            <p className="mt-1 text-gray-700 dark:text-gray-300">
                                                                {item.manufacturer}
                                                                {item.manufacturer_country && ` (${item.manufacturer_country})`}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {item.device_grade && (
                                                        <div>
                                                            <span className="font-bold text-gray-500 dark:text-gray-400 uppercase text-[10px]">
                                                                {t('등급', 'Grade')}
                                                            </span>
                                                            <p className="mt-1">
                                                                <Badge size="xs" color="gray">{t('등급', 'Grade')} {item.device_grade}</Badge>
                                                            </p>
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
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
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
