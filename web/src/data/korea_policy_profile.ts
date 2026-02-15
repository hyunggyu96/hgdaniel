import { CountryPolicyProfile } from "@/data/policyTypes";

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
                ko: "의료기기는 1~4등급(위해도 기반)으로 분류됩니다.\n- 1등급: 신고 중심\n- 2~4등급: 허가/인증 대상(제품군·제조/수입 형태에 따라 경로 상이)\n일반적으로 제조업/수입업 허가(또는 신고) + 품목 절차를 함께 충족해야 합니다.",
                en: "Medical devices are classified into Class I-IV based on risk.\n- Class I: declaration-focused\n- Class II-IV: license/certification paths (vary by product and manufacturing/import model)\nIn practice, business establishment requirements and product procedures must both be satisfied.",
            },
            note: { ko: "근거: 의료기기법 및 식약처 고시 체계.", en: "Source: Medical Device Act and MFDS notifications." },
        },
        {
            id: "kr_02_applicant_eligibility",
            label: { ko: "2) 신청 자격 (국내 법인/수입자/대리인)", en: "2) Applicant Eligibility (Local Entity / Importer / Agent)" },
            value: {
                ko: "해외 제조사는 국내 수입업체 또는 법적 책임주체를 통해 품목 허가/인증/신고를 진행하는 구조가 일반적입니다.\n통관 및 사후관리 책임은 국내 주체 기준으로 관리됩니다.",
                en: "Foreign manufacturers typically proceed through a Korean importer or a domestic legal responsible entity for product approval/certification/declaration.\nCustoms and post-market obligations are managed through the domestic responsible entity.",
            },
            note: { ko: "근거: 의료기기법상 제조/수입/판매 관련 요건.", en: "Source: business and product requirements under Korean medical-device regulations." },
        },
        {
            id: "kr_03_dossier_checklist",
            label: { ko: "3) 서류 체크리스트 (원본/공증/아포스티유/번역)", en: "3) Dossier Checklist (Original / Notarization / Apostille / Translation)" },
            value: {
                ko: "기본 패키지: 신청서, 기술문서, 성능/안전 자료, 품질시스템 관련 문서, 위임문서(해당 시), 라벨/사용설명서.\n형식 요건:\n- 공증·원본대조·번역 요건은 제출처/품목별로 상이\n- 해외 발행 문서는 아포스티유/영사확인 요구 가능\n- 국문 번역본 정확성과 원문 일치성이 핵심 심사 포인트",
                en: "Typical package: application form, technical dossier, safety/performance evidence, quality-system documents, authorization docs (if applicable), label/IFU.\nFormat requirements:\n- notarization/original-certified/translation requirements vary by pathway and product\n- foreign-issued documents may require apostille/consular legalization\n- Korean translation consistency is a key review point",
            },
            note: { ko: "근거: 품목별 허가·인증·신고 민원서식 및 심사 가이드.", en: "Source: pathway-specific application forms and review guides." },
        },
        {
            id: "kr_04_lead_time",
            label: { ko: "4) 심사 단계별 리드타임", en: "4) Lead Time by Stage" },
            value: {
                ko: "실무 리드타임은 품목 등급, 기술문서 난이도, 보완 빈도에 따라 달라집니다.\n일반 운영 구간:\n- 접수/형식검토\n- 기술심사/보완요청\n- 허가/인증 결과 통보\n- 통관/출시 준비\n보완 요청 발생 시 전체 일정이 크게 늘어날 수 있어 사전 갭분석이 중요합니다.",
                en: "Lead time depends on class, technical complexity, and deficiency frequency.\nTypical stages:\n- submission/formal review\n- technical review/deficiency cycle\n- approval/certification notification\n- customs/commercial launch preparation\nDeficiency rounds can significantly extend total timeline, so pre-gap analysis is critical.",
            },
            note: { ko: "근거: 식약처·심사기관 공식 민원 절차 및 처리기간 안내.", en: "Source: official MFDS and designated review-body procedures." },
        },
        {
            id: "kr_05_cost_breakdown",
            label: { ko: "5) 비용 세부내역", en: "5) Cost Breakdown" },
            value: {
                ko: "비용은 최소 3개 버킷으로 분리 관리해야 합니다.\n- 정부수수료(허가/인증/신고)\n- 대행수수료(RA 준비, 보완 대응)\n- 시험/번역/공증/라벨링 수정 비용\n제품군별 요구시험 여부가 총비용을 크게 좌우합니다.",
                en: "Costs should be managed in at least three buckets:\n- government fees (approval/certification/declaration)\n- agency fees (RA preparation and deficiency response)\n- testing/translation/notarization/label update costs\nRequired testing scope is often the largest cost driver.",
            },
            note: { ko: "근거: 민원 수수료 체계 + 운영비용 분해 기준.", en: "Source: official fee schedules + operational cost decomposition." },
        },
        {
            id: "kr_06_validity_renewal",
            label: { ko: "6) 유효기간 / 갱신주기", en: "6) Validity / Renewal Cycle" },
            value: {
                ko: "허가/인증/신고의 유효 및 유지요건은 제도별로 차이가 있습니다.\n정기 갱신이 없는 경우에도 제조소/품질문서/표시기재 변경 등 유지관리 항목을 지속 점검해야 합니다.",
                en: "Validity and maintenance obligations vary by approval/certification/declaration regime.\nEven where no periodic renewal is required, ongoing control is needed for manufacturing site, quality documents, and labeling changes.",
            },
            note: { ko: "근거: 의료기기법령 및 관련 고시의 유지관리 요건.", en: "Source: maintenance obligations under Korean medical-device laws and notifications." },
        },
        {
            id: "kr_07_change_control",
            label: { ko: "7) 변경관리 기준", en: "7) Change Control Criteria" },
            value: {
                ko: "성능·안전성 영향이 큰 변경(원재료/구조/제조소/사용목적)은 변경허가 또는 재심사 대상이 될 수 있습니다.\n경미 변경(행정·표기 일부)은 변경보고/신고 경로로 처리되는 경우가 있습니다.\n변경 영향도 매트릭스를 내부 SOP로 고정하는 것이 필수입니다.",
                en: "High-impact changes (materials/design/site/intended use) may require amendment approval or re-review.\nMinor administrative/label updates may be handled through notification paths.\nA fixed internal change-impact matrix in SOP is essential.",
            },
            note: { ko: "근거: 변경허가·변경보고 관련 식약처 고시/가이드.", en: "Source: MFDS notifications and guidance on amendment handling." },
        },
        {
            id: "kr_08_post_market",
            label: { ko: "8) 사후관리 의무", en: "8) Post-Market Obligations" },
            value: {
                ko: "사후관리 핵심:\n- 이상사례 보고\n- 시정조치/회수\n- 추적관리/기록보관\n- 점검 대응\n품목 특성에 따라 추적관리 및 UDI 관련 관리 요구가 강화될 수 있습니다.",
                en: "Post-market essentials:\n- adverse event reporting\n- corrective action/recall\n- traceability/record retention\n- inspection response\nDepending on product type, traceability and UDI obligations can be stricter.",
            },
            note: { ko: "근거: 의료기기법상 회수·보고·추적관리 규정.", en: "Source: recall/reporting/traceability rules in Korean medical-device regulations." },
        },
        {
            id: "kr_09_labeling_advertising",
            label: { ko: "9) 라벨링 / 광고 규정", en: "9) Labeling / Advertising Rules" },
            value: {
                ko: "표시기재는 필수 항목 누락이 없어야 하며, 광고는 허가사항 범위를 벗어난 표현·오인 가능 표현을 금지합니다.\n온·오프라인 홍보물은 사전 법무/RA 리뷰 체계를 갖추는 것이 안전합니다.",
                en: "Labeling must include mandatory particulars without omission.\nAdvertising must avoid off-label or misleading claims beyond approved scope.\nA pre-release legal/RA review process is strongly recommended for all promotional materials.",
            },
            note: { ko: "근거: 표시기재/광고 관련 의료기기법 및 하위규정.", en: "Source: labeling and advertising provisions under Korean medical-device laws." },
        },
        {
            id: "kr_10_update_and_sources",
            label: { ko: "10) 최종 업데이트 / 공식 출처 / 신뢰도", en: "10) Last Update / Official Sources / Reliability" },
            value: {
                ko: "본 페이지는 2026-02-15 기준으로 공식 포털을 재확인했습니다.\n신뢰도 원칙:\n- High: 법제처/식약처 원문 및 공식 포털\n- Medium: 운영 해석(비용·리드타임 버퍼)",
                en: "This page was re-checked against official portals as of 2026-02-15.\nReliability standard:\n- High: legal originals and official MFDS/government portals\n- Medium: operational interpretation (cost and lead-time buffer)",
            },
        },
        {
            id: "kr_11_registered_product_check",
            label: { ko: "11) 등록된 제품 확인", en: "11) Registered Product Verification" },
            value: {
                ko: "공식 조회 채널:\n- 의료기기 통합정보시스템(허가/인증/신고 정보)\n- UDI 포털(식별/유통정보)\n- 의약품안전나라(일부 통합 조회)\n조회 시 제품명, 업체명, 모델명, 허가번호를 교차검색하면 정확도가 높습니다.",
                en: "Official channels:\n- Medical Device Integrated Information System (approval/certification/declaration)\n- UDI portal (identification/distribution information)\n- NEDRUG portal (integrated lookups)\nCross-searching by product name, company, model, and license number improves accuracy.",
            },
            note: { ko: "아래 Official Sources 링크에서 직접 조회 가능.", en: "Direct links are provided in Official Sources below." },
        },
    ],
    keyRegulations: [
        {
            id: "kr-medical-device-act",
            documentNo: "의료기기법",
            title: "Medical Device Act (Korea)",
            kind: "Law",
            authority: "Korea Ministry of Government Legislation",
            sourceUrl: "https://www.law.go.kr/",
            summary: {
                ko: "국내 의료기기 인허가·제조·수입·사후관리의 기본법.",
                en: "Primary legal basis for approval, manufacturing/import, and post-market control.",
            },
        },
        {
            id: "kr-mfds-main",
            documentNo: "식약처",
            title: "Ministry of Food and Drug Safety (MFDS)",
            kind: "Portal",
            authority: "MFDS",
            sourceUrl: "https://www.mfds.go.kr/",
            summary: {
                ko: "공식 고시/민원/공지 기준 포털.",
                en: "Official portal for notices, procedures, and announcements.",
            },
        },
        {
            id: "kr-emedi",
            documentNo: "의료기기 통합정보시스템",
            title: "Medical Device Integrated Information System",
            kind: "Portal",
            authority: "MFDS",
            sourceUrl: "https://emedi.mfds.go.kr/",
            summary: {
                ko: "품목 등록 및 정보 조회 핵심 시스템.",
                en: "Core system for registration and medical-device information lookup.",
            },
        },
    ],
    sources: [
        { id: "kr-src-law", title: "[High] 국가법령정보센터 (법제처)", url: "https://www.law.go.kr/" },
        { id: "kr-src-mfds", title: "[High] 식품의약품안전처", url: "https://www.mfds.go.kr/" },
        { id: "kr-src-emedi", title: "[High] 의료기기 통합정보시스템", url: "https://emedi.mfds.go.kr/" },
        { id: "kr-src-udi", title: "[High] UDI 포털", url: "https://udiportal.mfds.go.kr/" },
        { id: "kr-src-nedrug", title: "[High] 의약품안전나라", url: "https://nedrug.mfds.go.kr/" },
    ],
    disclaimers: [
        { ko: "본 페이지는 운영 요약이며 법률자문이 아닙니다.", en: "This page is an operational summary and not legal advice." },
        { ko: "실제 제출 전에는 최신 법령 원문과 식약처 공지를 반드시 재확인하세요.", en: "Before submission, always re-check the latest legal originals and MFDS notices." },
    ],
};
