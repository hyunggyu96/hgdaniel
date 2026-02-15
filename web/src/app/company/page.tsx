'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { useLanguage } from "@/components/LanguageContext";
import { Building2, Globe, Search, BarChart3, PieChart } from "lucide-react";

const financialData: Record<string, any> = require('@/data/financial_data.json');

// revenue logic removed for compactness

type CompanyStatus = 'KOSPI' | 'KOSDAQ' | 'Unlisted' | 'Global_Listed' | 'Global_Private';
type CompanyCategory = 'korean' | 'global';

interface CompanyData {
    id: number;
    name: { ko: string; en: string };
    status: CompanyStatus;
    category: CompanyCategory;
}

const allCompanies: CompanyData[] = [
    { id: 1, name: { ko: "한스바이오메드", en: "HansBiomed" }, status: 'KOSDAQ', category: 'korean' },
    { id: 2, name: { ko: "엘앤씨바이오", en: "L&C Bio" }, status: 'KOSDAQ', category: 'korean' },
    { id: 3, name: { ko: "제테마", en: "Jetema" }, status: 'KOSDAQ', category: 'korean' },
    { id: 4, name: { ko: "한국비엔씨", en: "BNC Korea" }, status: 'KOSDAQ', category: 'korean' },
    { id: 5, name: { ko: "종근당바이오", en: "Chong Kun Dang Bio" }, status: 'KOSPI', category: 'korean' },
    { id: 6, name: { ko: "휴온스", en: "Huons" }, status: 'KOSDAQ', category: 'korean' },
    { id: 7, name: { ko: "휴온스글로벌", en: "Huons Global" }, status: 'KOSDAQ', category: 'korean' },
    { id: 8, name: { ko: "휴메딕스", en: "Humedix" }, status: 'KOSDAQ', category: 'korean' },
    { id: 9, name: { ko: "휴젤", en: "Hugel" }, status: 'KOSDAQ', category: 'korean' },
    { id: 10, name: { ko: "메디톡스", en: "Medytox" }, status: 'KOSDAQ', category: 'korean' },
    { id: 11, name: { ko: "대웅제약", en: "Daewoong Pharma" }, status: 'KOSPI', category: 'korean' },
    { id: 12, name: { ko: "파마리서치", en: "PharmaResearch" }, status: 'KOSDAQ', category: 'korean' },
    { id: 13, name: { ko: "클래시스", en: "Classys" }, status: 'KOSDAQ', category: 'korean' },
    { id: 14, name: { ko: "케어젠", en: "Caregen" }, status: 'KOSDAQ', category: 'korean' },
    { id: 15, name: { ko: "원텍", en: "Wontech" }, status: 'KOSDAQ', category: 'korean' },
    { id: 16, name: { ko: "동방메디컬", en: "Dongbang Medical" }, status: 'Unlisted', category: 'korean' },
    { id: 17, name: { ko: "제이시스메디칼", en: "Jeisys Medical" }, status: 'Unlisted', category: 'korean' },
    { id: 18, name: { ko: "바이오비쥬", en: "BioBijou" }, status: 'Unlisted', category: 'korean' },
    { id: 19, name: { ko: "바이오플러스", en: "BioPlus" }, status: 'KOSDAQ', category: 'korean' },
    { id: 20, name: { ko: "비올", en: "Viol" }, status: 'KOSDAQ', category: 'korean' },
    { id: 21, name: { ko: "하이로닉", en: "Hironic" }, status: 'KOSDAQ', category: 'korean' },
    { id: 22, name: { ko: "레이저옵텍", en: "Laseroptek" }, status: 'KOSDAQ', category: 'korean' },
    { id: 23, name: { ko: "유바이오로직스", en: "EuBiologics" }, status: 'KOSDAQ', category: 'korean' },
    { id: 24, name: { ko: "바임글로벌", en: "Vaim Global" }, status: 'Unlisted', category: 'korean' },
    { id: 25, name: { ko: "엑소코바이오", en: "ExoCoBio" }, status: 'Unlisted', category: 'korean' },
    { id: 26, name: { ko: "알에프바이오", en: "RFBio" }, status: 'Unlisted', category: 'korean' },
    { id: 27, name: { ko: "차메디텍", en: "Cha Meditech" }, status: 'Unlisted', category: 'korean' },
    { id: 28, name: { ko: "JW중외제약", en: "JW Pharmaceutical" }, status: 'KOSPI', category: 'korean' },
    { id: 29, name: { ko: "동국제약", en: "Dongkook Pharmaceutical" }, status: 'KOSDAQ', category: 'korean' },
    { id: 30, name: { ko: "리젠바이오텍", en: "Regen Biotech" }, status: 'Unlisted', category: 'korean' },
    { id: 31, name: { ko: "울트라브이", en: "Ultra V" }, status: 'Unlisted', category: 'korean' },
    { id: 32, name: { ko: "제노스", en: "Genoss" }, status: 'Unlisted', category: 'korean' },
    { id: 33, name: { ko: "멀츠", en: "Merz Aesthetics" }, status: 'Global_Private', category: 'global' },
    { id: 34, name: { ko: "앨러간", en: "Allergan Aesthetics" }, status: 'Global_Listed', category: 'global' },
    { id: 35, name: { ko: "갈더마", en: "Galderma" }, status: 'Global_Listed', category: 'global' },
    { id: 36, name: { ko: "테옥산", en: "Teoxane" }, status: 'Global_Private', category: 'global' }
];

