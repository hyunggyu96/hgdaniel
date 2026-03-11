export const translations = {
  ko: {
    // Tabs
    tab_news: "뉴스",
    tab_insights: "인사이트",
    tab_company: "기업",
    tab_calender: "달력",
    tab_more: "더보기",

    // Nav
    nav_news: "AI 뉴스피드",
    nav_insights: "인사이트 & 리서치",
    nav_company: "기업 브리핑",
    nav_policy: "정책 & 규제",
    nav_conferences: "글로벌 컨퍼런스",
    nav_about: "서비스 소개",
    nav_revenue: "매출 현황",

    // News
    news_section_title: "AI 뉴스피드",
    news_section_desc: "AI-Powered Analysis",
    news_overview: "종합 개요",
    news_categories: "카테고리",
    news_collections: "북마크",

    // Insights
    insights_title: "인사이트 & 리서치",
    insights_desc: "에스테틱 메디컬 연구 데이터베이스",
    insights_total_papers: "총 {count}건의 논문이 수록되어 있습니다",
    insights_search_placeholder: "제목 또는 초록 검색...",
    insights_all_topics: "모든 주제",
    insights_loading: "연구 논문 불러오는 중...",
    insights_no_papers: "검색된 논문이 없습니다.",
    insights_read: "데이터 보기",
    insights_error: "논문을 불러오지 못했습니다.",
    insights_previous: "이전",
    insights_next: "다음",
    insights_page_info: "페이지",
    insights_page_of: "/",

    // Revenue
    revenue_header: "매출 현황",
    revenue_desc: "전체 기업 매출 및 영업이익 비교",

    // Company
    company_header: "기업 브리핑",
    company_desc: "주요 에스테틱 기업 및 시장 성과 개요",
    company_korean: "한국",
    company_global: "글로벌",
    company_cards: "카드",
    company_revenue: "매출",

    // Policy
    policy_title: "정책 & 규제",
    policy_desc: "아시아 태평양 13개국 규제 동향 및 정책 분석",

    // About
    about_mission_title: "Aesthetic Intelligence",
    about_mission_desc:
      "글로벌 에스테틱 메디컬 산업을 위한 최고의 데이터 터미널. 실시간 인텔리전스, 규제 인사이트, 시장 데이터를 제공합니다.",
    about_card_news: "실시간 뉴스",
    about_card_news_desc:
      "글로벌 산업 뉴스를 집계하여 시장 트렌드를 선도하십시요.",
    about_card_data: "데이터 & 분석",
    about_card_data_desc:
      "주요 플레이어들의 재무 성과와 시장 점유율을 심층 분석합니다.",
    about_card_policy: "정책 & RA",
    about_card_policy_desc:
      "13개 아시아 태평양 국가의 복잡한 규제 환경을 탐색합니다.",

    // More
    more_title: "더보기",
    more_language: "언어",
    more_theme: "테마",
    more_theme_light: "라이트",
    more_theme_dark: "다크",
    more_theme_system: "시스템",

    // Common
    loading: "로딩 중...",
    search: "검색...",
    pull_to_refresh: "당겨서 새로고침",
    retry: "재시도",
    error_loading: "데이터를 불러오지 못했습니다",
  },
  en: {
    tab_news: "News",
    tab_insights: "Insights",
    tab_company: "Companies",
    tab_calender: "Calendar",
    tab_more: "More",

    nav_news: "AI Newsfeed",
    nav_insights: "Insights & Research",
    nav_company: "Company Brief",
    nav_policy: "Policy & RA",
    nav_conferences: "Global Conferences",
    nav_about: "About",
    nav_revenue: "Revenue",

    news_section_title: "AI NEWSFEED",
    news_section_desc: "AI-Powered Analysis",
    news_overview: "Overview",
    news_categories: "Categories",
    news_collections: "Collections",

    insights_title: "Insights & Research",
    insights_desc: "Aesthetic medicine research database",
    insights_total_papers: "{count} research papers in database",
    insights_search_placeholder: "Search title or abstract...",
    insights_all_topics: "All Topics",
    insights_loading: "Loading research papers...",
    insights_no_papers: "No papers found.",
    insights_read: "Read Data",
    insights_error: "Failed to load papers.",
    insights_previous: "Previous",
    insights_next: "Next",
    insights_page_info: "Page",
    insights_page_of: "of",

    revenue_header: "Revenue Overview",
    revenue_desc: "Company revenue and operating profit comparison",

    company_header: "Company Brief",
    company_desc:
      "Overview of key aesthetic medicine companies and their market performance.",
    company_korean: "Korean",
    company_global: "Global",
    company_cards: "Cards",
    company_revenue: "Revenue",

    policy_title: "Policy & RA",
    policy_desc: "Regulatory trends and policy analysis for 13 APAC countries",

    about_mission_title: "Aesthetic Intelligence",
    about_mission_desc:
      "The premier data terminal for the global aesthetic medicine industry. We provide real-time intelligence, regulatory insights, and market data.",
    about_card_news: "Real-time News",
    about_card_news_desc:
      "Aggregating global industry news to keep you ahead of market trends.",
    about_card_data: "Data & Analytics",
    about_card_data_desc:
      "Deep dive into financial performance and market share of top players.",
    about_card_policy: "Policy & RA",
    about_card_policy_desc:
      "Navigating complex regulatory landscapes across 13 APAC countries.",

    more_title: "More",
    more_language: "Language",
    more_theme: "Theme",
    more_theme_light: "Light",
    more_theme_dark: "Dark",
    more_theme_system: "System",

    loading: "Loading...",
    search: "Search...",
    pull_to_refresh: "Pull to refresh",
    retry: "Retry",
    error_loading: "Failed to load data",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];
