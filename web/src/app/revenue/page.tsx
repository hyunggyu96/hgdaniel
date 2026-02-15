'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { TrendingUp, Search, ArrowUpDown, ArrowUp, ArrowDown, Building2, Globe, BarChart3 } from 'lucide-react';

const financialData: Record<string, any> = require('@/data/financial_data.json');

const YEARS = ['2025', '2024', '2023', '2022'] as const;

type SortKey = 'name' | '2022' | '2023' | '2024' | '2025';
type SortDir = 'asc' | 'desc';

interface CompanyRow {
    name: string;
    category: 'korean' | 'global';
    revenue: Record<string, number | null>;
    operatingProfit: Record<string, number | null>;
    yoyGrowth: number | null; // latest available YoY %
    latestRevenue: number | null;
}

const GLOBAL_COMPANIES = new Set(['멀츠', '앨러간', '갈더마', '테옥산']);

function parseNum(val: string | undefined | null): number | null {
    if (!val || val === 'N/A' || val === '-' || val === '') return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
}

function toEok(val: number | null): number | null {
    if (val === null) return null;
    return Math.round(val / 1e8);
}

function formatEok(val: number | null): string {
    if (val === null) return '-';
    if (val === 0) return '0';
    const jo = Math.floor(val / 10000);
    const eok = val % 10000;
    let result = '';
    if (jo > 0) result += `${jo}조 `;
    if (eok > 0) result += `${eok.toLocaleString()}억`;
    return result.trim() || '0';
}

function buildRows(): CompanyRow[] {
    return Object.entries(financialData).map(([name, data]: [string, any]) => {
        const fh = data.financial_history || {};
        const revenue: Record<string, number | null> = {};
        const operatingProfit: Record<string, number | null> = {};

        for (const y of YEARS) {
            revenue[y] = toEok(parseNum(fh[y]?.revenue));
            operatingProfit[y] = toEok(parseNum(fh[y]?.operating_profit));
        }

        // YoY: find latest two consecutive years with data
        let yoyGrowth: number | null = null;
        for (let i = 0; i < YEARS.length - 1; i++) {
            const cur = revenue[YEARS[i]];
            const prev = revenue[YEARS[i + 1]];
            if (cur !== null && prev !== null && prev !== 0) {
                yoyGrowth = ((cur - prev) / prev) * 100;
                break;
            }
        }

        // Latest available revenue for default sort
        let latestRevenue: number | null = null;
        for (const y of YEARS) {
            if (revenue[y] !== null) {
                latestRevenue = revenue[y];
                break;
            }
        }

        return {
            name,
            category: GLOBAL_COMPANIES.has(name) ? 'global' : 'korean',
            revenue,
            operatingProfit,
            yoyGrowth,
            latestRevenue,
        };
    });
}