const StatusBadge = ({ status, lang }: { status: CompanyStatus; lang: string }) => {
    // Minimal Dot Style Badge
    const config = {
        'KOSPI': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', dot: 'bg-blue-500', label: 'KOSPI' },
        'KOSDAQ': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', dot: 'bg-indigo-500', label: 'KOSDAQ' },
        'Unlisted': { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', dot: 'bg-gray-400', label: lang === 'ko' ? '비상장' : 'Unlisted' },
        'Global_Listed': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100', dot: 'bg-violet-500', label: 'Listed' },
        'Global_Private': { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100', dot: 'bg-gray-400', label: 'Private' }
    }[status];

    if (!config) return null;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${config.bg} ${config.text} ${config.border} shadow-sm`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
};

export default function CompanyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { language, t } = useLanguage();
    const lang = language as 'ko' | 'en';
    const [rankings, setRankings] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState("");

    const initialCategory = searchParams?.get('tab') === 'global' ? 'global' : 'korean';
    const [activeCategory, setActiveCategory] = useState<'korean' | 'global'>(initialCategory);

    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab === 'global' && activeCategory !== 'global') {
            setActiveCategory('global');
        } else if (tab !== 'global' && activeCategory !== 'korean') {
            setActiveCategory('korean');
        }
    }, [searchParams, activeCategory]);

    const handleCategoryChange = (cat: 'korean' | 'global') => {
        setActiveCategory(cat);
        router.push(`/company?tab=${cat}`);
    };

    useEffect(() => {
        fetch(API_ENDPOINTS.rankings)
            .then(res => res.json())
            .then(data => setRankings(data))
            .catch(err => console.error(err));
    }, []);

    const filteredCompanies = allCompanies
        .filter(company =>
            company.category === activeCategory &&
            (searchQuery === "" ||
                company.name.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                company.name.ko.includes(searchQuery))
        )
        .sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang === 'ko' ? 'ko' : 'en'));

    const koreanCount = allCompanies.filter(c => c.category === 'korean').length;
    const globalCount = allCompanies.filter(c => c.category === 'global').length;

    return (
        <main className="min-h-screen bg-gray-50/50 p-6 md:p-12 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Premium Header Compact */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg animate-fade-in">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 px-6 py-5 md:px-8 md:py-6">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                            <Building2 className="w-7 h-7 text-blue-200" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                {t('company_header')}
                            </h2>
                            <p className="text-slate-300 text-sm md:text-base font-light">
                                {t('company_desc')}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" />
                                    {allCompanies.length} Companies Tracked
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-100 text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    Global & Local Leaders
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                </div>

                {/* Controls: Tabs & Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-20">
                    {/* Segmented Tab Control */}
                    <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-xl border border-white/50 shadow-sm ring-1 ring-gray-200/50 flex w-full md:w-auto">
                        <button
                            onClick={() => handleCategoryChange('korean')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeCategory === 'korean'
                                ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            <span>🇰🇷</span>
                            {lang === 'ko' ? `한국 기업 (${koreanCount})` : `Korean (${koreanCount})`}
                        </button>
                        <button
                            onClick={() => handleCategoryChange('global')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${activeCategory === 'global'
                                ? 'bg-white text-blue-600 shadow-md ring-1 ring-gray-100'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            <span>🌍</span>
                            {lang === 'ko' ? `글로벌 기업 (${globalCount})` : `Global (${globalCount})`}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-64 group bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/50 ring-1 ring-gray-200/50">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-none rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder={lang === 'ko' ? "기업명 검색..." : "Search companies..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Company Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredCompanies.map((item) => {
                        const companyNameKo = item.name.ko;
                        const rank = rankings[companyNameKo];
                        const isHighlight = rank && rank <= 3;
                        const displayName = item.name[lang];


                        return (
                            <div
                                key={item.id}
                                onClick={() => router.push(`/analysis?company=${companyNameKo}`)}
                                className={`group relative bg-white rounded-xl p-4 border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-2 hover:bg-gray-50/50
                                ${isHighlight
                                        ? 'border-violet-100 ring-2 ring-violet-500/20 shadow-lg shadow-violet-500/10'
                                        : 'border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-blue-100'}
                                `}
                            >
                                {/* Highlight Effect */}
                                {isHighlight && (
                                    <div className="absolute top-2 right-2">
                                        <span className="flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                                        </span>
                                    </div>
                                )}

                                {/* Compact Content */}
                                <div className="text-center w-full space-y-2">
                                    <h3 className={`text-base font-bold truncate px-2 ${displayName.length > 8 ? 'text-sm' : ''} ${isHighlight ? 'text-violet-900' : 'text-gray-900 group-hover:text-blue-700 transition-colors'}`}>
                                        {displayName}
                                    </h3>
                                    <div className="flex justify-center">
                                        <StatusBadge status={item.status} lang={lang} />
                                    </div>
                                </div>

                                {isHighlight && (
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-violet-500/20 pointer-events-none" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {filteredCompanies.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{lang === 'ko' ? "검색 결과가 없습니다." : "No companies found."}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
