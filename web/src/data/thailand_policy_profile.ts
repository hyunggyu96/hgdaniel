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
        title: "Medical Device Act B.E. 2551 & 2562 (MOPH)",
        url: "https://medical.fda.moph.go.th",
        accessedOn: "2026-02-15",
    },
    drug_act: {
        id: "th-drug-act",
        title: "Drug Act B.E. 2510 (MOPH)",
        url: "https://drug.fda.moph.go.th",
        accessedOn: "2026-02-15",
    },
    cosmetic_act: {
        id: "th-cosmetic-act",
        title: "Cosmetic Act B.E. 2558 (MOPH)",
        url: "https://cosmetic.fda.moph.go.th",
        accessedOn: "2026-02-15",
    },
    md_div: {
        id: "th-md-div",
        title: "Medical Device Control Division (Thai FDA)",
        url: "https://medical.fda.moph.go.th",
        accessedOn: "2026-02-15",
    },
    drug_div: {
        id: "th-drug-div",
        title: "Drug Control Division (Thai FDA)",
        url: "https://drug.fda.moph.go.th",
        accessedOn: "2026-02-15",
    },
    cosmetic_div: {
        id: "th-cosmetic-div",
        title: "Cosmetic Control Group (Thai FDA)",
        url: "https://cosmetic.fda.moph.go.th",
        accessedOn: "2026-02-15",
    },
    amdd: {
        id: "asean-amdd",
        title: "ASEAN Medical Device Directive (ASEAN.org)",
        url: "https://asean.org/our-communities/economic-community/standards-conformance/",
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
        // ─── Common / General ───
        {
            id: "th_00_aesthetic_product_cat",
            category: "common",
            label: { ko: "⚠️ 미용 제품 분류 기준 (Classification Criteria)", en: "⚠️ Aesthetic Product Classification Criteria" },
            value: {
                ko: "• 필러(Fillers): 의료기기 (Class 4)\n• 톡신(Toxins): 전문의약품 (Biological Drug)\n• 기능성 화장품: 화장품 (Notification)",
                en: "• Fillers: Medical Device (Class 4)\n• Toxins: Prescription Drug (Biological)\n• Functional Cosmetics: Cosmetic (Notification)",
            },
            note: {
                ko: "제품의 성격(작용기전)에 따라 적용 법령이 완전히 다르므로 초기 분류가 가장 중요합니다.",
                en: "Applicable laws differ completely by mechanism of action; initial classification is critical.",
            },
            confidence: "high",
            references: [REF.md_act, REF.drug_act, REF.cosmetic_act],
        },
        {
            id: "th_04_applicant_eligibility",
            category: "common",
            label: { ko: "현지 대리인 자격 (Local License Holder)", en: "Local License Holder Requirement" },
            value: {
                ko: "태국 내 사업자 등록이 된 현지 법인(수입업 허가 보유)만이 등록 신청 및 라이선스 보유가 가능합니다.",
                en: "Only a local entity with a valid Import License in Thailand can apply for and hold the product registration license.",
            },
            confidence: "high",
            references: [REF.md_act, REF.drug_act],
        },

        // ─── Medical Device (Fillers, Threads, Energy Devices) ───
        {
            id: "th_01_classification",
            category: "device",
            label: { ko: "의료기기 등급 및 경로 (Device Classification)", en: "Device Classification & Pathway" },
            value: {
                ko: "위험도에 따라 Class 1(Listing), Class 2-3(Notification), Class 4(License)로 분류됩니다. 필러는 Class 4(License)입니다.",
                en: "Classified into Class 1 (Listing), Class 2-3 (Notification), Class 4 (License). Dermal Fillers are Class 4 (License).",
            },
            confidence: "high",
            references: [REF.md_act, REF.md_div],
        },
        {
            id: "th_03_registration_dossier",
            category: "device",
            label: { ko: "기술문서 요건 (CSDT)", en: "Technical Dossier (CSDT)" },
            value: {
                ko: "모든 등급(Class 1-4)에 대해 ASEAN CSDT(Common Submission Dossier Template) 형식의 기술문서 제출이 의무화되었습니다.",
                en: "Submission of technical dossiers in ASEAN CSDT format is mandatory for all classes.",
            },
            confidence: "high",
            references: [REF.md_div, REF.amdd],
        },
        {
            id: "th_dev_lead_time",
            category: "device",
            label: { ko: "심사 소요 기간 (Device Timeline)", en: "Device Review Timeline" },
            value: {
                ko: "• Class 4 (License): 약 9-12개월 (전문가 검토 포함 시)\n• Class 2-3 (Notification): 약 4-6개월",
                en: "• Class 4 (License): ~9-12 months (w/ expert review)\n• Class 2-3 (Notification): ~4-6 months",
            },
            confidence: "medium",
            references: [REF.md_div],
        },

        // ─── Drugs (Botulinum Toxin) ───
        {
            id: "th_drug_01_pathway",
            category: "drug",
            label: { ko: "의약품 등록 경로 (Biological Drug)", en: "Drug Registration Pathway" },
            value: {
                ko: "보툴리눔 톡신은 '신약(New Drug)' 또는 '생물학적 제제'로 분류되어 엄격한 등록 절차(Or Yor)를 거칩니다.",
                en: "Botulinum Toxin is classified as a 'New Drug' or 'Biological Product', subject to strict registration (Or Yor).",
            },
            confidence: "high",
            references: [REF.drug_act],
        },
        {
            id: "th_drug_02_requirements",
            category: "drug",
            label: { ko: "제출 자료 요건 (ACTD/ICH-CTD)", en: "Dossier Requirements (ACTD/CTD)" },
            value: {
                ko: "ACTD(ASEAN CTD) 또는 ICH-CTD 양식을 따르며, 임상시험 자료(Phase 1-3)와 PIC/S GMP 인증이 필수입니다.",
                en: "Must follow ACTD or ICH-CTD format. Clinical data (Phase 1-3) and PIC/S GMP certification are mandatory.",
            },
            confidence: "high",
            references: [REF.drug_act],
        },
        {
            id: "th_drug_03_timeline",
            category: "drug",
            label: { ko: "심사 소요 기간 (Drug Timeline)", en: "Drug Review Timeline" },
            value: {
                ko: "일반적으로 12개월~24개월 이상 소요되며, 신약의 경우 더 오래 걸릴 수 있습니다.",
                en: "Typically 12-24+ months; new drugs may take longer depending on complexity.",
            },
            confidence: "medium",
            references: [REF.drug_div],
        },

        // ─── Cosmetics (Skin Boosters, Whitening) ───
        {
            id: "th_cos_01_notification",
            category: "cosmetic",
            label: { ko: "화장품 통지 절차 (Product Notification)", en: "Cosmetic Product Notification" },
            value: {
                ko: "화장품은 사전 허가가 아닌 '통지(Notification/Jor Jaeng)' 절차를 따르며, 온라인(E-submission)으로 진행됩니다.",
                en: "Cosmetics follow a 'Notification (Jor Jaeng)' procedure via E-submission, rather than pre-market approval.",
            },
            confidence: "high",
            references: [REF.cosmetic_act],
        },
        {
            id: "th_cos_02_requirements",
            category: "cosmetic",
            label: { ko: "주요 요건 및 제한 (Requirements)", en: "Key Requirements & Restrictions" },
            value: {
                ko: "ASEAN Cosmetic Directive를 따르며, 금지/제한 원료(색소, 보존제 등) 준수가 필수입니다. 주사제(Injectable) 형태는 화장품으로 등록 불가합니다.",
                en: "Must comply with ASEAN Cosmetic Directive. Injectable forms cannot be registered as cosmetics.",
            },
            note: {
                ko: "스킨부스터 중 '주사' 용도는 의료기기/의약품으로, '도포' 용도는 화장품으로 분류될 수 있습니다.",
                en: "Skin boosters for 'injection' are Devices/Drugs; 'topical' use may be Cosmetics.",
            },
            confidence: "high",
            references: [REF.cosmetic_act, REF.cosmetic_div],
        },
        {
            id: "th_cos_03_timeline",
            category: "cosmetic",
            label: { ko: "심사 소요 기간 (Cosmetic Timeline)", en: "Cosmetic Review Timeline" },
            value: {
                ko: "통상의 경우 업무일 기준 3~5일 내로 매우 빠르게 처리됩니다.",
                en: "Typically processed very quickly within 3-5 working days.",
            },
            confidence: "high",
            references: [REF.cosmetic_div],
        },
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
            sourceUrl: "https://medical.fda.moph.go.th",
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
            id: "th-cosmetic-act-2558",
            documentNo: "B.E. 2558 (2015)",
            title: "Cosmetic Act B.E. 2558",
            kind: "Law",
            authority: "Ministry of Public Health",
            issuedDate: "2015",
            effectiveDate: "2015",
            sourceUrl: "https://cosmetic.fda.moph.go.th",
            summary: {
                ko: "화장품 제조, 수입, 판매 및 통지(Notification) 절차를 규정.",
                en: "Regulates cosmetic manufacturing, import, sales, and notification procedures.",
            },
        }
    ],
    sources: [
        { id: "src-th-fda", title: "Thai FDA Official Website", url: REF.fda.url, accessedOn: REF.fda.accessedOn },
        { id: "src-md-div", title: "Medical Device Control Division", url: REF.md_div.url, accessedOn: REF.md_div.accessedOn },
        { id: "src-drug-div", title: "Drug Control Division", url: REF.drug_div.url, accessedOn: REF.drug_div.accessedOn },
        { id: "src-cos-div", title: "Cosmetic Control Group", url: REF.cosmetic_div.url, accessedOn: REF.cosmetic_div.accessedOn },
    ],
    disclaimers: [
        { ko: "태국 규제는 제품별 분류(기기/의약품/화장품)가 매우 엄격하므로 초기 분류 확인이 필수입니다.", en: "Strict product classification (Device/Drug/Cosmetic) requires mandatory initial verification." },
        { ko: "본 자료는 2026-02-15 기준이며, 최신 고시는 FDA 웹사이트를 통해 확인해야 합니다.", en: "Data as of 2026-02-15; check FDA website for latest gazettes." },
    ],
};
