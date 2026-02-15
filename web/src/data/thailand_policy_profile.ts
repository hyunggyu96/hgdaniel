import { CountryPolicyProfile } from "@/data/policyTypes";

const REF = {
    fda: {
        id: "th-fda",
        title: "Thai FDA Official Website",
        url: "https://fda.moph.go.th",
        accessedOn: "2026-02-15",
    },
    md_act: {
        id: "th-md-act",
        title: "Medical Device Act B.E. 2551 (2008) & B.E. 2562 (2019)",
        url: "https://medical.fda.moph.go.th/laws/medical-device-act",
        accessedOn: "2026-02-15",
    },
    drug_act: {
        id: "th-drug-act",
        title: "Drug Act B.E. 2510 (1967) & Amendments",
        url: "https://drug.fda.moph.go.th",
        accessedOn: "2026-02-15",
    },
    md_div: {
        id: "th-md-div",
        title: "Medical Device Control Division (Thai FDA)",
        url: "https://medical.fda.moph.go.th",
        accessedOn: "2026-02-15",
    },
    amdd: {
        id: "asean-amdd",
        title: "ASEAN Medical Device Directive (AMDD)",
        url: "https://asean.org/wp-content/uploads/2012/05/ASEAN-Medical-Device-Directive.pdf",
        accessedOn: "2026-02-15",
    }
};

