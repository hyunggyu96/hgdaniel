'use client';

import { Card, Text } from "@tremor/react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { useLanguage } from "@/components/LanguageContext";

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
    const commonClasses = "absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase";
    switch (status) {
        case 'KOSPI':
            return <span className={`${commonClasses} bg-blue-100 text-blue-700 border border-blue-200`}>KOSPI</span>;
        case 'KOSDAQ':
            return <span className={`${commonClasses} bg-teal-100 text-teal-700 border border-teal-200`}>KOSDAQ</span>;
        case 'Unlisted':
            return <span className={`${commonClasses} bg-gray-100 text-gray-500 border border-gray-200`}>{lang === 'ko' ? '비상장' : 'Unlisted'}</span>;
        case 'Global_Listed':
            return <span className={`${commonClasses} bg-violet-100 text-violet-700 border border-violet-200`}>Listed</span>;
        case 'Global_Private':
            return <span className={`${commonClasses} bg-gray-100 text-gray-500 border border-gray-200`}>Private</span>;
        default:
            return null;
    }
};

export default function CompanyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { language, t } = useLanguage();
    const lang = language as 'ko' | 'en';
    const [rankings, setRankings] = useState<Record<string, number>>({});

    // Initialize state from URL param, default to 'korean'
    // Using simple initialization; useEffect will handle sync
    const initialCategory = searchParams?.get('tab') === 'global' ? 'global' : 'korean';
    const [activeCategory, setActiveCategory] = useState<'korean' | 'global'>(initialCategory);

    // Sync state if URL changes (e.g. back button)
    useEffect(() => {
        const tab = searchParams?.get('tab');
        if (tab === 'global' && activeCategory !== 'global') {
            setActiveCategory('global');
        } else if (tab !== 'global' && activeCategory !== 'korean') {
            // If tab is missing or 'korean', switch to korean
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

    // Filter companies by category
    const filteredCompanies = allCompanies
        .filter(company => company.category === activeCategory)
        .sort((a, b) => a.name[lang].localeCompare(b.name[lang], lang === 'ko' ? 'ko' : 'en'));

    // Count for tabs
    const koreanCount = allCompanies.filter(c => c.category === 'korean').length;
    const globalCount = allCompanies.filter(c => c.category === 'global').length;

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <Text className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        {t('company_header')}
                    </Text>
                    <Text className="text-gray-500">
                        {t('company_desc')}
                    </Text>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => handleCategoryChange('korean')}
                        className={`px-6 py-3 font-semibold transition-all border-b-2 ${activeCategory === 'korean'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {lang === 'ko' ? `🇰🇷 한국 기업 (${koreanCount})` : `🇰🇷 Korean Companies (${koreanCount})`}
                    </button>
                    <button
                        onClick={() => handleCategoryChange('global')}
                        className={`px-6 py-3 font-semibold transition-all border-b-2 ${activeCategory === 'global'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {lang === 'ko' ? `🌍 글로벌 기업 (${globalCount})` : `🌍 Global Companies (${globalCount})`}
                    </button>
                </div>

                {/* Company Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {filteredCompanies.map((item) => {
                        // Use Korean name for routing and ranking key to maintain consistent API logic
                        const companyNameKo = item.name.ko;
                        const rank = rankings[companyNameKo];
                        const isHighlight = rank && rank <= 3;
                        const isGlobal = activeCategory === 'global';
                        // Use language-specific name for display
                        const displayName = item.name[lang];

                        return (
                            <Card
                                key={item.id}
                                className={`relative cursor-pointer transition-all text-center flex items-center justify-center min-h-[100px] overflow-visible rounded-xl group
                                hover:shadow-lg hover:-translate-y-1 hover:ring-2 hover:ring-blue-100 bg-white
                                ${isHighlight ? 'border border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border border-gray-200 shadow-sm'}
                                ${isGlobal ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}
                            `}
                                onClick={() => router.push(`/analysis?company=${companyNameKo}`)}
                            >
                                {/* Pulsing Border Effect for Highlights */}
                                {isHighlight && (
                                    <div className="absolute inset-0 rounded-xl border-2 border-purple-500 animate-pulse pointer-events-none z-10"></div>
                                )}

                                {/* Global Badge */}
                                {isGlobal && (
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <div className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                            Global
                                        </div>
                                    </div>
                                )}

                                <StatusBadge status={item.status} lang={lang} />

                                <Text className={`text-lg font-medium ${isHighlight ? 'text-purple-700 font-bold' : 'text-foreground'}`}>
                                    {displayName}
                                </Text>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
