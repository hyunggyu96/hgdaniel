'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Title, Text } from "@tremor/react";
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { COMPANY_OVERVIEWS } from '@/data/companyOverviews';
import { isGlobalCompany } from '@/data/companyCategories';
import CompetitorTable from '@/components/CompetitorTable';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import governanceData from '@/data/governance_data.json';

// Safely require MFDS Data (might be missing initially)
// Safely require MFDS Data (prioritize filtered small set)
let competitorData = { items: [] };
try {
    // Try loading the small filtered file first (for Repo/Production)
    competitorData = require('@/data/mfds_competitors_small.json');
} catch (e1) {
    try {
        // Fallback to full DB (local dev environment)
        competitorData = require('@/data/mfds_competitors.json');
    } catch (e2) {
        console.warn("MFDS Data not found, using empty set");
    }
}

const YEARS = ['2022', '2023', '2024', '2025'] as const;

export default function AnalysisPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryCompany = searchParams?.get('company');

    const [companyName, setCompanyName] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Separate state for real-time data
    const [newsData, setNewsData] = useState<any>(null);

    useEffect(() => {
        if (queryCompany) {
            setCompanyName(queryCompany);
            performAnalysis(queryCompany);
        }
    }, [queryCompany]);

    // Auto-refresh news data every 30 seconds
    useEffect(() => {
        if (!companyName || !result) return;

        const refreshData = async () => {
            try {
                // Fetch news data
                const newsRes = await fetch(API_ENDPOINTS.news(companyName));
                if (newsRes.ok) {
                    const newsJson = await newsRes.json();
                    setNewsData(newsJson);
                }
            } catch (err) {
                console.error('Auto-refresh error:', err);
            }
        };

        // Initial fetch
        refreshData();

        // Set up interval (30 seconds)
        const interval = setInterval(refreshData, 30000);

        return () => clearInterval(interval);
    }, [companyName, result]);

    // MOCK DATA GENERATOR (Can be replaced with JSON injection)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const financialData = require('@/data/financial_data.json');

    const getMockData = (name: string) => {
        // Use Real Data from JSON if available
        const realData = financialData[name];

        // Stock data removed as requested

        // Basic company info map (simplified)
        const db: Record<string, { code: string }> = {
            "한스바이오메드": { code: "042520" },
            "엘앤씨바이오": { code: "290650" },
            "제테마": { code: "216080" },
            "한국비엔씨": { code: "256840" },
            "종근당바이오": { code: "063160" },
            "휴온스": { code: "243070" },
            "휴온스글로벌": { code: "084110" },
            "휴메딕스": { code: "200670" },
            "휴젤": { code: "145020" },
            "메디톡스": { code: "086900" },
            "대웅제약": { code: "069620" },
            "파마리서치": { code: "214450" },
            "클래시스": { code: "214150" },
            "케어젠": { code: "214370" },
            "원텍": { code: "336570" },
            "동방메디컬": { code: "240550" },
            "제이시스메디칼": { code: "287410" },
            "바이오비쥬": { code: "489460" },
            "바이오플러스": { code: "099430" },
            "비올": { code: "335890" },
            "하이로닉": { code: "149980" },
            "레이저옵텍": { code: "199550" },
            "유바이오로직스": { code: "206650" },
            "멀츠": { code: "MERZ" },
            "앨러간": { code: "ABBV" },
            "갈더마": { code: "GALD" },
            "테옥산": { code: "TEOX" },
        };

        const companyInfo = db[name] || { code: "000000" };

        return {
            "company": {
                "name": name,
                "stock_code": companyInfo.code
            },
            "company_summary": `${name}은(는) 의료기기 및 바이오 헬스케어 분야에서 혁신적인 기술력을 보유한 선도 기업입니다. 지속적인 R&D 투자와 글로벌 시장 확대를 통해 안정적인 성장을 이어가고 있으며, 특히 에스테틱 및 치료용 의료기기 시장에서 강력한 경쟁력을 입증하고 있습니다.`,
            "financial_history": (realData && realData.financial_history && Object.keys(realData.financial_history).length > 0)
                ? realData.financial_history
                : {
                    "2026": { "revenue": "1000", "operating_profit": "150", "rd_cost": "50", "data_type": "projected" },
                    "2025": { "revenue": "950", "operating_profit": "130", "rd_cost": "45", "data_type": "estimated" },
                    "2024": { "revenue": "900", "operating_profit": "120", "rd_cost": "40" },
                    "2023": { "revenue": "850", "operating_profit": "100", "rd_cost": "35" }
                },
            "news_analysis": {
                "recent_headlines": [
                    { "title": `${name}, 글로벌 시장 공략 가속화... 수출 비중 확대`, "date": "2024-10-25", "link": "#" },
                    { "title": `신제품 FDA 승인 기대감... ${name} 주가 상승세`, "date": "2024-10-24", "link": "#" },
                    { "title": `${name} 3분기 실적 호조, 영업이익 대폭 개선`, "date": "2024-10-23", "link": "#" }
                ]
            }
        };
    };

    const performAnalysis = async (name: string) => {
        if (!name) return;
        setLoading(true);
        setError('');
        setResult(null);

        try {

            const mock = getMockData(name);
            setResult(mock);
        } catch (err: any) {
            setError('Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    const isReportMode = !!queryCompany || !!result || loading;

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Helper for Korean Financial Units (Jo/Eok) - Rounded to nearest Eok
    const formatKoreanNumber = (amount: string | number) => {
        if (!amount || amount === '-' || amount === 'N/A') return '-';

        let num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(num)) return amount.toString();

        if (num === 0) return '0원';

        // Convert to 'Eok' (100 million) and round
        const eokUnit = 100000000;
        const roundedEok = Math.round(num / eokUnit);

        if (roundedEok === 0) {
            return '0억';
        }

        const joUnit = 10000; // 10000 Eok = 1 Jo
        const jo = Math.floor(roundedEok / joUnit);
        const eok = roundedEok % joUnit;

        let result = '';
        if (jo > 0) {
            result += `${jo}조 `; // No comma for Jo usually
        }
        if (eok > 0) {
            result += `${eok.toLocaleString()}억`; // Add commas for readability: 4,227
        }

        return result.trim();
    };

    // Calculate Ratio (e.g. R&D / Revenue)
    const calculateRatio = (numerator: string | number, denominator: string | number) => {
        if (!numerator || !denominator || numerator === 'N/A' || denominator === 'N/A' || numerator === '-' || denominator === '-') return null;

        const num = typeof numerator === 'string' ? parseFloat(numerator.replace(/,/g, '')) : numerator;
        const den = typeof denominator === 'string' ? parseFloat(denominator.replace(/,/g, '')) : denominator;

        if (isNaN(num) || isNaN(den) || den === 0) return null;

        const ratio = (num / den) * 100;
        return ratio.toFixed(1);
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 md:p-12 transition-colors duration-300">
            <div className="w-full px-4 md:px-8 space-y-6">
                {/* Back to List Navigation - absolute top-left or wide container */}
                {isReportMode && (
                    <div className="w-full flex justify-start mb-4">
                        <button
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2"
                            onClick={() => router.push('/company')}
                        >
                            <span className="font-bold">←</span> Back to List
                        </button>
                    </div>
                )}

                {!isReportMode && (
                    <div className="max-w-xl mx-auto mt-20 text-center">
                        <Title className="text-3xl font-bold mb-4">Stock Analysis (Deep Dive)</Title>
                        <Text className="mb-8 text-gray-500">Enter a company name to analyze R&D, Patents, and News.</Text>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="border p-3 rounded-lg w-full text-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Company Name (e.g. 삼성전자)"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && performAnalysis(companyName)}
                            />
                            <button
                                onClick={() => performAnalysis(companyName)}
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
                            >
                                Analyze
                            </button>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="mt-20 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <Text className="text-lg text-gray-600">Analyzing <b>{companyName}</b>...</Text>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Company Header Info (NO Stock Data) */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                        {result.company.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{result.company.name}</h2>
                                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                                {result.company.stock_code}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">KOSDAQ</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-px h-12 bg-gray-200 dark:bg-gray-700 hidden md:block mx-2"></div>

                                <div className="flex-1 min-w-[200px]">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wide">Overview</span>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-snug line-clamp-2">
                                        {COMPANY_OVERVIEWS[companyName] || result.company_summary || "회사 개요 정보가 없습니다."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>

                        {/* Financial History (Left) and Recent Headlines (Right) - Side by Side */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 1. Financial History Table (4 Years) - LEFT */}
                            <Card className="overflow-hidden shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800 sm:rounded-xl bg-white dark:bg-gray-900 transition-colors">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg">
                                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Financial History</h3>
                                    </div>
                                </div>

                                {result.financial_history && Object.keys(result.financial_history).length > 0 ? (
                                    (() => {
                                        const chartData = YEARS.map(year => {
                                            const yearData = result.financial_history[year];
                                            const rev = yearData?.revenue;
                                            const op = yearData?.operating_profit;
                                            const parseEok = (v: string | undefined) => {
                                                if (!v || v === 'N/A' || v === '-') return 0;
                                                const n = parseFloat(v);
                                                return isNaN(n) ? 0 : Math.round(n / 1e8);
                                            };
                                            return {
                                                year,
                                                매출액: parseEok(rev),
                                                영업이익: parseEok(op),
                                            };
                                        });

                                        const hasData = chartData.some(d => d.매출액 > 0 || d.영업이익 > 0);

                                        return (
                                            <>
                                                {hasData && (
                                                    <div className="mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
                                                        <ResponsiveContainer width="100%" height={260}>
                                                            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                                <defs>
                                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" className="dark:opacity-30 opacity-50" />
                                                                <XAxis
                                                                    dataKey="year"
                                                                    tick={{ fontSize: 12, fill: '#6b7280' }}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    dy={10}
                                                                />
                                                                <YAxis
                                                                    yAxisId="left"
                                                                    tick={{ fontSize: 10, fill: '#6b7280' }}
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tickFormatter={(v) => {
                                                                        if (v === 0) return '0';
                                                                        const jo = Math.floor(v / 10000);
                                                                        const eok = v % 10000;
                                                                        let formatted = '';
                                                                        if (jo > 0) formatted += `${jo}조`;
                                                                        if (eok > 0) formatted += `${eok}억`;
                                                                        return formatted;
                                                                    }}
                                                                    width={40}
                                                                />
                                                                <Tooltip
                                                                    contentStyle={{
                                                                        backgroundColor: '#1f2937',
                                                                        borderColor: '#374151',
                                                                        borderRadius: '8px',
                                                                        color: '#f3f4f6',
                                                                        fontSize: '12px'
                                                                    }}
                                                                    itemStyle={{ color: '#f3f4f6' }}
                                                                    formatter={(value: number, name: string) => {
                                                                        if (value === 0) return ['-', name];
                                                                        const jo = Math.floor(value / 10000);
                                                                        const eok = value % 10000;
                                                                        let formatted = '';
                                                                        if (jo > 0) formatted += `${jo}조 `;
                                                                        if (eok > 0) formatted += `${eok.toLocaleString()}억`;
                                                                        return [formatted.trim() || '0', name === '매출액' ? 'Revenue' : 'Op. Profit'];
                                                                    }}
                                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                                />
                                                                <Legend wrapperStyle={{ fontSize: 12, paddingTop: '10px' }} iconType="circle" />
                                                                <Bar yAxisId="left" dataKey="매출액" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} barSize={24} name="매출액 (Revenue)" />
                                                                <Line yAxisId="left" type="monotone" dataKey="영업이익" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#1f2937' }} activeDot={{ r: 6 }} name="영업이익 (Profit)" />
                                                            </ComposedChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                )}

                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                                                        <thead>
                                                            <tr>
                                                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-32 border-b border-gray-100 dark:border-gray-800">
                                                                    구분
                                                                </th>
                                                                {YEARS.map(year => (
                                                                    <th key={year} scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                                                        {year}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-transparent divide-y divide-gray-100 dark:divide-gray-800/30">
                                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-200">
                                                                    매출액
                                                                </td>
                                                                {YEARS.map(year => {
                                                                    const yearData = result.financial_history[year];
                                                                    const dataType = yearData?.data_type;
                                                                    const isYTD = dataType && dataType.startsWith('ytd_');

                                                                    return (
                                                                        <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-blue-600 dark:text-blue-400">
                                                                            <div className="flex items-center justify-center gap-2">
                                                                                <span>{formatKoreanNumber(yearData?.revenue)}</span>
                                                                                {isYTD && (
                                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                                                                        YTD
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-200">
                                                                    영업이익
                                                                </td>
                                                                {YEARS.map(year => (
                                                                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-green-600 dark:text-green-400">
                                                                        {formatKoreanNumber(result.financial_history[year]?.operating_profit)}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-200">
                                                                    연구비용
                                                                </td>
                                                                {YEARS.map(year => {
                                                                    const rdCost = result.financial_history[year]?.rd_cost;
                                                                    const revenue = result.financial_history[year]?.revenue;
                                                                    const ratio = calculateRatio(rdCost, revenue);

                                                                    return (
                                                                        <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-purple-600 dark:text-purple-400">
                                                                            <div className="flex items-center justify-center gap-2">
                                                                                <span>{formatKoreanNumber(rdCost)}</span>
                                                                                {ratio && (
                                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                                                                        {ratio}%
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors border-t border-gray-100 dark:border-gray-800">
                                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                                    사업보고서
                                                                </td>
                                                                {YEARS.map(year => {
                                                                    const report = result.financial_history[year]?.annual_report;
                                                                    return (
                                                                        <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center">
                                                                            {report ? (
                                                                                <a href={report.link} target="_blank" rel="noopener noreferrer"
                                                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800  dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800">
                                                                                    View
                                                                                </a>
                                                                            ) : <span className="text-gray-300 dark:text-gray-600">-</span>}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                            {['Q4', 'Q3', 'Q2', 'Q1'].map(quarter => (
                                                                <tr key={quarter} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                                        {quarter === 'Q1' ? '1분기' : quarter === 'Q2' ? '2분기' : quarter === 'Q3' ? '3분기' : '4분기'}
                                                                    </td>
                                                                    {YEARS.map(year => {
                                                                        const report = (result.financial_history[year] as any)?.[quarter];
                                                                        return (
                                                                            <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center">
                                                                                {report ? (
                                                                                    <a href={report.link} target="_blank" rel="noopener noreferrer"
                                                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors">
                                                                                        View
                                                                                    </a>
                                                                                ) : <span className="text-gray-300 dark:text-gray-600">-</span>}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        );
                                    })()
                                ) : (
                                    <Text className="p-6 text-center text-gray-500">No financial history available for this company.</Text>
                                )}
                            </Card>

                            {/* 2. Recent Headlines (Naver) - RIGHT */}
                            <Card className="overflow-hidden shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800 sm:rounded-xl bg-white dark:bg-gray-900 transition-colors h-full">
                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">
                                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Headlines</h3>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {(newsData?.headlines || result.news_analysis.recent_headlines).map((item: any, i: number) => (
                                        <div key={i} className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0 last:pb-0">
                                            {item.link ? (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-gray-800 dark:text-gray-200 leading-snug hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer block"
                                                >
                                                    {item.title}
                                                </a>
                                            ) : (
                                                <Text className="font-medium text-gray-800 dark:text-gray-200 leading-snug">{item.title}</Text>
                                            )}
                                            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1 block">{formatDate(item.date)}</Text>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>

                        {/* 3. Analysis Summary - Corporate Governance */}
                        <div className="mt-8">
                            <Card className="overflow-hidden shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800 sm:rounded-xl bg-white dark:bg-gray-900 transition-colors">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-lg">
                                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Analysis Summary</h3>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">— 기업 지배구조</span>
                                    </div>
                                </div>

                                {(() => {
                                    const gov = (governanceData as Record<string, any>)[companyName];
                                    if (!gov) {
                                        return (
                                            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                                                <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                                </svg>
                                                <p className="text-sm">지배구조 정보가 아직 등록되지 않았습니다.</p>
                                            </div>
                                        );
                                    }

                                    const rows = [
                                        { label: "최대주주", value: gov.largest_shareholder, icon: "👤" },
                                        { label: "대표이사 (CEO)", value: gov.ceo, icon: "🏛️" },
                                        { label: "모회사 / 그룹", value: gov.parent_group, icon: "🏢" },
                                        { label: "경영형태", value: gov.governance_type, icon: "📋" },
                                        { label: "주요 자회사", value: gov.subsidiaries, icon: "🔗" },
                                    ];

                                    return (
                                        <div className="space-y-4">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
                                                        {rows.map((row, i) => (
                                                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                                                <td className="px-4 py-3.5 whitespace-nowrap w-48">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-base">{row.icon}</span>
                                                                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{row.label}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {row.value || (
                                                                        <span className="text-gray-300 dark:text-gray-600 italic">미확인</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Data Source Footer */}
                                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 px-4">
                                                <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                                    출처: {gov.source || "DART 전자공시 / 기업 IR"}
                                                    {gov.source_date && ` (${gov.source_date})`}
                                                    {" · 실제와 다를 수 있으며 최신 공시를 확인하세요"}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </Card>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>

                        {/* 4. Competitor Permit Status (MFDS Data) */}
                        <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            {(() => {
                                // OPTIMIZATION: Filter items on SERVER side
                                // Handle both Flat (Small) and Nested (Full) structures
                                const rawItems = competitorData?.items || [];

                                const normalizedItems = rawItems.map((item: any) => item.item || item);

                                const filteredItems = normalizedItems.filter((item: any) => {
                                    const name = item.PRDLST_NM || "";
                                    const isFillerRelated = (
                                        name.includes('조직수복용') ||
                                        name.includes('필러') ||
                                        name.includes('히알루론산') ||
                                        (name.includes('주입') && name.includes('안면'))
                                    ) && !name.includes('치과');
                                    return isFillerRelated;
                                });

                                return <CompetitorTable data={filteredItems} />;
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
