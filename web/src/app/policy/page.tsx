"use client";

import { useState } from "react";
import { Card, Title, Text, Badge } from "@tremor/react";

interface Country {
    id: string;
    nameEn: string;
    nameKo: string;
    flag: string;
}

const COUNTRIES: Country[] = [
    { id: 'kr', nameEn: 'South Korea', nameKo: '대한민국', flag: '🇰🇷' },
    { id: 'vn', nameEn: 'Vietnam', nameKo: '베트남', flag: '🇻🇳' },
    { id: 'kh', nameEn: 'Cambodia', nameKo: '캄보디아', flag: '🇰🇭' },
    { id: 'th', nameEn: 'Thailand', nameKo: '태국', flag: '🇹🇭' },
    { id: 'la', nameEn: 'Laos', nameKo: '라오스', flag: '🇱🇦' },
    { id: 'mm', nameEn: 'Myanmar', nameKo: '미얀마', flag: '🇲🇲' },
    { id: 'bd', nameEn: 'Bangladesh', nameKo: '방글라데시', flag: '🇧🇩' },
    { id: 'in', nameEn: 'India', nameKo: '인도', flag: '🇮🇳' },
    { id: 'my', nameEn: 'Malaysia', nameKo: '말레이시아', flag: '🇲🇾' },
    { id: 'sg', nameEn: 'Singapore', nameKo: '싱가포르', flag: '🇸🇬' },
    { id: 'id', nameEn: 'Indonesia', nameKo: '인도네시아', flag: '🇮🇩' },
    { id: 'ph', nameEn: 'Philippines', nameKo: '필리핀', flag: '🇵🇭' },
    { id: 'tw', nameEn: 'Taiwan', nameKo: '대만', flag: '🇹🇼' }
];

export default function PolicyPage() {
    const [language, setLanguage] = useState<'en' | 'ko'>('ko');

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <Title className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Policy & RA
                        </Title>
                        <Text className="text-gray-500 mt-1">
                            {language === 'ko'
                                ? '아시아 태평양 13개국 규제 동향 및 정책 분석'
                                : 'Regulatory trends and policy analysis for 13 APAC countries'}
                        </Text>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center bg-white rounded-full p-1 border border-gray-200 shadow-sm">
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${language === 'en'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLanguage('ko')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${language === 'ko'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            한국어
                        </button>
                    </div>
                </div>

                {/* Country Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {COUNTRIES.map((country) => (
                        <Card
                            key={country.id}
                            className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 ring-1 ring-gray-100 hover:ring-blue-100 bg-white rounded-3xl flex flex-col items-center justify-center py-6 px-2 gap-3 hover:-translate-y-1"
                        >
                            <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm group-hover:ring-2 group-hover:ring-blue-100 transition-all bg-gray-50 flex items-center justify-center border border-gray-100">
                                <img
                                    src={`https://flagcdn.com/w80/${country.id}.png`}
                                    alt={country.nameEn}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center">
                                <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                    {language === 'ko' ? country.nameKo : country.nameEn}
                                </h3>
                                <Text className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
                                    {language === 'ko' ? country.nameEn : country.nameKo}
                                </Text>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Info Text */}
                <div className="text-center mt-12 text-gray-400 text-sm">
                    {language === 'ko'
                        ? '각 국가를 클릭하여 상세 규제 정보 및 등록 가이드를 확인하세요.'
                        : 'Click on a country to view detailed regulatory information and registration guides.'}
                </div>
            </div>
        </main>
    );
}