export const thailandPolicyProfile: CountryPolicyProfile = {
    countryId: "th",
    countryName: {
        ko: "태국",
        en: "Thailand",
    },
    lastUpdated: "2026-02-15",
    sourceLastCheckedAt: "2026-02-15",
    facts: [
        {
            id: "th_01_classification",
            label: { ko: "1) 의료기기 등급 및 경로", en: "1) Medical Device Classification & Pathway" },
            value: {
                ko: "위험도에 따라 Class 1(Listing), Class 2-3(Notification), Class 4(License)로 분류됩니다. AMDD(아세안 의료기기 지침)를 따릅니다.",
                en: "Classified into Class 1 (Listing), Class 2-3 (Notification), and Class 4 (License) based on risk, following AMDD harmonization.",
            },
            confidence: "high",
            references: [REF.md_act, REF.md_div],
        },
        {
            id: "th_02_aesthetic_products",
            label: { ko: "2) 미용 제품 분류 (중요)", en: "2) Aesthetic Product Classification (Critical)" },
            value: {
                ko: "히알루론산 필러(Dermal Fillers)는 '의료기기 Class 4(License)'로 분류되나, 보툴리눔 톡신(Botulinum Toxin)은 '전문의약품(Biological Drug)'으로 분류되어 의약품 등록 절차를 따릅니다.",
                en: "Hyaluronic Acid Dermal Fillers are 'Medical Devices Class 4 (License)', whereas Botulinum Toxin is regulated as a 'Biological Drug' requiring Drug Registration.",
            },
            note: {
                ko: "제품 카테고리에 따라 적용 법령(Device Act vs Drug Act)이 완전히 다르므로 주의가 필요합니다.",
                en: "Applicable laws (Device Act vs Drug Act) differ completely by product category; caution required.",
            },
            confidence: "high",
            references: [REF.md_act, REF.drug_act],
        },
        {
            id: "th_03_registration_dossier",
            label: { ko: "3) 기술문서 요건 (CSDT)", en: "3) Technical Dossier (CSDT)" },
            value: {
                ko: "모든 등급(Class 1-4)에 대해 ASEAN CSDT(Common Submission Dossier Template) 형식의 기술문서 제출이 의무화되었습니다.",
                en: "Submission of technical dossiers in ASEAN CSDT format is mandatory for all classes (Class 1-4).",
            },
            confidence: "high",
            references: [REF.md_div, REF.amdd],
        },
        {
            id: "th_04_applicant_eligibility",
            label: { ko: "4) 신청 자격 (License Holder)", en: "4) Applicant Eligibility" },
            value: {
                ko: "태국 내 사업자 등록이 된 현지 법인(수입업 허가 보유)만이 등록 신청 및 라이선스 보유가 가능합니다.",
                en: "Only a local entity with a valid Import License in Thailand can apply for and hold the product registration license.",
            },
            confidence: "high",
            references: [REF.md_act],
        },
        {
            id: "th_05_grouping",
            label: { ko: "5) 제품 그룹핑 (Grouping)", en: "5) Product Grouping" },
            value: {
                ko: "Single, Family, System, Set, IVD Test Kit, IVD Cluster 등 6가지 그룹핑 등록이 가능합니다. (조건 충족 시)",
                en: "Registration allowed as Single, Family, System, Set, IVD Test Kit, or IVD Cluster (if conditions met).",
            },
            confidence: "high",
            references: [REF.md_div],
        },
        {
            id: "th_06_validity",
            label: { ko: "6) 유효기간", en: "6) Validity Period" },
            value: {
                ko: "의료기기 등록 증명서(Listing/Notification/License)의 유효기간은 5년입니다.",
                en: "Medical device registration certificates (Listing/Notification/License) are valid for 5 years.",
            },
            confidence: "high",
            references: [REF.md_act],
        },
        {
            id: "th_07_specialized_review",
            label: { ko: "7) 전문가 검토 (Specialized Listing)", en: "7) Specialized Review" },
            value: {
                ko: "일부 고위험 제품은 전문가 검토(Expert Review)가 필요하여 비용과 기간이 추가될 수 있습니다.",
                en: "Certain high-risk products require Expert Review, which may incur additional costs and time.",
            },
            confidence: "medium",
            references: [REF.md_div],
        }
    ],
    keyRegulations: [
        {
            id: "th-md-act-2562",
            documentNo: "B.E. 2562 (2019)",
            title: "Medical Device Act (No. 2) B.E. 2562",
            kind: "Law",
            authority: "Ministry of Public Health",
            issuedDate: "2019",
            effectiveDate: "2019",
            sourceUrl: "https://medical.fda.moph.go.th/laws/medical-device-act",
            summary: {
                ko: "2008년 법령을 개정하여 ASEAN 등급 분류 체계 및 CSDT 도입을 명문화함.",
                en: "Amended the 2008 Act to formalize ASEAN risk classification and CSDT adoption.",
            },
        },
        {
            id: "th-drug-act-1967",
            documentNo: "B.E. 2510 (1967)",
            title: "Drug Act B.E. 2510",
            kind: "Law",
            authority: "Ministry of Public Health",
            issuedDate: "1967",
            effectiveDate: "1967",
            sourceUrl: "https://drug.fda.moph.go.th",
            summary: {
                ko: "의약품(보툴리눔 톡신 포함) 관리의 기본 법령.",
                en: "Fundamental act for drug regulation (including Botulinum Toxin).",
            },
        },
        {
            id: "th-fda-portal",
            documentNo: "E-Submission",
            title: "Thai FDA E-Submission Portal",
            kind: "Portal",
            authority: "Thai FDA",
            sourceUrl: "https://privus.fda.moph.go.th/",
            summary: {
                ko: "의료기기 및 의약품 전자 등록 시스템 (SKYNET 등).",
                en: "Electronic submission system for devices and drugs (SKYNET, etc.).",
            },
        }
    ],
    sources: [
        { id: "src-th-fda", title: "Thai FDA Official Website", url: REF.fda.url, accessedOn: REF.fda.accessedOn },
        { id: "src-md-div", title: "Medical Device Control Division", url: REF.md_div.url, accessedOn: REF.md_div.accessedOn },
        { id: "src-drug-div", title: "Drug Control Division", url: REF.drug_act.url, accessedOn: REF.drug_act.accessedOn },
    ],
    disclaimers: [
        { ko: "태국 규제는 제품별 분류(기기/의약품/화장품)가 매우 엄격하므로 초기 분류 확인이 필수입니다.", en: "Strict product classification (Device/Drug/Cosmetic) requires mandatory initial verification." },
        { ko: "본 자료는 2026-02-15 기준이며, 최신 고시는 FDA 웹사이트를 통해 확인해야 합니다.", en: "Data as of 2026-02-15; check FDA website for latest gazettes." },
    ],
};
