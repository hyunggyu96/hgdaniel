import { CountryPolicyProfile } from "@/data/policyTypes";

const REF = {
    lawKr: {
        id: "kr-law-go",
        title: "국가법령정보센터",
        url: "https://www.law.go.kr/",
        accessedOn: "2026-02-15",
    },
    mfds: {
        id: "kr-mfds",
        title: "식품의약품안전처",
        url: "https://www.mfds.go.kr/",
        accessedOn: "2026-02-15",
    },
    emedi: {
        id: "kr-emedi",
        title: "의료기기 통합정보시스템",
        url: "https://emedi.mfds.go.kr/",
        accessedOn: "2026-02-15",
    },
    nedrug: {
        id: "kr-nedrug",
        title: "의약품안전나라 (NEDRUG)",
        url: "https://nedrug.mfds.go.kr/",
        accessedOn: "2026-02-15",
    },
    udi: {
        id: "kr-udi",
        title: "의료기기 UDI 포털",
        url: "https://udiportal.mfds.go.kr/",
        accessedOn: "2026-02-15",
    },
};

export const koreaPolicyProfile: CountryPolicyProfile = {
    countryId: "kr",
    countryName: { ko: "대한민국", en: "South Korea" },
    lastUpdated: "2026-02-15",
    sourceLastCheckedAt: "2026-02-15",
    facts: [
        {
            id: "kr_00_aesthetic_cat",
            category: "common",
            label: { ko: "미용 제품 분류 기준", en: "Aesthetic Product Classification" },
            value: {
                ko: "• 필러: 의료기기 (4등급)\n• 톡신: 전문의약품 (생물학적제제)\n• 스킨부스터: 주사제(의료기기/의약품) vs 도포용(화장품)",
                en: "• Fillers: Medical Device (Class 4)\n• Toxins: Prescription Drug (Biological)\n• Skin Boosters: Injectable (Device/Drug) vs Topical (Cosmetic)",
            },
            confidence: "high",
            references: [REF.mfds],
        },
        {
            id: "kr_02_applicant_eligibility",
            category: "common",
            label: { ko: "신청 자격 (License Holder)", en: "Applicant Eligibility" },
            value: {
                ko: "해외 제조사는 국내 수입업허가를 보유한 수입자(Importer)를 통해 품목허가를 진행해야 합니다.",
                en: "Foreign manufacturers must apply through a local entity holding an Import License.",
            },
            confidence: "high",
            references: [REF.lawKr],
        },
        {
            id: "kr_dev_01_classification",
            category: "device",
            label: { ko: "의료기기 등급 (Device Classification)", en: "Device Classification" },
            value: {
                ko: "위해도에 따라 1~4등급으로 분류됩니다. 안면 주입용 필러(Tissue Reconstructive Material)는 고위험군인 4등급에 해당합니다.",
                en: "Classified into Class I-IV. Dermal fillers are Class IV (High Risk) requiring strict approval.",
            },
            confidence: "high",
            references: [REF.lawKr, REF.emedi],
        },
        {
            id: "kr_dev_02_requirements",
            category: "device",
            label: { ko: "기술문서 및 임상 (Requirements)", en: "Technical Dossier & Clinical Data" },
            value: {
                ko: "4등급(필러)은 기술문서 심사와 임상시험 자료 제출이 필수입니다. 또한 KGMP(적합인정)가 선행되어야 합니다.",
                en: "Class IV requires technical dossier review and clinical trial data. KGMP certification is a prerequisite.",
            },
            confidence: "high",
            references: [REF.lawKr],
        },
        {
            id: "kr_dev_03_lead_time",
            category: "device",
            label: { ko: "심사 기간 (Device Timeline)", en: "Device Review Timeline" },
            value: {
                ko: "기술문서 심사 처리기한은 약 65~80일이나, 보완 요청 시 실제 기간은 6~12개월 이상 소요될 수 있습니다.",
                en: "Official timeline is ~65-80 days, but deficiency cycles often extend this to 6-12+ months.",
            },
            confidence: "medium",
            references: [REF.emedi],
        },
        {
            id: "kr_drug_01_toxin",
            category: "drug",
            label: { ko: "보툴리눔 톡신 규제 (Toxin Regulation)", en: "Botulinum Toxin Regulation" },
            value: {
                ko: "보툴리눔 톡신은 '생물학적 제제'로서 신약 수준의 안전성·유효성 심사 및 기준및시험방법 심사를 거쳐야 합니다.",
                en: "Regulated as a 'Biological Product', requiring rigorous safety/efficacy review equivalent to New Drugs.",
            },
            confidence: "high",
            references: [REF.nedrug],
        },
        {
            id: "kr_drug_02_lot_release",
            category: "drug",
            label: { ko: "국가출하승인 (National Lot Release)", en: "National Lot Release" },
            value: {
                ko: "생물학적 제제는 시중 유통 전 매 제조단위(Lot)마다 식약처의 국가출하승인을 받아야 판매 가능합니다.",
                en: "Every lot must pass National Lot Release testing by MFDS before market release.",
            },
            confidence: "high",
            references: [REF.lawKr],
        },
        {
            id: "kr_drug_03_timeline",
            category: "drug",
            label: { ko: "심사 기간 (Drug Timeline)", en: "Drug Review Timeline" },
            value: {
                ko: "안전성·유효성 심사 포함 시 약 12개월 이상 소요되며, GMP 실사 기간은 별도입니다.",
                en: "Typically 12+ months including safety/efficacy review; GMP inspection is separate.",
            },
            confidence: "medium",
            references: [REF.nedrug],
        },
        {
            id: "kr_cos_01_functional",
            category: "cosmetic",
            label: { ko: "기능성 화장품 (Functional Cosmetics)", en: "Functional Cosmetics" },
            value: {
                ko: "미백, 주름개선, 자외선차단 제품은 '기능성 화장품'으로 심사 또는 보고가 필요합니다.",
                en: "Whitening, Anti-wrinkle, and UV protection products require Functional Cosmetic review or notification.",
            },
            confidence: "high",
            references: [REF.mfds],
        },
        {
            id: "kr_cos_02_restriction",
            category: "cosmetic",
            label: { ko: "주입 금지 (Injection Ban)", en: "Injection Ban" },
            value: {
                ko: "화장품은 인체에 바르거나 뿌리는 물품으로 정의되며, 피부 내 주입(Injection)하는 형태는 화장품으로 인정되지 않습니다.",
                en: "Cosmetics are defined as topical usage only; injectable forms are legally strictly prohibited as cosmetics.",
            },
            confidence: "high",
            references: [REF.lawKr],
        },
    ],
    keyRegulations: [
        {
            id: "kr-md-act",
            documentNo: "법률 제19468호",
            title: "의료기기법 (Medical Device Act)",
            kind: "Law",
            authority: "국가법령정보센터",
            sourceUrl: "https://www.law.go.kr/법령/의료기기법",
            summary: {
                ko: "의료기기(필러 등)의 제조, 수입, 판매, 관리에 관한 기본법.",
                en: "Framework act for medical device manufacturing, import, and safety.",
            },
        },
        {
            id: "kr-pharm-act",
            documentNo: "법률 제19641호",
            title: "약사법 (Pharmaceutical Affairs Act)",
            kind: "Law",
            authority: "국가법령정보센터",
            sourceUrl: "https://www.law.go.kr/법령/약사법",
            summary: {
                ko: "의약품(톡신 등)의 등록 및 관리에 관한 기본법.",
                en: "Framework act for pharmaceutical (toxin) registration and control.",
            },
        },
        {
            id: "kr-cosmetic-act",
            documentNo: "법률 제19642호",
            title: "화장품법 (Cosmetics Act)",
            kind: "Law",
            authority: "국가법령정보센터",
            sourceUrl: "https://www.law.go.kr/법령/화장품법",
            summary: {
                ko: "기능성 화장품 심사 및 화장품 안전/표시기재 규정.",
                en: "Regulates functional cosmetic review and labeling standards.",
            },
        },
    ],
    sources: [
        { id: "kr-src-mfds", title: "[High] 식약처 (MFDS)", url: REF.mfds.url, accessedOn: REF.mfds.accessedOn },
        { id: "kr-src-emedi", title: "[High] 의료기기 통합정보시스템 (EMEDI)", url: REF.emedi.url, accessedOn: REF.emedi.accessedOn },
        { id: "kr-src-nedrug", title: "[High] 의약품안전나라 (NEDRUG)", url: REF.nedrug.url, accessedOn: REF.nedrug.accessedOn },
        { id: "kr-src-law", title: "[High] 국가법령정보센터", url: REF.lawKr.url, accessedOn: REF.lawKr.accessedOn },
    ],
    disclaimers: [
        { ko: "본 내용은 요약 정보이며, 실제 인허가 진행 시 식약처의 최신 고시를 확인해야 합니다.", en: "Summary only; verify latest MFDS notifications before filing." },
        { ko: "미용 주사제(스킨부스터)의 품목 분류(기기/약/화장품)는 사용방법과 성분에 따라 달라지므로 주의 바랍니다.", en: "Classification of skin boosters depends on usage/ingredients; caution required." },
    ],
};
