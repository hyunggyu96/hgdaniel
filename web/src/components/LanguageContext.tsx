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