export default function RevenuePage() {
    const router = useRouter();
    const { language, t } = useLanguage();
    const lang = language as 'ko' | 'en';

    const [activeCategory, setActiveCategory] = useState<'korean' | 'global'>('korean');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('2024');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const allRows = useMemo(() => buildRows(), []);

    const koreanCount = allRows.filter(r => r.category === 'korean').length;
    const globalCount = allRows.filter(r => r.category === 'global').length;

    const filteredRows = useMemo(() => {
        let rows = allRows.filter(r => r.category === activeCategory);

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            rows = rows.filter(r => r.name.toLowerCase().includes(q));
        }

        rows.sort((a, b) => {
            if (sortKey === 'name') {
                const cmp = a.name.localeCompare(b.name, lang === 'ko' ? 'ko' : 'en');
                return sortDir === 'asc' ? cmp : -cmp;
            }
            const aVal = a.revenue[sortKey];
            const bVal = b.revenue[sortKey];
            if (aVal === null && bVal === null) return 0;
            if (aVal === null) return 1;
            if (bVal === null) return -1;
            return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return rows;
    }, [allRows, activeCategory, searchQuery, sortKey, sortDir, lang]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
        return sortDir === 'desc'
            ? <ArrowDown className="w-3 h-3 text-blue-600" />
            : <ArrowUp className="w-3 h-3 text-blue-600" />;
    };

    // Totals for the filtered set
    const totals = useMemo(() => {
        const result: Record<string, number> = {};
        for (const y of YEARS) {
            result[y] = filteredRows.reduce((sum, r) => sum + (r.revenue[y] || 0), 0);
        }
        return result;
    }, [filteredRows]);

    return (
        <main className="min-h-screen bg-gray-50/50 p-6 md:p-12 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg animate-fade-in">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 px-6 py-5 md:px-8 md:py-6">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                            <TrendingUp className="w-7 h-7 text-emerald-200" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                {t('revenue_header')}
                            </h2>
                            <p className="text-slate-300 text-sm md:text-base font-light">
                                {t('revenue_desc')}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" />
                                    {allRows.length} Companies
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                                    DART Financial Data
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-20">
                    {/* Tabs */}
                    <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-white/50 shadow-sm ring-1 ring-gray-200/50 flex w-full md:w-auto">
                        <button
                            onClick={() => setActiveCategory('korean')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeCategory === 'korean'
                                ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            <Building2 className="w-4 h-4" />
                            {lang === 'ko' ? `한국 기업 (${koreanCount})` : `Korean (${koreanCount})`}
                        </button>
                        <button
                            onClick={() => setActiveCategory('global')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeCategory === 'global'
                                ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            <Globe className="w-4 h-4" />
                            {lang === 'ko' ? `글로벌 기업 (${globalCount})` : `Global (${globalCount})`}
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64 group bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/50 ring-1 ring-gray-200/50">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-none rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder={lang === 'ko' ? '기업명 검색...' : 'Search companies...'}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50/80">
                                    <th
                                        onClick={() => handleSort('name')}
                                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors sticky left-0 bg-gray-50/80 z-10"
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {lang === 'ko' ? '회사명' : 'Company'}
                                            <SortIcon column="name" />
                                        </div>
                                    </th>
                                    {YEARS.map(year => (
                                        <th
                                            key={year}
                                            onClick={() => handleSort(year)}
                                            className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center justify-end gap-1.5">
                                                {year}
                                                <SortIcon column={year} />
                                            </div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {lang === 'ko' ? '영업이익 (최신)' : 'Op. Profit (Latest)'}
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        YoY
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRows.map((row, idx) => {
                                    // Find latest operating profit
                                    let latestOp: number | null = null;
                                    for (const y of YEARS) {
                                        if (row.operatingProfit[y] !== null) {
                                            latestOp = row.operatingProfit[y];
                                            break;
                                        }
                                    }

                                    return (
                                        <tr
                                            key={row.name}
                                            onClick={() => router.push(`/analysis?company=${encodeURIComponent(row.name)}`)}
                                            className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white group-hover:bg-blue-50/50 transition-colors z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:text-blue-600 transition-colors shrink-0">
                                                        {row.name.slice(0, 1)}
                                                    </div>
                                                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                        {row.name}
                                                    </span>
                                                </div>
                                            </td>
                                            {YEARS.map(year => (
                                                <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-700">
                                                    {row.revenue[year] !== null
                                                        ? <span className="text-blue-600">{formatEok(row.revenue[year])}</span>
                                                        : <span className="text-gray-300">-</span>
                                                    }
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                                                {latestOp !== null
                                                    ? <span className={latestOp >= 0 ? 'text-green-600' : 'text-red-500'}>{formatEok(latestOp)}</span>
                                                    : <span className="text-gray-300">-</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                                                {row.yoyGrowth !== null
                                                    ? (
                                                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold ${row.yoyGrowth >= 0
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-red-50 text-red-600'
                                                            }`}>
                                                            {row.yoyGrowth >= 0 ? '+' : ''}{row.yoyGrowth.toFixed(1)}%
                                                        </span>
                                                    )
                                                    : <span className="text-gray-300">-</span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Total Row */}
                                {filteredRows.length > 0 && (
                                    <tr className="bg-gray-50 border-t-2 border-gray-200">
                                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-gray-50 z-10">
                                            <span className="text-sm font-bold text-gray-900">
                                                {lang === 'ko' ? '합계' : 'Total'}
                                            </span>
                                        </td>
                                        {YEARS.map(year => (
                                            <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                                {totals[year] > 0 ? formatEok(totals[year]) : '-'}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4" />
                                        <td className="px-6 py-4" />
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {filteredRows.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm">{lang === 'ko' ? '검색 결과가 없습니다.' : 'No companies found.'}</p>
                        </div>
                    )}
                </div>

                {/* Data Source Note */}
                <p className="text-xs text-gray-400 text-center">
                    {lang === 'ko'
                        ? '* 매출액 단위: 억원 (원화 기준) | 데이터 출처: DART 전자공시시스템'
                        : '* Revenue unit: 100M KRW | Source: DART Electronic Disclosure System'
                    }
                </p>
            </div>
        </main>
    );
}
