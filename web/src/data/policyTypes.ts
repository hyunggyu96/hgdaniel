export interface LocalizedText {
    ko: string;
    en: string;
}

export type PolicyConfidence = "high" | "medium" | "low";

export interface PolicyReference {
    id: string;
    title: string;
    url: string;
    accessedOn: string; // YYYY-MM-DD
    citation?: LocalizedText; // Article/Clause or rationale
}

export interface CountryPolicyFact {
    id: string;
    label: LocalizedText;
    value: LocalizedText;
    note?: LocalizedText;
    confidence: PolicyConfidence;
    references: PolicyReference[];
}

export interface CountryPolicyRegulation {
    id: string;
    documentNo: string;
    title: string;
    kind: "Law" | "Decree" | "Circular" | "Notice" | "Portal";
    authority: string;
    issuedDate?: string;
    effectiveDate?: string;
    sourceUrl: string;
    summary: LocalizedText;
}

export interface CountryPolicySource {
    id: string;
    title: string;
    url: string;
    accessedOn?: string;
}

export interface CountryPolicyProfile {
    countryId: string;
    countryName: LocalizedText;
    lastUpdated: string;
    sourceLastCheckedAt: string;
    facts: CountryPolicyFact[];
    keyRegulations: CountryPolicyRegulation[];
    sources: CountryPolicySource[];
    disclaimers: LocalizedText[];
}
