'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Globe, Calendar as CalendarIcon, MapPin, ExternalLink, X, Filter } from "lucide-react";

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

// ─── Country Flag ISO Codes ───
const COUNTRY_CODES: Record<string, string> = {
    '프랑스': 'fr', 'France': 'fr',
    '브라질': 'br', 'Brazil': 'br',
    '태국': 'th', 'Thailand': 'th',
    '중국': 'cn', 'China': 'cn',
    '미국': 'us', 'USA': 'us',
    '모나코': 'mc', 'Monaco': 'mc',
    '대만': 'tw', 'Taiwan': 'tw',
    '한국': 'kr', 'South Korea': 'kr',
    '일본': 'jp', 'Japan': 'jp',
    'UAE': 'ae',
    '콜롬비아': 'co', 'Colombia': 'co',
    '베트남': 'vn', 'Vietnam': 'vn',
    '인도네시아': 'id', 'Indonesia': 'id',
    '홍콩': 'hk', 'Hong Kong': 'hk',
    '싱가포르': 'sg', 'Singapore': 'sg',
    '인도': 'in', 'India': 'in',
};

function FlagIcon({ country, size = 16 }: { country: string; size?: number }) {
    const code = COUNTRY_CODES[country];
    if (!code) return <span>🌐</span>;
    return (
        <img
            src={`https://flagcdn.com/w40/${code}.png`}
            width={size}
            height={Math.round(size * 0.75)}
            alt={country}
            className="inline-block rounded-[2px] object-cover bg-gray-100 shadow-sm"
            loading="lazy"
        />
    );
}

// ─── Country Colors ───
const COUNTRY_COLORS: Record<string, { color: string; bgColor: string; borderColor: string }> = {
    '프랑스': { color: '#0055A4', bgColor: '#EBF2FA', borderColor: '#A8C8E8' },
    'France': { color: '#0055A4', bgColor: '#EBF2FA', borderColor: '#A8C8E8' },
    '브라질': { color: '#009B3A', bgColor: '#E6F7ED', borderColor: '#8DD4A8' },
    'Brazil': { color: '#009B3A', bgColor: '#E6F7ED', borderColor: '#8DD4A8' },
    '태국': { color: '#241D4F', bgColor: '#EDEAF5', borderColor: '#B5AFD6' },
    'Thailand': { color: '#241D4F', bgColor: '#EDEAF5', borderColor: '#B5AFD6' },
    '중국': { color: '#DE2910', bgColor: '#FDE8E6', borderColor: '#F5ACA5' },
    'China': { color: '#DE2910', bgColor: '#FDE8E6', borderColor: '#F5ACA5' },
    '미국': { color: '#002868', bgColor: '#E6EBF5', borderColor: '#99ABD1' },
    'USA': { color: '#002868', bgColor: '#E6EBF5', borderColor: '#99ABD1' },
    '모나코': { color: '#CE1126', bgColor: '#FCEBEE', borderColor: '#F0A8B1' },
    'Monaco': { color: '#CE1126', bgColor: '#FCEBEE', borderColor: '#F0A8B1' },
    '대만': { color: '#0048B0', bgColor: '#E8EEF9', borderColor: '#99B4E0' },
    'Taiwan': { color: '#0048B0', bgColor: '#E8EEF9', borderColor: '#99B4E0' },
    '한국': { color: '#003478', bgColor: '#E6EDF7', borderColor: '#8FAEDB' },
    'South Korea': { color: '#003478', bgColor: '#E6EDF7', borderColor: '#8FAEDB' },
    '일본': { color: '#BC002D', bgColor: '#FCEAEF', borderColor: '#EEA0B5' },
    'Japan': { color: '#BC002D', bgColor: '#FCEAEF', borderColor: '#EEA0B5' },
    'UAE': { color: '#00732F', bgColor: '#E6F3EC', borderColor: '#8DD4B3' },
    '콜롬비아': { color: '#8B6914', bgColor: '#FDF5E1', borderColor: '#E2C872' },
    'Colombia': { color: '#8B6914', bgColor: '#FDF5E1', borderColor: '#E2C872' },
    '베트남': { color: '#DA251D', bgColor: '#FDE9E8', borderColor: '#F3AAA6' },
    'Vietnam': { color: '#DA251D', bgColor: '#FDE9E8', borderColor: '#F3AAA6' },
    '인도네시아': { color: '#CE1126', bgColor: '#FCEBED', borderColor: '#F0A8B1' },
    'Indonesia': { color: '#CE1126', bgColor: '#FCEBED', borderColor: '#F0A8B1' },
    '홍콩': { color: '#9B1B30', bgColor: '#F8E9EC', borderColor: '#D9A0AE' },
    'Hong Kong': { color: '#9B1B30', bgColor: '#F8E9EC', borderColor: '#D9A0AE' },
    '싱가포르': { color: '#EF3340', bgColor: '#FDECEE', borderColor: '#F9B0B6' },
    'Singapore': { color: '#EF3340', bgColor: '#FDECEE', borderColor: '#F9B0B6' },
    '인도': { color: '#D96B00', bgColor: '#FFF3E6', borderColor: '#F5C88A' },
    'India': { color: '#D96B00', bgColor: '#FFF3E6', borderColor: '#F5C88A' },
};

