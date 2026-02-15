import { CountryPolicyProfile } from "@/data/policyTypes";

export const vietnamPolicyProfile: CountryPolicyProfile = {
    countryId: "vn",
    countryName: {
        ko: "Vietnam",
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
                ko: "Class A/B/C/D 위험도 체계를 적용합니다.\n- A/B: '적용 표준 신고(Declaration of Applied Standards)' 경로\n- C/D: '유통번호(Registration Number) 발급' 경로\nDecree 98/2021/ND-CP 및 개정(07/2023, 04/2025, 148/2025) 체계 기준.",
                en: "Vietnam uses Class A/B/C/D risk classes.\n- Class A/B: Declaration of Applied Standards pathway\n- Class C/D: Registration Number issuance pathway\nBased on Decree 98/2021/ND-CP and amendments (07/2023, 04/2025, 148/2025).",
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
                ko: "신청은 베트남 내 법적 주체가 수행해야 하며, 해외 제조사는 현지 수입자 또는 위임 대리인(Authorized Representative)을 통해 진행하는 구조가 일반적입니다.\n수입 시 통관용으로 소유자 위임서(owner authorization to import) 등 수입자 관련 서류가 요구됩니다.",
                en: "Filings must be made through a legal entity in Vietnam. Foreign manufacturers typically proceed via a local importer or authorized representative.\nFor customs release, importer authorization documents (owner authorization to import) are generally required.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Article 22(수입 요건), DVC 절차별 신청주체 규정.",
                en: "Source: Decree 98/2021/ND-CP Article 22 (import conditions), applicant entities in DVC procedures.",
            },
        },
        {
            id: "vn_03_dossier_checklist",
            label: {
                ko: "3) 서류 체크리스트 (원본/공증/영사확인/번역)",
                en: "3) Dossier Checklist (Original / Notarization / Legalization / Translation)",
            },
            value: {
                ko: "핵심 서류: 신청서, 분류문서, CFS 또는 동등 허가증빙, ISO 13485, LoA, 라벨/IFU, 기술문서(및 해당 시 시험자료).\n형식 요건:\n- 일부 문서는 공증 사본 또는 인증 사본 요구\n- 해외 발행 문서는 영사확인(Consular legalization) 요구 조항 존재\n- 베트남어 번역/공증 번역 요구될 수 있음\n- 제출 방식은 전자포털 + 요구 시 원본/대조본 보완",
                en: "Core documents include application form, classification document, CFS or equivalent market authorization proof, ISO 13485, LoA, labels/IFU, technical dossier (and test reports when applicable).\nFormat requirements:\n- Some documents require notarized/certified copies\n- Foreign-issued documents may require consular legalization\n- Vietnamese translation (often notarized) may be required\n- Submission is via e-portal plus originals/certified copies when requested",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Article 25, Article 30, Article 32, Article 75. 아포스티유 단독 수용 여부는 접수기관 최신 운영기준 확인 필요.",
                en: "Source: Decree 98/2021/ND-CP Article 25, Article 30, Article 32, Article 75. Confirm whether apostille-only acceptance is currently allowed by the receiving authority.",
            },
        },
        {
            id: "vn_04_lead_time",
            label: {
                ko: "4) 심사 단계별 리드타임 (접수/보완/승인/통관준비)",
                en: "4) Lead Time by Stage (Submission / Deficiency / Approval / Customs Prep)",
            },
            value: {
                ko: "공식 절차 기준(대표 값):\n- A/B 신고: 통상 3 영업일(서류 적합 시)\n- C/D 유통번호: 통상 45 영업일\n- C/D(국가표준 적용 일부 경로): 통상 30일\n보완요청:\n- 통상 접수 후 40일 이내 보완요청 가능\n- 보완제출 기간 90일(최대 5회)\n승인 후:\n- 결과 공시/게시가 단기(예: 1 영업일)로 표시되는 절차 존재\n통관 준비(실무):\n- 승인번호 반영, 수입위임서/상업서류 정합 점검에 별도 운영 버퍼(보통 수일~수주) 필요",
                en: "Typical official timelines:\n- Class A/B declaration: usually 3 working days (if dossier is complete)\n- Class C/D registration number: usually 45 working days\n- Some C/D routes (national-standard based): usually 30 days\nDeficiency handling:\n- Deficiency request can be issued within about 40 days from receipt\n- Applicant correction window: up to 90 days (max 5 rounds)\nAfter approval:\n- Certain procedures show short publication windows (for example 1 working day)\nCustoms prep (operational):\n- Additional buffer is needed for approval-number reflection and importer/customs document alignment",
            },
            note: {
                ko: "근거: IMDA DVC 절차(2231, 1326, 1301) 및 Decree 98/2021/ND-CP Article 33(보완 처리). 통관준비 기간은 운영 추정치.",
                en: "Source: IMDA DVC procedures (2231, 1326, 1301) and Decree 98/2021/ND-CP Article 33 (deficiency processing). Customs prep duration is an operational estimate.",
            },
        },
        {
            id: "vn_05_cost_breakdown",
            label: {
                ko: "5) 비용 세부내역 (정부수수료/대행수수료/시험·번역비)",
                en: "5) Cost Breakdown (Government / Agency / Testing-Translation)",
            },
            value: {
                ko: "정부수수료(공식 절차 표기 예시):\n- A/B 신고: 1,000,000 VND (절차 1326 표기)\n- C/D 유통번호: 6,000,000 VND (절차 2231 표기)\n대행수수료:\n- 현지 RA 대행, 질의응답 대응, 포털 운용 지원 비용(업체별 상이)\n시험/번역/공증/영사확인:\n- 제품/적합성 시험, 번역 및 공증, 영사확인 비용 별도",
                en: "Official government fee examples shown in procedures:\n- Class A/B declaration: 1,000,000 VND (procedure 1326)\n- Class C/D registration number: 6,000,000 VND (procedure 2231)\nAgency fee:\n- Local RA service, deficiency response, and portal operation support (vendor-dependent)\nTesting/translation/notarization/legalization:\n- Product/conformity testing, translation-notarization, and consular legalization are separate cost buckets",
            },
            note: {
                ko: "근거: IMDA DVC 절차 수수료 항목. 실제 총비용은 제품군, 보완횟수, 시험 필요성에 따라 변동.",
                en: "Source: Fee items shown in IMDA DVC procedures. Total cost varies by device type, number of deficiency rounds, and testing needs.",
            },
        },
        {
            id: "vn_06_validity_renewal",
            label: {
                ko: "6) 유효기간 / 갱신주기",
                en: "6) Validity / Renewal Cycle",
            },
            value: {
                ko: "의료기기 유통번호는 원칙적으로 '무기한' 효력으로 규정되어 별도 정기 갱신주기가 없는 구조입니다.\n다만 근거문서(CFS, ISO, LoA, 제조정보 등) 변경·만료 시 변경신고/변경허가 트리거가 발생할 수 있어 사전 점검 리드타임(일반적으로 60~180일) 관리가 필요합니다.",
                en: "Medical device registration numbers are generally defined as having indefinite validity, so there is no fixed periodic renewal cycle.\nHowever, changes/expiry of core documents (CFS, ISO, LoA, manufacturing details, etc.) may trigger amendment obligations, so pre-expiry planning lead time (commonly 60-180 days) should be managed.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Article 21(유통번호 유효). 60~180일은 운영 권장치.",
                en: "Source: Decree 98/2021/ND-CP Article 21 (registration number validity). 60-180 days is an operational recommendation.",
            },
        },
        {
            id: "vn_07_change_control",
            label: {
                ko: "7) 변경관리 기준 (성분·제조소·라벨 등)",
                en: "7) Change Control Criteria (Composition / Site / Label, etc.)",
            },
            value: {
                ko: "등록 후 변경은 영향도에 따라 구분됩니다.\n- 중대한 변경(예: 제조소, 기술특성, intended use, 안전성/성능 영향): 변경허가 또는 재등록 검토\n- 경미 변경(예: 일부 라벨/행정정보): 변경신고 또는 통지 경로\n실무에서는 변경유형 매트릭스와 당국 질의 이력을 함께 관리해야 보완 리스크를 줄일 수 있습니다.",
                en: "Post-registration changes are handled by impact level.\n- Major changes (for example manufacturing site, technical characteristics, intended use, safety/performance impact): amendment approval or re-registration review\n- Minor changes (for example some labeling/admin details): notification/declaration routes\nOperationally, a change-type matrix plus authority Q&A history should be managed to reduce deficiency risk.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP 및 개정령의 변경 관련 조항. 세부 분류는 최신 하위지침 확인 필요.",
                en: "Source: Amendment-related provisions in Decree 98/2021/ND-CP and amendments. Confirm detailed categories in latest implementing guidance.",
            },
        },
        {
            id: "vn_08_post_market",
            label: {
                ko: "8) 사후관리 의무",
                en: "8) Post-Market Obligations",
            },
            value: {
                ko: "필수 사후관리 범주:\n- 이상사례/안전성 이슈 보고(vigilance)\n- 시정조치/리콜 수행 및 공문 대응\n- 유통추적 및 불만처리 기록 보관\n- 당국 점검 대비 문서 보관 및 제출 협조\n포털상으로도 회수 공시/안전 정보가 별도 게시됩니다.",
                en: "Core post-market duties include:\n- Vigilance and adverse event reporting\n- Corrective action/recall execution and authority response\n- Distribution traceability and complaint record retention\n- Document retention and submission support for inspections\nRecall and safety notices are also publicly posted on official portals.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Chapter IX(관리, 정보, 회수 관련), IMDA 회수/경고 공시 페이지.",
                en: "Source: Decree 98/2021/ND-CP Chapter IX (management, information, recall) and IMDA recall/alert pages.",
            },
        },
        {
            id: "vn_09_labeling_advertising",
            label: {
                ko: "9) 라벨링 / 광고 규정",
                en: "9) Labeling / Advertising Rules",
            },
            value: {
                ko: "라벨·사용설명은 베트남어 요건 및 필수표기 항목을 충족해야 하며, 수입 제품은 원산지/수입자/기기식별정보 정합성이 중요합니다.\n광고는 등록·신고된 적응증/범위를 벗어난 표현, 오인·과장 표현이 제한됩니다.\n광고 공개정보(승인/수리 이력)는 IMDA 포털에서 조회 가능합니다.",
                en: "Labels and IFU must satisfy Vietnamese-language requirements and mandatory particulars. For imported products, consistency across origin/importer/device-identification information is critical.\nAdvertising is restricted from claims outside approved scope and from misleading/exaggerated language.\nPublic disclosure of advertising acceptance records can be checked on the IMDA portal.",
            },
            note: {
                ko: "근거: Decree 98/2021/ND-CP Article 25(라벨/IFU 포함 요건), 광고 공개 포털. 금지표현의 세부판단은 최신 광고법령/당국 해석 동시 확인 필요.",
                en: "Source: Decree 98/2021/ND-CP Article 25 (including label/IFU requirements) and advertising disclosure portal. For prohibited expression details, check latest advertising-law interpretation as well.",
            },
        },
        {
            id: "vn_10_update_and_sources",
            label: {
                ko: "10) 최종 업데이트 / 공식 출처 / 신뢰도",
                en: "10) Last Update / Official Sources / Reliability",
            },
            value: {
                ko: "이 페이지는 2026-02-15 기준으로 공식 포털을 재확인했습니다.\n신뢰도 표준:\n- High: 정부 법령 원문(정부 공보/법령 DB)\n- High: 보건부(IMDA) 공식 절차 포털\n- Medium: 운영 해석(리드타임 버퍼, 비용 총계 추정)\n각 항목 note에 법령/절차 번호를 병기했습니다.",
                en: "This page was re-checked against official portals as of 2026-02-15.\nReliability standard:\n- High: Government legal originals (official legal DB/gazette)\n- High: MOH (IMDA) official procedure portal\n- Medium: Operational interpretation (buffer lead times, total cost planning)\nEach item note contains the legal/procedure basis.",
            },
        },
        {
            id: "vn_11_registered_product_check",
            label: {
                ko: "11) 등록된 제품 확인 방법",
                en: "11) How to Verify Registered Products",
            },
            value: {
                ko: "공식 확인 경로:\n- 공공서비스 결과(승인/처리 결과): dossier/결과 공시 조회\n- 분류결과 공개: 분류번호 및 분류결과 조회\n- 회수/경고 공시: 리콜·안전성 공지 확인\n- 광고 공개: 의료기기 광고 수리 이력 확인\n실무 팁: 제품명(영문/베트남어), 제조사명, 유통번호, dossier 코드 4개 키워드로 교차검색하면 정확도가 높습니다.",
                en: "Official verification channels:\n- Public service results: approval/processing outcomes by dossier\n- Public classification records: classification numbers and decisions\n- Recall/alert publication: safety and recall notices\n- Advertising disclosure: accepted medical-device advertising records\nOperational tip: Cross-search using 4 keys (product name in EN/VN, manufacturer, registration number, dossier code) for better matching.",
            },
            note: {
                ko: "아래 'Official Sources' 섹션의 포털 링크에서 직접 조회 가능.",
                en: "Direct links are listed in the Official Sources section below.",
            },
        },
    ],
    keyRegulations: [
        {
            id: "nd-98-2021",
            documentNo: "98/2021/ND-CP",
            title: "Quy dinh ve quan ly trang thiet bi y te",
            kind: "Decree",
            authority: "Government of Vietnam",
            issuedDate: "2021-11-08",
            effectiveDate: "2022-01-01",
            sourceUrl: "https://congbao.chinhphu.vn/noi-dung-van-ban-so-98-2021-nd-cp-43567",
            summary: {
                ko: "베트남 의료기기 관리 기본령(분류, 신고/등록, 수입, 사후관리).",
                en: "Core decree for medical device management (classification, declaration/registration, import, post-market).",
            },
        },
        {
            id: "nd-07-2023",
            documentNo: "07/2023/ND-CP",
            title: "Amending and supplementing Decree 98/2021/ND-CP",
            kind: "Decree",
            authority: "Government of Vietnam",
            issuedDate: "2023-03-03",
            effectiveDate: "2023-03-03",
            sourceUrl: "https://congbao.chinhphu.vn/noi-dung-van-ban-so-07-2023-nd-cp-48635",
            summary: {
                ko: "Decree 98 일부 절차/유예/운영 규정 개정.",
                en: "Amends procedural and implementation points under Decree 98.",
            },
        },
        {
            id: "nd-04-2025",
            documentNo: "04/2025/ND-CP",
            title: "Further amendments on medical device management",
            kind: "Decree",
            authority: "Government of Vietnam",
            issuedDate: "2025-01-01",
            effectiveDate: "2025-01-01",
            sourceUrl: "https://congbao.chinhphu.vn/noi-dung-van-ban-so-04-2025-nd-cp-52596",
            summary: {
                ko: "의료기기 관리 체계의 추가 개정 반영.",
                en: "Additional amendments to medical device management implementation.",
            },
        },
        {
            id: "nd-148-2025",
            documentNo: "148/2025/ND-CP",
            title: "Latest amendment update",
            kind: "Decree",
            authority: "Government of Vietnam",
            issuedDate: "2025-06-12",
            effectiveDate: "2025-07-01",
            sourceUrl: "https://congbao.chinhphu.vn/noi-dung-van-ban-so-148-2025-nd-cp-54569",
            summary: {
                ko: "최근 개정령(시행 세부사항 업데이트).",
                en: "Latest amendment decree updating implementation details.",
            },
        },
        {
            id: "dvc-cd-registration",
            documentNo: "DVC 2231",
            title: "Issuance of registration number for Class C,D imported devices",
            kind: "Portal",
            authority: "IMDA - Ministry of Health",
            sourceUrl: "https://dichvucong.moh.gov.vn/web/guest/cong-khai-tthc?p_p_id=thutuchanhchinh_WAR_mohapp&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_thutuchanhchinh_WAR_mohapp_thuTucHanhChinhId=2231",
            summary: {
                ko: "공식 절차 페이지(처리기간, 수수료, 단계정보 확인 가능).",
                en: "Official procedure page with processing time, fees, and step details.",
            },
        },
        {
            id: "dvc-ab-declaration",
            documentNo: "DVC 1326",
            title: "Declaration of applied standards for Class A,B devices",
            kind: "Portal",
            authority: "IMDA - Ministry of Health",
            sourceUrl: "https://dichvucong.moh.gov.vn/web/guest/cong-khai-tthc?p_p_id=thutuchanhchinh_WAR_mohapp&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_thutuchanhchinh_WAR_mohapp_thuTucHanhChinhId=1326",
            summary: {
                ko: "A/B 신고 절차(처리기간 3일, 수수료 항목 등) 확인.",
                en: "A/B declaration procedure (3-day timeline, fee item, etc.).",
            },
        },
    ],
    sources: [
        {
            id: "src-legal-db",
            title: "[High] Official legal text database (VBPL)",
            url: "https://vbpl.vn/boyte/Pages/vbpq-toanvan.aspx?ItemID=153250",
        },
        {
            id: "src-congbao-98",
            title: "[High] Government Gazette - Decree 98/2021/ND-CP",
            url: "https://congbao.chinhphu.vn/noi-dung-van-ban-so-98-2021-nd-cp-43567",
        },
        {
            id: "src-congbao-07",
            title: "[High] Government Gazette - Decree 07/2023/ND-CP",
            url: "https://congbao.chinhphu.vn/noi-dung-van-ban-so-07-2023-nd-cp-48635",
        },
        {
            id: "src-congbao-04",
            title: "[High] Government Gazette - Decree 04/2025/ND-CP",
            url: "https://congbao.chinhphu.vn/noi-dung-van-ban-so-04-2025-nd-cp-52596",
        },
        {
            id: "src-congbao-148",
            title: "[High] Government Gazette - Decree 148/2025/ND-CP",
            url: "https://congbao.chinhphu.vn/noi-dung-van-ban-so-148-2025-nd-cp-54569",
        },
        {
            id: "src-dvc-2231",
            title: "[High] IMDA DVC Procedure 2231 (Class C,D imported registration)",
            url: "https://dichvucong.moh.gov.vn/web/guest/cong-khai-tthc?p_p_id=thutuchanhchinh_WAR_mohapp&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_thutuchanhchinh_WAR_mohapp_thuTucHanhChinhId=2231",
        },
        {
            id: "src-dvc-1326",
            title: "[High] IMDA DVC Procedure 1326 (Class A,B declaration)",
            url: "https://dichvucong.moh.gov.vn/web/guest/cong-khai-tthc?p_p_id=thutuchanhchinh_WAR_mohapp&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_thutuchanhchinh_WAR_mohapp_thuTucHanhChinhId=1326",
        },
        {
            id: "src-dvc-1301",
            title: "[High] IMDA DVC Procedure 1301 (Class C,D standard-based route)",
            url: "https://dichvucong.moh.gov.vn/web/guest/cong-khai-tthc?p_p_id=thutuchanhchinh_WAR_mohapp&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_thutuchanhchinh_WAR_mohapp_thuTucHanhChinhId=1301",
        },
        {
            id: "src-public-results",
            title: "[High] IMDA Public Service Results (approval/publication check)",
            url: "https://imda.moh.gov.vn/ket-qua-dich-vu-cong",
        },
        {
            id: "src-public-classification",
            title: "[High] IMDA Public Classification Records",
            url: "https://imda.moh.gov.vn/cong-khai-phan-loai-ttbyt",
        },
        {
            id: "src-recall",
            title: "[High] IMDA Recall / Safety Publication",
            url: "https://imda.moh.gov.vn/van-ban-thu-hoi",
        },
        {
            id: "src-ads-disclosure",
            title: "[High] IMDA Medical Device Advertising Disclosure",
            url: "https://imda.moh.gov.vn/cong-khai-noi-dung-quang-cao",
        },
    ],
    disclaimers: [
        {
            ko: "본 페이지는 2026-02-15 기준 운영 요약이며, 법률자문이 아닙니다.",
            en: "This page is an operational summary as of 2026-02-15 and not legal advice.",
        },
        {
            ko: "제품 등록/수입 실행 전에는 반드시 최신 원문 법령과 해당 절차 페이지의 요구사항을 최종 대조하세요.",
            en: "Before submission/import execution, always cross-check against the latest legal text and procedure page requirements.",
        },
        {
            ko: "리드타임 버퍼와 총비용 추정은 운영 해석(중간 신뢰도)이며, 공식 수수료/법정기한 정보와 구분해서 사용해야 합니다.",
            en: "Lead-time buffers and total-cost estimates are operational interpretations (medium confidence) and should be used separately from official fees/statutory timelines.",
        },
    ],
};
