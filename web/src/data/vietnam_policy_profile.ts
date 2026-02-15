import { CountryPolicyProfile } from "@/data/policyTypes";

const REF = {
    vbpl: {
        id: "vn-vbpl",
        title: "VBPL (National Database of Legal Documents)",
        url: "https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=150654", // Link to Decree 98 as intro
        accessedOn: "2026-02-15",
    },
    nd98: {
        id: "vn-nd98",
        title: "Decree 98/2021/ND-CP (VBPL)",
        url: "https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=150654",
        accessedOn: "2026-02-15",
    },
    circ32: {
        id: "vn-circ32",
        title: "Circular 32/2018/TT-BYT (VBPL)",
        url: "https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=132788",
        accessedOn: "2026-02-15",
    },
    circ06: {
        id: "vn-circ06",
        title: "Circular 06/2011/TT-BYT (VBPL)",
        url: "https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=26362",
        accessedOn: "2026-02-15",
    },
    dvc: {
        id: "vn-dvc",
        title: "IMDA Public Services Portal",
        url: "https://imda.moh.gov.vn/dich-vu-cong",
        accessedOn: "2026-02-15",
    },
    drugAdmin: {
        id: "vn-dav",
        title: "Drug Administration of Vietnam (DAV)",
        url: "https://dav.gov.vn/",
        accessedOn: "2026-02-15",
    },
};

