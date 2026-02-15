'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/components/LanguageContext';

// ─── Types ───
interface ConferenceEvent {
    id: string;
    name: { ko: string; en: string };
    series: string;
    startDate: string;
    endDate: string;
    city: { ko: string; en: string };
    country: { ko: string; en: string };
    venue: string;
    confirmed: boolean;
    url: string;
}

// ─── Country Flag Emojis ───
const COUNTRY_FLAGS: Record<string, string> = {
    '프랑스': '🇫🇷', 'France': '🇫🇷',
    '브라질': '🇧🇷', 'Brazil': '🇧🇷',
    '태국': '🇹🇭', 'Thailand': '🇹🇭',
    '중국': '🇨🇳', 'China': '🇨🇳',
    '미국': '🇺🇸', 'USA': '🇺🇸',
    '모나코': '🇲🇨', 'Monaco': '🇲🇨',
    '대만': '🇹🇼', 'Taiwan': '🇹🇼',
    '한국': '🇰🇷', 'South Korea': '🇰🇷',
    '일본': '🇯🇵', 'Japan': '🇯🇵',
    'UAE': '🇦🇪',
    '콜롬비아': '🇨🇴', 'Colombia': '🇨🇴',
    '베트남': '🇻🇳', 'Vietnam': '🇻🇳',
    '인도네시아': '🇮🇩', 'Indonesia': '🇮🇩',
    '홍콩': '🇭🇰', 'Hong Kong': '🇭🇰',
    '싱가포르': '🇸🇬', 'Singapore': '🇸🇬',
    '인도': '🇮🇳', 'India': '🇮🇳',
};

// ─── Country Colors (based on national flag primary color) ───
const COUNTRY_COLORS: Record<string, { color: string; bgColor: string; borderColor: string }> = {
    // 🇫🇷 France – French Blue
    '프랑스': { color: '#0055A4', bgColor: '#EBF2FA', borderColor: '#A8C8E8' },
    'France': { color: '#0055A4', bgColor: '#EBF2FA', borderColor: '#A8C8E8' },
    // 🇧🇷 Brazil – Green
    '브라질': { color: '#009B3A', bgColor: '#E6F7ED', borderColor: '#8DD4A8' },
    'Brazil': { color: '#009B3A', bgColor: '#E6F7ED', borderColor: '#8DD4A8' },
    // 🇹🇭 Thailand – Royal Navy
    '태국': { color: '#241D4F', bgColor: '#EDEAF5', borderColor: '#B5AFD6' },
    'Thailand': { color: '#241D4F', bgColor: '#EDEAF5', borderColor: '#B5AFD6' },
    // 🇨🇳 China – Chinese Red
    '중국': { color: '#DE2910', bgColor: '#FDE8E6', borderColor: '#F5ACA5' },
    'China': { color: '#DE2910', bgColor: '#FDE8E6', borderColor: '#F5ACA5' },
    // 🇺🇸 USA – Old Glory Blue
    '미국': { color: '#002868', bgColor: '#E6EBF5', borderColor: '#99ABD1' },
    'USA': { color: '#002868', bgColor: '#E6EBF5', borderColor: '#99ABD1' },
    // 🇲🇨 Monaco – Monaco Red
    '모나코': { color: '#CE1126', bgColor: '#FCEBEE', borderColor: '#F0A8B1' },
    'Monaco': { color: '#CE1126', bgColor: '#FCEBEE', borderColor: '#F0A8B1' },
    // 🇹🇼 Taiwan – KMT Blue
    '대만': { color: '#0048B0', bgColor: '#E8EEF9', borderColor: '#99B4E0' },
    'Taiwan': { color: '#0048B0', bgColor: '#E8EEF9', borderColor: '#99B4E0' },
    // 🇰🇷 South Korea – Taegeuk Blue
    '한국': { color: '#003478', bgColor: '#E6EDF7', borderColor: '#8FAEDB' },
    'South Korea': { color: '#003478', bgColor: '#E6EDF7', borderColor: '#8FAEDB' },
    // 🇯🇵 Japan – Hinomaru Crimson
    '일본': { color: '#BC002D', bgColor: '#FCEAEF', borderColor: '#EEA0B5' },
    'Japan': { color: '#BC002D', bgColor: '#FCEAEF', borderColor: '#EEA0B5' },
    // 🇦🇪 UAE – Emerald Green
    'UAE': { color: '#00732F', bgColor: '#E6F3EC', borderColor: '#8DD4B3' },
    // 🇨🇴 Colombia – Gold
    '콜롬비아': { color: '#8B6914', bgColor: '#FDF5E1', borderColor: '#E2C872' },
    'Colombia': { color: '#8B6914', bgColor: '#FDF5E1', borderColor: '#E2C872' },
    // 🇻🇳 Vietnam – Vietnamese Red
    '베트남': { color: '#DA251D', bgColor: '#FDE9E8', borderColor: '#F3AAA6' },
    'Vietnam': { color: '#DA251D', bgColor: '#FDE9E8', borderColor: '#F3AAA6' },
    // 🇮🇩 Indonesia – Merah (Warm Red)
    '인도네시아': { color: '#CE1126', bgColor: '#FCEBED', borderColor: '#F0A8B1' },
    'Indonesia': { color: '#CE1126', bgColor: '#FCEBED', borderColor: '#F0A8B1' },
    // 🇭🇰 Hong Kong – Bauhinia Purple-Red
    '홍콩': { color: '#9B1B30', bgColor: '#F8E9EC', borderColor: '#D9A0AE' },
    'Hong Kong': { color: '#9B1B30', bgColor: '#F8E9EC', borderColor: '#D9A0AE' },
    // 🇸🇬 Singapore – Lion Red
    '싱가포르': { color: '#EF3340', bgColor: '#FDECEE', borderColor: '#F9B0B6' },
    'Singapore': { color: '#EF3340', bgColor: '#FDECEE', borderColor: '#F9B0B6' },
    // 🇮🇳 India – Saffron
    '인도': { color: '#D96B00', bgColor: '#FFF3E6', borderColor: '#F5C88A' },
    'India': { color: '#D96B00', bgColor: '#FFF3E6', borderColor: '#F5C88A' },
};

