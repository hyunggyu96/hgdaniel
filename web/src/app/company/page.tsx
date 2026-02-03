'use client';

import { Card, Text } from "@tremor/react";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/apiConfig';
import { useLanguage } from "@/components/LanguageContext";
import { COMPANY_CATEGORIES, getCompanyCategory } from "@/data/companyCategories";

const allCompanies: { id: number; name: string }[] = [
    { id: 1, name: "한스바이오메드" },
    { id: 2, name: "엘앤씨바이오" },
    { id: 3, name: "제테마" },
    { id: 4, name: "한국비엔씨" },
    { id: 5, name: "종근당바이오" },
    { id: 6, name: "휴온스" },
    { id: 7, name: "휴온스글로벌" },
    { id: 8, name: "휴메딕스" },
    { id: 9, name: "휴젤" },
    { id: 10, name: "메디톡스" },
    { id: 11, name: "대웅제약" },
    { id: 12, name: "파마리서치" },
    { id: 13, name: "클래시스" },
    { id: 14, name: "케어젠" },
    { id: 15, name: "원텍" },
    { id: 16, name: "동방메디컬" },
    { id: 17, name: "제이시스메디칼" },
    { id: 18, name: "바이오비쥬" },
    { id: 19, name: "바이오플러스" },
    { id: 20, name: "비올" },
    { id: 21, name: "하이로닉" },
    { id: 22, name: "레이저옵텍" },
    { id: 23, name: "유바이오로직스" },
    { id: 24, name: "바임글로벌" },
    { id: 25, name: "엑소코바이오" },
    { id: 26, name: "멀츠" },
    { id: 27, name: "앨러간" },
    { id: 28, name: "갈더마" },
    { id: 29, name: "테옥산" }
];

export default function CompanyPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [rankings, setRankings] = useState<Record<string, number>>({});
    const [activeCategory, setActiveCategory] = useState<'korean' | 'global'>('korean');

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
                        onClick={() => setActiveCategory('korean')}
                        className={`px-6 py-3 font-semibold transition-all border-b-2 ${activeCategory === 'korean'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        🇰🇷 한국 기업 ({COMPANY_CATEGORIES.korean.length})
                    </button>
                    <button
                        onClick={() => setActiveCategory('global')}
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
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                        Global
                                    </div>
                                )}

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
