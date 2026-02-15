"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Card, Text, Title } from "@tremor/react";
import { useLanguage } from "@/components/LanguageContext";
import { koreaPolicyProfile } from "@/data/korea_policy_profile";
import { vietnamPolicyProfile } from "@/data/vietnam_policy_profile";
import type { LocalizedText, PolicyConfidence } from "@/data/policyTypes";

interface Country {
    id: string;
    nameEn: string;
    nameKo: string;
}

const COUNTRIES: Country[] = [
    { id: "kr", nameEn: "South Korea", nameKo: "South Korea" },
    { id: "vn", nameEn: "Vietnam", nameKo: "Vietnam" },
    { id: "kh", nameEn: "Cambodia", nameKo: "Cambodia" },
    { id: "th", nameEn: "Thailand", nameKo: "Thailand" },
    { id: "la", nameEn: "Laos", nameKo: "Laos" },
    { id: "mm", nameEn: "Myanmar", nameKo: "Myanmar" },
    { id: "bd", nameEn: "Bangladesh", nameKo: "Bangladesh" },
    { id: "in", nameEn: "India", nameKo: "India" },
    { id: "my", nameEn: "Malaysia", nameKo: "Malaysia" },
    { id: "sg", nameEn: "Singapore", nameKo: "Singapore" },
    { id: "id", nameEn: "Indonesia", nameKo: "Indonesia" },
    { id: "ph", nameEn: "Philippines", nameKo: "Philippines" },
    { id: "tw", nameEn: "Taiwan", nameKo: "Taiwan" },
];

const SUPPORTED_COUNTRIES = new Set(["kr", "vn"]);

const getLocalizedText = (language: "ko" | "en", text: LocalizedText): string => {
    if (language === "en") return text.en;
    return /[가-힣]/.test(text.ko) ? text.ko : text.en;
};

const formatIsoDate = (dateStr?: string): string => {
    if (!dateStr) return "-";
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!match) return dateStr;
    return `${match[1]}.${match[2]}.${match[3]}`;
};