const DEFAULT_COUNTRY_COLOR = { color: '#3B82F6', bgColor: '#EFF6FF', borderColor: '#BFDBFE' };
function getCountryColor(country: string) {
    return COUNTRY_COLORS[country] || DEFAULT_COUNTRY_COLOR;
}

// ─── 2026 Conference Data ───
const CONFERENCES: ConferenceEvent[] = [
    // ── IMCAS ──
    {
        id: 'imcas-world-2026', series: 'IMCAS',
        name: { ko: 'IMCAS World Congress', en: 'IMCAS World Congress' },
        startDate: '2026-01-29', endDate: '2026-01-31',
        city: { ko: '파리', en: 'Paris' }, country: { ko: '프랑스', en: 'France' },
        venue: 'Palais des Congrès de Paris', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-world-congress-2026',
    },
    {
        id: 'imcas-americas-2026', series: 'IMCAS',
        name: { ko: 'IMCAS Americas', en: 'IMCAS Americas' },
        startDate: '2026-03-13', endDate: '2026-03-15',
        city: { ko: '상파울루', en: 'São Paulo' }, country: { ko: '브라질', en: 'Brazil' },
        venue: 'The World Trade Center São Paulo', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-americas-2026',
    },
    {
        id: 'imcas-asia-2026', series: 'IMCAS',
        name: { ko: 'IMCAS Asia', en: 'IMCAS Asia' },
        startDate: '2026-06-19', endDate: '2026-06-21',
        city: { ko: '방콕', en: 'Bangkok' }, country: { ko: '태국', en: 'Thailand' },
        venue: 'The Athenee Hotel', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-asia-2026',
    },
    {
        id: 'imcas-china-2026', series: 'IMCAS',
        name: { ko: 'IMCAS China', en: 'IMCAS China' },
        startDate: '2026-08-27', endDate: '2026-08-29',
        city: { ko: '상하이', en: 'Shanghai' }, country: { ko: '중국', en: 'China' },
        venue: 'W Hotel - The Bund', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-china-2026',
    },

    // ── AMWC ──
    {
        id: 'amwc-americas-2026', series: 'AMWC',
        name: { ko: 'AMWC Americas', en: 'AMWC Americas' },
        startDate: '2026-02-14', endDate: '2026-02-16',
        city: { ko: '마이애미', en: 'Miami' }, country: { ko: '미국', en: 'USA' },
        venue: 'JW Marriott Miami Turnberry Resort', confirmed: true,
        url: 'https://www.amwcamericas.com',
    },
    {
        id: 'amwc-monaco-2026', series: 'AMWC',
        name: { ko: 'AMWC Monaco', en: 'AMWC Monaco' },
        startDate: '2026-03-26', endDate: '2026-03-28',
        city: { ko: '몬테카를로', en: 'Monte Carlo' }, country: { ko: '모나코', en: 'Monaco' },
        venue: 'Grimaldi Forum', confirmed: true,
        url: 'https://www.amwc-conference.com',
    },
    {
        id: 'amwc-asia-2026', series: 'AMWC',
        name: { ko: 'AMWC Asia', en: 'AMWC Asia' },
        startDate: '2026-05-01', endDate: '2026-05-03',
        city: { ko: '타이베이', en: 'Taipei' }, country: { ko: '대만', en: 'Taiwan' },
        venue: 'Taipei Intl Convention Center (TICC)', confirmed: true,
        url: 'https://www.amwc-asia.com',
    },
    {
        id: 'amwc-brazil-2026', series: 'AMWC',
        name: { ko: 'AMWC Brazil', en: 'AMWC Brazil' },
        startDate: '2026-06-17', endDate: '2026-06-19',
        city: { ko: '상파울루', en: 'São Paulo' }, country: { ko: '브라질', en: 'Brazil' },
        venue: 'Centro de Convenções Frei Caneca', confirmed: true,
        url: 'https://www.amwcbrazil.com.br',
    },
    {
        id: 'amwc-korea-2026', series: 'AMWC',
        name: { ko: 'AMWC Korea', en: 'AMWC Korea' },
        startDate: '2026-06-19', endDate: '2026-06-20',
        city: { ko: '서울', en: 'Seoul' }, country: { ko: '한국', en: 'South Korea' },
        venue: '인터컨티넨탈 그랜드 서울 파르나스', confirmed: true,
        url: 'https://www.amwc-korea.com',
    },
    {
        id: 'amwc-japan-2026', series: 'AMWC',
        name: { ko: 'AMWC Japan', en: 'AMWC Japan' },
        startDate: '2026-09-12', endDate: '2026-09-13',
        city: { ko: '도쿄', en: 'Tokyo' }, country: { ko: '일본', en: 'Japan' },
        venue: 'The Prince Park Tower Tokyo', confirmed: true,
        url: 'https://www.amwc-japan.com',
    },
    {
        id: 'amwc-china-2026', series: 'AMWC',
        name: { ko: 'AMWC China', en: 'AMWC China' },
        startDate: '2026-10-16', endDate: '2026-10-18',
        city: { ko: '청두', en: 'Chengdu' }, country: { ko: '중국', en: 'China' },
        venue: 'Wuzhouqing Ctr', confirmed: true,
        url: 'https://www.amwcchina.com',
    },
    {
        id: 'amwc-dubai-2026', series: 'AMWC',
        name: { ko: 'AMWC Dubai', en: 'AMWC Dubai' },
        startDate: '2026-10-21', endDate: '2026-10-23',
        city: { ko: '두바이', en: 'Dubai' }, country: { ko: 'UAE', en: 'UAE' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.amwc-dubai.com',
    },
    {
        id: 'amwc-latam-2026', series: 'AMWC',
        name: { ko: 'AMWC Latin America', en: 'AMWC Latin America' },
        startDate: '2026-10-29', endDate: '2026-10-31',
        city: { ko: '메델린', en: 'Medellín' }, country: { ko: '콜롬비아', en: 'Colombia' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.amwc-la.com',
    },
    {
        id: 'amwc-sea-2026', series: 'AMWC',
        name: { ko: 'AMWC Southeast Asia', en: 'AMWC Southeast Asia' },
        startDate: '2026-11-26', endDate: '2026-11-28',
        city: { ko: '방콕', en: 'Bangkok' }, country: { ko: '태국', en: 'Thailand' },
        venue: 'The Athenee Hotel, Bangkok', confirmed: true,
        url: 'https://www.amwc-southeastasia.com',
    },

    // ── Individual Conferences ──
    {
        id: 'kimes-2026', series: 'KIMES',
        name: { ko: 'KIMES 2026', en: 'KIMES 2026' },
        startDate: '2026-03-19', endDate: '2026-03-22',
        city: { ko: '서울', en: 'Seoul' }, country: { ko: '한국', en: 'South Korea' },
        venue: 'COEX', confirmed: true,
        url: 'https://kimes.kr/en',
    },
    {
        id: 'dubai-derma-2026', series: 'Dubai Derma',
        name: { ko: 'Dubai Derma 2026', en: 'Dubai Derma 2026' },
        startDate: '2026-03-31', endDate: '2026-04-02',
        city: { ko: '두바이', en: 'Dubai' }, country: { ko: 'UAE', en: 'UAE' },
        venue: 'Dubai World Trade Centre', confirmed: true,
        url: 'https://www.dubaiderma.com',
    },
    {
        id: 'aps-korea-2026', series: 'APS Korea',
        name: { ko: 'APS Korea 2026', en: 'APS Korea 2026' },
        startDate: '2026-04-04', endDate: '2026-04-05',
        city: { ko: '서울', en: 'Seoul' }, country: { ko: '한국', en: 'South Korea' },
        venue: 'COEX (TBD)', confirmed: false,
        url: 'https://www.apskorea.or.kr',
    },
    {
        id: 'idax-2026', series: 'IDAX',
        name: { ko: 'IDAX 2026', en: 'IDAX 2026' },
        startDate: '2026-04-09', endDate: '2026-04-11',
        city: { ko: '하노이', en: 'Hanoi' }, country: { ko: '베트남', en: 'Vietnam' },
        venue: 'NECC', confirmed: true,
        url: 'https://www.idaxexpo.com',
    },
    {
        id: 'ceswam-2026', series: 'SWAM',
        name: { ko: 'CeSWAM 2026', en: 'CeSWAM 2026' },
        startDate: '2026-04-17', endDate: '2026-04-19',
        city: { ko: '스마랑', en: 'Semarang' }, country: { ko: '인도네시아', en: 'Indonesia' },
        venue: 'Padma Hotel', confirmed: true,
        url: 'https://swam.id',
    },
    {
        id: 'cbe-2026', series: 'CBE',
        name: { ko: 'CBE 2026 (China Beauty Expo)', en: 'CBE 2026 (China Beauty Expo)' },
        startDate: '2026-05-12', endDate: '2026-05-14',
        city: { ko: '상하이', en: 'Shanghai' }, country: { ko: '중국', en: 'China' },
        venue: 'SNIEC', confirmed: true,
        url: 'https://www.chinabeautyexpo.com',
    },
    {
        id: 'weswam-2026', series: 'SWAM',
        name: { ko: 'WeSWAM 2026', en: 'WeSWAM 2026' },
        startDate: '2026-06-12', endDate: '2026-06-14',
        city: { ko: '반둥', en: 'Bandung' }, country: { ko: '인도네시아', en: 'Indonesia' },
        venue: 'El Hotel', confirmed: true,
        url: 'https://swam.id',
    },
    {
        id: 'korea-derma-2026', series: 'Korea Derma',
        name: { ko: 'Korea Derma 2026', en: 'Korea Derma 2026' },
        startDate: '2026-06-15', endDate: '2026-06-17',
        city: { ko: '서울', en: 'Seoul' }, country: { ko: '한국', en: 'South Korea' },
        venue: 'The-K Hotel (TBD)', confirmed: false,
        url: 'https://www.koderma.co.kr',
    },
    {
        id: 'hksdv-2026', series: 'HKSDV',
        name: { ko: 'HKSDV Annual Meeting 2026', en: 'HKSDV Annual Meeting 2026' },
        startDate: '2026-07-04', endDate: '2026-07-05',
        city: { ko: '홍콩', en: 'Hong Kong' }, country: { ko: '홍콩', en: 'Hong Kong' },
        venue: 'Sheraton HK Hotel', confirmed: true,
        url: 'https://www.hksdv.org',
    },
    {
        id: 'iswam-bali-2026', series: 'SWAM',
        name: { ko: '8th i-SWAM Bali 2026', en: '8th i-SWAM Bali 2026' },
        startDate: '2026-07-10', endDate: '2026-07-12',
        city: { ko: '발리', en: 'Bali' }, country: { ko: '인도네시아', en: 'Indonesia' },
        venue: 'The Trans Resort Bali', confirmed: true,
        url: 'https://www.internationalswam.com',
    },
    {
        id: 'vietbeauty-2026', series: 'Vietbeauty',
        name: { ko: 'Vietbeauty & Cosmobeauté 2026', en: 'Vietbeauty & Cosmobeauté 2026' },
        startDate: '2026-07-23', endDate: '2026-07-26',
        city: { ko: '호찌민', en: 'Ho Chi Minh City' }, country: { ko: '베트남', en: 'Vietnam' },
        venue: 'SECC', confirmed: true,
        url: 'https://www.vietbeautyshow.com',
    },
    {
        id: 'medical-fair-asia-2026', series: 'Medical Fair Asia',
        name: { ko: 'Medical Fair Asia 2026', en: 'Medical Fair Asia 2026' },
        startDate: '2026-09-09', endDate: '2026-09-11',
        city: { ko: '싱가포르', en: 'Singapore' }, country: { ko: '싱가포르', en: 'Singapore' },
        venue: 'Marina Bay Sands', confirmed: true,
        url: 'https://www.medicalfair-asia.com',
    },
    {
        id: 'easwam-2026', series: 'SWAM',
        name: { ko: 'EaSWAM 2026', en: 'EaSWAM 2026' },
        startDate: '2026-09-25', endDate: '2026-09-27',
        city: { ko: '수라바야', en: 'Surabaya' }, country: { ko: '인도네시아', en: 'Indonesia' },
        venue: 'Dyandra Convention Ctr', confirmed: true,
        url: 'https://swam.id',
    },
    {
        id: 'medical-japan-2026', series: 'Medical Japan',
        name: { ko: 'Medical Japan Tokyo 2026', en: 'Medical Japan Tokyo 2026' },
        startDate: '2026-10-07', endDate: '2026-10-09',
        city: { ko: '도쿄', en: 'Tokyo' }, country: { ko: '일본', en: 'Japan' },
        venue: 'Makuhari Messe', confirmed: true,
        url: 'https://www.medical-jpn.jp/tokyo/en-gb.html',
    },
    {
        id: 'dasil-2026', series: 'DASIL',
        name: { ko: 'DASIL 2026', en: 'DASIL 2026' },
        startDate: '2026-10-28', endDate: '2026-10-31',
        city: { ko: '코치', en: 'Kochi' }, country: { ko: '인도', en: 'India' },
        venue: 'TBD', confirmed: false,
        url: 'https://www.dasil.org',
    },
    {
        id: 'cosmoprof-asia-2026', series: 'Cosmoprof Asia',
        name: { ko: 'Cosmoprof Asia 2026', en: 'Cosmoprof Asia 2026' },
        startDate: '2026-11-10', endDate: '2026-11-13',
        city: { ko: '홍콩', en: 'Hong Kong' }, country: { ko: '홍콩', en: 'Hong Kong' },
        venue: 'HKCEC & AsiaWorld', confirmed: true,
        url: 'https://www.cosmoprof-asia.com',
    },
    {
        id: 'prs-korea-2026', series: 'PRS Korea',
        name: { ko: 'PRS Korea 2026', en: 'PRS Korea 2026' },
        startDate: '2026-11-05', endDate: '2026-11-07',
        city: { ko: '서울', en: 'Seoul' }, country: { ko: '한국', en: 'South Korea' },
        venue: 'Grand InterContinental (TBD)', confirmed: false,
        url: 'https://www.prskorea.org',
    },
    {
        id: 'icad-bangkok-2026', series: 'ICAD Bangkok',
        name: { ko: 'ICAD Bangkok 2026', en: 'ICAD Bangkok 2026' },
        startDate: '2026-11-20', endDate: '2026-11-22',
        city: { ko: '방콕', en: 'Bangkok' }, country: { ko: '태국', en: 'Thailand' },
        venue: 'Centara Grand (TBD)', confirmed: false,
        url: 'https://www.icadbangkok.com',
    },
    {
        id: 'iswam-world-2026', series: 'SWAM',
        name: { ko: '17th i-SWAM World Congress 2026', en: '17th i-SWAM World Congress 2026' },
        startDate: '2026-12-04', endDate: '2026-12-06',
        city: { ko: '탕게랑', en: 'Tangerang' }, country: { ko: '인도네시아', en: 'Indonesia' },
        venue: 'ICE BSD City', confirmed: true,
        url: 'https://www.internationalswam.com',
    },
];

// ─── Derived Data ───
const ALL_SERIES = Array.from(new Set(CONFERENCES.map((c) => c.series)));
const ALL_COUNTRIES_KO = Array.from(new Set(CONFERENCES.map((c) => c.country.ko))).sort();
const ALL_COUNTRIES_EN = Array.from(new Set(CONFERENCES.map((c) => c.country.en))).sort();

// ─── Utility ───
const MONTH_NAMES_KO = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES_KO = ['일', '월', '화', '수', '목', '금', '토'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function formatDateRange(start: string, end: string, lang: 'ko' | 'en'): string {
    const s = new Date(start);
    const e = new Date(end);
    const sMonth = s.getMonth() + 1;
    const eMonth = e.getMonth() + 1;
    if (lang === 'ko') {
        if (sMonth === eMonth) return `${sMonth}월 ${s.getDate()}일 - ${e.getDate()}일`;
        return `${sMonth}월 ${s.getDate()}일 - ${eMonth}월 ${e.getDate()}일`;
    }
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (sMonth === eMonth) return `${m[sMonth - 1]} ${s.getDate()} – ${e.getDate()}`;
    return `${m[sMonth - 1]} ${s.getDate()} – ${m[eMonth - 1]} ${e.getDate()}`;
}

function isDateInRange(year: number, month: number, day: number, start: string, end: string): boolean {
    const d = new Date(year, month, day);
    const s = new Date(start);
    const e = new Date(end);
    d.setHours(0, 0, 0, 0); s.setHours(0, 0, 0, 0); e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
}

function isToday(year: number, month: number, day: number): boolean {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

// ─── Components ───

function EventBadge({ event, onClick, isSelected, lang }: {
    event: ConferenceEvent; onClick: () => void; isSelected: boolean; lang: 'ko' | 'en';
}) {
    const cityLabel = event.city[lang];
    const cc = getCountryColor(event.country[lang]);

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="w-full text-left group"
            title={`${event.name[lang]} — ${cityLabel}, ${event.country[lang]}`}
        >
            <div
                className={`text-[9px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-md truncate transition-all duration-200 border ${isSelected ? 'shadow-md scale-[1.02]' : 'hover:scale-[1.02]'}`}
                style={isSelected
                    ? { backgroundColor: cc.color, color: '#fff', borderColor: cc.color }
                    : { backgroundColor: cc.bgColor, color: cc.color, borderColor: cc.borderColor }
                }
            >
                {event.name[lang].replace(/ 2026$/, '')} ({cityLabel})
            </div>
        </button>
    );
}

function EventDetailPanel({ event, onClose, lang }: {
    event: ConferenceEvent; onClose: () => void; lang: 'ko' | 'en';
}) {
    const isPast = new Date(event.endDate) < new Date();
    const isOngoing = new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();
    const cc = getCountryColor(event.country[lang]);

    const statusLabel = isOngoing ? { ko: '진행 중', en: 'LIVE' } : isPast ? { ko: '종료', en: 'ENDED' } : { ko: '예정', en: 'UPCOMING' };
    const statusStyle = isOngoing ? 'bg-emerald-100 text-emerald-700' : isPast ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600';
    const flag = COUNTRY_FLAGS[event.country[lang]] || '🌐';

    return (
        <div className="rounded-2xl p-5 sm:p-6 transition-all duration-300"
            style={{ backgroundColor: cc.bgColor, borderWidth: '2px', borderStyle: 'solid', borderColor: cc.borderColor }}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: cc.color + '18', color: cc.color }}>
                            {event.series}
                        </span>
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${statusStyle}`}>
                            {statusLabel[lang]}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/70"
                            style={{ color: cc.color }}>
                            {flag} {event.country[lang]}
                        </span>
                        {!event.confirmed && (
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-orange-50 text-orange-500">
                                {lang === 'ko' ? '미확정' : 'TBC'}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 leading-tight">{event.name[lang]}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                            <span className="text-base mt-0.5">📅</span>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '일정' : 'Date'}</p>
                                <p className="font-semibold text-gray-800">{formatDateRange(event.startDate, event.endDate, lang)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-base mt-0.5">📍</span>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '개최 도시' : 'Location'}</p>
                                <p className="font-semibold text-gray-800">{event.city[lang]}, {event.country[lang]}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-base mt-0.5">🏛️</span>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '장소' : 'Venue'}</p>
                                <p className="font-semibold text-gray-800">{event.venue}</p>
                            </div>
                        </div>
                    </div>
                    {/* Official Website Link */}
                    {event.url && (
                        <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${cc.borderColor}` }}>
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-[12px] font-bold tracking-wide transition-all duration-200 shadow-sm hover:shadow-md hover:brightness-110"
                                style={{ backgroundColor: cc.color }}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                {lang === 'ko' ? '공식 웹사이트 방문' : 'Visit Official Website'}
                            </a>
                        </div>
                    )}
                </div>
                <button onClick={onClose} aria-label="Close"
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/50 shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── Main Page ───
export default function ConferencesPage() {
    const { language } = useLanguage();
    const lang = language as 'ko' | 'en';

    const currentDate = new Date();
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(currentDate.getFullYear() === 2026 ? currentDate.getMonth() : 0);
    const [selectedEvent, setSelectedEvent] = useState<ConferenceEvent | null>(null);
    const [seriesFilter, setSeriesFilter] = useState<string>('ALL');
    const [countryFilter, setCountryFilter] = useState<string>('ALL');

    const monthNames = lang === 'ko' ? MONTH_NAMES_KO : MONTH_NAMES_EN;
    const dayNames = lang === 'ko' ? DAY_NAMES_KO : DAY_NAMES_EN;
    const countries = lang === 'ko' ? ALL_COUNTRIES_KO : ALL_COUNTRIES_EN;

    // Filtered conferences
    const filteredConferences = useMemo(() => {
        let result = CONFERENCES;
        if (seriesFilter !== 'ALL') {
            result = result.filter((c) => c.series === seriesFilter);
        }
        if (countryFilter !== 'ALL') {
            result = result.filter((c) => c.country[lang] === countryFilter);
        }
        return result;
    }, [seriesFilter, countryFilter, lang]);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthEvents = useMemo(() => {
        return filteredConferences.filter((conf) => {
            const s = new Date(conf.startDate);
            const e = new Date(conf.endDate);
            return s <= new Date(year, month, daysInMonth) && e >= new Date(year, month, 1);
        });
    }, [year, month, filteredConferences, daysInMonth]);

    function getEventsForDay(day: number) {
        return filteredConferences.filter((c) => isDateInRange(year, month, day, c.startDate, c.endDate));
    }

    function prevMonth() {
        if (month === 0) { setMonth(11); setYear(year - 1); } else { setMonth(month - 1); }
        setSelectedEvent(null);
    }
    function nextMonth() {
        if (month === 11) { setMonth(0); setYear(year + 1); } else { setMonth(month + 1); }
        setSelectedEvent(null);
    }
    function goToToday() {
        const now = new Date();
        setYear(now.getFullYear());
        setMonth(now.getMonth());
        setSelectedEvent(null);
    }

    // Upcoming events
    const upcomingEvents = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return filteredConferences
            .filter((c) => new Date(c.endDate) >= today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [filteredConferences]);

    // Series counts
    const seriesCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        CONFERENCES.forEach((c) => { counts[c.series] = (counts[c.series] || 0) + 1; });
        return counts;
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {/* ── Page Header ── */}
                <div className="mb-8 sm:mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <span className="text-white text-lg">🌍</span>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">Global Conferences</h1>
                            <p className="text-sm text-gray-500 font-medium">
                                {lang === 'ko'
                                    ? `${year}년 주요 글로벌 미용의학 컨퍼런스 일정 (${CONFERENCES.length}개)`
                                    : `${year} Global Aesthetic Medicine Conferences (${CONFERENCES.length} events)`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Selected Event Detail (ABOVE calendar) ── */}
                {selectedEvent && (
                    <div className="mb-5">
                        <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} lang={lang} />
                    </div>
                )}

                {/* ── Calendar ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-gray-100 bg-gray-50/60">
                        <button onClick={prevMonth} aria-label="Previous month"
                            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
                            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="text-center">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                                {lang === 'ko' ? `${year}년 ${monthNames[month]}` : `${monthNames[month]} ${year}`}
                            </h2>
                            {monthEvents.length > 0 && (
                                <p className="text-xs text-gray-400 font-semibold mt-1">
                                    {lang === 'ko' ? `${monthEvents.length}개 컨퍼런스` : `${monthEvents.length} conference${monthEvents.length > 1 ? 's' : ''}`}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={goToToday}
                                className="hidden sm:block px-3 py-2 rounded-xl text-[11px] font-bold tracking-wide bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                                📌 {lang === 'ko' ? '오늘' : 'Today'}
                            </button>
                            <button onClick={nextMonth} aria-label="Next month"
                                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm">
                                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-100">
                        {dayNames.map((day, i) => (
                            <div key={day}
                                className={`text-center py-3 text-[11px] font-bold tracking-wider uppercase ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                                    }`}>
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[110px] border-b border-r border-gray-50 bg-gray-50/30" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayOfWeek = (firstDay + i) % 7;
                            const events = getEventsForDay(day);
                            const today = isToday(year, month, day);
                            return (
                                <div key={`day-${day}`}
                                    className={`min-h-[80px] sm:min-h-[110px] border-b border-r border-gray-100 p-1 sm:p-1.5 transition-colors duration-150 ${today ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'
                                        }`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg ${today ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                            : dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-700'
                                            }`}>
                                            {day}
                                        </span>
                                    </div>
                                    <div className="space-y-0.5">
                                        {events.slice(0, 3).map((event) => (
                                            <EventBadge key={event.id} event={event} lang={lang}
                                                onClick={() => {
                                                    setSelectedEvent(selectedEvent?.id === event.id ? null : event);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                isSelected={selectedEvent?.id === event.id} />
                                        ))}
                                        {events.length > 3 && (
                                            <p className="text-[10px] text-gray-400 font-semibold px-1">+{events.length - 3} more</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
                            <div key={`empty-end-${i}`} className="min-h-[80px] sm:min-h-[110px] border-b border-r border-gray-50 bg-gray-50/30" />
                        ))}
                    </div>
                </div>

                {/* ── Filters (below calendar) ── */}
                <div className="mt-6 space-y-4 bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
                    {/* Series filter */}
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            {lang === 'ko' ? '시리즈 / 전시회' : 'Series / Conference'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => { setSeriesFilter('ALL'); setSelectedEvent(null); }}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200 border ${seriesFilter === 'ALL'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                    : 'bg-white text-blue-600 border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                ALL ({CONFERENCES.length})
                            </button>
                            {ALL_SERIES.map((s) => {
                                const isActive = seriesFilter === s;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => { setSeriesFilter(isActive ? 'ALL' : s); setSelectedEvent(null); }}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200 border ${isActive
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-100'
                                            }`}
                                    >
                                        {s} {(seriesCounts[s] || 0) > 1 ? `(${seriesCounts[s]})` : ''}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Country filter */}
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            {lang === 'ko' ? '국가' : 'Country'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => { setCountryFilter('ALL'); setSelectedEvent(null); }}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200 border ${countryFilter === 'ALL'
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                    : 'bg-white text-blue-600 border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                            >
                                {lang === 'ko' ? '전체' : 'All'}
                            </button>
                            {countries.map((c) => {
                                const isActive = countryFilter === c;
                                const count = CONFERENCES.filter((conf) => conf.country[lang] === c).length;
                                const flag = COUNTRY_FLAGS[c] || '🌐';
                                const cc = getCountryColor(c);
                                return (
                                    <button
                                        key={c}
                                        onClick={() => { setCountryFilter(isActive ? 'ALL' : c); setSelectedEvent(null); }}
                                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all duration-200 border ${isActive ? 'shadow-md scale-[1.02]' : 'hover:scale-[1.02]'}`}
                                        style={isActive
                                            ? { backgroundColor: cc.color, color: '#fff', borderColor: cc.color }
                                            : { backgroundColor: cc.bgColor, color: cc.color, borderColor: cc.borderColor }
                                        }
                                    >
                                        {flag} {c} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active filters summary */}
                    {(seriesFilter !== 'ALL' || countryFilter !== 'ALL') && (
                        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
                            <span className="text-[11px] text-gray-400 font-semibold">
                                {lang === 'ko' ? '필터 적용 중:' : 'Active filters:'}
                            </span>
                            {seriesFilter !== 'ALL' && (
                                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                                    {seriesFilter}
                                </span>
                            )}
                            {seriesFilter !== 'ALL' && countryFilter !== 'ALL' && (
                                <span className="text-[11px] text-gray-300 font-bold">+</span>
                            )}
                            {countryFilter !== 'ALL' && (
                                <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                                    {countryFilter}
                                </span>
                            )}
                            <span className="text-[11px] text-gray-400">
                                → {filteredConferences.length}{lang === 'ko' ? '개' : ' events'}
                            </span>
                            <button
                                onClick={() => { setSeriesFilter('ALL'); setCountryFilter('ALL'); setSelectedEvent(null); }}
                                className="text-[11px] text-blue-400 hover:text-blue-600 font-bold transition-colors ml-1 underline"
                            >
                                {lang === 'ko' ? '초기화' : 'Clear all'}
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Upcoming Events List ── */}
                <div className="mt-10">
                    <h2 className="text-lg font-black tracking-tight text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-blue-300 rounded-full" />
                        {lang === 'ko' ? '다가오는 컨퍼런스' : 'Upcoming Conferences'}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {upcomingEvents.map((event) => {
                            const isOngoing = new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();
                            const cc = getCountryColor(event.country[lang]);
                            const flag = COUNTRY_FLAGS[event.country[lang]] || '🌐';
                            return (
                                <button key={event.id}
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        const s = new Date(event.startDate);
                                        setYear(s.getFullYear()); setMonth(s.getMonth());
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="text-left group bg-white rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                                    style={{ borderWidth: '1.5px', borderStyle: 'solid', borderColor: cc.borderColor + '80' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: cc.bgColor, color: cc.color }}>
                                            {event.series}
                                        </span>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: cc.bgColor, color: cc.color }}>
                                            {flag}
                                        </span>
                                        {isOngoing && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">LIVE</span>
                                        )}
                                        {!event.confirmed && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500">
                                                {lang === 'ko' ? '미확정' : 'TBC'}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 transition-colors mb-1.5 leading-tight"
                                        style={{ ['--tw-group-hover-color' as string]: cc.color }}>
                                        {event.name[lang]}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>📅 {formatDateRange(event.startDate, event.endDate, lang)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span>📍 {event.city[lang]}, {event.country[lang]}</span>
                                    </div>
                                    <div className="w-full h-0.5 rounded-full mt-3 opacity-40" style={{ backgroundColor: cc.color }} />
                                </button>
                            );
                        })}
                    </div>
                    {upcomingEvents.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-sm font-medium">
                                {lang === 'ko' ? '해당 조건의 컨퍼런스가 없습니다.' : 'No conferences match your filters.'}
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
