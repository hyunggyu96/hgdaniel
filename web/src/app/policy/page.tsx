"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Title, Text, Badge } from "@tremor/react";
import { useLanguage } from "@/components/LanguageContext";
import koreaRegulations from "@/data/korea_regulations.json";

interface Country {
    id: string;
    nameEn: string;
    nameKo: string;
    flag: string;
}

interface Regulation {
    title: string;
    date: string;
    link: string;
    type: string;
    id: string;
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
    const { language, t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Sync state with URL param 'country'
    const countryParam = searchParams?.get('country') ?? null;
    const [selectedCountry, setSelectedCountry] = useState<string | null>(countryParam);

    useEffect(() => {
        setSelectedCountry(countryParam);
    }, [countryParam]);

    const handleCountryClick = (countryId: string) => {
        if (countryId === 'kr') {
            router.push(`/policy?country=${countryId}`);
        } else {
            // For other countries, show "Coming Soon" or do nothing
            alert(language === 'ko' ? '준비 중입니다' : 'Coming Soon');
        }
    };

    const handleBackClick = () => {
        router.push('/policy');
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.length !== 8) return dateStr;
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    };

    // Filter out regulations with empty titles
    const validRegulations = (koreaRegulations as Regulation[]).filter(r => r.title && r.title.trim() !== '');

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <Title className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            {t('policy_title')}
                        </Title>
                        <Text className="text-gray-500 mt-1">
                            {t('policy_desc')}
                        </Text>
                    </div>
                </div>

                {/* Country Grid */}
                {!selectedCountry && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {COUNTRIES.map((country) => (
                            <Card
                                key={country.id}
                                onClick={() => handleCountryClick(country.id)}
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
                )}

                {/* Korea Regulations Detail View */}
                {selectedCountry === 'kr' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Back Button */}
                        <button
                            onClick={handleBackClick}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <span>←</span>
                            <span>{language === 'ko' ? '국가 목록으로' : 'Back to Countries'}</span>
                        </button>

                        {/* Regulations Header */}
                        <div className="flex items-center gap-3">
                            <img
                                src="https://flagcdn.com/w80/kr.png"
                                alt="South Korea"
                                className="w-10 h-10 rounded-full shadow-sm"
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {language === 'ko' ? '대한민국 규제 정보' : 'South Korea Regulations'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {language === 'ko'
                                        ? `의료기기 및 화장품 관련 법령 · 행정규칙 (${validRegulations.length}건)`
                                        : `Medical Device & Cosmetics Laws & Rules (${validRegulations.length} items)`}
                                </p>
                            </div>
                        </div>

                        {/* Regulations List */}
                        <div className="space-y-3">
                            {validRegulations.map((regulation) => (
                                <Card
                                    key={regulation.id}
                                    className="hover:shadow-md transition-all cursor-pointer border border-gray-200"
                                    onClick={() => window.open(`http://www.law.go.kr${regulation.link}`, '_blank')}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge color={regulation.type === 'Law' ? 'blue' : 'green'}>
                                                    {regulation.type === 'Law'
                                                        ? (language === 'ko' ? '법령' : 'Law')
                                                        : (language === 'ko' ? '행정규칙' : 'Rule')}
                                                </Badge>
                                                <Text className="text-xs text-gray-400">
                                                    {formatDate(regulation.date)}
                                                </Text>
                                            </div>
                                            <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                                {regulation.title}
                                            </h3>
                                        </div>
                                        <div className="text-gray-400 hover:text-blue-600 transition-colors">
                                            →
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Text */}
                {!selectedCountry && (
                    <div className="text-center mt-12 text-gray-400 text-sm">
                        {t('policy_info')}
                    </div>
                )}
            </div>
        </main>
    );
}