const ConfidenceIndicator = ({ level }: { level: PolicyConfidence }) => {
    const config = {
        high: { color: "bg-emerald-500", label: "High Confidence", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
        medium: { color: "bg-amber-500", label: "Medium Confidence", bg: "bg-amber-50 text-amber-700 border-amber-200" },
        low: { color: "bg-rose-500", label: "Low Confidence", bg: "bg-rose-50 text-rose-700 border-rose-200" },
    }[level];

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${config.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
            {level}
        </div>
    );
};

const DetailView = ({
    countryId,
    profile,
    onBack,
    language
}: {
    countryId: string;
    profile: any;
    onBack: () => void;
    language: "ko" | "en";
}) => {
    const country = COUNTRIES.find(c => c.id === countryId);
    if (!country) return null;

    const countryName = language === 'ko' ? country.nameKo : country.nameEn;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="group flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors pl-1"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>Back to countries</span>
            </button>

            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 p-8 md:p-10">
                    <img
                        src={`https://flagcdn.com/w160/${countryId}.png`}
                        alt={country.nameEn}
                        className="w-20 h-20 rounded-2xl border-4 border-white/10 shadow-lg object-cover bg-white"
                    />
                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{countryName} Regulations</h2>
                            <div className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-xs font-semibold backdrop-blur-sm">
                                {profile.facts.length} Fields Analyzed
                            </div>
                        </div>
                        <p className="text-slate-300 md:text-lg max-w-2xl font-light">
                            Operational regulatory snapshot and key legal instruments.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-mono">
                            <span>Updated: {formatIsoDate(profile.lastUpdated)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                            <span>Verified: {formatIsoDate(profile.sourceLastCheckedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            </div>

            {/* Facts Grid */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 pl-1">
                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                    Regulatory Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {profile.facts.map((fact: any) => (
                        <div key={fact.id} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-blue-600 transition-colors">
                                    {getLocalizedText(language, fact.label)}
                                </span>
                                <ConfidenceIndicator level={fact.confidence} />
                            </div>

                            <p className="text-base text-gray-800 font-medium leading-7 whitespace-pre-line mb-4">
                                {getLocalizedText(language, fact.value)}
                            </p>

                            {fact.note && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs list-disc list-inside text-gray-600 leading-5 border border-gray-100">
                                    {getLocalizedText(language, fact.note)}
                                </div>
                            )}

                            <div className="pt-3 border-t border-dashed border-gray-100">
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-2">
                                    References
                                </div>
                                <div className="space-y-1.5">
                                    {fact.references.map((ref: any) => (
                                        <a
                                            key={ref.id}
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors group/link"
                                        >
                                            <span className="w-1 h-1 rounded-full bg-gray-300 group-hover/link:bg-blue-400" />
                                            <span className="underline decoration-gray-200 underline-offset-2 decoration-1 group-hover/link:decoration-blue-200 truncate max-w-[90%]">
                                                {ref.title}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Legal Instruments */}
            <div className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 pl-1">
                    <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                    Key Legal Instruments
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {profile.keyRegulations.map((item: any) => (
                        <div key={item.id} className="flex flex-col md:flex-row bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-indigo-100 transition-all duration-200 group">
                            <div className="w-1.5 bg-gray-100 group-hover:bg-indigo-500 transition-colors self-stretch" />
                            <div className="flex-1 p-5 md:flex md:items-start md:justify-between gap-6">
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${item.kind === 'Portal'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                            }`}>
                                            {item.kind}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">{item.documentNo}</span>
                                    </div>

                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                        {item.title}
                                    </h4>

                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {getLocalizedText(language, item.summary)}
                                    </p>

                                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-1">
                                        <span className="flex items-center gap-1.5">
                                            🏢 {item.authority}
                                        </span>
                                        {item.effectiveDate && (
                                            <span className="flex items-center gap-1.5">
                                                📅 Effective: {formatIsoDate(item.effectiveDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <a
                                    href={item.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0 mt-1"
                                    title="View Official Source"
                                >
                                    ↗
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sources & Compliance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                {/* Official Sources */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        🔗 Official Sources
                    </h3>
                    <div className="space-y-3">
                        {profile.sources.map((source: any) => (
                            <a
                                key={source.id}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                                <div className="text-sm font-medium text-slate-700 group-hover:text-blue-700 mb-1">
                                    {source.title}
                                </div>
                                {source.accessedOn && (
                                    <div className="text-[10px] text-slate-400">
                                        Last Verified: {formatIsoDate(source.accessedOn)}
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Compliance Notes */}
                <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100">
                    <h3 className="text-base font-bold text-amber-900 mb-4 flex items-center gap-2">
                        💡 Compliance Notes
                    </h3>
                    <div className="space-y-3">
                        {profile.disclaimers.map((note: any, index: number) => (
                            <div key={index} className="flex gap-3 text-sm text-amber-900/80 leading-relaxed bg-white/60 p-3 rounded-lg border border-amber-100/50">
                                <span className="text-amber-500 font-bold shrink-0 mt-0.5">!</span>
                                <p>{getLocalizedText(language, note)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function PolicyPage() {
    const { language, t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    const countryParam = searchParams?.get("country") ?? null;
    const [selectedCountry, setSelectedCountry] = useState<string | null>(countryParam);

    useEffect(() => {
        setSelectedCountry(countryParam);
    }, [countryParam]);

    const handleCountryClick = (countryId: string) => {
        if (SUPPORTED_COUNTRIES.has(countryId)) {
            router.push(`/policy?country=${countryId}`);
            return;
        }
        alert("Comming soon");
    };

    const handleBackClick = () => {
        router.push("/policy");
    };

    const getProfile = (id: string) => {
        if (id === 'kr') return koreaPolicyProfile;
        if (id === 'vn') return vietnamPolicyProfile;
        return null;
    };

    const profile = selectedCountry ? getProfile(selectedCountry) : null;

    return (
        <main className="min-h-screen bg-gray-50/50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {!selectedCountry && (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <Title className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-1">
                                {t("policy_title")}
                            </Title>
                            <Text className="text-gray-500 mt-2 px-1 text-lg">{t("policy_desc")}</Text>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
                            {COUNTRIES.map((country) => (
                                <div
                                    key={country.id}
                                    onClick={() => handleCountryClick(country.id)}
                                    className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:scale-110 transition-transform" />

                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-4 ring-gray-50 group-hover:ring-blue-50 transition-all bg-white">
                                                <img
                                                    src={`https://flagcdn.com/w160/${country.id}.png`}
                                                    alt={country.nameEn}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {SUPPORTED_COUNTRIES.has(country.id) && (
                                                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                                                    DATA
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-center space-y-0.5">
                                            <h3 className="text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {language === "ko" ? country.nameKo : country.nameEn}
                                            </h3>
                                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                                                {language === "ko" ? country.nameEn : country.nameKo}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-12 text-gray-400 text-sm">
                            {t("policy_info")}
                        </div>
                    </div>
                )}

                {selectedCountry && profile && (
                    <DetailView
                        countryId={selectedCountry}
                        profile={profile}
                        onBack={handleBackClick}
                        language={language as "ko" | "en"}
                    />
                )}

                {selectedCountry && !profile && (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                        <div className="text-4xl mb-4">🚧</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Comming Soon</h3>
                        <p className="text-gray-500 mb-8">Detailed policy data for this country is being collected.</p>
                        <button onClick={handleBackClick} className="text-blue-600 hover:underline">
                            Back to map
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
