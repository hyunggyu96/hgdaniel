import { CountryPolicyProfile } from "@/data/policyTypes";

const REF = {
    vbpl: {
        id: "vn-vbpl",
        title: "VBPL (MOH legal database)",
        url: "https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=153250",
        accessedOn: "2026-02-15",
    },
    nd98: {
        id: "vn-nd98",
        title: "Decree 98/2021/ND-CP (official PDF)",
        url: "https://imda.moh.gov.vn/documents/10182/0/E_1636511534239_98_2021_ND-CP_08112021-signed.pdf/6e96247f-e468-434c-a478-091e7cb159ef",
        accessedOn: "2026-02-15",
    },
    nd07: {
        id: "vn-nd07",
        title: "Decree 07/2023/ND-CP (official PDF)",
        url: "https://imda.moh.gov.vn/documents/10182/10030594/Nghi%2Bdinh%2B07-2023/99935bb7-b51f-4127-9c6a-58e4b514fbf9",
        accessedOn: "2026-02-15",
    },
    nd04: {
        id: "vn-nd04",
        title: "Decree 04/2025/ND-CP reference publication",
        url: "https://imda.moh.gov.vn/documents/10182/10030600/CV042025/7fbafd39-b08f-47a2-8870-11900d37f777",
        accessedOn: "2026-02-15",
    },
    legalList: {
        id: "vn-legal-list",
        title: "IMDA legal document list",
        url: "https://imda.moh.gov.vn/web/guest/van-ban-phap-quy",
        accessedOn: "2026-02-15",
    },
    dvc: {
        id: "vn-dvc",
        title: "IMDA public service portal",
        url: "https://imda.moh.gov.vn/dich-vu-cong",
        accessedOn: "2026-02-15",
    },
    registered: {
        id: "vn-registered",
        title: "IMDA registration decision publication",
        url: "https://imda.moh.gov.vn/web/guest/quyet-dinh-dklh-ttbyt",
        accessedOn: "2026-02-15",
    },
    classification: {
        id: "vn-classification",
        title: "IMDA classification disclosure",
        url: "https://imda.moh.gov.vn/cong-khai-phan-loai-ttbyt",
        accessedOn: "2026-02-15",
    },
    recall: {
        id: "vn-recall",
        title: "IMDA recall publication",
        url: "https://imda.moh.gov.vn/van-ban-thu-hoi",
        accessedOn: "2026-02-15",
    },
    ads: {
        id: "vn-ads",
        title: "IMDA advertising disclosure",
        url: "https://imda.moh.gov.vn/cong-khai-nd-ht-quang-cao-ttbyt",
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
        {
            id: "vn_01_classification_pathway",
            label: { ko: "1) 제품 분류 / 규제 경로", en: "1) Classification / Regulatory Pathway" },
            value: {
                ko: "베트남은 Class A/B/C/D 위험도 체계를 적용합니다. 일반적으로 A/B는 적용표준 신고, C/D는 유통번호 발급 경로입니다.",
                en: "Vietnam applies a Class A/B/C/D risk framework. In general, A/B follow declaration of applied standards, while C/D require registration-number issuance.",
            },
            confidence: "high",
            references: [
                { ...REF.nd98, citation: { ko: "Article 4, Article 21", en: "Article 4, Article 21" } },
                REF.nd07,
                REF.nd04,
            ],
        },
        {
            id: "vn_02_applicant_eligibility",
            label: { ko: "2) 신청 자격 (현지 법인/수입자/AR)", en: "2) Applicant Eligibility" },
            value: {
                ko: "해외 제조사는 베트남 내 법적 주체(수입자/대리인)를 통해 신청하는 구조가 일반적입니다.",
                en: "Foreign manufacturers generally file via a Vietnam-based legal entity (importer/authorized representative).",
            },
            confidence: "high",
            references: [{ ...REF.nd98, citation: { ko: "Article 22", en: "Article 22" } }, REF.dvc],
        },
        {
            id: "vn_03_dossier_checklist",
            label: { ko: "3) 서류 체크리스트 (원본/공증/영사확인/번역)", en: "3) Dossier Checklist" },
            value: {
                ko: "신청서, 분류문서, CFS(또는 동등증빙), ISO 13485, LoA, 라벨/IFU, 기술문서가 기본이며, 절차별로 공증·영사확인·번역 요건이 달라질 수 있습니다.",
                en: "Core dossier includes application form, classification document, CFS (or equivalent), ISO 13485, LoA, label/IFU, and technical documents. Notarization/legalization/translation needs vary by procedure.",
            },
            confidence: "high",
            references: [
                { ...REF.nd98, citation: { ko: "Article 25, 30, 32, 75", en: "Article 25, 30, 32, 75" } },
                REF.dvc,
            ],
        },
        {
            id: "vn_04_lead_time",
            label: { ko: "4) 심사 단계별 리드타임", en: "4) Lead Time by Stage" },
            value: {
                ko: "대표 단계는 접수→기술검토→보완→결정 통보입니다. 보완 발생 시 전체 일정이 크게 증가할 수 있습니다.",
                en: "Typical flow is submission -> technical review -> deficiency cycle -> decision. Deficiencies can significantly increase total timeline.",
            },
            note: {
                ko: "법정 처리기간과 실제 운영기간은 다를 수 있어 통관 준비 버퍼를 권장합니다.",
                en: "Statutory and operational timelines can differ, so customs-preparation buffer is recommended.",
            },
            confidence: "medium",
            references: [{ ...REF.nd98, citation: { ko: "Article 33", en: "Article 33" } }, REF.dvc],
        },
        {
            id: "vn_05_cost_breakdown",
            label: { ko: "5) 비용 세부내역", en: "5) Cost Breakdown" },
            value: {
                ko: "정부수수료, 대행수수료, 시험/번역/공증/영사확인비를 분리해 관리해야 합니다.",
                en: "Costs should be split into government fees, agency fees, and testing/translation/notarization/legalization costs.",
            },
            confidence: "medium",
            references: [REF.dvc],
        },
        {
            id: "vn_06_validity_renewal",
            label: { ko: "6) 유효기간 / 갱신주기", en: "6) Validity / Renewal Cycle" },
            value: {
                ko: "유통번호는 제도상 장기 유효 구조이나, 핵심 문서 변경/만료 시 변경 절차 트리거가 발생할 수 있습니다.",
                en: "Registration number validity is long-term by design, but amendment triggers may occur when core documents change or expire.",
            },
            confidence: "medium",
            references: [{ ...REF.nd98, citation: { ko: "Article 21", en: "Article 21" } }],
        },
        {
            id: "vn_07_change_control",
            label: { ko: "7) 변경관리 기준", en: "7) Change Control Criteria" },
            value: {
                ko: "제조소·기술특성·사용목적 등 중대한 변경은 변경허가/재심사 검토 대상이며, 경미 변경은 통지/신고 경로가 적용될 수 있습니다.",
                en: "Major changes (site, technical characteristics, intended use) may require amendment approval/re-review; minor changes may use notification paths.",
            },
            confidence: "high",
            references: [REF.nd98, REF.legalList],
        },
        {
            id: "vn_08_post_market",
            label: { ko: "8) 사후관리 의무", en: "8) Post-Market Obligations" },
            value: {
                ko: "이상사례 보고, 시정조치/리콜, 추적관리, 기록보관, 점검 대응 의무가 핵심입니다.",
                en: "Core obligations include vigilance reporting, corrective action/recall, traceability, record retention, and inspection readiness.",
            },
            confidence: "high",
            references: [{ ...REF.nd98, citation: { ko: "Chapter IX", en: "Chapter IX" } }, REF.recall],
        },
        {
            id: "vn_09_labeling_advertising",
            label: { ko: "9) 라벨링 / 광고 규정", en: "9) Labeling / Advertising Rules" },
            value: {
                ko: "베트남어 표시 및 필수기재 준수, 허가 범위 외 광고표현 제한이 핵심입니다.",
                en: "Vietnamese labeling with mandatory particulars and restrictions on out-of-scope advertising claims are core requirements.",
            },
            confidence: "high",
            references: [{ ...REF.nd98, citation: { ko: "Article 25", en: "Article 25" } }, REF.ads],
        },
        {
            id: "vn_10_update_and_sources",
            label: { ko: "10) 최종 업데이트 / 공식 출처 / 신뢰도", en: "10) Last Update / Official Sources / Reliability" },
            value: {
                ko: "본 페이지는 2026-02-15 기준으로 공식 출처를 재검증했습니다. High는 원문/공식포털 근거, Medium은 운영 해석 항목입니다.",
                en: "This page was re-validated on 2026-02-15. High means legal originals/official portals; Medium indicates operational interpretation.",
            },
            confidence: "high",
            references: [REF.vbpl, REF.legalList, REF.dvc],
        },
        {
            id: "vn_11_registered_product_check",
            label: { ko: "11) 등록된 제품 확인", en: "11) Registered Product Verification" },
            value: {
                ko: "등록결정 공시, 분류공시, 회수공시, 광고공시 페이지를 교차 조회해 확인합니다.",
                en: "Verify by cross-checking registration decision, classification, recall, and advertising publication pages.",
            },
            confidence: "high",
            references: [REF.registered, REF.classification, REF.recall, REF.ads],
        },
    ],
    keyRegulations: [
        {
            id: "nd-98-2021",
            documentNo: "98/2021/ND-CP",
            title: "Decree 98/2021/ND-CP",
            kind: "Decree",
            authority: "Government of Vietnam",
            issuedDate: "2021-11-08",
            effectiveDate: "2022-01-01",
            sourceUrl: REF.nd98.url,
            summary: {
                ko: "의료기기 관리 기본 체계(분류, 등록, 수입, 사후관리).",
                en: "Core framework for device management (classification, registration, import, post-market).",
            },
        },
        {
            id: "nd-07-2023",
            documentNo: "07/2023/ND-CP",
            title: "Decree 07/2023/ND-CP",
            kind: "Decree",
            authority: "Government of Vietnam",
            issuedDate: "2023-03-03",
            effectiveDate: "2023-03-03",
            sourceUrl: REF.nd07.url,
            summary: {
                ko: "Decree 98 개정령.",
                en: "Amendment decree to Decree 98.",
            },
        },
        {
            id: "nd-04-2025",
            documentNo: "04/2025/ND-CP",
            title: "Decree 04/2025/ND-CP",
            kind: "Decree",
            authority: "Government of Vietnam",
            issuedDate: "2025-01-01",
            effectiveDate: "2025-01-01",
            sourceUrl: REF.nd04.url,
            summary: {
                ko: "추가 개정령 참고 링크.",
                en: "Reference link for additional amendment.",
            },
        },
        {
            id: "portal-public-service",
            documentNo: "IMDA DVC",
            title: "IMDA Public Service / Registration Portal",
            kind: "Portal",
            authority: "IMDA - Ministry of Health",
            sourceUrl: REF.dvc.url,
            summary: {
                ko: "공식 민원/등록 서비스 진입 경로.",
                en: "Official public service and registration entry point.",
            },
        },
    ],
    sources: [
        { id: "src-vbpl", title: "[High] VBPL legal database", url: REF.vbpl.url, accessedOn: REF.vbpl.accessedOn },
        { id: "src-nd-98", title: "[High] Decree 98/2021/ND-CP", url: REF.nd98.url, accessedOn: REF.nd98.accessedOn },
        { id: "src-nd-07", title: "[High] Decree 07/2023/ND-CP", url: REF.nd07.url, accessedOn: REF.nd07.accessedOn },
        { id: "src-legal-list", title: "[High] IMDA legal list", url: REF.legalList.url, accessedOn: REF.legalList.accessedOn },
        { id: "src-dvc", title: "[High] IMDA public service portal", url: REF.dvc.url, accessedOn: REF.dvc.accessedOn },
        { id: "src-reg", title: "[High] Registration decision publication", url: REF.registered.url, accessedOn: REF.registered.accessedOn },
        { id: "src-class", title: "[High] Classification disclosure", url: REF.classification.url, accessedOn: REF.classification.accessedOn },
        { id: "src-recall", title: "[High] Recall publication", url: REF.recall.url, accessedOn: REF.recall.accessedOn },
        { id: "src-ads", title: "[High] Advertising disclosure", url: REF.ads.url, accessedOn: REF.ads.accessedOn },
    ],
    disclaimers: [
        { ko: "본 페이지는 운영 요약이며 법률자문이 아닙니다.", en: "This page is an operational summary and not legal advice." },
        { ko: "실제 제출 전에는 최신 원문 법령과 당국 공지를 반드시 최종 대조하세요.", en: "Before filing, always verify latest legal originals and authority notices." },
    ],
};

