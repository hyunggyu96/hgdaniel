export interface LocalizedText {
    ko: string;
    en: string;
}

export interface CountryPolicyFact {
    id: string;
    label: LocalizedText;
    value: LocalizedText;
    note?: LocalizedText;
}

export interface CountryPolicyRegulation {
    id: string;
    documentNo: string;
    title: string;
    kind: "Decree" | "Circular" | "Portal";
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