const DEFAULT_COUNTRY_COLOR = { color: '#3B82F6', bgColor: '#EFF6FF', borderColor: '#BFDBFE' };
function getCountryColor(country: string) {
    return COUNTRY_COLORS[country] || DEFAULT_COUNTRY_COLOR;
}

// ─── 2026 Conference Data ───
const CONFERENCES: ConferenceEvent[] = [
    {
        id: 'imcas-world-2026', series: 'IMCAS',
        name: { ko: 'IMCAS World Congress', en: 'IMCAS World Congress' },
        startDate: '2026-01-29', endDate: '2026-01-31',
        city: { ko: '파리', en: 'Paris' }, country: { ko: '프랑스', en: 'France' },
        venue: 'Palais des Congrès de Paris', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-world-congress-2026',
    },
    {
        id: 'amwc-americas-2026', series: 'AMWC',
        name: { ko: 'AMWC Americas', en: 'AMWC Americas' },
        startDate: '2026-02-14', endDate: '2026-02-16',
        city: { ko: '마이애미', en: 'Miami' }, country: { ko: '미국', en: 'USA' },
        venue: 'JW Marriott Miami Turnberry Resort', confirmed: true,
        url: 'https://www.amwcamericas.com',
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
        id: 'kimes-2026', series: 'KIMES',
        name: { ko: 'KIMES 2026', en: 'KIMES 2026' },
        startDate: '2026-03-19', endDate: '2026-03-22',
        city: { ko: '서울', en: 'Seoul' }, country: { ko: '한국', en: 'South Korea' },
        venue: 'COEX', confirmed: true,
        url: 'https://kimes.kr/en',
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
        id: 'amwc-asia-2026', series: 'AMWC',
        name: { ko: 'AMWC Asia', en: 'AMWC Asia' },
        startDate: '2026-05-01', endDate: '2026-05-03',
        city: { ko: '타이베이', en: 'Taipei' }, country: { ko: '대만', en: 'Taiwan' },
        venue: 'Taipei Intl Convention Center (TICC)', confirmed: true,
        url: 'https://www.amwc-asia.com',
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
        id: 'amwc-brazil-2026', series: 'AMWC',
        name: { ko: 'AMWC Brazil', en: 'AMWC Brazil' },
        startDate: '2026-06-17', endDate: '2026-06-19',
        city: { ko: '상파울루', en: 'São Paulo' }, country: { ko: '브라질', en: 'Brazil' },
        venue: 'Centro de Convenções Frei Caneca', confirmed: true,
        url: 'https://www.amwcbrazil.com.br',
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
        id: 'amwc-korea-2026', series: 'AMWC',
        name: { ko: 'AMWC Korea', en: 'AMWC Korea' },
        startDate: '2026-06-19', endDate: '2026-06-20',
        city: { ko: '서울', en: 'Seoul' }, country: { ko: '한국', en: 'South Korea' },
        venue: '인터컨티넨탈 그랜드 서울 파르나스', confirmed: true,
        url: 'https://www.amwc-korea.com',
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
        id: 'imcas-china-2026', series: 'IMCAS',
        name: { ko: 'IMCAS China', en: 'IMCAS China' },
        startDate: '2026-08-27', endDate: '2026-08-29',
        city: { ko: '상하이', en: 'Shanghai' }, country: { ko: '중국', en: 'China' },
        venue: 'W Hotel - The Bund', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-china-2026',
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
        id: 'dasil-2026', series: 'DASIL',
        name: { ko: 'DASIL 2026', en: 'DASIL 2026' },
        startDate: '2026-10-28', endDate: '2026-10-31',
        city: { ko: '코치', en: 'Kochi' }, country: { ko: '인도', en: 'India' },
        venue: 'TBD', confirmed: false,
        url: 'https://www.dasil.org',
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
        id: 'prs-korea-2026', series: 'PRS Korea',
        name: { ko: 'PRS Korea 2026', en: 'PRS Korea 2026' },
        startDate: '2026-11-05', endDate: '2026-11-07',
        city: { ko: '서울', en: 'Seoul' }, country: { ko: '한국', en: 'South Korea' },
        venue: 'Grand InterContinental (TBD)', confirmed: false,
        url: 'https://www.prskorea.org',
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
        id: 'icad-bangkok-2026', series: 'ICAD Bangkok',
        name: { ko: 'ICAD Bangkok 2026', en: 'ICAD Bangkok 2026' },
        startDate: '2026-11-20', endDate: '2026-11-22',
        city: { ko: '방콕', en: 'Bangkok' }, country: { ko: '태국', en: 'Thailand' },
        venue: 'Centara Grand (TBD)', confirmed: false,
        url: 'https://www.icadbangkok.com',
    },
    {
        id: 'amwc-sea-2026', series: 'AMWC',
        name: { ko: 'AMWC Southeast Asia', en: 'AMWC Southeast Asia' },
        startDate: '2026-11-26', endDate: '2026-11-28',
        city: { ko: '방콕', en: 'Bangkok' }, country: { ko: '태국', en: 'Thailand' },
        venue: 'The Athenee Hotel, Bangkok', confirmed: true,
        url: 'https://www.amwc-southeastasia.com',
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

// ─── Component: Event Detail Panel ───
function EventDetailPanel({ event, onClose, lang }: {
    event: ConferenceEvent; onClose: () => void; lang: 'ko' | 'en';
}) {
    const isPast = new Date(event.endDate) < new Date();
    const isOngoing = new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();
    const cc = getCountryColor(event.country[lang]);

    const statusLabel = isOngoing ? { ko: '진행 중', en: 'LIVE' } : isPast ? { ko: '종료', en: 'ENDED' } : { ko: '예정', en: 'UPCOMING' };
    const statusStyle = isOngoing ? 'bg-emerald-100 text-emerald-700' : isPast ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border border-gray-200 ring-1 ring-black/5 p-6 animate-fade-in-down mb-8">
            <div
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${cc.color}20 0%, transparent 70%)` }}
            />

            <div className="relative z-10">
                {/* Header: Tags & Close */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {event.series}
                        </span>
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${statusStyle}`}>
                            {statusLabel[lang]}
                        </span>
                        {!event.confirmed && (
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-100">
                                {lang === 'ko' ? '미확정' : 'TBC'}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors -mr-2 -mt-2"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Title & Website Button Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                        {event.name[lang]}
                    </h3>

                    {event.url && (
                        <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[10px] font-bold uppercase tracking-wide transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0 self-start md:self-auto"
                            style={{ backgroundColor: cc.color }}
                        >
                            {lang === 'ko' ? '공식 웹사이트' : 'Official Website'}
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '일정' : 'Date'}</p>
                            <p className="text-sm font-semibold text-gray-800">{formatDateRange(event.startDate, event.endDate, lang)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '위치' : 'Location'}</p>
                            <div className="flex items-center gap-1.5">
                                <FlagIcon country={event.country[lang]} size={16} />
                                <p className="text-sm font-semibold text-gray-800">{event.city[lang]}, {event.country[lang]}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '장소' : 'Venue'}</p>
                            <p className="text-sm font-semibold text-gray-800">{event.venue}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EmbeddedEventDetailPanel({ event, lang }: {
    event: ConferenceEvent; lang: 'ko' | 'en';
}) {
    const isPast = new Date(event.endDate) < new Date();
    const isOngoing = new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();
    const cc = getCountryColor(event.country[lang]);

    const statusLabel = isOngoing ? { ko: '진행 중', en: 'LIVE' } : isPast ? { ko: '종료', en: 'ENDED' } : { ko: '예정', en: 'UPCOMING' };
    const statusStyle = isOngoing ? 'bg-emerald-100 text-emerald-700' : isPast ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-600';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200 ring-1 ring-black/5 p-6 animate-fade-in h-fit sticky top-24">
            <div
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${cc.color}20 0%, transparent 70%)` }}
            />

            <div className="relative z-10 w-full min-w-0">
                {/* Header: Tags */}
                <div className="flex items-start justify-between mb-3 w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {event.series}
                        </span>
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${statusStyle}`}>
                            {statusLabel[lang]}
                        </span>
                        {!event.confirmed && (
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-orange-50 text-orange-500 border border-orange-100">
                                {lang === 'ko' ? '미확정' : 'TBC'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Title & Website Button Row */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 w-full">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight break-words">
                        {event.name[lang]}
                    </h3>

                    {event.url && (
                        <a
                            href={event.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[10px] font-bold uppercase tracking-wide transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 shrink-0 self-start xl:self-auto"
                            style={{ backgroundColor: cc.color }}
                        >
                            {lang === 'ko' ? '공식 웹사이트' : 'Official Website'}
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-8 pt-4 border-t border-gray-100 w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '일정' : 'Date'}</p>
                            <p className="text-sm font-semibold text-gray-800">{formatDateRange(event.startDate, event.endDate, lang)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '위치' : 'Location'}</p>
                            <div className="flex items-center gap-1.5">
                                <FlagIcon country={event.country[lang]} size={16} />
                                <p className="text-sm font-semibold text-gray-800">{event.city[lang]}, {event.country[lang]}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '장소' : 'Venue'}</p>
                            <p className="text-sm font-semibold text-gray-800 break-words">{event.venue}</p>
                        </div>
                    </div>
                </div>
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

    // Pagination Removed as per user request
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

    const upcomingEvents = useMemo(() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return filteredConferences
            .filter((c) => new Date(c.endDate) >= today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [filteredConferences]);

    // Master-Detail View State for Upcoming Events
    const [focusedEvent, setFocusedEvent] = useState<ConferenceEvent | null>(null);

    // Initialize focused event when list changes
    useEffect(() => {
        if (upcomingEvents.length > 0) {
            setFocusedEvent(upcomingEvents[0]);
        } else {
            setFocusedEvent(null);
        }
    }, [upcomingEvents]);


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

    return (
        <main className="min-h-screen bg-gray-50/50 p-6 md:p-12 pb-24">
            <div className="max-w-[1400px] mx-auto space-y-8">

                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-xl animate-fade-in">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 p-8 md:p-10">
                        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                            <Globe className="w-10 h-10 text-cyan-200" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                                Global Conferences
                            </h2>
                            <p className="text-blue-100 md:text-lg max-w-2xl font-light">
                                {lang === 'ko'
                                    ? `2026년 주요 글로벌 미용의학 컨퍼런스 일정`
                                    : `2026 Global Aesthetic Medicine Conferences`}
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-100 text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    {CONFERENCES.length} Events
                                </span>
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5" />
                                    {ALL_COUNTRIES_EN.length} Countries
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedEvent && (
                    <div className="animate-fade-in-up">
                        <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} lang={lang} />
                    </div>
                )}

                {/* Grid: Calendar (Left) & Filters (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Calendar (Compact) - Span 7 */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-xl ring-1 ring-black/5 overflow-hidden">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                ←
                            </button>
                            <div className="text-center">
                                <h2 className="text-xl font-black tracking-tight text-gray-900">
                                    {lang === 'ko' ? `${year}년 ${monthNames[month]}` : `${monthNames[month]} ${year}`}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={goToToday} className="hidden sm:block text-[10px] font-bold text-gray-500 hover:text-blue-600 px-2 py-1.5 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-all">
                                    {lang === 'ko' ? '오늘' : 'Today'}
                                </button>
                                <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                    →
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30">
                            {dayNames.map((day, i) => (
                                <div key={day} className={`text-center py-2 text-[10px] font-bold tracking-widest uppercase ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 bg-white">
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-[80px] bg-gray-50/20 border-b border-r border-gray-50" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayOfWeek = (firstDay + i) % 7;
                                const events = getEventsForDay(day);
                                const today = isToday(year, month, day);
                                return (
                                    <div key={`day-${day}`} className={`min-h-[80px] border-b border-r border-gray-100 p-1 transition-all hover:bg-blue-50/30 flex flex-col gap-0.5 group relative ${today ? 'bg-blue-50/20' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <span className={`w-5 h-5 flex items-center justify-center rounded-md text-xs font-bold transition-all ${today
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-blue-400' : 'text-gray-700'
                                                }`}>
                                                {day}
                                            </span>
                                        </div>
                                        <div className="space-y-0.5 mt-0.5">
                                            {events.slice(0, 2).map((event) => {
                                                const cc = getCountryColor(event.country[lang]);
                                                const isSel = selectedEvent?.id === event.id;
                                                return (
                                                    <button
                                                        key={event.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedEvent(selectedEvent?.id === event.id ? null : event);
                                                            window.scrollTo({ top: 100, behavior: 'smooth' });
                                                        }}
                                                        className={`w-full text-left text-[9px] font-bold px-1 py-0.5 rounded-[4px] truncate transition-all duration-200 border flex items-center gap-1 leading-none
                                                        ${isSel ? 'scale-105 shadow-md z-10' : 'hover:scale-105 hover:shadow-sm hover:z-10'}`}
                                                        style={isSel
                                                            ? { backgroundColor: cc.color, color: '#fff', borderColor: cc.color }
                                                            : { backgroundColor: cc.bgColor, color: cc.color, borderColor: cc.borderColor }
                                                        }
                                                    >
                                                        <span className="shrink-0"><FlagIcon country={event.country[lang]} size={9} /></span>
                                                        <span className="truncate">{event.name[lang].replace(/ 2026.*/, '')}</span>
                                                    </button>
                                                );
                                            })}
                                            {events.length > 2 && (
                                                <p className="text-[8px] text-gray-400 font-bold px-1 text-center leading-none">+{events.length - 2}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
                                <div key={`empty-end-${i}`} className="min-h-[80px] bg-gray-50/20 border-b border-r border-gray-50" />
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Filters - Span 5 */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Series Filter */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {lang === 'ko' ? '시리즈 필터' : 'Filter by Series'}
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => { setSeriesFilter('ALL'); setSelectedEvent(null); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${seriesFilter === 'ALL'
                                        ? 'bg-slate-800 text-white shadow-md border-transparent'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    ALL
                                </button>
                                {ALL_SERIES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setSeriesFilter(seriesFilter === s ? 'ALL' : s); setSelectedEvent(null); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${seriesFilter === s
                                            ? 'bg-blue-600 text-white shadow-md border-transparent'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Country Filter */}
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    {lang === 'ko' ? '국가 필터' : 'Filter by Country'}
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                <button
                                    onClick={() => { setCountryFilter('ALL'); setSelectedEvent(null); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${countryFilter === 'ALL'
                                        ? 'bg-slate-800 text-white shadow-md border-transparent'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    {lang === 'ko' ? '전체' : 'All'}
                                </button>
                                {countries.map((c) => {
                                    const isActive = countryFilter === c;
                                    const cc = getCountryColor(c);
                                    return (
                                        <button
                                            key={c}
                                            onClick={() => { setCountryFilter(isActive ? 'ALL' : c); setSelectedEvent(null); }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${isActive
                                                ? 'bg-blue-600 text-white shadow-md border-transparent'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:scale-[1.02]'
                                                }`}
                                        >
                                            <FlagIcon country={c} size={14} /> {c}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Upcoming Events (Master-Detail View) */}
                <div className="pt-8 space-y-5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 border-l-4 border-blue-600 pl-3">
                                {lang === 'ko' ? '다가오는 일정' : 'Upcoming Events'}
                            </h3>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                Total {upcomingEvents.length}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Left List */}
                        <div className="lg:col-span-6 flex flex-col gap-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {upcomingEvents.map((event) => {
                                const cc = getCountryColor(event.country[lang]);
                                const startDate = new Date(event.startDate);
                                const isOngoing = new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();
                                const isFocused = focusedEvent?.id === event.id;

                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => setFocusedEvent(event)}
                                        className={`group bg-white rounded-xl p-3 border shadow-sm cursor-pointer transition-all relative overflow-hidden flex items-center justify-between gap-3
                                             ${isFocused
                                                ? 'border-blue-500 ring-2 ring-blue-100 shadow-md scale-[1.01]'
                                                : 'border-gray-100 hover:border-blue-200 hover:shadow-md hover:scale-[1.005]'
                                            }`}
                                    >
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1 transition-all"
                                            style={{ backgroundColor: cc.color }}
                                        />

                                        <div className="flex items-center gap-4 pl-3 flex-1 min-w-0">
                                            <div className="flex flex-col items-center justify-center w-10 shrink-0">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">{lang === 'ko' ? `${startDate.getMonth() + 1}월` : MONTH_NAMES_EN[startDate.getMonth()].substring(0, 3)}</span>
                                                <span className="text-lg font-bold text-gray-900 leading-tight">{startDate.getDate()}</span>
                                            </div>

                                            <div className="min-w-0 flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    {isOngoing && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 animate-pulse uppercase">LIVE</span>
                                                    )}
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                                        {event.series}
                                                    </span>
                                                </div>
                                                <h4 className={`text-sm font-bold transition-colors truncate ${isFocused ? 'text-blue-700' : 'text-gray-900 group-hover:text-blue-700'}`}>
                                                    {event.name[lang]}
                                                </h4>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Right Detail Panel (Sticky) */}
                        <div className="hidden lg:block lg:col-span-6 lg:sticky lg:top-24">
                            {focusedEvent ? (
                                <EmbeddedEventDetailPanel event={focusedEvent} lang={lang} />
                            ) : (
                                <div className="h-64 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-gray-400">
                                    {lang === 'ko' ? '일정을 선택하세요' : 'Select an event'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
