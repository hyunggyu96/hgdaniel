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
                ko: "1) ?쒗뭹 遺꾨쪟 / 洹쒖젣 寃쎈줈",
                en: "1) Classification / Regulatory Pathway",
            },
            value: {
                ko: "Class A/B/C/D ?꾪뿕??泥닿퀎瑜??곸슜?⑸땲??\n- A/B: '?곸슜 ?쒖? ?좉퀬(Declaration of Applied Standards)' 寃쎈줈\n- C/D: '?좏넻踰덊샇(Registration Number) 諛쒓툒' 寃쎈줈\nDecree 98/2021/ND-CP 諛?媛쒖젙(07/2023, 04/2025, 148/2025) 泥닿퀎 湲곗?.",
                en: "Vietnam uses Class A/B/C/D risk classes.\n- Class A/B: Declaration of Applied Standards pathway\n- Class C/D: Registration Number issuance pathway\nBased on Decree 98/2021/ND-CP and amendments (07/2023, 04/2025, 148/2025).",
            },
            note: {
                ko: "洹쇨굅: Decree 98/2021/ND-CP Article 4, Article 21 諛?媛쒖젙??",
                en: "Source: Decree 98/2021/ND-CP Article 4, Article 21 and amendments.",
            },
        },
        {
            id: "vn_02_applicant_eligibility",
            label: {
                ko: "2) ?좎껌 ?먭꺽 (?꾩? 踰뺤씤/?섏엯??AR)",
                en: "2) Applicant Eligibility (Local Entity / Importer / AR)",
            },
            value: {
                ko: "?좎껌? 踰좏듃????踰뺤쟻 二쇱껜媛 ?섑뻾?댁빞 ?섎ŉ, ?댁쇅 ?쒖“?щ뒗 ?꾩? ?섏엯???먮뒗 ?꾩엫 ?由ъ씤(Authorized Representative)???듯빐 吏꾪뻾?섎뒗 援ъ“媛 ?쇰컲?곸엯?덈떎.\n?섏엯 ???듦??⑹쑝濡??뚯쑀???꾩엫??owner authorization to import) ???섏엯??愿???쒕쪟媛 ?붽뎄?⑸땲??",
                en: "Filings must be made through a legal entity in Vietnam. Foreign manufacturers typically proceed via a local importer or authorized representative.\nFor customs release, importer authorization documents (owner authorization to import) are generally required.",
            },
            note: {
                ko: "洹쇨굅: Decree 98/2021/ND-CP Article 22(?섏엯 ?붽굔), DVC ?덉감蹂??좎껌二쇱껜 洹쒖젙.",
                en: "Source: Decree 98/2021/ND-CP Article 22 (import conditions), applicant entities in DVC procedures.",
            },
        },
        {
            id: "vn_03_dossier_checklist",
            label: {
                ko: "3) ?쒕쪟 泥댄겕由ъ뒪??(?먮낯/怨듭쬆/?곸궗?뺤씤/踰덉뿭)",
                en: "3) Dossier Checklist (Original / Notarization / Legalization / Translation)",
            },
            value: {
                ko: "?듭떖 ?쒕쪟: ?좎껌?? 遺꾨쪟臾몄꽌, CFS ?먮뒗 ?숇벑 ?덇?利앸튃, ISO 13485, LoA, ?쇰꺼/IFU, 湲곗닠臾몄꽌(諛??대떦 ???쒗뿕?먮즺).\n?뺤떇 ?붽굔:\n- ?쇰? 臾몄꽌??怨듭쬆 ?щ낯 ?먮뒗 ?몄쬆 ?щ낯 ?붽뎄\n- ?댁쇅 諛쒗뻾 臾몄꽌???곸궗?뺤씤(Consular legalization) ?붽뎄 議고빆 議댁옱\n- 踰좏듃?⑥뼱 踰덉뿭/怨듭쬆 踰덉뿭 ?붽뎄?????덉쓬\n- ?쒖텧 諛⑹떇? ?꾩옄?ы꽭 + ?붽뎄 ???먮낯/?議곕낯 蹂댁셿",
                en: "Core documents include application form, classification document, CFS or equivalent market authorization proof, ISO 13485, LoA, labels/IFU, technical dossier (and test reports when applicable).\nFormat requirements:\n- Some documents require notarized/certified copies\n- Foreign-issued documents may require consular legalization\n- Vietnamese translation (often notarized) may be required\n- Submission is via e-portal plus originals/certified copies when requested",
            },
            note: {
                ko: "洹쇨굅: Decree 98/2021/ND-CP Article 25, Article 30, Article 32, Article 75. ?꾪룷?ㅽ떚???⑤룆 ?섏슜 ?щ????묒닔湲곌? 理쒖떊 ?댁쁺湲곗? ?뺤씤 ?꾩슂.",
                en: "Source: Decree 98/2021/ND-CP Article 25, Article 30, Article 32, Article 75. Confirm whether apostille-only acceptance is currently allowed by the receiving authority.",
            },
        },
        {
            id: "vn_04_lead_time",
            label: {
                ko: "4) ?ъ궗 ?④퀎蹂?由щ뱶???(?묒닔/蹂댁셿/?뱀씤/?듦?以鍮?",
                en: "4) Lead Time by Stage (Submission / Deficiency / Approval / Customs Prep)",
            },
            value: {
                ko: "怨듭떇 ?덉감 湲곗?(???媛?:\n- A/B ?좉퀬: ?듭긽 3 ?곸뾽???쒕쪟 ?곹빀 ??\n- C/D ?좏넻踰덊샇: ?듭긽 45 ?곸뾽??n- C/D(援???쒖? ?곸슜 ?쇰? 寃쎈줈): ?듭긽 30??n蹂댁셿?붿껌:\n- ?듭긽 ?묒닔 ??40???대궡 蹂댁셿?붿껌 媛??n- 蹂댁셿?쒖텧 湲곌컙 90??理쒕? 5??\n?뱀씤 ??\n- 寃곌낵 怨듭떆/寃뚯떆媛 ?④린(?? 1 ?곸뾽??濡??쒖떆?섎뒗 ?덉감 議댁옱\n?듦? 以鍮??ㅻТ):\n- ?뱀씤踰덊샇 諛섏쁺, ?섏엯?꾩엫???곸뾽?쒕쪟 ?뺥빀 ?먭???蹂꾨룄 ?댁쁺 踰꾪띁(蹂댄넻 ?섏씪~?섏＜) ?꾩슂",
                en: "Typical official timelines:\n- Class A/B declaration: usually 3 working days (if dossier is complete)\n- Class C/D registration number: usually 45 working days\n- Some C/D routes (national-standard based): usually 30 days\nDeficiency handling:\n- Deficiency request can be issued within about 40 days from receipt\n- Applicant correction window: up to 90 days (max 5 rounds)\nAfter approval:\n- Certain procedures show short publication windows (for example 1 working day)\nCustoms prep (operational):\n- Additional buffer is needed for approval-number reflection and importer/customs document alignment",
            },
            note: {
                ko: "洹쇨굅: IMDA DVC ?덉감(2231, 1326, 1301) 諛?Decree 98/2021/ND-CP Article 33(蹂댁셿 泥섎━). ?듦?以鍮?湲곌컙? ?댁쁺 異붿젙移?",
                en: "Source: IMDA DVC procedures (2231, 1326, 1301) and Decree 98/2021/ND-CP Article 33 (deficiency processing). Customs prep duration is an operational estimate.",
            },
        },
        {
            id: "vn_05_cost_breakdown",
            label: {
                ko: "5) 鍮꾩슜 ?몃??댁뿭 (?뺣??섏닔猷???됱닔?섎즺/?쒗뿕쨌踰덉뿭鍮?",
                en: "5) Cost Breakdown (Government / Agency / Testing-Translation)",
            },
            value: {
                ko: "?뺣??섏닔猷?怨듭떇 ?덉감 ?쒓린 ?덉떆):\n- A/B ?좉퀬: 1,000,000 VND (?덉감 1326 ?쒓린)\n- C/D ?좏넻踰덊샇: 6,000,000 VND (?덉감 2231 ?쒓린)\n??됱닔?섎즺:\n- ?꾩? RA ??? 吏덉쓽?묐떟 ??? ?ы꽭 ?댁슜 吏??鍮꾩슜(?낆껜蹂??곸씠)\n?쒗뿕/踰덉뿭/怨듭쬆/?곸궗?뺤씤:\n- ?쒗뭹/?곹빀???쒗뿕, 踰덉뿭 諛?怨듭쬆, ?곸궗?뺤씤 鍮꾩슜 蹂꾨룄",
                en: "Official government fee examples shown in procedures:\n- Class A/B declaration: 1,000,000 VND (procedure 1326)\n- Class C/D registration number: 6,000,000 VND (procedure 2231)\nAgency fee:\n- Local RA service, deficiency response, and portal operation support (vendor-dependent)\nTesting/translation/notarization/legalization:\n- Product/conformity testing, translation-notarization, and consular legalization are separate cost buckets",
            },
            note: {
                ko: "洹쇨굅: IMDA DVC ?덉감 ?섏닔猷???ぉ. ?ㅼ젣 珥앸퉬?⑹? ?쒗뭹援? 蹂댁셿?잛닔, ?쒗뿕 ?꾩슂?깆뿉 ?곕씪 蹂??",
                en: "Source: Fee items shown in IMDA DVC procedures. Total cost varies by device type, number of deficiency rounds, and testing needs.",
            },
        },
        {
            id: "vn_06_validity_renewal",
            label: {
                ko: "6) ?좏슚湲곌컙 / 媛깆떊二쇨린",
                en: "6) Validity / Renewal Cycle",
            },
            value: {
                ko: "?섎즺湲곌린 ?좏넻踰덊샇???먯튃?곸쑝濡?'臾닿린?? ?⑤젰?쇰줈 洹쒖젙?섏뼱 蹂꾨룄 ?뺢린 媛깆떊二쇨린媛 ?녿뒗 援ъ“?낅땲??\n?ㅻ쭔 洹쇨굅臾몄꽌(CFS, ISO, LoA, ?쒖“?뺣낫 ?? 蹂寃승룸쭔猷???蹂寃쎌떊怨?蹂寃쏀뿀媛 ?몃━嫄곌? 諛쒖깮?????덉뼱 ?ъ쟾 ?먭? 由щ뱶????쇰컲?곸쑝濡?60~180?? 愿由ш? ?꾩슂?⑸땲??",
                en: "Medical device registration numbers are generally defined as having indefinite validity, so there is no fixed periodic renewal cycle.\nHowever, changes/expiry of core documents (CFS, ISO, LoA, manufacturing details, etc.) may trigger amendment obligations, so pre-expiry planning lead time (commonly 60-180 days) should be managed.",
            },
            note: {
                ko: "洹쇨굅: Decree 98/2021/ND-CP Article 21(?좏넻踰덊샇 ?좏슚). 60~180?쇱? ?댁쁺 沅뚯옣移?",
                en: "Source: Decree 98/2021/ND-CP Article 21 (registration number validity). 60-180 days is an operational recommendation.",
            },
        },
        {
            id: "vn_07_change_control",
            label: {
                ko: "7) 蹂寃쎄?由?湲곗? (?깅텇쨌?쒖“?뙿룸씪踰???",
                en: "7) Change Control Criteria (Composition / Site / Label, etc.)",
            },
            value: {
                ko: "?깅줉 ??蹂寃쎌? ?곹뼢?꾩뿉 ?곕씪 援щ텇?⑸땲??\n- 以묐???蹂寃??? ?쒖“?? 湲곗닠?뱀꽦, intended use, ?덉쟾???깅뒫 ?곹뼢): 蹂寃쏀뿀媛 ?먮뒗 ?щ벑濡?寃??n- 寃쎈? 蹂寃??? ?쇰? ?쇰꺼/?됱젙?뺣낫): 蹂寃쎌떊怨??먮뒗 ?듭? 寃쎈줈\n?ㅻТ?먯꽌??蹂寃쎌쑀??留ㅽ듃由?뒪? ?밴뎅 吏덉쓽 ?대젰???④퍡 愿由ы빐??蹂댁셿 由ъ뒪?щ? 以꾩씪 ???덉뒿?덈떎.",
                en: "Post-registration changes are handled by impact level.\n- Major changes (for example manufacturing site, technical characteristics, intended use, safety/performance impact): amendment approval or re-registration review\n- Minor changes (for example some labeling/admin details): notification/declaration routes\nOperationally, a change-type matrix plus authority Q&A history should be managed to reduce deficiency risk.",
            },
            note: {
                ko: "洹쇨굅: Decree 98/2021/ND-CP 諛?媛쒖젙?뱀쓽 蹂寃?愿??議고빆. ?몃? 遺꾨쪟??理쒖떊 ?섏쐞吏移??뺤씤 ?꾩슂.",
                en: "Source: Amendment-related provisions in Decree 98/2021/ND-CP and amendments. Confirm detailed categories in latest implementing guidance.",
            },
        },
        {
            id: "vn_08_post_market",
            label: {
                ko: "8) ?ы썑愿由??섎Т",
                en: "8) Post-Market Obligations",
            },
            value: {
                ko: "?꾩닔 ?ы썑愿由?踰붿＜:\n- ?댁긽?щ?/?덉쟾???댁뒋 蹂닿퀬(vigilance)\n- ?쒖젙議곗튂/由ъ퐳 ?섑뻾 諛?怨듬Ц ???n- ?좏넻異붿쟻 諛?遺덈쭔泥섎━ 湲곕줉 蹂닿?\n- ?밴뎅 ?먭? ?鍮?臾몄꽌 蹂닿? 諛??쒖텧 ?묒“\n?ы꽭?곸쑝濡쒕룄 ?뚯닔 怨듭떆/?덉쟾 ?뺣낫媛 蹂꾨룄 寃뚯떆?⑸땲??",
                en: "Core post-market duties include:\n- Vigilance and adverse event reporting\n- Corrective action/recall execution and authority response\n- Distribution traceability and complaint record retention\n- Document retention and submission support for inspections\nRecall and safety notices are also publicly posted on official portals.",
            },
            note: {
                ko: "洹쇨굅: Decree 98/2021/ND-CP Chapter IX(愿由? ?뺣낫, ?뚯닔 愿??, IMDA ?뚯닔/寃쎄퀬 怨듭떆 ?섏씠吏.",
                en: "Source: Decree 98/2021/ND-CP Chapter IX (management, information, recall) and IMDA recall/alert pages.",
            },
        },
        {
            id: "vn_09_labeling_advertising",
            label: {
                ko: "9) ?쇰꺼留?/ 愿묎퀬 洹쒖젙",
                en: "9) Labeling / Advertising Rules",
            },
            value: {
                ko: "?쇰꺼쨌?ъ슜?ㅻ챸? 踰좏듃?⑥뼱 ?붽굔 諛??꾩닔?쒓린 ??ぉ??異⑹”?댁빞 ?섎ŉ, ?섏엯 ?쒗뭹? ?먯궛吏/?섏엯??湲곌린?앸퀎?뺣낫 ?뺥빀?깆씠 以묒슂?⑸땲??\n愿묎퀬???깅줉쨌?좉퀬???곸쓳利?踰붿쐞瑜?踰쀬뼱???쒗쁽, ?ㅼ씤쨌怨쇱옣 ?쒗쁽???쒗븳?⑸땲??\n愿묎퀬 怨듦컻?뺣낫(?뱀씤/?섎━ ?대젰)??IMDA ?ы꽭?먯꽌 議고쉶 媛?ν빀?덈떎.",
                en: "Labels and IFU must satisfy Vietnamese-language requirements and mandatory particulars. For imported products, consistency across origin/importer/device-identification information is critical.\nAdvertising is restricted from claims outside approved scope and from misleading/exaggerated language.\nPublic disclosure of advertising acceptance records can be checked on the IMDA portal.",
            },
            note: {
                ko: "洹쇨굅: Decree 98/2021/ND-CP Article 25(?쇰꺼/IFU ?ы븿 ?붽굔), 愿묎퀬 怨듦컻 ?ы꽭. 湲덉??쒗쁽???몃??먮떒? 理쒖떊 愿묎퀬踰뺣졊/?밴뎅 ?댁꽍 ?숈떆 ?뺤씤 ?꾩슂.",
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
                ko: "???섏씠吏??2026-02-15 湲곗??쇰줈 怨듭떇 ?ы꽭???ы솗?명뻽?듬땲??\n?좊ː???쒖?:\n- High: ?뺣? 踰뺣졊 ?먮Ц(?뺣? 怨듬낫/踰뺣졊 DB)\n- High: 蹂닿굔遺(IMDA) 怨듭떇 ?덉감 ?ы꽭\n- Medium: ?댁쁺 ?댁꽍(由щ뱶???踰꾪띁, 鍮꾩슜 珥앷퀎 異붿젙)\n媛???ぉ note??踰뺣졊/?덉감 踰덊샇瑜?蹂묎린?덉뒿?덈떎.",
                en: "This page was re-checked against official portals as of 2026-02-15.\nReliability standard:\n- High: Government legal originals (official legal DB/gazette)\n- High: MOH (IMDA) official procedure portal\n- Medium: Operational interpretation (buffer lead times, total cost planning)\nEach item note contains the legal/procedure basis.",
            },
        },
        {
            id: "vn_11_registered_product_check",
            label: {
                ko: "11) ?깅줉???쒗뭹 ?뺤씤 諛⑸쾿",
                en: "11) How to Verify Registered Products",
            },
            value: {
                ko: "怨듭떇 ?뺤씤 寃쎈줈:\n- 怨듦났?쒕퉬??寃곌낵(?뱀씤/泥섎━ 寃곌낵): dossier/寃곌낵 怨듭떆 議고쉶\n- 遺꾨쪟寃곌낵 怨듦컻: 遺꾨쪟踰덊샇 諛?遺꾨쪟寃곌낵 議고쉶\n- ?뚯닔/寃쎄퀬 怨듭떆: 由ъ퐳쨌?덉쟾??怨듭? ?뺤씤\n- 愿묎퀬 怨듦컻: ?섎즺湲곌린 愿묎퀬 ?섎━ ?대젰 ?뺤씤\n?ㅻТ ?? ?쒗뭹紐??곷Ц/踰좏듃?⑥뼱), ?쒖“?щ챸, ?좏넻踰덊샇, dossier 肄붾뱶 4媛??ㅼ썙?쒕줈 援먯감寃?됲븯硫??뺥솗?꾧? ?믪뒿?덈떎.",
                en: "Official verification channels:\n- Public service results: approval/processing outcomes by dossier\n- Public classification records: classification numbers and decisions\n- Recall/alert publication: safety and recall notices\n- Advertising disclosure: accepted medical-device advertising records\nOperational tip: Cross-search using 4 keys (product name in EN/VN, manufacturer, registration number, dossier code) for better matching.",
            },
            note: {
                ko: "?꾨옒 'Official Sources' ?뱀뀡???ы꽭 留곹겕?먯꽌 吏곸젒 議고쉶 媛??",
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
            sourceUrl: "https://imda.moh.gov.vn/documents/10182/0/E_1636511534239_98_2021_ND-CP_08112021-signed.pdf/6e96247f-e468-434c-a478-091e7cb159ef",
            summary: {
                ko: "踰좏듃???섎즺湲곌린 愿由?湲곕낯??遺꾨쪟, ?좉퀬/?깅줉, ?섏엯, ?ы썑愿由?.",
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
            sourceUrl: "https://imda.moh.gov.vn/documents/10182/10030594/Nghi%2Bdinh%2B07-2023/99935bb7-b51f-4127-9c6a-58e4b514fbf9",
            summary: {
                ko: "Decree 98 ?쇰? ?덉감/?좎삁/?댁쁺 洹쒖젙 媛쒖젙.",
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
            sourceUrl: "https://imda.moh.gov.vn/documents/10182/10030600/CV042025/7fbafd39-b08f-47a2-8870-11900d37f777",
            summary: {
                ko: "?섎즺湲곌린 愿由?泥닿퀎??異붽? 媛쒖젙 諛섏쁺.",
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
            sourceUrl: "https://imda.moh.gov.vn/web/guest/van-ban-phap-quy",
            summary: {
                ko: "理쒓렐 媛쒖젙???쒗뻾 ?몃??ы빆 ?낅뜲?댄듃).",
                en: "Latest amendment decree updating implementation details.",
            },
        },
        {
            id: "dvc-cd-registration",
            documentNo: "DVC 2231",
            title: "Issuance of registration number for Class C,D imported devices",
            kind: "Portal",
            authority: "IMDA - Ministry of Health",
            sourceUrl: "https://imda.moh.gov.vn/dich-vu-cong",
            summary: {
                ko: "怨듭떇 ?덉감 ?섏씠吏(泥섎━湲곌컙, ?섏닔猷? ?④퀎?뺣낫 ?뺤씤 媛??.",
                en: "Official procedure page with processing time, fees, and step details.",
            },
        },
        {
            id: "dvc-ab-declaration",
            documentNo: "DVC 1326",
            title: "Declaration of applied standards for Class A,B devices",
            kind: "Portal",
            authority: "IMDA - Ministry of Health",
            sourceUrl: "https://imda.moh.gov.vn/web/guest/quyet-dinh-dklh-ttbyt",
            summary: {
                ko: "A/B ?좉퀬 ?덉감(泥섎━湲곌컙 3?? ?섏닔猷???ぉ ?? ?뺤씤.",
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
            url: "https://imda.moh.gov.vn/documents/10182/0/E_1636511534239_98_2021_ND-CP_08112021-signed.pdf/6e96247f-e468-434c-a478-091e7cb159ef",
        },
        {
            id: "src-congbao-07",
            title: "[High] Government Gazette - Decree 07/2023/ND-CP",
            url: "https://imda.moh.gov.vn/documents/10182/10030594/Nghi%2Bdinh%2B07-2023/99935bb7-b51f-4127-9c6a-58e4b514fbf9",
        },
        {
            id: "src-congbao-04",
            title: "[High] Government Gazette - Decree 04/2025/ND-CP",
            url: "https://imda.moh.gov.vn/documents/10182/10030600/CV042025/7fbafd39-b08f-47a2-8870-11900d37f777",
        },
        {
            id: "src-congbao-148",
            title: "[High] Government Gazette - Decree 148/2025/ND-CP",
            url: "https://imda.moh.gov.vn/web/guest/van-ban-phap-quy",
        },
        {
            id: "src-dvc-2231",
            title: "[High] IMDA DVC Procedure 2231 (Class C,D imported registration)",
            url: "https://imda.moh.gov.vn/dich-vu-cong",
        },
        {
            id: "src-dvc-1326",
            title: "[High] IMDA DVC Procedure 1326 (Class A,B declaration)",
            url: "https://imda.moh.gov.vn/web/guest/quyet-dinh-dklh-ttbyt",
        },
        {
            id: "src-dvc-1301",
            title: "[High] IMDA DVC Procedure 1301 (Class C,D standard-based route)",
            url: "https://imda.moh.gov.vn/web/guest/van-ban-phap-quy",
        },
        {
            id: "src-public-results",
            title: "[High] IMDA Public Service Results (approval/publication check)",
            url: "https://imda.moh.gov.vn/web/guest/quyet-dinh-dklh-ttbyt",
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
            url: "https://imda.moh.gov.vn/cong-khai-nd-ht-quang-cao-ttbyt",
        },
    ],
    disclaimers: [
        {
            ko: "蹂??섏씠吏??2026-02-15 湲곗? ?댁쁺 ?붿빟?대ŉ, 踰뺣쪧?먮Ц???꾨떃?덈떎.",
            en: "This page is an operational summary as of 2026-02-15 and not legal advice.",
        },
        {
            ko: "?쒗뭹 ?깅줉/?섏엯 ?ㅽ뻾 ?꾩뿉??諛섎뱶??理쒖떊 ?먮Ц 踰뺣졊怨??대떦 ?덉감 ?섏씠吏???붽뎄?ы빆??理쒖쥌 ?議고븯?몄슂.",
            en: "Before submission/import execution, always cross-check against the latest legal text and procedure page requirements.",
        },
        {
            ko: "由щ뱶???踰꾪띁? 珥앸퉬??異붿젙? ?댁쁺 ?댁꽍(以묎컙 ?좊ː???대ŉ, 怨듭떇 ?섏닔猷?踰뺤젙湲고븳 ?뺣낫? 援щ텇?댁꽌 ?ъ슜?댁빞 ?⑸땲??",
            en: "Lead-time buffers and total-cost estimates are operational interpretations (medium confidence) and should be used separately from official fees/statutory timelines.",
        },
    ],
};

