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
    udi: {
        id: "kr-udi",
        title: "UDI 포털",
        url: "https://udiportal.mfds.go.kr/",
        accessedOn: "2026-02-15",
    },
    nedrug: {
        id: "kr-nedrug",
        title: "의약품안전나라",
        url: "https://nedrug.mfds.go.kr/",
        accessedOn: "2026-02-15",
    },
};

export const koreaPolicyProfile: CountryPolicyProfile = {
    countryId: "kr",
    countryName: {
        ko: "대한민국",
        en: "South Korea",
    },
    lastUpdated: "2026-02-15",
    sourceLastCheckedAt: "2026-02-15",
    facts: [
        {
            id: "kr_01_classification_pathway",
            label: { ko: "1) 제품 분류 / 규제 경로", en: "1) Classification / Regulatory Pathway" },
            value: {
                ko: "의료기기는 위해도 기반 1~4등급 체계를 사용합니다. 일반적으로 1등급은 신고 중심, 2~4등급은 허가/인증 중심으로 운영됩니다.",
                en: "Korea uses a risk-based Class I-IV system. In general, Class I is declaration-oriented, while Class II-IV follow approval/certification paths.",
            },
            note: {
                ko: "실제 경로는 품목군, 제조/수입 형태, 제출자료 범위에 따라 달라질 수 있습니다.",
                en: "Actual pathway may vary by product group, manufacturing/import model, and dossier scope.",
            },
            confidence: "high",
            references: [
                {
                    ...REF.lawKr,
                    citation: { ko: "의료기기법 및 하위 규정 체계", en: "Medical Device Act and subordinate regulations" },
                },
                REF.mfds,
            ],
        },
        {
            id: "kr_02_applicant_eligibility",
            label: { ko: "2) 신청 자격 (국내 법인/수입자/대리인)", en: "2) Applicant Eligibility" },
            value: {
                ko: "해외 제조사는 통상 국내 수입자 또는 국내 책임 주체를 통해 품목 절차를 진행합니다.",
                en: "Foreign manufacturers generally proceed through a local importer or a domestic legal responsible entity.",
            },
            confidence: "high",
            references: [
                {
                    ...REF.lawKr,
                    citation: { ko: "제조/수입 관련 기본 요건", en: "Base requirements for manufacturing/import entities" },
                },
                REF.mfds,
            ],
        },
        {
            id: "kr_03_dossier_checklist",
            label: { ko: "3) 서류 체크리스트 (원본/공증/아포스티유/번역)", en: "3) Dossier Checklist" },
            value: {
                ko: "신청서, 기술문서, 안전성/성능 자료, 라벨/사용설명서, 위임서류(해당 시) 등이 기본입니다. 문서 형식요건(공증·번역·아포스티유)은 절차별로 달라집니다.",
                en: "Typical dossier includes application form, technical documents, safety/performance evidence, label/IFU, and authorization documents where applicable. Notarization/translation/apostille requirements vary by path.",
            },
            confidence: "medium",
            references: [
                REF.mfds,
                {
                    ...REF.emedi,
                    citation: { ko: "민원서식 및 제출 가이드 확인", en: "Check submission forms and filing guides" },
                },
            ],
        },
        {
            id: "kr_04_lead_time",
            label: { ko: "4) 심사 단계별 리드타임", en: "4) Lead Time by Stage" },
            value: {
                ko: "일반 단계는 접수→기술검토→보완요청→결과통보→출시준비입니다. 보완 발생 시 전체 기간이 크게 늘어날 수 있습니다.",
                en: "Typical stages are submission -> technical review -> deficiency cycle -> decision -> launch prep. Deficiencies can materially extend total timeline.",
            },
            note: {
                ko: "법정 처리기간과 실제 운영기간은 다를 수 있어 별도 버퍼 운영이 필요합니다.",
                en: "Statutory timelines and operational timelines may differ, so buffer planning is recommended.",
            },
            confidence: "medium",
            references: [REF.mfds, REF.emedi],
        },
        {
            id: "kr_05_cost_breakdown",
            label: { ko: "5) 비용 세부내역", en: "5) Cost Breakdown" },
            value: {
                ko: "정부수수료, 대행수수료, 시험/번역/공증비를 분리해 관리해야 합니다.",
                en: "Costs should be separated into government fees, agency fees, and testing/translation/notarization costs.",
            },
            confidence: "medium",
            references: [REF.mfds, REF.emedi],
        },
        {
            id: "kr_06_validity_renewal",
            label: { ko: "6) 유효기간 / 갱신주기", en: "6) Validity / Renewal Cycle" },
            value: {
                ko: "제도 유형별로 유효 및 유지 의무가 다릅니다. 정기 갱신이 없더라도 변경관리·사후관리 의무는 유지됩니다.",
                en: "Validity and maintenance obligations differ by regime. Even without periodic renewal, amendment and post-market obligations remain.",
            },
            confidence: "medium",
            references: [REF.lawKr, REF.mfds],
        },
        {
            id: "kr_07_change_control",
            label: { ko: "7) 변경관리 기준", en: "7) Change Control Criteria" },
            value: {
                ko: "제조소, 기술특성, 사용목적 등 중대한 변경은 변경허가/재심사가 필요할 수 있습니다.",
                en: "Major changes such as site, technical characteristics, and intended use may require amendment approval/re-review.",
            },
            confidence: "high",
            references: [REF.lawKr, REF.mfds],
        },
        {
            id: "kr_08_post_market",
            label: { ko: "8) 사후관리 의무", en: "8) Post-Market Obligations" },
            value: {
                ko: "이상사례 보고, 시정조치/회수, 추적관리, 기록보관, 점검 대응이 핵심입니다.",
                en: "Core obligations include adverse event reporting, corrective action/recall, traceability, record retention, and inspection response.",
            },
            confidence: "high",
            references: [REF.lawKr, REF.mfds],
        },
        {
            id: "kr_09_labeling_advertising",
            label: { ko: "9) 라벨링 / 광고 규정", en: "9) Labeling / Advertising Rules" },
            value: {
                ko: "표시기재 필수 항목 준수 및 허가 범위를 벗어난 광고표현 제한이 핵심입니다.",
                en: "Mandatory labeling compliance and restriction of off-scope/misleading advertising claims are key requirements.",
            },
            confidence: "high",
            references: [REF.lawKr, REF.mfds],
        },
        {
            id: "kr_10_update_and_sources",
            label: { ko: "10) 최종 업데이트 / 공식 출처 / 신뢰도", en: "10) Last Update / Official Sources / Reliability" },
            value: {
                ko: "본 페이지는 2026-02-15 기준으로 공식 출처를 재확인했습니다. High는 원문/공식포털 근거, Medium은 운영 해석 항목입니다.",
                en: "This page was re-checked on 2026-02-15. High means legal originals/official portals; Medium indicates operational interpretation.",
            },
            confidence: "high",
            references: [REF.lawKr, REF.mfds, REF.emedi],
        },
        {
            id: "kr_11_registered_product_check",
            label: { ko: "11) 등록된 제품 확인", en: "11) Registered Product Verification" },
            value: {
                ko: "의료기기 통합정보시스템, UDI 포털, 의약품안전나라에서 제품명/업체명/모델명/허가번호를 교차 조회해 확인합니다.",
                en: "Verify via EMEDI, UDI portal, and NEDRUG by cross-searching product name, company, model, and license number.",
            },
            confidence: "high",
            references: [REF.emedi, REF.udi, REF.nedrug],
        },
    ],
    keyRegulations: [
        {
            id: "kr-medical-device-act",
            documentNo: "의료기기법",
            title: "Medical Device Act (Korea)",
            kind: "Law",
            authority: "Korea Ministry of Government Legislation",
            sourceUrl: REF.lawKr.url,
            summary: {
                ko: "국내 의료기기 인허가·제조·수입·사후관리의 기본법.",
                en: "Primary legal framework for approval, manufacturing/import, and post-market control.",
            },
        },
        {
            id: "kr-mfds-main",
            documentNo: "식약처",
            title: "Ministry of Food and Drug Safety (MFDS)",
            kind: "Portal",
            authority: "MFDS",
            sourceUrl: REF.mfds.url,
            summary: {
                ko: "공식 고시/민원/공지 포털.",
                en: "Official portal for notices, procedures, and announcements.",
            },
        },
        {
            id: "kr-emedi",
            documentNo: "EMEDI",
            title: "Medical Device Integrated Information System",
            kind: "Portal",
            authority: "MFDS",
            sourceUrl: REF.emedi.url,
            summary: {
                ko: "등록 제품 및 품목 정보 조회 핵심 시스템.",
                en: "Core system for registered-product and item lookup.",
            },
        },
    ],
    sources: [
        { id: "kr-src-law", title: "[High] 국가법령정보센터", url: REF.lawKr.url, accessedOn: REF.lawKr.accessedOn },
        { id: "kr-src-mfds", title: "[High] 식품의약품안전처", url: REF.mfds.url, accessedOn: REF.mfds.accessedOn },
        { id: "kr-src-emedi", title: "[High] 의료기기 통합정보시스템", url: REF.emedi.url, accessedOn: REF.emedi.accessedOn },
        { id: "kr-src-udi", title: "[High] UDI 포털", url: REF.udi.url, accessedOn: REF.udi.accessedOn },
        { id: "kr-src-nedrug", title: "[High] 의약품안전나라", url: REF.nedrug.url, accessedOn: REF.nedrug.accessedOn },
    ],
    disclaimers: [
        { ko: "본 페이지는 운영 요약이며 법률자문이 아닙니다.", en: "This page is an operational summary and not legal advice." },
        { ko: "실제 신청 전에는 최신 법령 원문과 식약처 공지를 반드시 재확인하세요.", en: "Before filing, always verify the latest legal originals and MFDS notices." },
    ],
};

