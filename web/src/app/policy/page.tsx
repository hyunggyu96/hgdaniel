"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale, Globe, FileText, ExternalLink, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
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

// ─── Detail View Component ───
const DetailView = ({
    countryId,
    profile,
    language
}: {
    countryId: string;
    profile: any;
    language: "ko" | "en";
}) => {
    const country = COUNTRIES.find(c => c.id === countryId);
    if (!country) return null;

    const countryName = language === 'ko' ? country.nameKo : country.nameEn;

    return (
        <div className="space-y-6 animate-fade-in bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
            {/* Country Header */}
            <div className="flex flex-col md:flex-row items-start gap-6 border-b border-gray-100 pb-6">
                <img
                    src={`https://flagcdn.com/w160/${countryId}.png`}
                    alt={country.nameEn}
                    className="w-16 h-16 rounded-2xl border border-gray-200 shadow-sm object-cover bg-gray-50 shrink-0"
                />
                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">{countryName} Regulations</h2>
                        <div className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold uppercase tracking-wide">
                            {profile.facts.length} Fields Analyzed
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm md:text-base font-light">
                        Operational regulatory snapshot and key legal instruments.
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-1 font-mono">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Verified: {formatIsoDate(profile.sourceLastCheckedAt)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Compliance Notes */}
            {profile.disclaimers && profile.disclaimers.length > 0 && (
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                    <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Compliance Notes
                    </h3>
                    <div className="space-y-2">
                        {profile.disclaimers.map((note: any, index: number) => (
                            <div key={index} className="flex gap-2 text-xs md:text-sm text-amber-900/80 leading-relaxed bg-white/50 p-2.5 rounded-lg border border-amber-100/50">
                                <span className="text-amber-500 font-bold shrink-0">!</span>
                                <p>{getLocalizedText(language, note)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Facts Grid */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pl-1">
                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                    Regulatory Overview
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {profile.facts.map((fact: any) => (
                        <div key={fact.id} className="group relative bg-gray-50/50 rounded-xl p-5 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-blue-600 transition-colors">
                                    {getLocalizedText(language, fact.label)}
                                </span>
                                <ConfidenceIndicator level={fact.confidence} />
                            </div>

                            <p className="text-sm md:text-base text-gray-800 font-medium leading-relaxed whitespace-pre-line mb-3">
                                {getLocalizedText(language, fact.value)}
                            </p>

                            {fact.note && (
                                <div className="mb-3 p-2.5 bg-white rounded-lg text-xs list-disc list-inside text-gray-500 leading-normal border border-gray-200/50">
                                    {getLocalizedText(language, fact.note)}
                                </div>
                            )}

                            {fact.references && fact.references.length > 0 && (
                                <div className="space-y-1 pt-2 border-t border-gray-100">
                                    {fact.references.map((ref: any) => (
                                        <a
                                            key={ref.id}
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-blue-600 transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            <span className="truncate hover:underline decoration-1 underline-offset-2">
                                                {ref.title}
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Legal Instruments */}
            <div className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 pl-1">
                    <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                    Key Legal Instruments
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {profile.keyRegulations.map((item: any) => (
                        <div key={item.id} className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-indigo-300 transition-all duration-200 group">
                            <div className="flex-1 p-4 md:flex md:items-start md:justify-between gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${item.kind === 'Portal'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                            }`}>
                                            {item.kind}
                                        </span>
                                        <span className="text-[11px] text-gray-400 font-mono">{item.documentNo}</span>
                                    </div>

                                    <h4 className="text-sm md:text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                        {item.title}
                                    </h4>

                                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                        {getLocalizedText(language, item.summary)}
                                    </p>
                                </div>

                                <a
                                    href={item.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all shrink-0 border border-gray-100"
                                    title="View Source"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </div>
    );
};

// ─── Main Page ───
export default function PolicyPage() {
    const { language, t } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();

    const countryParam = searchParams?.get("country") ?? null;
    const initialCountry = SUPPORTED_COUNTRIES.has("kr") ? "kr" : null; // Default to KR if available

    // If no param, we can default to KR or let user select.
    // User requested "Master-Detail" interaction.
    // Let's optimize UX: Default to first supported country (KR) if none selected?
    // Or keep null and show prompt?
    // Let's use the first supported country as default if 'kr' exists.
    const [selectedCountry, setSelectedCountry] = useState<string | null>(countryParam || 'kr');

    useEffect(() => {
        if (countryParam && SUPPORTED_COUNTRIES.has(countryParam)) {
            setSelectedCountry(countryParam);
        } else if (!countryParam) {
            // If no param, ensure KR is default
            setSelectedCountry('kr');
        }
    }, [countryParam]);

    const handleCountrySelect = (countryId: string) => {
        if (SUPPORTED_COUNTRIES.has(countryId)) {
            setSelectedCountry(countryId);
            // Shallow update URL
            const url = new URL(window.location.href);
            url.searchParams.set("country", countryId);
            window.history.pushState({}, "", url.toString());
        } else {
            alert("Coming Soon");
        }
    };

    const getProfile = (id: string) => {
        if (id === 'kr') return koreaPolicyProfile;
        if (id === 'vn') return vietnamPolicyProfile;
        return null;
    };

    const profile = selectedCountry ? getProfile(selectedCountry) : null;
    const lang = language as "ko" | "en";

    return (
        <main className="min-h-screen bg-gray-50/50 p-6 md:p-12 pb-24">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Premium Header Compact */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-gray-900 text-white shadow-lg animate-fade-in">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 px-6 py-5 md:px-8 md:py-6">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                            <Scale className="w-7 h-7 text-indigo-200" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                {t("policy_title")}
                            </h2>
                            <p className="text-gray-300 text-sm md:text-base font-light">
                                {t("policy_desc")}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {COUNTRIES.length} Regions
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    Database Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Master-Detail Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left Panel: Country List (Sticky) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-3">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Select Region</h3>
                            <div className="space-y-2">
                                {COUNTRIES.map((country) => {
                                    const isSupported = SUPPORTED_COUNTRIES.has(country.id);
                                    const isSelected = selectedCountry === country.id;

                                    return (
                                        <div
                                            key={country.id}
                                            onClick={() => handleCountrySelect(country.id)}
                                            className={`group relative flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer border
                                                ${isSelected
                                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                                    : "bg-white border-transparent hover:border-gray-100 hover:bg-gray-50"
                                                }
                                                ${!isSupported && "opacity-60 grayscale hover:grayscale-0"}
                                            `}
                                        >
                                            <div className={`relative w-10 h-10 rounded-lg overflow-hidden border ${isSelected ? 'border-blue-200' : 'border-gray-100'} shrink-0`}>
                                                <img
                                                    src={`https://flagcdn.com/w80/${country.id}.png`}
                                                    alt={country.nameEn}
                                                    className="w-full h-full object-cover"
                                                />
                                                {isSupported && (
                                                    <div className="absolute inset-0 bg-black/10 hidden group-hover:block" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className={`text-sm font-bold truncate ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                                                        {lang === "ko" ? country.nameKo : country.nameEn}
                                                    </h4>
                                                    {isSupported && isSelected && <ChevronRight className="w-4 h-4 text-blue-500" />}
                                                </div>
                                                <p className="text-[10px] text-gray-400 truncate">
                                                    {lang === "ko" ? country.nameEn : country.nameKo}
                                                </p>
                                            </div>

                                            {!isSupported && (
                                                <span className="text-[9px] font-bold text-gray-300 border border-gray-100 px-1.5 py-0.5 rounded bg-gray-50">
                                                    SOON
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Detail View */}
                    <div className="lg:col-span-8 min-h-[500px]">
                        {selectedCountry && profile ? (
                            <DetailView
                                countryId={selectedCountry}
                                profile={profile}
                                language={lang}
                            />
                        ) : selectedCountry && !profile ? (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full min-h-[400px]">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 text-3xl grayscale opacity-50">
                                    🚧
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
                                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                                    Detailed regulatory data for <span className="font-bold text-gray-700">{lang === 'ko' ? COUNTRIES.find(c => c.id === selectedCountry)?.nameKo : COUNTRIES.find(c => c.id === selectedCountry)?.nameEn}</span> is currently being collected/verified.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full min-h-[400px]">
                                <Globe className="w-12 h-12 text-gray-200 mb-4" />
                                <p className="text-gray-400">Select a country to view regulations</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