export const vietnamPolicyProfile: CountryPolicyProfile = {
    countryId: "vn",
    countryName: {
        ko: "베트남",
        en: "Vietnam",
    },
    lastUpdated: "2026-02-15",
    sourceLastCheckedAt: "2026-02-15",
    facts: [
        // ─── Common / General ───
        {
            id: "vn_00_aesthetic_cat",
            category: "common",
            label: { ko: "⚠️ 미용 제품 분류 기준", en: "⚠️ Aesthetic Product Classification" },
            value: {
                ko: "• 필러(Fillers): 의료기기 (Class D, IMDA)\n• 톡신(Toxins): 의약품/생물학적제제 (DAV)\n• 화장품: Notification (DAV)",
                en: "• Fillers: Medical Device (Class D, IMDA)\n• Toxins: Biological Drug (DAV)\n• Cosmetics: Notification (DAV)",
            },
            confidence: "high",
            references: [REF.nd98, REF.circ32],
        },
        {
            id: "vn_02_applicant_eligibility",
            category: "common",
            label: { ko: "신청 자격 (License Holder)", en: "Applicant Eligibility" },
            value: {
                ko: "베트남 내 사업자등록증을 보유한 현지 법인(수입업 자격 보유)만이 등록 신청 및 라이선스 소유가 가능합니다.",
                en: "Only a local entity with a valid business registration (Import capability) can hold the marketing authorization.",
            },
            confidence: "high",
            references: [REF.nd98],
        },

        // ─── Medical Device (Fillers) ───
        {
            id: "vn_dev_01_classification",
            category: "device",
            label: { ko: "의료기기 등급 (Device Classification)", en: "Device Classification" },
            value: {
                ko: "위험도에 따라 Class A, B, C, D로 분류됩니다. 인체에 주입되는 필러(Filler)는 최고 위험도인 Class D에 해당합니다.",
                en: "Risk-based classification A/B/C/D. Injectable dermal fillers fall under Class D (High Risk).",
            },
            confidence: "high",
            references: [REF.nd98],
        },
        {
            id: "vn_dev_02_csdt",
            category: "device",
            label: { ko: "기술문서 (CSDT)", en: "Technical Dossier (CSDT)" },
            value: {
                ko: "ASEAN CSDT 형식을 따르며, Class C/D는 기술문서 심사(Full Technical Review)가 필수입니다. 자유판매증명서(CFS)는 필수입니다.",
                en: "Adopts ASEAN CSDT. Class C/D requires full technical review. Free Sale Certificate (CFS) is mandatory.",
            },
            confidence: "high",
            references: [REF.nd98],
        },
        {
            id: "vn_dev_03_lead_time",
            category: "device",
            label: { ko: "심사 기간 (Device Timeline)", en: "Device Review Timeline" },
            value: {
                ko: "Class C/D 공식 검토 기간은 영업일 30~60일이나, 실제로는 서류 보완 등으로 인해 6~12개월 이상 소요됩니다.",
                en: "Official review is 30-60 working days, but practical timeline is 6-12+ months due to dossier queries.",
            },
            confidence: "medium",
            references: [REF.dvc],
        },

        // ─── Drugs (Toxins) ───
        {
            id: "vn_drug_01_toxin",
            category: "drug",
            label: { ko: "톡신 등록 (Toxin Registration)", en: "Toxin Registration" },
            value: {
                ko: "보툴리눔 톡신은 의약품(생물학적제제) 등록 절차(Circular 32/2018)를 따르며, 베트남 의약품청(DAV) 소관입니다.",
                en: "Botulinum Toxin follows drug registration (Circular 32/2018) under the Drug Administration of Vietnam (DAV).",
            },
            confidence: "high",
            references: [REF.circ32],
        },
        {
            id: "vn_drug_02_requirements",
            category: "drug",
            label: { ko: "제출 서류 (CTD/CPP)", en: "Dossier Requirements" },
            value: {
                ko: "ACTD(ASEAN CTD) 또는 ICH-CTD 양식의 기술문서와 CPP(Original)가 필수 제출되어야 합니다. 임상 자료 검토가 엄격합니다.",
                en: "ACTD/ICH-CTD dossier and original CPP are mandatory. Strict clinical data review applies.",
            },
            confidence: "high",
            references: [REF.circ32],
        },
        {
            id: "vn_drug_03_timeline",
            category: "drug",
            label: { ko: "심사 기간 (Drug Timeline)", en: "Drug Review Timeline" },
            value: {
                ko: "통상 12개월(신규 등록) 이상 소요되며, 갱신(Renewal)은 5년마다 필요합니다.",
                en: "New registration typically takes 12+ months. Validity is 5 years with renewal requirement.",
            },
            confidence: "medium",
            references: [REF.drugAdmin],
        },

        // ─── Cosmetics ───
        {
            id: "vn_cos_01_notification",
            category: "cosmetic",
            label: { ko: "화장품 공포 (Product Notification)", en: "Product Notification" },
            value: {
                ko: "화장품은 사전 허가제가 아닌 '공포(Notification/Cong Bo)' 절차를 통해 신고필증을 발급받습니다.",
                en: "Cosmetics require a 'Notification (Cong Bo)' receipt number, not pre-market approval.",
            },
            confidence: "high",
            references: [REF.circ06],
        },
        {
            id: "vn_cos_02_requirements",
            category: "cosmetic",
            label: { ko: "성분 및 라벨링 (Ingredients/Labeling)", en: "Ingredients & Labeling" },
            value: {
                ko: "ASEAN 화장품 지침(ACD)을 준수해야 하며, 금지/제한 원료 및 전성분 표시 의무가 있습니다.",
                en: "Must comply with ASEAN Cosmetic Directive (ACD) restrictions and full ingredient labeling.",
            },
            confidence: "high",
            references: [REF.circ06],
        },
    ],
    keyRegulations: [
        {
            id: "vn-nd-98-2021",
            documentNo: "Decree 98/2021/ND-CP",
            title: "Decree on Medical Device Management",
            kind: "Decree",
            authority: "Government of Vietnam",
            sourceUrl: REF.nd98.url,
            summary: {
                ko: "의료기기(필러 등) 등급 분류, 등록, 수입 관리의 핵심 법령.",
                en: "Core decree for medical device classification, registration, and import.",
            },
        },
        {
            id: "vn-circ-32-2018",
            documentNo: "Circular 32/2018/TT-BYT",
            title: "Drug Registration Circular",
            kind: "Circular",
            authority: "Ministry of Health",
            sourceUrl: REF.circ32.url,
            summary: {
                ko: "의약품(톡신 등) 품목 허가 및 갱신에 관한 규정.",
                en: "Regulation on marketing authorization for drugs and medicinal ingredients.",
            },
        },
        {
            id: "vn-circ-06-2011",
            documentNo: "Circular 06/2011/TT-BYT",
            title: "Cosmetic Management Circular",
            kind: "Circular",
            authority: "Ministry of Health",
            sourceUrl: REF.circ06.url,
            summary: {
                ko: "화장품 관리 및 ASEAN 화장품 지침 이행 규정.",
                en: "Implementation of ASEAN Cosmetic Directive in Vietnam.",
            },
        },
    ],
    sources: [
        { id: "src-nd98", title: "[High] Decree 98/2021/ND-CP", url: REF.nd98.url, accessedOn: REF.nd98.accessedOn },
        { id: "src-dav", title: "[High] Drug Administration of Vietnam", url: REF.drugAdmin.url, accessedOn: REF.drugAdmin.accessedOn },
        { id: "src-dvc", title: "[High] Public Service Portal (IMDA)", url: REF.dvc.url, accessedOn: REF.dvc.accessedOn },
    ],
    disclaimers: [
        { ko: "본 정보는 요약본이며, 실제 진행 시 최신 시행령(Decree)과 시행규칙(Circular)을 확인해야 합니다.", en: "Summary only; verify latest Decrees/Circulars before filing." },
        { ko: "필러(Device)와 톡신(Drug)은 관할 부서(IMDA vs DAV)가 다르므로 주의하세요.", en: "Caution: Fillers (IMDA) and Toxins (DAV) are regulated by different agencies." },
    ],
};
