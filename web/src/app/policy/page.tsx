"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Card, Text, Title } from "@tremor/react";
import { useLanguage } from "@/components/LanguageContext";
import { koreaPolicyProfile } from "@/data/korea_policy_profile";
import { vietnamPolicyProfile } from "@/data/vietnam_policy_profile";
import type { LocalizedText } from "@/data/policyTypes";

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
    return language === "ko" ? text.ko : text.en;
};

const formatIsoDate = (dateStr?: string): string => {
    if (!dateStr) return "-";
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!match) return dateStr;
    return `${match[1]}.${match[2]}.${match[3]}`;
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

        alert("Coming soon");
    };

    const handleBackClick = () => {
        router.push("/policy");
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <Title className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            {t("policy_title")}
                        </Title>
                        <Text className="text-gray-500 mt-1">{t("policy_desc")}</Text>
                    </div>
                </div>

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
                                        {language === "ko" ? country.nameKo : country.nameEn}
                                    </h3>
                                    <Text className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">
                                        {language === "ko" ? country.nameEn : country.nameKo}
                                    </Text>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {selectedCountry === "kr" && (
                    <div className="space-y-6 animate-fade-in">
                        <button
                            onClick={handleBackClick}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <span aria-hidden="true">{"<"}</span>
                            <span>Back to countries</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <img
                                src="https://flagcdn.com/w80/kr.png"
                                alt="South Korea"
                                className="w-10 h-10 rounded-full shadow-sm"
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">South Korea Regulations</h2>
                                <p className="text-sm text-gray-500">
                                    {`Operational regulatory snapshot (${koreaPolicyProfile.facts.length} fields)`}
                                </p>
                            </div>
                        </div>

                        <div className="text-xs text-gray-500 space-y-1">
                            <p>{`Last updated: ${formatIsoDate(koreaPolicyProfile.lastUpdated)}`}</p>
                            <p>{`Sources checked: ${formatIsoDate(koreaPolicyProfile.sourceLastCheckedAt)}`}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {koreaPolicyProfile.facts.map((fact) => (
                                <Card key={fact.id} className="border border-gray-200">
                                    <Text className="text-xs uppercase tracking-wide text-gray-500">
                                        {getLocalizedText(language, fact.label)}
                                    </Text>
                                    <p className="mt-2 text-sm text-gray-900 leading-6 whitespace-pre-line">
                                        {getLocalizedText(language, fact.value)}
                                    </p>
                                    {fact.note && (
                                        <p className="mt-3 text-xs text-gray-500 leading-5">
                                            {getLocalizedText(language, fact.note)}
                                        </p>
                                    )}
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900">Key Legal Instruments</h3>
                            {koreaPolicyProfile.keyRegulations.map((item) => (
                                <Card key={item.id} className="border border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge color={item.kind === "Portal" ? "green" : "blue"}>{item.kind}</Badge>
                                                <Text className="text-xs text-gray-500">{item.documentNo}</Text>
                                            </div>
                                            <h4 className="text-base font-semibold text-gray-900">{item.title}</h4>
                                            <Text className="text-xs text-gray-500">{item.authority}</Text>
                                            <p className="text-sm text-gray-700 leading-6">
                                                {getLocalizedText(language, item.summary)}
                                            </p>
                                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                                {item.issuedDate && <span>{`Issued: ${formatIsoDate(item.issuedDate)}`}</span>}
                                                {item.effectiveDate && <span>{`Effective: ${formatIsoDate(item.effectiveDate)}`}</span>}
                                            </div>
                                        </div>
                                        <a
                                            href={item.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Official source
                                        </a>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Official Sources</h3>
                                <div className="space-y-2">
                                    {koreaPolicyProfile.sources.map((source) => (
                                        <a
                                            key={source.id}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-sm text-blue-600 hover:text-blue-700 break-all"
                                        >
                                            {source.title}
                                        </a>
                                    ))}
                                </div>
                            </Card>
                            <Card className="border border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Compliance Notes</h3>
                                <div className="space-y-2">
                                    {koreaPolicyProfile.disclaimers.map((note, index) => (
                                        <p key={index} className="text-sm text-gray-700 leading-6">
                                            {getLocalizedText(language, note)}
                                        </p>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {selectedCountry === "vn" && (
                    <div className="space-y-6 animate-fade-in">
                        <button
                            onClick={handleBackClick}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <span aria-hidden="true">{"<"}</span>
                            <span>Back to countries</span>
                        </button>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="https://flagcdn.com/w80/vn.png"
                                    alt="Vietnam"
                                    className="w-10 h-10 rounded-full shadow-sm"
                                />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Vietnam Regulations</h2>
                                    <p className="text-sm text-gray-500">
                                        {`Operational regulatory snapshot (${vietnamPolicyProfile.facts.length} fields)`}
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                                <p>{`Last updated: ${formatIsoDate(vietnamPolicyProfile.lastUpdated)}`}</p>
                                <p>{`Sources checked: ${formatIsoDate(vietnamPolicyProfile.sourceLastCheckedAt)}`}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {vietnamPolicyProfile.facts.map((fact) => (
                                <Card key={fact.id} className="border border-gray-200">
                                    <Text className="text-xs uppercase tracking-wide text-gray-500">
                                        {getLocalizedText(language, fact.label)}
                                    </Text>
                                    <p className="mt-2 text-sm text-gray-900 leading-6 whitespace-pre-line">
                                        {getLocalizedText(language, fact.value)}
                                    </p>
                                    {fact.note && (
                                        <p className="mt-3 text-xs text-gray-500 leading-5">
                                            {getLocalizedText(language, fact.note)}
                                        </p>
                                    )}
                                </Card>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900">Key Legal Instruments</h3>
                            {vietnamPolicyProfile.keyRegulations.map((item) => (
                                <Card key={item.id} className="border border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Badge color={item.kind === "Portal" ? "green" : "blue"}>{item.kind}</Badge>
                                                <Text className="text-xs text-gray-500">{item.documentNo}</Text>
                                            </div>
                                            <h4 className="text-base font-semibold text-gray-900">{item.title}</h4>
                                            <Text className="text-xs text-gray-500">{item.authority}</Text>
                                            <p className="text-sm text-gray-700 leading-6">
                                                {getLocalizedText(language, item.summary)}
                                            </p>
                                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                                {item.issuedDate && <span>{`Issued: ${formatIsoDate(item.issuedDate)}`}</span>}
                                                {item.effectiveDate && <span>{`Effective: ${formatIsoDate(item.effectiveDate)}`}</span>}
                                            </div>
                                        </div>
                                        <a
                                            href={item.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                                        >
                                            Official source
                                        </a>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Official Sources</h3>
                                <div className="space-y-2">
                                    {vietnamPolicyProfile.sources.map((source) => (
                                        <a
                                            key={source.id}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-sm text-blue-600 hover:text-blue-700 break-all"
                                        >
                                            {source.title}
                                        </a>
                                    ))}
                                </div>
                            </Card>
                            <Card className="border border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Compliance Notes</h3>
                                <div className="space-y-2">
                                    {vietnamPolicyProfile.disclaimers.map((note, index) => (
                                        <p key={index} className="text-sm text-gray-700 leading-6">
                                            {getLocalizedText(language, note)}
                                        </p>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {selectedCountry && !SUPPORTED_COUNTRIES.has(selectedCountry) && (
                    <Card className="border border-gray-200">
                        <Text className="text-sm text-gray-600">
                            Detailed policy data for this country is not available yet.
                        </Text>
                    </Card>
                )}

                {!selectedCountry && (
                    <div className="text-center mt-12 text-gray-400 text-sm">
                        {t("policy_info")}
                    </div>
                )}
            </div>
        </main>
    );
}
