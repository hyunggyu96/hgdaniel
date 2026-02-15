import { CountryPolicyProfile } from "@/data/policyTypes";

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
            label: {
                ko: "1) 제품 분류 / 규제 경로",
                en: "1) Classification / Regulatory Pathway",
            },
            value: {
                ko: "베트남은 Class A/B/C/D 위험도 체계를 사용합니다.\n- Class A/B: 적용표준 신고(Declaration of Applied Standards)\n- Class C/D: 유통번호(Registration Number) 발급 경로\n근거 프레임은 Decree 98/2021/ND-CP 및 개정령(07/2023, 04/2025, 148/2025)입니다.",
                en: "Vietnam uses Class A/B/C/D risk classes.\n- Class A/B: Declaration of Applied Standards\n- Class C/D: Registration Number issuance\nThe legal framework is Decree 98/2021/ND-CP and amendments (07/2023, 04/2025, 148/2025).",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Article 4, Article 21 및 개정령.",
                en: "Source: Decree 98/2021/ND-CP Article 4, Article 21 and amendments.",
            },
        },
        {
            id: "vn_02_applicant_eligibility",
            label: {
                ko: "2) 신청 자격 (현지 법인/수입자/AR)",
                en: "2) Applicant Eligibility (Local Entity / Importer / AR)",
            },
            value: {
                ko: "해외 제조사는 일반적으로 베트남 현지 법인(수입자/대리인)을 통해 신청합니다.\n실무상 Authorized Representative(AR) 또는 수입자 명의로 접수하며, 통관 단계에서 소유자 위임 문서(owner authorization to import) 정합성이 중요합니다.",
                en: "Foreign manufacturers generally file through a Vietnam-based legal entity (importer/agent).\nIn practice, submissions are made under the authorized representative or importer, and owner authorization to import is critical for customs alignment.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Article 22 및 공식 절차 페이지의 신청 주체 요건.",
                en: "Source: Decree 98/2021/ND-CP Article 22 and applicant requirements in official procedures.",
            },
        },
        {
            id: "vn_03_dossier_checklist",
            label: {
                ko: "3) 서류 체크리스트 (원본/공증/영사확인/번역)",
                en: "3) Dossier Checklist (Original / Notarization / Legalization / Translation)",
            },
            value: {
                ko: "핵심 서류: 신청서, 분류문서, CFS(또는 동등증빙), ISO 13485, LoA, 라벨/IFU, 기술문서(해당 시 시험자료).\n형식 요건:\n- 공증/인증 사본 요구 가능\n- 해외 발행 문서는 영사확인(Consular legalization) 요구 가능\n- 베트남어 번역(공증 번역 포함) 요구 가능\n- 전자접수 후 원본/보완 제출 요구 가능",
                en: "Core documents: application form, classification document, CFS (or equivalent proof), ISO 13485, LoA, label/IFU, technical dossier (and tests if applicable).\nFormat requirements:\n- Notarized/certified copies may be required\n- Foreign documents may require consular legalization\n- Vietnamese translation (including notarized translation) may be required\n- Originals/supplements may be requested after e-submission",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Article 25, 30, 32, 75.",
                en: "Source: Decree 98/2021/ND-CP Article 25, 30, 32, 75.",
            },
        },
        {
            id: "vn_04_lead_time",
            label: {
                ko: "4) 심사 단계별 리드타임",
                en: "4) Lead Time by Stage",
            },
            value: {
                ko: "대표 기준(공식 절차 기준):\n- A/B 신고: 통상 3 영업일\n- C/D 유통번호: 통상 45 영업일\n- 일부 C/D 경로: 통상 30일\n보완요청은 접수 후 일정 기간 내 발생 가능하며, 보완 제출 기한 관리가 필수입니다.\n승인 후에는 통관 문서 정합 점검(수일~수주) 버퍼를 별도로 두는 것이 안전합니다.",
                en: "Typical official timelines:\n- Class A/B declaration: usually 3 working days\n- Class C/D registration number: usually 45 working days\n- Some C/D routes: usually 30 days\nDeficiency requests may occur after submission, so correction windows must be managed.\nAfter approval, keep an additional customs-document alignment buffer (days to weeks).",
            },
            note: {
                ko: "근거: IMDA 절차 페이지 및 Decree 98/2021/ND-CP Article 33.",
                en: "Source: IMDA procedure pages and Decree 98/2021/ND-CP Article 33.",
            },
        },
        {
            id: "vn_05_cost_breakdown",
            label: {
                ko: "5) 비용 세부내역",
                en: "5) Cost Breakdown",
            },
            value: {
                ko: "비용은 다음으로 분리 관리해야 합니다.\n- 정부수수료(공식 절차 표기)\n- 대행수수료(현지 RA/질의대응)\n- 시험/번역/공증/영사확인 비용\n실무 견적은 제품군, 보완 횟수, 시험 필요성에 따라 크게 달라집니다.",
                en: "Costs should be separated into:\n- Government fees (official procedure fees)\n- Agency fees (local RA and deficiency handling)\n- Testing/translation/notarization/legalization costs\nReal-world totals vary significantly by product type, deficiency rounds, and testing needs.",
            },
            note: {
                ko: "근거: IMDA 절차 페이지 수수료 항목 + 운영비용 분해 기준.",
                en: "Source: IMDA fee items + operational cost decomposition.",
            },
        },
        {
            id: "vn_06_validity_renewal",
            label: {
                ko: "6) 유효기간 / 갱신주기",
                en: "6) Validity / Renewal Cycle",
            },
            value: {
                ko: "유통번호는 원칙적으로 무기한 효력 구조입니다.\n다만 CFS/ISO/LoA/제조정보 변경·만료 시 변경신고 또는 변경허가 트리거가 발생할 수 있으므로, 만료 전 사전 준비(예: 60~180일)를 권장합니다.",
                en: "Registration numbers are generally indefinite in validity.\nHowever, changes/expiry in CFS/ISO/LoA/manufacturing details can trigger amendment obligations, so pre-expiry preparation (for example 60-180 days) is recommended.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Article 21.",
                en: "Source: Decree 98/2021/ND-CP Article 21.",
            },
        },
        {
            id: "vn_07_change_control",
            label: {
                ko: "7) 변경관리 기준",
                en: "7) Change Control Criteria",
            },
            value: {
                ko: "변경은 영향도 기반으로 관리합니다.\n- 중대한 변경(제조소/기술특성/intended use/안전성·성능 영향): 변경허가 또는 재등록 검토\n- 경미 변경(일부 라벨/행정정보): 변경신고 또는 통지 경로\n실무에서는 변경유형 매트릭스와 당국 질의 이력을 함께 관리하는 것이 좋습니다.",
                en: "Changes are managed by impact level.\n- Major changes (site, technical characteristics, intended use, safety/performance impact): amendment approval or re-registration review\n- Minor changes (some label/admin updates): notification/declaration routes\nOperationally, maintain a change matrix and authority Q&A history.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP 및 개정령의 변경 관련 조항.",
                en: "Source: Amendment-related provisions in Decree 98/2021/ND-CP and amendments.",
            },
        },
        {
            id: "vn_08_post_market",
            label: {
                ko: "8) 사후관리 의무",
                en: "8) Post-Market Obligations",
            },
            value: {
                ko: "필수 사후관리 범주:\n- 이상사례/안전성 이슈 보고\n- 시정조치 및 리콜\n- 유통추적/불만처리 기록 보관\n- 당국 점검 대응 문서 유지\n공식 포털에서 회수/안전 공시를 함께 확인해야 합니다.",
                en: "Core post-market obligations:\n- Adverse event / vigilance reporting\n- Corrective actions and recalls\n- Distribution traceability / complaint records\n- Inspection-ready documentation\nRecall and safety publications should be continuously monitored on official portals.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Chapter IX.",
                en: "Source: Decree 98/2021/ND-CP Chapter IX.",
            },
        },
        {
            id: "vn_09_labeling_advertising",
            label: {
                ko: "9) 라벨링 / 광고 규정",
                en: "9) Labeling / Advertising Rules",
            },
            value: {
                ko: "라벨/IFU는 베트남어 및 필수표기 요건을 충족해야 합니다.\n광고는 등록 범위를 벗어난 표현, 오인/과장 표현이 제한됩니다.\n광고 관련 공개 자료는 공식 포털에서 확인 가능합니다.",
                en: "Labels/IFU must meet Vietnamese-language and mandatory-content requirements.\nAdvertising is restricted from out-of-scope claims and misleading/exaggerated expressions.\nPublic advertising records are available on official portals.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Article 25 및 광고 공개 포털.",
                en: "Source: Decree 98/2021/ND-CP Article 25 and advertising disclosure portal.",
            },
        },
        {
            id: "vn_10_update_and_sources",
            label: {
                ko: "10) 최종 업데이트 / 공식 출처 / 신뢰도",
                en: "10) Last Update / Official Sources / Reliability",
            },
            value: {
                ko: "본 페이지는 2026-02-15 기준으로 공식 출처를 재검증했습니다.\n신뢰도 원칙:\n- High: 정부/보건부 원문 법령·공식 포털\n- Medium: 운영 해석(버퍼 리드타임, 총비용 추정)",
                en: "This page was re-validated against official sources as of 2026-02-15.\nReliability rule:\n- High: Government/MOH legal originals and official portals\n- Medium: Operational interpretation (buffer lead time, total cost estimation)",
            },
        },
        {
            id: "vn_11_registered_product_check",
            label: {
                ko: "11) 등록된 제품 확인 방법",
                en: "11) How to Verify Registered Products",
            },
            value: {
                ko: "아래 공식 경로에서 확인합니다.\n- 등록/결정 공시 페이지\n- 분류 공시 페이지\n- 회수/안전 공시 페이지\n- 광고 공시 페이지\n검색은 제품명(영문/베트남어), 제조사명, 등록번호, dossier 코드 조합이 가장 정확합니다.",
                en: "Use official channels below:\n- Registration/decision publication pages\n- Classification publication pages\n- Recall/safety publication pages\n- Advertising publication pages\nBest match strategy: product name (EN/VN), manufacturer, registration number, and dossier code together.",
            },
            note: {
                ko: "아래 Official Sources 링크에서 직접 조회 가능합니다.",
                en: "You can directly verify via the Official Sources links below.",
            },
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
            sourceUrl: "https://imda.moh.gov.vn/documents/10182/0/E_1636511534239_98_2021_ND-CP_08112021-signed.pdf/6e96247f-e468-434c-a478-091e7cb159ef",
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
            sourceUrl: "https://imda.moh.gov.vn/documents/10182/10030594/Nghi%2Bdinh%2B07-2023/99935bb7-b51f-4127-9c6a-58e4b514fbf9",
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
            sourceUrl: "https://imda.moh.gov.vn/documents/10182/10030600/CV042025/7fbafd39-b08f-47a2-8870-11900d37f777",
            summary: {
                ko: "의료기기 관리 관련 추가 개정.",
                en: "Additional amendment related to device management.",
            },
        },
        {
            id: "nd-148-2025",
            documentNo: "148/2025/ND-CP",
            title: "Decree 148/2025/ND-CP",
            kind: "Decree",
            authority: "Government of Vietnam",
            issuedDate: "2025-06-12",
            effectiveDate: "2025-07-01",
            sourceUrl: "https://imda.moh.gov.vn/web/guest/van-ban-phap-quy",
            summary: {
                ko: "최신 개정 관련 공식 법규 목록에서 확인.",
                en: "Check latest amendment references in official legal-list page.",
            },
        },
        {
            id: "portal-public-service",
            documentNo: "IMDA Portal",
            title: "IMDA Public Service / Registration Portal",
            kind: "Portal",
            authority: "IMDA - Ministry of Health",
            sourceUrl: "https://imda.moh.gov.vn/dich-vu-cong",
            summary: {
                ko: "공식 민원/등록 서비스 진입 경로.",
                en: "Official public service and registration entry point.",
            },
        },
    ],
    sources: [
        {
            id: "src-vbpl",
            title: "[High] VBPL legal database (MOH)",
            url: "https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=153250",
        },
        {
            id: "src-nd-98",
            title: "[High] Decree 98/2021/ND-CP (official PDF)",
            url: "https://imda.moh.gov.vn/documents/10182/0/E_1636511534239_98_2021_ND-CP_08112021-signed.pdf/6e96247f-e468-434c-a478-091e7cb159ef",
        },
        {
            id: "src-nd-07",
            title: "[High] Decree 07/2023/ND-CP (official PDF)",
            url: "https://imda.moh.gov.vn/documents/10182/10030594/Nghi%2Bdinh%2B07-2023/99935bb7-b51f-4127-9c6a-58e4b514fbf9",
        },
        {
            id: "src-nd-04",
            title: "[High] Decree 04/2025/ND-CP (official publication)",
            url: "https://imda.moh.gov.vn/documents/10182/10030600/CV042025/7fbafd39-b08f-47a2-8870-11900d37f777",
        },
        {
            id: "src-legal-list",
            title: "[High] IMDA legal documents list",
            url: "https://imda.moh.gov.vn/web/guest/van-ban-phap-quy",
        },
        {
            id: "src-public-service",
            title: "[High] IMDA public service portal",
            url: "https://imda.moh.gov.vn/dich-vu-cong",
        },
        {
            id: "src-registered-products",
            title: "[High] IMDA registration decision publication",
            url: "https://imda.moh.gov.vn/web/guest/quyet-dinh-dklh-ttbyt",
        },
        {
            id: "src-classification",
            title: "[High] IMDA classification disclosure",
            url: "https://imda.moh.gov.vn/cong-khai-phan-loai-ttbyt",
        },
        {
            id: "src-recall",
            title: "[High] IMDA recall and safety publication",
            url: "https://imda.moh.gov.vn/van-ban-thu-hoi",
        },
        {
            id: "src-advertising",
            title: "[High] IMDA advertising disclosure",
            url: "https://imda.moh.gov.vn/cong-khai-nd-ht-quang-cao-ttbyt",
        },
    ],
    disclaimers: [
        {
            ko: "본 페이지는 2026-02-15 기준 운영 요약이며 법률자문이 아닙니다.",
            en: "This page is an operational summary as of 2026-02-15 and is not legal advice.",
        },
        {
            ko: "실제 제출 전에는 반드시 최신 원문 법령과 접수기관 공지를 최종 대조하세요.",
            en: "Before filing, always verify against the latest legal originals and authority notices.",
        },
        {
            ko: "리드타임 버퍼/총비용은 운영 추정치이며 공식 법정기한·정부수수료와 구분해 사용해야 합니다.",
            en: "Lead-time buffers and total costs are operational estimates and must be separated from statutory timelines and official fees.",
        },
    ],
};
