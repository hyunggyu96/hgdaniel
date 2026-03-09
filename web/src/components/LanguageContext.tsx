"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ko' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
    ko: {
        // Nav
        nav_news: 'AI 뉴스피드',
        nav_insights: '인사이트 & 리서치',
        nav_company: '기업 브리핑',
        nav_policy: '정책 & 규제',
        nav_conferences: '글로벌 컨퍼런스',
        nav_about: '서비스 소개',
        nav_revenue: '매출 현황',

        // NewsList
        news_section_title: 'MARKET INTELLIGENCE', // Exception
        news_section_desc: 'AI-Powered Analysis', // Exception

        // Insights
        insights_title: '인사이트 & 리서치',
        insights_desc: '에스테틱 메디컬 연구 데이터베이스',
        insights_total_papers: '총 {count}건의 논문이 수록되어 있습니다',
        insights_search_placeholder: '제목 또는 초록 검색...',
        insights_filter_topic: '주제별 필터...',
        insights_all_topics: '모든 주제',
        insights_loading: '연구 논문 불러오는 중...',
        insights_no_papers: '검색된 논문이 없습니다.',
        insights_no_papers_hint: '필터를 조정하거나 데이터 수집 스크립트를 실행해 보세요.',
        insights_read: '데이터 보기',
        insights_error: '논문을 불러오지 못했습니다.',
        insights_previous: '이전',
        insights_next: '다음',
        insights_page_info: '페이지',
        insights_page_of: '/',

        // Revenue
        revenue_header: '매출 현황',
        revenue_desc: '전체 기업 매출 및 영업이익 비교',

        // Company
        company_header: '기업 브리핑',
        company_desc: '주요 에스테틱 기업 및 시장 성과 개요',

        // Policy
        policy_title: '정책 & 규제',
        policy_desc: '아시아 태평양 13개국 규제 동향 및 정책 분석',
        policy_info: '각 국가를 클릭하여 상세 규제 정보 및 등록 가이드를 확인하세요.',

        // About
        about_mission_title: 'Aesthetic Intelligence', // Exception
        about_mission_desc: '글로벌 에스테틱 메디컬 산업을 위한 최고의 데이터 터미널. 실시간 인텔리전스, 규제 인사이트, 시장 데이터를 제공합니다.',
        about_card_news: '실시간 뉴스',
        about_card_news_desc: '글로벌 산업 뉴스를 집계하여 시장 트렌드를 선도하십시요.',
        about_card_data: '데이터 & 분석',
        about_card_data_desc: '주요 플레이어들의 재무 성과와 시장 점유율을 심층 분석합니다.',
        about_card_policy: '정책 & RA',
        about_card_policy_desc: '13개 아시아 태평양 국가의 복잡한 규제 환경을 탐색합니다.',
        about_contact: '문의하기',
        about_contact_desc: '파트너십 문의 및 API 접근 요청.',

        // Sidebar
        sidebar_watchlist: '분야별 뉴스',
        sidebar_overview: '종합 개요',
        sidebar_collections: '북마크',
        sidebar_feedback: '피드백',
        sidebar_keyword_suggest: '키워드 추천/제안',
        sidebar_live_monitoring: '실시간 모니터링',
        sidebar_tracking: '173개 의료 미용 분야 실시간 AI 분석 중',

        // Common
        loading: '로딩 중...',
        search: '검색',
        loading_news: '뉴스 불러오는 중...',
        failed_news: '뉴스 로드 실패',
        retry: '재시도',

        // Ask AI
        ask_ai_tab_search: '논문 검색',
        ask_ai_tab_ai: 'AI에게 물어보기',
        ask_ai_title: 'AI에게 물어보기',
        ask_ai_desc: '논문과 파일을 기반으로 AI가 답변합니다',
        ask_ai_select_papers: '논문 선택',
        ask_ai_max_papers: '최대 20편',
        ask_ai_papers_selected: '편 선택됨',
        ask_ai_search_papers: '컨텍스트에 추가할 논문을 검색하세요',
        ask_ai_add_papers: '논문 컨텍스트에 추가',
        ask_ai_processing: '처리 중...',
        ask_ai_upload_files: '파일 업로드',
        ask_ai_drop_files: '파일을 여기에 드롭하거나 클릭하여 선택',
        ask_ai_sources: '컨텍스트 소스',
        ask_ai_no_sources: '아직 추가된 소스가 없습니다',
        ask_ai_papers: '논문',
        ask_ai_files: '파일',
        ask_ai_ready: '컨텍스트가 로드되었습니다! 논문과 파일에 대해 질문하세요.',
        ask_ai_no_context: '먼저 논문을 추가하거나 파일을 업로드한 후 질문하세요.',
        ask_ai_add_context: '논문 또는 파일을 추가하면 AI 채팅이 활성화됩니다',
        ask_ai_placeholder: '논문에 대해 질문하세요...',
        ask_ai_thinking: '생각 중...',

        // Tier
        tier_free: '무료',
        tier_pro: '프로',
        tier_enterprise: '엔터프라이즈',
        tier_locked_title: '프리미엄 기능',
        tier_locked_desc: '이 기능은 Pro 이상 플랜에서 사용할 수 있습니다.',
        tier_required: '플랜 필요',
        tier_upgrade: '업그레이드',
        tier_current: '현재 플랜',
        tier_news_limited: '최근 3일간의 뉴스만 표시됩니다.',
        tier_news_upgrade: '전체 뉴스를 보려면 Pro로 업그레이드하세요.',
        tier_login_required: '로그인이 필요합니다.',

        // Category Tabs
        tabs_overview: '전체',
        tabs_collections: '북마크',
        tabs_suggest: '키워드 제안',
        card_view_all: '전체 보기',
        card_no_articles: '기사 없음',
        trend_title: '키워드 트렌드',
        trend_7d: '7일',
        display_classic: '과거 뉴스피드',

        // Auth & Privacy
        auth_email: '이메일',
        auth_birth_year: '생년',
        auth_agree_all: '모든 약관에 동의합니다.',
        auth_agree_terms: '이용약관 동의',
        auth_agree_privacy: '개인정보처리방침 동의',
        auth_required: '(필수)',
        auth_check_username: '중복확인',
        auth_username_available: '사용 가능한 아이디입니다.',
        auth_username_taken: '이미 사용 중인 아이디입니다.',
        auth_send_code: '인증',
        auth_code_sent: '인증 코드가 전송되었습니다.',
        auth_code_placeholder: '인증 코드 6자리',
        auth_email_verified: '인증 완료',
        auth_pw_hint: '8자 이상, 영문 대소문자 및 특수문자 포함.',
        auth_username_hint: '* 아이디는 영문 소문자로 저장됩니다.',
        auth_birth_hint: '* 사용자 평균 연령대 통계에 사용됩니다.',
        privacy_title: '개인정보 처리방침',

        // Account Recovery
        recover_title: '계정 찾기',
        recover_desc: '가입 시 사용한 아이디 또는 이메일을 입력하세요',
        recover_identifier_label: '아이디 또는 이메일',
        recover_send: '계정 찾기',
        recover_sent: '계정이 존재하는 경우 이메일로 아이디 및 인증코드가 전송됩니다.',
        recover_code: '인증코드',
        recover_new_pw: '새 비밀번호',
        recover_confirm_pw: '새 비밀번호 확인',
        recover_reset: '비밀번호 재설정',
        recover_success: '비밀번호가 재설정되었습니다!',
        recover_go_login: '로그인하기',
        recover_forgot: '아이디 또는 비밀번호를 잊으셨나요?',
        recover_mismatch: '비밀번호가 일치하지 않습니다',

        // Editor's Pick
        editors_picks_curated: '큐레이션',
        editors_picks_settings: 'Editor\'s pick 설정',
        editors_picks_add_section: '섹션 추가',
        editors_picks_max_sections: '최대 3개 섹션',
        editors_picks_section_name: '섹션 이름을 입력하세요',
        editors_picks_add_articles: '기사 추가',
        editors_picks_search_articles: '기사 검색...',
        editors_picks_no_sections: '섹션이 없습니다. 설정에서 추가하세요.',
        confirm: '확인',
    },
    en: {
        // Nav
        nav_news: 'AI Newsfeed',
        nav_insights: 'Insights & Research',
        nav_company: 'Company Brief',
        nav_policy: 'Policy & RA',
        nav_conferences: 'Global Conferences',
        nav_about: 'About',
        nav_revenue: 'Revenue',

        // NewsList
        news_section_title: 'MARKET INTELLIGENCE',
        news_section_desc: 'AI-Powered Analysis',

        // Insights
        insights_title: 'Insights & Research',
        insights_desc: 'Aesthetic medicine research database',
        insights_total_papers: '{count} research papers in database',
        insights_search_placeholder: 'Search title or abstract...',
        insights_filter_topic: 'Filter by Topic...',
        insights_all_topics: 'All Topics',
        insights_loading: 'Loading research papers...',
        insights_no_papers: 'No papers found.',
        insights_no_papers_hint: 'Try adjusting your filters or run the data collection script.',
        insights_read: 'Read Data',
        insights_error: 'Failed to load papers.',
        insights_previous: 'Previous',
        insights_next: 'Next',
        insights_page_info: 'Page',
        insights_page_of: 'of',

        // Revenue
        revenue_header: 'Revenue Overview',
        revenue_desc: 'Company revenue and operating profit comparison',

        // Company
        company_header: 'Company Brief',
        company_desc: 'Overview of key aesthetic medicine companies and their market performance.',

        // Policy
        policy_title: 'Policy & RA',
        policy_desc: 'Regulatory trends and policy analysis for 13 APAC countries',
        policy_info: 'Click on a country to view detailed regulatory information and registration guides.',

        // About
        about_mission_title: 'Aesthetic Intelligence',
        about_mission_desc: 'The premier data terminal for the global aesthetic medicine industry. We provide real-time intelligence, regulatory insights, and market data.',
        about_card_news: 'Real-time News',
        about_card_news_desc: 'Aggregating global industry news to keep you ahead of market trends.',
        about_card_data: 'Data & Analytics',
        about_card_data_desc: 'Deep dive into financial performance and market share of top players.',
        about_card_policy: 'Policy & RA',
        about_card_policy_desc: 'Navigating complex regulatory landscapes across 13 APAC countries.',
        about_contact: 'Contact Us',
        about_contact_desc: 'For partnership inquiries and API access.',

        // Sidebar
        sidebar_watchlist: 'Sector Watchlist',
        sidebar_overview: 'Overview',
        sidebar_collections: 'Collections',
        sidebar_feedback: 'Feedback',
        sidebar_keyword_suggest: 'Keyword Suggestion',
        sidebar_live_monitoring: 'Live Monitoring',
        sidebar_tracking: 'Tracking 173 medical aesthetic sectors with AI-powered real-time analysis.',

        // Common
        loading: 'Loading...',
        search: 'Search',
        loading_news: 'Loading news...',
        failed_news: 'Failed to load news',
        retry: 'Retry',

        // Ask AI
        ask_ai_tab_search: 'Paper Search',
        ask_ai_tab_ai: 'Ask AI',
        ask_ai_title: 'Ask AI',
        ask_ai_desc: 'AI answers based on your papers and files',
        ask_ai_select_papers: 'Select Papers',
        ask_ai_max_papers: 'Up to 20 papers',
        ask_ai_papers_selected: 'papers selected',
        ask_ai_search_papers: 'Search for papers to add to your context',
        ask_ai_add_papers: 'Add Papers to Context',
        ask_ai_processing: 'Processing...',
        ask_ai_upload_files: 'Upload Files',
        ask_ai_drop_files: 'Drop files here or click to browse',
        ask_ai_sources: 'Context Sources',
        ask_ai_no_sources: 'No sources added yet',
        ask_ai_papers: 'Papers',
        ask_ai_files: 'Files',
        ask_ai_ready: 'Context loaded! Ask me anything about your selected papers and files.',
        ask_ai_no_context: 'Add papers or upload files first, then ask your questions.',
        ask_ai_add_context: 'Add papers or files to enable AI chat',
        ask_ai_placeholder: 'Ask a question about your papers...',
        ask_ai_thinking: 'Thinking...',

        // Tier
        tier_free: 'Free',
        tier_pro: 'Pro',
        tier_enterprise: 'Enterprise',
        tier_locked_title: 'Premium Feature',
        tier_locked_desc: 'This feature is available on Pro plan and above.',
        tier_required: 'Plan Required',
        tier_upgrade: 'Upgrade',
        tier_current: 'Current Plan',
        tier_news_limited: 'Showing news from the last 3 days only.',
        tier_news_upgrade: 'Upgrade to Pro to access the full news archive.',
        tier_login_required: 'Login required.',

        // Category Tabs
        tabs_overview: 'Overview',
        tabs_collections: 'Collections',
        tabs_suggest: 'Suggest Keyword',
        card_view_all: 'View All',
        card_no_articles: 'No articles',
        trend_title: 'Keyword Trends',
        trend_7d: '7D',
        display_classic: 'Classic Feed',

        // Auth & Privacy
        auth_email: 'Email',
        auth_birth_year: 'Birth Year',
        auth_agree_all: 'I agree to all terms.',
        auth_agree_terms: 'Terms of Service',
        auth_agree_privacy: 'Privacy Policy',
        auth_required: '(Required)',
        auth_check_username: 'Check',
        auth_username_available: 'Username is available.',
        auth_username_taken: 'Username is already taken.',
        auth_send_code: 'Verify',
        auth_code_sent: 'Verification code sent.',
        auth_code_placeholder: '6-digit code',
        auth_email_verified: 'Verified',
        auth_pw_hint: '8+ chars, upper/lowercase & special char.',
        auth_username_hint: '* Username is saved in lowercase.',
        auth_birth_hint: '* Used for average age group statistics.',
        privacy_title: 'Privacy Policy',

        // Account Recovery
        recover_title: 'Find Your Account',
        recover_desc: 'Enter your username or email to recover your account',
        recover_identifier_label: 'Username or Email',
        recover_send: 'Find Account',
        recover_sent: 'If an account exists, your username and verification code will be sent.',
        recover_code: 'Verification Code',
        recover_new_pw: 'New Password',
        recover_confirm_pw: 'Confirm New Password',
        recover_reset: 'Reset Password',
        recover_success: 'Password has been reset!',
        recover_go_login: 'Go to Login',
        recover_forgot: 'Forgot your username or password?',
        recover_mismatch: 'Passwords do not match',

        // Editor's Pick
        editors_picks_curated: 'CURATED',
        editors_picks_settings: 'Editor\'s Pick Settings',
        editors_picks_add_section: 'Add Section',
        editors_picks_max_sections: 'Max 3 sections',
        editors_picks_section_name: 'Enter section name',
        editors_picks_add_articles: 'Add Articles',
        editors_picks_search_articles: 'Search articles...',
        editors_picks_no_sections: 'No sections yet. Add one in settings.',
        confirm: 'Confirm',
    }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('ko');

    const t = (key: string) => {
        // @ts-ignore
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
