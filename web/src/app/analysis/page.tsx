'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, Title, Text, Grid, Badge } from "@tremor/react";
import { API_ENDPOINTS } from '@/lib/apiConfig';

export default function AnalysisPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryCompany = searchParams?.get('company');

    const [companyName, setCompanyName] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [language, setLanguage] = useState<'ko' | 'en'>('ko');

    // Separate state for real-time data
    const [stockData, setStockData] = useState<any>(null);
    const [newsData, setNewsData] = useState<any>(null);

    useEffect(() => {
        if (queryCompany) {
            setCompanyName(queryCompany);
            performAnalysis(queryCompany);
        }
    }, [queryCompany]);

    // Auto-refresh stock and news data every 30 seconds
    useEffect(() => {
        if (!companyName || !result) return;

        const refreshData = async () => {
            try {
                // Fetch stock data
                const stockRes = await fetch(API_ENDPOINTS.stockData(companyName));
                if (stockRes.ok) {
                    const stockJson = await stockRes.json();
                    setStockData(stockJson);
                }

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

    // MOCK DATA for Fallback/Demo
    const MOCK_RESULT = {
        "company": {
            "name": "삼성전자",
            "stock_code": "005930"
        },
        "company_summary": "삼성전자는 대한민국을 대표하는 글로벌 전자 기업으로, 반도체(메모리, 시스템LSI), 모바일(스마트폰, 태블릿), 가전(TV, 냉장고) 등 다양한 사업 분야에서 세계적인 경쟁력을 보유하고 있습니다.\n특히 메모리 반도체 분야에서는 압도적인 시장 점유율 1위를 유지하고 있으며, AI 시대를 맞아 HBM 등 차세대 메모리 기술 개발에 주력하고 있습니다.",
        "market_data": {
            "price": "74,200",
            "change": "+800 (+1.09%)",
            "market_cap": "452조",
            "market_type": "KOSPI",
            "code": "005930"
        },
        "financial_history": {
            "2026": { "revenue": "85000000000000", "operating_profit": "12000000000000", "rd_cost": "7500000000000", "data_type": "projected" },
            "2025": { "revenue": "320000000000000", "operating_profit": "35000000000000", "rd_cost": "28000000000000", "data_type": "estimated" },
            "2024": { "revenue": "305000000000000", "operating_profit": "28000000000000", "rd_cost": "26000000000000" },
            "2023": { "revenue": "258935000000000", "operating_profit": "6567000000000", "rd_cost": "28340000000000" }
        },
        "audit_report": {
            "title": "제56기 반기보고서 (2024.06)",
            "date": "2024-08-14",
            "link": "#",
            "financials": { "revenue": "145000000000000", "profit": "16000000000000" }
        },
        "prior_report": {
            "title": "제55기 사업보고서 (2023.12)",
            "date": "2024-03-12",
            "financials": { "revenue": "258935000000000", "profit": "6567000000000" }
        },
        "news_analysis": {
            "recent_headlines": [
                { "title": "삼성전자, 차세대 HBM4 개발 박차... 엔비디아 공급 기대감", "date": "2024-10-25", "link": "#" },
                { "title": "'AI폰' 갤럭시 S25 조기 출시설 솔솔... 성능 대폭 향상", "date": "2024-10-24", "link": "#" },
                { "title": "삼성 파운드리, 2나노 공정 수율 확보 총력전", "date": "2024-10-23", "link": "#" }
            ]
        },
        "gemini_analysis": "### 📊 삼성전자 재무/사업 분석 (AI 요약)\n\n**1. 실적 턴어라운드 본격화**\n2023년 반도체 불황으로 인한 영업이익 급감을 딛고, 2024년 및 2025년에는 실적이 뚜렷하게 회복될 것으로 전망됩니다. 특히 메모리 반도체 가격 상승과 AI 수요 증가가 주요 견인차 역할을 할 것입니다.\n\n**2. 압도적인 R&D 투자 지속**\n어려운 업황 속에서도 R&D 투자를 줄이지 않고 역대 최대 규모(28조원↑)를 유지하고 있습니다. 이는 당장의 수익성보다는 초격차 기술 확보를 통해 미래 경쟁력을 다지겠다는 강력한 의지로 해석됩니다.\n\n**3. AI 시대의 핵심 플레이어**\n온디바이스 AI(갤럭시 스마트폰)와 AI 인프라(HBM, 파운드리) 양쪽 모두에서 핵심적인 입지를 구축하고 있어, AI 시장 성장의 직접적인 수혜가 기대됩니다.",
        "gemini_analysis_en": "Analysis pending...",
        "rd_analysis": {
            "keywords": ["R&D", "임상", "연구", "개발"],
            "patents": []
        }
    };

    const performAnalysis = async (name: string) => {
        if (!name) return;
        setLoading(true);
        setError('');
        setResult(null);

        // MOCK MODE: Bypass API call and use mock data
        // setTimeout to simulate network delay
        setTimeout(() => {
            // Update Mock Data with requested company name for realism
            const mock = { ...MOCK_RESULT };
            mock.company.name = name;
            // Randomize slightly for demo
            if (name !== '삼성전자') {
                mock.company_summary = `${name}에 대한 AI 분석 결과입니다. (데모 데이터)`;
                mock.gemini_analysis = `### 📊 ${name} 분석 결과 (MOCK)\n\n현재 API 시스템 점검으로 인해 샘플 데이터를 표시합니다.\n실제 **${name}**의 최신 사업보고서 기반 분석은 추후 연동될 예정입니다.\n\n다만, **${name}** 역시 최근 시장 트렌드에 맞춰 R&D 투자를 확대하고 있으며, 안정적인 재무 구조를 유지하기 위해 노력하고 있는 것으로 파악됩니다.`;
            }

            setResult(mock);
            setLoading(false);
        }, 1500);

        /* REAL API CALL (TEMPORARILY DISABLED)
        try {
            const response = await fetch(API_ENDPOINTS.analyze, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company_name: name }),
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setLoading(false);
        } finally {
            // setLoading(false);
        }
        */
    };

    const isReportMode = !!queryCompany || !!result || loading;

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? dateString : date.toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Helper for formatting large numbers (Korean Won)
    const formatMoney = (amount: string) => {
        if (!amount || amount === '-' || amount === 'N/A') return amount;
        return Number(amount).toLocaleString() + ' KRW';
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

    // Calculate percentage change
    const calculateChange = (current: string, previous: string) => {
        if (!current || !previous || current === 'N/A' || previous === 'N/A') return null;

        const currVal = parseFloat(current);
        const prevVal = parseFloat(previous);

        if (isNaN(currVal) || isNaN(prevVal) || prevVal === 0) return null;

        const change = ((currVal - prevVal) / Math.abs(prevVal)) * 100;
        return change;
    };

    const renderChangeBadge = (current: string, previous: string) => {
        const change = calculateChange(current, previous);
        if (change === null) return null;

        const isPositive = change > 0;
        const colorClass = isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";
        const sign = isPositive ? "+" : "";

        return (
            <span className={`text-xs font-bold px-2 py-0.5 rounded ml-2 ${colorClass}`}>
                {sign}{change.toFixed(1)}%
            </span>
        );
    };

    const renderStockChange = (changeStr: string) => {
        if (!changeStr) return null;
        // changeStr format example: "+150 (+1.2%)" or "-50 (-0.5%)"

        const isPositive = changeStr.includes('+') && !changeStr.includes('-');

        return (
            <span className={`text-sm font-semibold ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                {changeStr}
            </span>
        );
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
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div>
                        <Title className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Company Analyzer
                        </Title>
                        <Text className="text-gray-500 mt-1">
                            Advanced AI-powered financial analysis & real-time monitoring
                        </Text>
                    </div>
                    {isReportMode && (
                        <button
                            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1 rounded text-sm transition-colors flex items-center gap-1"
                            onClick={() => router.push('/company')}
                        >
                            &larr; Back to List
                        </button>
                    )}
                </div>
            </div>

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

            {/* Analysis Result */}
            {isReportMode && result && (
                <div className="animate-fade-in-up">

                    {/* 0. Stock Info Header */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="flex items-start gap-4 flex-none">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600 shadow-sm border border-blue-200">
                                {companyName.slice(0, 1)}
                            </div>
                            <div className="flex flex-col">
                                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{result.company.name}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-gray-500 text-lg font-medium">{result.company.stock_code}</span>
                                    <span className="px-2 py-1 bg-blue-500 text-white font-bold rounded text-xs shadow-sm">
                                        {stockData?.market_type || result.market_data?.market_type || 'KRX'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 items-center bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex-1">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Price</span>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className={`text-2xl font-bold ${typeof result.market_data?.change === 'string' && result.market_data?.change.includes('+') ? 'text-red-600' : 'text-blue-600'}`}>
                                        {result.market_data?.price !== 'N/A' ? `${result.market_data?.price} 원` : 'N/A'}
                                    </span>
                                    {typeof result.market_data?.change === 'string' && renderStockChange(result.market_data.change)}
                                </div>
                            </div>
                            <div className="w-px h-12 bg-gray-200 hidden md:block mx-2"></div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Market Cap</span>
                                <span className="text-xl font-medium text-gray-800 mt-1">
                                    {result.market_data?.market_cap !== 'N/A' ? result.market_data?.market_cap : '-'}
                                </span>
                            </div>
                            <div className="w-px h-12 bg-gray-200 hidden md:block mx-2"></div>
                            <div className="flex-1 min-w-[200px]">
                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Overview</span>
                                <p className="text-sm text-gray-700 mt-1 leading-snug line-clamp-2">
                                    {result.company_summary}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 my-8"></div>

                    {/* Financial History (Left) and Recent Headlines (Right) - Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 1. Financial History Table (4 Years) - LEFT */}
                        <Card className="overflow-hidden shadow-lg border-0 ring-1 ring-gray-200 sm:rounded-xl">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-100 p-1.5 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Financial History</h3>
                                </div>
                            </div>

                            {result.financial_history && Object.keys(result.financial_history).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr>
                                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-blue-50/80 w-32 border-r border-gray-100">
                                                    구분
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-blue-50/50">
                                                    2026
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-blue-50/50">
                                                    2025
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-blue-50/50">
                                                    2024
                                                </th>
                                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-blue-50/50">
                                                    2023
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {/* Revenue Row */}
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-100/80 border-r border-gray-200">
                                                    매출액
                                                </td>
                                                {['2026', '2025', '2024', '2023'].map(year => {
                                                    const yearData = result.financial_history[year];
                                                    const dataType = yearData?.data_type;
                                                    const isYTD = dataType && dataType.startsWith('ytd_');

                                                    return (
                                                        <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-blue-600">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span>{formatKoreanNumber(yearData?.revenue)}</span>
                                                                {isYTD && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                                                        YTD
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            {/* Operating Profit Row */}
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-100/80 border-r border-gray-200">
                                                    영업이익
                                                </td>
                                                {['2026', '2025', '2024', '2023'].map(year => (
                                                    <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-green-600">
                                                        {formatKoreanNumber(result.financial_history[year]?.operating_profit)}
                                                    </td>
                                                ))}
                                            </tr>
                                            {/* R&D Cost Row */}
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-100/80 border-r border-gray-200">
                                                    연구비용
                                                </td>
                                                {['2026', '2025', '2024', '2023'].map(year => {
                                                    const rdCost = result.financial_history[year]?.rd_cost;
                                                    const revenue = result.financial_history[year]?.revenue;
                                                    const ratio = calculateRatio(rdCost, revenue);

                                                    return (
                                                        <td key={year} className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-purple-600">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span>{formatKoreanNumber(rdCost)}</span>
                                                                {ratio && (
                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                                                        {ratio}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            {/* Divider Row for Visual Separation */}
                                            <tr><td colSpan={5} className="bg-gray-50 h-2 p-0"></td></tr>

                                            {/* Annual Report Row */}
                                            <tr className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500 bg-gray-100/80 border-r border-gray-200">
                                                    사업보고서
                                                </td>
                                                {['2026', '2025', '2024', '2023'].map(year => {
                                                    const report = result.financial_history[year]?.annual_report;
                                                    return (
                                                        <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center">
                                                            {report ? (
                                                                <a href={report.link} target="_blank" rel="noopener noreferrer"
                                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition-colors border border-blue-200">
                                                                    View
                                                                </a>
                                                            ) : <span className="text-gray-300">-</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>

                                            {/* Quarterly Reports Rows */}
                                            {['Q4', 'Q3', 'Q2', 'Q1'].map(quarter => (
                                                <tr key={quarter} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-500 bg-gray-100/80 border-r border-gray-200">
                                                        {quarter === 'Q1' ? '1분기' : quarter === 'Q2' ? '2분기' : quarter === 'Q3' ? '3분기' : '4분기'}
                                                    </td>
                                                    {['2026', '2025', '2024', '2023'].map(year => {
                                                        // Dynamic access to quarter property safely
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const report = (result.financial_history[year] as any)?.[quarter];
                                                        return (
                                                            <td key={year} className="px-6 py-3 whitespace-nowrap text-sm text-center">
                                                                {report ? (
                                                                    <a href={report.link} target="_blank" rel="noopener noreferrer"
                                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                                                        View
                                                                    </a>
                                                                ) : <span className="text-gray-300">-</span>}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <Text>No financial history available</Text>
                            )}
                        </Card>

                        {/* 2. Recent Headlines (Naver) - RIGHT */}
                        <Card className="overflow-hidden shadow-lg border-0 ring-1 ring-gray-200 sm:rounded-xl h-full">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-100 p-1.5 rounded-lg">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Recent Headlines</h3>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {(newsData?.headlines || result.news_analysis.recent_headlines).map((item: any, i: number) => (
                                    <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                        {item.link ? (
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-gray-800 leading-snug hover:text-green-600 transition-colors cursor-pointer"
                                            >
                                                {item.title}
                                            </a>
                                        ) : (
                                            <Text className="font-medium text-gray-800 leading-snug">{item.title}</Text>
                                        )}
                                        <Text className="text-xs text-gray-400 mt-1">{formatDate(item.date)}</Text>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="border-t border-gray-200 my-8"></div>

                    {/* 3. Analysis Summary - BOTTOM */}
                    <div className="mt-8">
                        <Card className="overflow-hidden shadow-lg border-0 ring-1 ring-gray-200 sm:rounded-xl bg-white">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="bg-purple-100 p-1.5 rounded-lg">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Analysis Summary</h3>
                                </div>
                                <button
                                    onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
                                    className="px-4 py-1.5 text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 hover:text-purple-600 rounded-full transition-all shadow-sm"
                                >
                                    {language === 'ko' ? 'English' : '한국어'}
                                </button>
                            </div>
                            <Text className="text-gray-800 font-medium whitespace-pre-line leading-relaxed text-base p-2">
                                {language === 'ko'
                                    ? (result.gemini_analysis || "분석 대기 중...")
                                    : (result.gemini_analysis_en || result.gemini_analysis || "Analysis pending...")
                                }
                            </Text>
                        </Card>
                    </div>
                </div>
            )}
        </main>
    );
}
