'use client';

import { Card, Text } from "@tremor/react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { useLanguage } from "@/components/LanguageContext";
import { COMPANY_CATEGORIES, getCompanyCategory } from "@/data/companyCategories";

type CompanyStatus = 'KOSPI' | 'KOSDAQ' | 'Unlisted' | 'Global_Listed' | 'Global_Private';

const allCompanies: { id: number; name: string; status: CompanyStatus }[] = [
    { id: 1, name: "한스바이오메드", status: 'KOSDAQ' },
    { id: 2, name: "엘앤씨바이오", status: 'KOSDAQ' },
    { id: 3, name: "제테마", status: 'KOSDAQ' },
    { id: 4, name: "한국비엔씨", status: 'KOSDAQ' },
    { id: 5, name: "종근당바이오", status: 'KOSPI' },
    { id: 6, name: "휴온스", status: 'KOSDAQ' },
    { id: 7, name: "휴온스글로벌", status: 'KOSDAQ' },
    { id: 8, name: "휴메딕스", status: 'KOSDAQ' },
    { id: 9, name: "휴젤", status: 'KOSDAQ' },
    { id: 10, name: "메디톡스", status: 'KOSDAQ' },
    { id: 11, name: "대웅제약", status: 'KOSPI' },
    { id: 12, name: "파마리서치", status: 'KOSDAQ' },
    { id: 13, name: "클래시스", status: 'KOSDAQ' },
    { id: 14, name: "케어젠", status: 'KOSDAQ' },
    { id: 15, name: "원텍", status: 'KOSDAQ' },
    { id: 16, name: "동방메디컬", status: 'Unlisted' },
    { id: 17, name: "제이시스메디칼", status: 'Unlisted' },
    { id: 18, name: "바이오비쥬", status: 'Unlisted' },
    { id: 19, name: "바이오플러스", status: 'KOSDAQ' },
    { id: 20, name: "비올", status: 'KOSDAQ' },
    { id: 21, name: "하이로닉", status: 'KOSDAQ' },
    { id: 22, name: "레이저옵텍", status: 'KOSDAQ' },
    { id: 23, name: "유바이오로직스", status: 'KOSDAQ' },
    { id: 24, name: "바임글로벌", status: 'Unlisted' },
    { id: 25, name: "엑소코바이오", status: 'Unlisted' },
    { id: 26, name: "알에프바이오", status: 'Unlisted' },
    { id: 27, name: "차메디텍", status: 'Unlisted' },
    { id: 28, name: "JW중외제약", status: 'KOSPI' },
    { id: 29, name: "동국제약", status: 'KOSDAQ' },
    { id: 30, name: "리젠바이오텍", status: 'Unlisted' },
    { id: 31, name: "울트라브이", status: 'Unlisted' },
    { id: 32, name: "제노스", status: 'Unlisted' },
    { id: 33, name: "멀츠", status: 'Global_Private' },
    { id: 34, name: "앨러간", status: 'Global_Listed' },
    { id: 35, name: "갈더마", status: 'Global_Listed' },
    { id: 36, name: "테옥산", status: 'Global_Private' }
];

const StatusBadge = ({ status }: { status: CompanyStatus }) => {
    const commonClasses = "absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase";
    switch (status) {
        case 'KOSPI':
            return <span className={`${commonClasses} bg-blue-100 text-blue-700 border border-blue-200`}>KOSPI</span>;
        case 'KOSDAQ':
            return <span className={`${commonClasses} bg-teal-100 text-teal-700 border border-teal-200`}>KOSDAQ</span>;
        case 'Unlisted':
            return <span className={`${commonClasses} bg-gray-100 text-gray-500 border border-gray-200`}>비상장</span>;
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
    const { t } = useLanguage();
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
        .filter(company => getCompanyCategory(company.name) === activeCategory)
        .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

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
                        🇰🇷 한국 기업 ({COMPANY_CATEGORIES.korean.length})
                    </button>
                    <button
                        onClick={() => handleCategoryChange('global')}
                        className={`px-6 py-3 font-semibold transition-all border-b-2 ${activeCategory === 'global'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        🌍 글로벌 기업 ({COMPANY_CATEGORIES.global.length})
                    </button>
                </div>

                {/* Company Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {filteredCompanies.map((item) => {
                        const rank = rankings[item.name];
                        const isHighlight = rank && rank <= 3;
                        const isGlobal = activeCategory === 'global';

                        return (
                            <Card
                                key={item.id}
                                className={`relative cursor-pointer transition-all text-center flex items-center justify-center min-h-[100px] overflow-visible rounded-xl group
                                hover:shadow-lg hover:-translate-y-1 hover:ring-2 hover:ring-blue-100 bg-white
                                ${isHighlight ? 'border border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border border-gray-200 shadow-sm'}
                                ${isGlobal ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''}
                            `}
                                onClick={() => router.push(`/analysis?company=${item.name}`)}
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

                                <StatusBadge status={item.status} />

                                <Text className={`text-lg font-medium ${isHighlight ? 'text-purple-700 font-bold' : 'text-foreground'}`}>
                                    {item.name}
                                </Text>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
