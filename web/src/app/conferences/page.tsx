'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageContext';
import { Globe, Calendar as CalendarIcon, MapPin, ExternalLink, X, Filter, ChevronRight, ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import { supabase } from '@/lib/supabaseClient';

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
    '영국': 'gb', 'United Kingdom': 'gb',
    '이탈리아': 'it', 'Italy': 'it',
    '포르투갈': 'pt', 'Portugal': 'pt',
    '스페인': 'es', 'Spain': 'es',
    '오스트리아': 'at', 'Austria': 'at',
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
    '영국': { color: '#1F3C88', bgColor: '#E8EDF8', borderColor: '#A3B5E3' },
    'United Kingdom': { color: '#1F3C88', bgColor: '#E8EDF8', borderColor: '#A3B5E3' },
    '이탈리아': { color: '#008C45', bgColor: '#E8F6EE', borderColor: '#9EDBB8' },
    'Italy': { color: '#008C45', bgColor: '#E8F6EE', borderColor: '#9EDBB8' },
    '포르투갈': { color: '#046A38', bgColor: '#E7F5EE', borderColor: '#9AD7BE' },
    'Portugal': { color: '#046A38', bgColor: '#E7F5EE', borderColor: '#9AD7BE' },
    '스페인': { color: '#AA151B', bgColor: '#FBEAEC', borderColor: '#E8A6AB' },
    'Spain': { color: '#AA151B', bgColor: '#FBEAEC', borderColor: '#E8A6AB' },
    '오스트리아': { color: '#ED2939', bgColor: '#FDECEE', borderColor: '#F7B5BC' },
    'Austria': { color: '#ED2939', bgColor: '#FDECEE', borderColor: '#F7B5BC' },
};

const DEFAULT_COUNTRY_COLOR = { color: '#3B82F6', bgColor: '#EFF6FF', borderColor: '#BFDBFE' };
function getCountryColor(country: string) {
    return COUNTRY_COLORS[country] || DEFAULT_COUNTRY_COLOR;
}

// Conference Data (2025-2026 Verified)
const CONFERENCES: ConferenceEvent[] = [
    {
        id: 'imcas-world-2025', series: 'IMCAS',
        name: { ko: 'IMCAS World Congress 2025', en: 'IMCAS World Congress 2025' },
        startDate: '2025-01-30', endDate: '2025-02-01',
        city: { ko: 'Paris', en: 'Paris' }, country: { ko: 'France', en: 'France' },
        venue: 'Palais des Congres de Paris', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-world-congress-2025',
    },
    {
        id: 'amwc-americas-2025', series: 'AMWC',
        name: { ko: 'AMWC Americas 2025', en: 'AMWC Americas 2025' },
        startDate: '2025-02-15', endDate: '2025-02-17',
        city: { ko: 'Miami', en: 'Miami' }, country: { ko: 'USA', en: 'USA' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.amwcamericas.com/en/practical-info/cme-accreditation.html',
    },
    {
        id: 'aad-annual-2025', series: 'AAD',
        name: { ko: 'AAD Annual Meeting 2025', en: 'AAD Annual Meeting 2025' },
        startDate: '2025-03-07', endDate: '2025-03-11',
        city: { ko: 'Orlando', en: 'Orlando' }, country: { ko: 'USA', en: 'USA' },
        venue: 'TBD', confirmed: false,
        url: 'https://www.aad.org/member/meetings/archive',
    },
    {
        id: 'aesthetic-meet-2025', series: 'Aesthetic MEET',
        name: { ko: 'The Aesthetic MEET 2025', en: 'The Aesthetic MEET 2025' },
        startDate: '2025-03-20', endDate: '2025-03-23',
        city: { ko: 'Austin', en: 'Austin' }, country: { ko: 'USA', en: 'USA' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.theaestheticmeet.org/info/',
    },
    {
        id: 'amwc-monaco-2025', series: 'AMWC',
        name: { ko: 'AMWC Monaco 2025', en: 'AMWC Monaco 2025' },
        startDate: '2025-03-27', endDate: '2025-03-29',
        city: { ko: 'Monte Carlo', en: 'Monte Carlo' }, country: { ko: 'Monaco', en: 'Monaco' },
        venue: 'Grimaldi Forum', confirmed: true,
        url: 'https://www.amwc-conference.com/content/dam/markets/aest/amwc-conference/2025/pdf/amwc2025-program-new.pdf',
    },
    {
        id: 'dubai-derma-2025', series: 'Dubai Derma',
        name: { ko: 'Dubai Derma 2025', en: 'Dubai Derma 2025' },
        startDate: '2025-04-14', endDate: '2025-04-16',
        city: { ko: 'Dubai', en: 'Dubai' }, country: { ko: 'UAE', en: 'UAE' },
        venue: 'Dubai World Trade Centre', confirmed: true,
        url: 'https://www.dubaiderma.com/',
    },
    {
        id: 'sime-congress-2025', series: 'SIME',
        name: { ko: 'SIME Congress 2025', en: 'SIME Congress 2025' },
        startDate: '2025-05-16', endDate: '2025-05-18',
        city: { ko: 'Rome', en: 'Rome' }, country: { ko: 'Italy', en: 'Italy' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.simecongress.com/',
    },
    {
        id: 'fivecc-2025', series: '5CC',
        name: { ko: '5-Continent Congress 2025', en: '5-Continent Congress 2025' },
        startDate: '2025-05-29', endDate: '2025-05-31',
        city: { ko: 'Lisbon', en: 'Lisbon' }, country: { ko: 'Portugal', en: 'Portugal' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.5-cc.com/',
    },
    {
        id: 'vegas-cosmetic-surgery-2025', series: 'VCS',
        name: { ko: 'Vegas Cosmetic Surgery 2025', en: 'Vegas Cosmetic Surgery 2025' },
        startDate: '2025-05-29', endDate: '2025-05-31',
        city: { ko: 'Las Vegas', en: 'Las Vegas' }, country: { ko: 'USA', en: 'USA' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.vegascosmeticsurgery.com/en/scientific-program/accreditation.html',
    },
    {
        id: 'eadv-congress-2025', series: 'EADV',
        name: { ko: 'EADV Congress 2025', en: 'EADV Congress 2025' },
        startDate: '2025-09-17', endDate: '2025-09-20',
        city: { ko: 'Paris', en: 'Paris' }, country: { ko: 'France', en: 'France' },
        venue: 'TBD', confirmed: true,
        url: 'https://eadv.org/event/sessions-at-the-eadv-congress-2025/',
    },
    {
        id: 'ccr-london-2025', series: 'CCR London',
        name: { ko: 'CCR London 2025', en: 'CCR London 2025' },
        startDate: '2025-09-25', endDate: '2025-09-26',
        city: { ko: 'London', en: 'London' }, country: { ko: 'United Kingdom', en: 'United Kingdom' },
        venue: 'ExCeL London', confirmed: true,
        url: 'https://www.ccrlondon.com/',
    },
    {
        id: 'global-aesthetics-conference-2025', series: 'Global Aesthetics Conference',
        name: { ko: 'Global Aesthetics Conference 2025', en: 'Global Aesthetics Conference 2025' },
        startDate: '2025-10-30', endDate: '2025-11-02',
        city: { ko: 'Miami Beach', en: 'Miami Beach' }, country: { ko: 'USA', en: 'USA' },
        venue: 'Loews Miami Beach Hotel', confirmed: true,
        url: 'https://globalaestheticsconference.com/',
    },
    {
        id: 'asds-annual-meeting-2025', series: 'ASDS',
        name: { ko: 'ASDS Annual Meeting 2025', en: 'ASDS Annual Meeting 2025' },
        startDate: '2025-11-13', endDate: '2025-11-16',
        city: { ko: 'Chicago', en: 'Chicago' }, country: { ko: 'USA', en: 'USA' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.asds.net/AnnualMeeting',
    },
    {
        id: 'toxins-2026', series: 'TOXINS',
        name: { ko: 'TOXINS 2026', en: 'TOXINS 2026' },
        startDate: '2026-01-14', endDate: '2026-01-17',
        city: { ko: 'Madrid', en: 'Madrid' }, country: { ko: 'Spain', en: 'Spain' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.neurotoxins.org/',
    },
    {
        id: 'imcas-world-2026', series: 'IMCAS',
        name: { ko: 'IMCAS World Congress 2026', en: 'IMCAS World Congress 2026' },
        startDate: '2026-01-29', endDate: '2026-01-31',
        city: { ko: 'Paris', en: 'Paris' }, country: { ko: 'France', en: 'France' },
        venue: 'Palais des Congres de Paris', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-world-congress-2026',
    },
    {
        id: 'south-beach-symposium-2026', series: 'South Beach Symposium',
        name: { ko: 'South Beach Symposium 2026', en: 'South Beach Symposium 2026' },
        startDate: '2026-02-05', endDate: '2026-02-08',
        city: { ko: 'Miami Beach', en: 'Miami Beach' }, country: { ko: 'USA', en: 'USA' },
        venue: 'Loews Miami Beach Hotel', confirmed: true,
        url: 'https://www.southbeachsymposium.org/',
    },
    {
        id: 'amwc-americas-2026', series: 'AMWC',
        name: { ko: 'AMWC Americas 2026', en: 'AMWC Americas 2026' },
        startDate: '2026-02-14', endDate: '2026-02-16',
        city: { ko: 'Miami', en: 'Miami' }, country: { ko: 'USA', en: 'USA' },
        venue: 'JW Marriott Miami Turnberry Resort', confirmed: true,
        url: 'https://www.amwcamericas.com/en/aesthetic-medicine-conference-miami-2026/aesthetic-medicine-conference-miami-2026.html',
    },
    {
        id: 'ace-london-2026', series: 'ACE',
        name: { ko: 'ACE London 2026', en: 'ACE London 2026' },
        startDate: '2026-03-13', endDate: '2026-03-14',
        city: { ko: 'London', en: 'London' }, country: { ko: 'United Kingdom', en: 'United Kingdom' },
        venue: 'Business Design Centre', confirmed: true,
        url: 'https://www.aestheticsconference.com/ace-london-2026/',
    },
    {
        id: 'imcas-americas-2026', series: 'IMCAS',
        name: { ko: 'IMCAS Americas 2026', en: 'IMCAS Americas 2026' },
        startDate: '2026-03-13', endDate: '2026-03-15',
        city: { ko: 'Sao Paulo', en: 'Sao Paulo' }, country: { ko: 'Brazil', en: 'Brazil' },
        venue: 'The World Trade Center Sao Paulo', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-americas-2026',
    },
    {
        id: 'kimes-2026', series: 'KIMES',
        name: { ko: 'KIMES 2026', en: 'KIMES 2026' },
        startDate: '2026-03-19', endDate: '2026-03-22',
        city: { ko: 'Seoul', en: 'Seoul' }, country: { ko: 'South Korea', en: 'South Korea' },
        venue: 'COEX', confirmed: true,
        url: 'https://kimes.kr/en',
    },
    {
        id: 'amwc-monaco-2026', series: 'AMWC',
        name: { ko: 'AMWC Monaco 2026', en: 'AMWC Monaco 2026' },
        startDate: '2026-03-26', endDate: '2026-03-28',
        city: { ko: 'Monte Carlo', en: 'Monte Carlo' }, country: { ko: 'Monaco', en: 'Monaco' },
        venue: 'Grimaldi Forum', confirmed: true,
        url: 'https://www.amwc-conference.com/en/home.html',
    },
    {
        id: 'aad-annual-2026', series: 'AAD',
        name: { ko: 'AAD Annual Meeting 2026', en: 'AAD Annual Meeting 2026' },
        startDate: '2026-03-27', endDate: '2026-03-31',
        city: { ko: 'Denver', en: 'Denver' }, country: { ko: 'USA', en: 'USA' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.aad.org/member/meetings-education/am26',
    },
    {
        id: 'dubai-derma-2026', series: 'Dubai Derma',
        name: { ko: 'Dubai Derma 2026', en: 'Dubai Derma 2026' },
        startDate: '2026-03-31', endDate: '2026-04-02',
        city: { ko: 'Dubai', en: 'Dubai' }, country: { ko: 'UAE', en: 'UAE' },
        venue: 'Dubai World Trade Centre', confirmed: true,
        url: 'https://www.dubaiderma.com/',
    },
    {
        id: 'aps-korea-2026', series: 'APS Korea',
        name: { ko: 'APS Korea 2026', en: 'APS Korea 2026' },
        startDate: '2026-04-04', endDate: '2026-04-05',
        city: { ko: 'Seoul', en: 'Seoul' }, country: { ko: 'South Korea', en: 'South Korea' },
        venue: 'COEX (TBD)', confirmed: false,
        url: 'https://www.apskorea.or.kr',
    },
    {
        id: 'idax-2026', series: 'IDAX',
        name: { ko: 'IDAX 2026', en: 'IDAX 2026' },
        startDate: '2026-04-09', endDate: '2026-04-11',
        city: { ko: 'Hanoi', en: 'Hanoi' }, country: { ko: 'Vietnam', en: 'Vietnam' },
        venue: 'NECC', confirmed: true,
        url: 'https://www.idaxexpo.com',
    },
    {
        id: 'ceswam-2026', series: 'SWAM',
        name: { ko: 'CeSWAM 2026', en: 'CeSWAM 2026' },
        startDate: '2026-04-17', endDate: '2026-04-19',
        city: { ko: 'Semarang', en: 'Semarang' }, country: { ko: 'Indonesia', en: 'Indonesia' },
        venue: 'Padma Hotel', confirmed: true,
        url: 'https://swam.id',
    },
    {
        id: 'amwc-asia-2026', series: 'AMWC',
        name: { ko: 'AMWC Asia 2026', en: 'AMWC Asia 2026' },
        startDate: '2026-05-01', endDate: '2026-05-03',
        city: { ko: 'Taipei', en: 'Taipei' }, country: { ko: 'Taiwan', en: 'Taiwan' },
        venue: 'Taipei Intl Convention Center', confirmed: true,
        url: 'https://www.amwc-asia.com',
    },
    {
        id: 'bcam-conference-2026', series: 'BCAM',
        name: { ko: 'BCAM Conference 2026', en: 'BCAM Conference 2026' },
        startDate: '2026-05-02', endDate: '2026-05-02',
        city: { ko: 'London', en: 'London' }, country: { ko: 'United Kingdom', en: 'United Kingdom' },
        venue: 'Royal College of Physicians', confirmed: true,
        url: 'https://bcam.ac.uk/events-calendar/',
    },
    {
        id: 'scale-nashville-2026', series: 'SCALE',
        name: { ko: 'SCALE Nashville 2026', en: 'SCALE Nashville 2026' },
        startDate: '2026-05-13', endDate: '2026-05-17',
        city: { ko: 'Nashville', en: 'Nashville' }, country: { ko: 'USA', en: 'USA' },
        venue: 'Music City Center', confirmed: true,
        url: 'https://www.scalemusiccity.com/',
    },
    {
        id: 'cbe-2026', series: 'CBE',
        name: { ko: 'CBE 2026 (China Beauty Expo)', en: 'CBE 2026 (China Beauty Expo)' },
        startDate: '2026-05-12', endDate: '2026-05-14',
        city: { ko: 'Shanghai', en: 'Shanghai' }, country: { ko: 'China', en: 'China' },
        venue: 'SNIEC', confirmed: true,
        url: 'https://www.chinabeautyexpo.com',
    },
    {
        id: 'vegas-cosmetic-surgery-2026', series: 'VCS',
        name: { ko: 'Vegas Cosmetic Surgery 2026', en: 'Vegas Cosmetic Surgery 2026' },
        startDate: '2026-05-28', endDate: '2026-05-30',
        city: { ko: 'Las Vegas', en: 'Las Vegas' }, country: { ko: 'USA', en: 'USA' },
        venue: 'Fontainebleau Las Vegas', confirmed: true,
        url: 'https://www.vegascosmeticsurgery.com/',
    },
    {
        id: 'weswam-2026', series: 'SWAM',
        name: { ko: 'WeSWAM 2026', en: 'WeSWAM 2026' },
        startDate: '2026-06-12', endDate: '2026-06-14',
        city: { ko: 'Bandung', en: 'Bandung' }, country: { ko: 'Indonesia', en: 'Indonesia' },
        venue: 'El Hotel', confirmed: true,
        url: 'https://swam.id',
    },
    {
        id: 'korea-derma-2026', series: 'Korea Derma',
        name: { ko: 'Korea Derma 2026', en: 'Korea Derma 2026' },
        startDate: '2026-06-15', endDate: '2026-06-17',
        city: { ko: 'Seoul', en: 'Seoul' }, country: { ko: 'South Korea', en: 'South Korea' },
        venue: 'The-K Hotel (TBD)', confirmed: false,
        url: 'https://www.koderma.co.kr',
    },
    {
        id: 'amwc-brazil-2026', series: 'AMWC',
        name: { ko: 'AMWC Brazil 2026', en: 'AMWC Brazil 2026' },
        startDate: '2026-06-17', endDate: '2026-06-19',
        city: { ko: 'Sao Paulo', en: 'Sao Paulo' }, country: { ko: 'Brazil', en: 'Brazil' },
        venue: 'Frei Caneca Convention Center', confirmed: true,
        url: 'https://www.amwcbrazil.com.br',
    },
    {
        id: 'amwc-korea-2026', series: 'AMWC',
        name: { ko: 'AMWC Korea 2026', en: 'AMWC Korea 2026' },
        startDate: '2026-06-19', endDate: '2026-06-20',
        city: { ko: 'Seoul', en: 'Seoul' }, country: { ko: 'South Korea', en: 'South Korea' },
        venue: 'InterContinental Grand Seoul Parnas', confirmed: true,
        url: 'https://www.amwc-korea.com',
    },
    {
        id: 'imcas-asia-2026', series: 'IMCAS',
        name: { ko: 'IMCAS Asia 2026', en: 'IMCAS Asia 2026' },
        startDate: '2026-06-19', endDate: '2026-06-21',
        city: { ko: 'Bangkok', en: 'Bangkok' }, country: { ko: 'Thailand', en: 'Thailand' },
        venue: 'The Athenee Hotel', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-asia-2026',
    },
    {
        id: 'hksdv-2026', series: 'HKSDV',
        name: { ko: 'HKSDV Annual Meeting 2026', en: 'HKSDV Annual Meeting 2026' },
        startDate: '2026-07-04', endDate: '2026-07-05',
        city: { ko: 'Hong Kong', en: 'Hong Kong' }, country: { ko: 'Hong Kong', en: 'Hong Kong' },
        venue: 'Sheraton Hong Kong Hotel', confirmed: true,
        url: 'https://www.hksdv.org',
    },
    {
        id: 'iswam-bali-2026', series: 'SWAM',
        name: { ko: '8th i-SWAM Bali 2026', en: '8th i-SWAM Bali 2026' },
        startDate: '2026-07-10', endDate: '2026-07-12',
        city: { ko: 'Bali', en: 'Bali' }, country: { ko: 'Indonesia', en: 'Indonesia' },
        venue: 'The Trans Resort Bali', confirmed: true,
        url: 'https://www.internationalswam.com',
    },
    {
        id: 'vietbeauty-2026', series: 'Vietbeauty',
        name: { ko: 'Vietbeauty 2026', en: 'Vietbeauty 2026' },
        startDate: '2026-07-23', endDate: '2026-07-26',
        city: { ko: 'Ho Chi Minh City', en: 'Ho Chi Minh City' }, country: { ko: 'Vietnam', en: 'Vietnam' },
        venue: 'SECC', confirmed: true,
        url: 'https://www.vietbeautyshow.com',
    },
    {
        id: 'imcas-china-2026', series: 'IMCAS',
        name: { ko: 'IMCAS China 2026', en: 'IMCAS China 2026' },
        startDate: '2026-08-27', endDate: '2026-08-29',
        city: { ko: 'Shanghai', en: 'Shanghai' }, country: { ko: 'China', en: 'China' },
        venue: 'W Hotel - The Bund', confirmed: true,
        url: 'https://www.imcas.com/en/imcas-china-2026',
    },
    {
        id: 'medical-fair-asia-2026', series: 'Medical Fair Asia',
        name: { ko: 'Medical Fair Asia 2026', en: 'Medical Fair Asia 2026' },
        startDate: '2026-09-09', endDate: '2026-09-11',
        city: { ko: 'Singapore', en: 'Singapore' }, country: { ko: 'Singapore', en: 'Singapore' },
        venue: 'Marina Bay Sands', confirmed: true,
        url: 'https://www.medicalfair-asia.com',
    },
    {
        id: 'easwam-2026', series: 'SWAM',
        name: { ko: 'EaSWAM 2026', en: 'EaSWAM 2026' },
        startDate: '2026-09-25', endDate: '2026-09-27',
        city: { ko: 'Surabaya', en: 'Surabaya' }, country: { ko: 'Indonesia', en: 'Indonesia' },
        venue: 'Dyandra Convention Ctr', confirmed: true,
        url: 'https://swam.id',
    },
    {
        id: 'eadv-congress-2026', series: 'EADV',
        name: { ko: 'EADV Congress 2026', en: 'EADV Congress 2026' },
        startDate: '2026-09-30', endDate: '2026-10-03',
        city: { ko: 'Vienna', en: 'Vienna' }, country: { ko: 'Austria', en: 'Austria' },
        venue: 'TBD', confirmed: true,
        url: 'https://eadvcongress2026.org/',
    },
    {
        id: 'ccr-london-2026', series: 'CCR London',
        name: { ko: 'CCR London 2026', en: 'CCR London 2026' },
        startDate: '2026-10-01', endDate: '2026-10-02',
        city: { ko: 'London', en: 'London' }, country: { ko: 'United Kingdom', en: 'United Kingdom' },
        venue: 'ExCeL London', confirmed: true,
        url: 'https://www.ccrlondon.com/',
    },
    {
        id: 'medical-japan-2026', series: 'Medical Japan',
        name: { ko: 'Medical Japan Tokyo 2026', en: 'Medical Japan Tokyo 2026' },
        startDate: '2026-10-07', endDate: '2026-10-09',
        city: { ko: 'Tokyo', en: 'Tokyo' }, country: { ko: 'Japan', en: 'Japan' },
        venue: 'Makuhari Messe', confirmed: true,
        url: 'https://www.medical-jpn.jp/tokyo/en-gb.html',
    },
    {
        id: 'amwc-china-2026', series: 'AMWC',
        name: { ko: 'AMWC China 2026', en: 'AMWC China 2026' },
        startDate: '2026-10-16', endDate: '2026-10-18',
        city: { ko: 'Chengdu', en: 'Chengdu' }, country: { ko: 'China', en: 'China' },
        venue: 'Wuzhouqing Convention Center', confirmed: true,
        url: 'https://www.amwcchina.com',
    },
    {
        id: 'amwc-dubai-2026', series: 'AMWC',
        name: { ko: 'AMWC Dubai 2026', en: 'AMWC Dubai 2026' },
        startDate: '2026-10-21', endDate: '2026-10-23',
        city: { ko: 'Dubai', en: 'Dubai' }, country: { ko: 'UAE', en: 'UAE' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.amwc-dubai.com',
    },
    {
        id: 'dasil-2026', series: 'DASIL',
        name: { ko: 'DASIL 2026', en: 'DASIL 2026' },
        startDate: '2026-10-28', endDate: '2026-10-31',
        city: { ko: 'Kochi', en: 'Kochi' }, country: { ko: 'India', en: 'India' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.dasil.org',
    },
    {
        id: 'amwc-latam-2026', series: 'AMWC',
        name: { ko: 'AMWC Latin America 2026', en: 'AMWC Latin America 2026' },
        startDate: '2026-10-29', endDate: '2026-10-31',
        city: { ko: 'Medellin', en: 'Medellin' }, country: { ko: 'Colombia', en: 'Colombia' },
        venue: 'TBD', confirmed: true,
        url: 'https://www.amwc-la.com',
    },
    {
        id: 'prs-korea-2026', series: 'PRS Korea',
        name: { ko: 'PRS Korea 2026', en: 'PRS Korea 2026' },
        startDate: '2026-11-05', endDate: '2026-11-07',
        city: { ko: 'Seoul', en: 'Seoul' }, country: { ko: 'South Korea', en: 'South Korea' },
        venue: 'Grand InterContinental Seoul', confirmed: true,
        url: 'https://www.prskorea.org',
    },
    {
        id: 'cosmoprof-asia-2026', series: 'Cosmoprof Asia',
        name: { ko: 'Cosmoprof Asia 2026', en: 'Cosmoprof Asia 2026' },
        startDate: '2026-11-10', endDate: '2026-11-13',
        city: { ko: 'Hong Kong', en: 'Hong Kong' }, country: { ko: 'Hong Kong', en: 'Hong Kong' },
        venue: 'HKCEC & AsiaWorld', confirmed: true,
        url: 'https://www.cosmoprof-asia.com',
    },
    {
        id: 'icad-bangkok-2026', series: 'ICAD Bangkok',
        name: { ko: 'ICAD Bangkok 2026', en: 'ICAD Bangkok 2026' },
        startDate: '2026-11-20', endDate: '2026-11-22',
        city: { ko: 'Bangkok', en: 'Bangkok' }, country: { ko: 'Thailand', en: 'Thailand' },
        venue: 'Centara Grand (TBD)', confirmed: false,
        url: 'https://www.icadbangkok.com',
    },
    {
        id: 'amwc-sea-2026', series: 'AMWC',
        name: { ko: 'AMWC Southeast Asia 2026', en: 'AMWC Southeast Asia 2026' },
        startDate: '2026-11-26', endDate: '2026-11-28',
        city: { ko: 'Bangkok', en: 'Bangkok' }, country: { ko: 'Thailand', en: 'Thailand' },
        venue: 'The Athenee Hotel', confirmed: true,
        url: 'https://www.amwc-southeastasia.com',
    },
    {
        id: 'iswam-world-2026', series: 'SWAM',
        name: { ko: '17th i-SWAM World Congress 2026', en: '17th i-SWAM World Congress 2026' },
        startDate: '2026-12-04', endDate: '2026-12-06',
        city: { ko: 'Tangerang', en: 'Tangerang' }, country: { ko: 'Indonesia', en: 'Indonesia' },
        venue: 'ICE BSD City', confirmed: true,
        url: 'https://www.internationalswam.com',
    },
];

// ─── Derived Data ───
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
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 ring-1 ring-black/5 p-6 animate-fade-in-down mb-8">
            <div
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none opacity-50 dark:opacity-30"
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
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/50">
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
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
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatDateRange(event.startDate, event.endDate, lang)}</p>
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
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{event.city[lang]}, {event.country[lang]}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '장소' : 'Venue'}</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{event.venue}</p>
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
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 ring-1 ring-black/5 p-6 animate-fade-in h-fit sticky top-24">
            <div
                className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none opacity-50 dark:opacity-30"
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
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight break-words">
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
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatDateRange(event.startDate, event.endDate, lang)}</p>
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
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{event.city[lang]}, {event.country[lang]}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{lang === 'ko' ? '장소' : 'Venue'}</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-words">{event.venue}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Filter Section Component ───
// ─── Filter Section Component ───
function FilterSection({
    items,
    selected,
    onSelect,
    type,
    lang,
    valueKey,
    labelKey
}: {
    items: any[],
    selected: string[],
    onSelect: (val: any) => void,
    type: 'text' | 'country',
    lang: 'ko' | 'en',
    valueKey?: string,
    labelKey?: string
}) {
    const [expanded, setExpanded] = useState(false);
    // Button height approx 36px + gap 8px. 3 rows = ~124px.
    // We set max-height slightly less than 3 full rows to show continuity, or exact to show 3 rows.
    // Let's rely on gradient to hide the cut-off.
    const COLLAPSED_HEIGHT = 'max-h-[140px]';

    const contentRef = React.useRef<HTMLDivElement>(null);
    const [showToggle, setShowToggle] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
            if (contentRef.current.scrollHeight > 150) { // Threshold slightly larger than limit
                setShowToggle(true);
            }
        }
    }, [items]);

    return (
        <div className="relative">
            <div
                ref={contentRef}
                className={`flex flex-wrap gap-2 transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[1000px]' : COLLAPSED_HEIGHT}`}
            >
                {items.map((item) => {
                    const value = valueKey ? item[valueKey] : item;
                    // Use labelKey if available, otherwise fallback to item[lang] for country or item for text
                    const label = labelKey ? item[labelKey] : (type === 'country' ? item[lang] : item);
                    const isActive = selected.includes(value);

                    if (type === 'country') {
                        return (
                            <button
                                key={value}
                                onClick={() => onSelect(value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${isActive
                                    ? 'bg-blue-600 text-white shadow-md border-transparent'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:text-blue-600 hover:scale-[1.02] dark:hover:bg-gray-700'
                                    }`}
                            >
                                <FlagIcon country={value} size={14} /> {label}
                            </button>
                        );
                    } else {
                        return (
                            <button
                                key={value}
                                onClick={() => onSelect(value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isActive
                                    ? 'bg-blue-600 text-white shadow-md border-transparent'
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {label}
                            </button>
                        );
                    }
                })}
            </div>

            {showToggle && (
                !expanded ? (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-gray-900 dark:via-gray-900/90 dark:to-transparent flex items-end justify-center pb-0 pointer-events-none">
                        <button
                            onClick={() => setExpanded(true)}
                            className="pointer-events-auto transform translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all hover:scale-110 active:scale-95 group"
                            aria-label="Expand"
                        >
                            <ChevronDown className="w-5 h-5 group-hover:animate-bounce-small" />
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center mt-6 relative">
                        <div className="absolute inset-x-0 top-1/2 h-px bg-gray-100 dark:bg-gray-800 border-t border-dashed border-gray-200 dark:border-gray-700" />
                        <button
                            onClick={() => setExpanded(false)}
                            className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all hover:scale-110 active:scale-95"
                            aria-label="Collapse"
                        >
                            <ChevronUp className="w-5 h-5" />
                        </button>
                    </div>
                )
            )}
        </div>
    );
}

// ─── Main Page ───
export default function ConferencesPage() {
    const { language } = useLanguage();
    const lang = language as 'ko' | 'en';

    const currentDate = new Date();
    const [conferences, setConferences] = useState<ConferenceEvent[]>(CONFERENCES);
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(currentDate.getFullYear() === 2026 ? currentDate.getMonth() : 0);
    const [selectedEvent, setSelectedEvent] = useState<ConferenceEvent | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
    const [selectedCountriesEn, setSelectedCountriesEn] = useState<string[]>([]);

    // Pagination Removed as per user request
    const monthNames = lang === 'ko' ? MONTH_NAMES_KO : MONTH_NAMES_EN;
    const dayNames = lang === 'ko' ? DAY_NAMES_KO : DAY_NAMES_EN;
    const allSeries = useMemo(() => Array.from(new Set(conferences.map((c) => c.series))), [conferences]);
    const allCountriesEn = useMemo(() => Array.from(new Set(conferences.map((c) => c.country.en))).sort(), [conferences]);
    const countryOptions = useMemo(() => {
        const countryMap = new Map<string, { ko: string; en: string }>();
        conferences.forEach((c) => {
            if (!countryMap.has(c.country.en)) {
                countryMap.set(c.country.en, { ko: c.country.ko, en: c.country.en });
            }
        });
        const locale = lang === 'ko' ? 'ko' : 'en';
        return Array.from(countryMap.values()).sort((a, b) => a[lang].localeCompare(b[lang], locale));
    }, [conferences, lang]);

    useEffect(() => {
        const fetchConferences = async () => {
            try {
                const { data, error } = await supabase
                    .from('conferences')
                    .select('id, series, name_ko, name_en, start_date, end_date, city_ko, city_en, country_ko, country_en, venue, confirmed, url, is_active')
                    .eq('is_active', true)
                    .order('start_date', { ascending: true })
                    .order('end_date', { ascending: true });

                if (error) throw error;

                if (data && data.length > 0) {
                    const mapped: ConferenceEvent[] = data.map((item: any) => ({
                        id: item.id,
                        series: item.series,
                        name: {
                            ko: item.name_ko,
                            en: item.name_en,
                        },
                        startDate: item.start_date,
                        endDate: item.end_date,
                        city: {
                            ko: item.city_ko,
                            en: item.city_en,
                        },
                        country: {
                            ko: item.country_ko,
                            en: item.country_en,
                        },
                        venue: item.venue,
                        confirmed: Boolean(item.confirmed),
                        url: item.url,
                    }));
                    setConferences(mapped);
                }
            } catch (fetchError) {
                console.error('Failed to fetch conferences from Supabase:', fetchError);
            }
        };

        fetchConferences();
    }, []);

    // Filtered conferences
    const filteredConferences = useMemo(() => {
        let result = conferences;
        if (selectedSeries.length > 0) {
            result = result.filter((c) => selectedSeries.includes(c.series));
        }
        if (selectedCountriesEn.length > 0) {
            result = result.filter((c) => selectedCountriesEn.includes(c.country.en));
        }
        return result;
    }, [conferences, selectedSeries, selectedCountriesEn]);

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
        setSelectedDate(now);
    }

    const calendarRef = React.useRef<HTMLDivElement>(null);
    const lastScrollTime = React.useRef(0);

    useEffect(() => {
        const el = calendarRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            const now = Date.now();
            if (now - lastScrollTime.current < 400) {
                e.preventDefault();
                return;
            }
            if (Math.abs(e.deltaY) > 20) {
                e.preventDefault();
                lastScrollTime.current = now;
                if (e.deltaY > 0) nextMonth();
                else prevMonth();
            }
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    });

    return (
        <main className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-6 md:p-12 pb-24 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Premium Header Compact */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-lg animate-fade-in">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 px-6 py-5 md:px-8 md:py-6">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner shrink-0">
                            <Globe className="w-7 h-7 text-cyan-200" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                Global Conferences
                            </h2>
                            <p className="text-blue-100 text-sm md:text-base font-light">
                                {lang === 'ko'
                                    ? `2026년 주요 글로벌 미용의학 컨퍼런스 일정`
                                    : `2026 Global Aesthetic Medicine Conferences`}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-100 text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    {conferences.length} Events
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-[10px] font-semibold backdrop-blur-sm flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {allCountriesEn.length} Countries
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
                    <div
                        ref={calendarRef}
                        className="lg:col-span-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl ring-1 ring-black/5 overflow-hidden flex flex-col h-full relative"
                    >
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/80">
                            <div className="w-20" /> {/* Spacer */}

                            <div className="flex items-center gap-6">
                                <button
                                    onClick={prevMonth}
                                    className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95 group"
                                    aria-label={lang === 'ko' ? '이전 달' : 'Previous month'}
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </button>

                                <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100 min-w-[140px] text-center select-none">
                                    {lang === 'ko' ? `${year}년 ${monthNames[month]}` : `${monthNames[month]} ${year}`}
                                </h2>

                                <button
                                    onClick={nextMonth}
                                    aria-label={lang === 'ko' ? '다음 달' : 'Next month'}
                                    className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 hover:text-blue-600 transition-all active:scale-95 group"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </button>
                            </div>

                            <div className="w-20 flex justify-end">
                                <button onClick={goToToday} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-200 transition-all shadow-sm">
                                    {lang === 'ko' ? '오늘' : 'Today'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                            {dayNames.map((day, i) => (
                                <div key={day} className={`text-center py-2 text-[10px] font-bold tracking-widest uppercase ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 bg-white dark:bg-gray-900 flex-1">
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-[60px] md:min-h-[80px] bg-gray-50/20 dark:bg-gray-800/20 border-b border-r border-gray-50 dark:border-gray-800" />
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayOfWeek = (firstDay + i) % 7;
                                const events = getEventsForDay(day);
                                const today = isToday(year, month, day);
                                return (
                                    <div
                                        key={`day-${day}`}
                                        onClick={() => {
                                            const clickedDate = new Date(year, month, day);
                                            setSelectedDate(clickedDate);
                                            // On mobile, scroll to events list
                                            if (window.innerWidth < 1024) {
                                                const el = document.getElementById('day-events-list');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                        className={`min-h-[60px] md:min-h-[80px] border-b border-r border-gray-100 dark:border-gray-800 p-1 transition-all hover:bg-blue-50/30 dark:hover:bg-gray-800/50 flex flex-col gap-0.5 group relative cursor-pointer
                                            ${today ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}
                                            ${selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year ? 'bg-blue-50 dark:bg-gray-800 ring-1 ring-inset ring-blue-500' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className={`w-5 h-5 flex items-center justify-center rounded-md text-xs font-bold transition-all ${today
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : dayOfWeek === 0 ? 'text-red-400 dark:text-red-300' : dayOfWeek === 6 ? 'text-blue-400 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                                                }`}>
                                                {day}
                                            </span>
                                        </div>

                                        {/* Mobile View: Simple Dots */}
                                        <div className="md:hidden flex flex-wrap justify-center gap-1 mt-1">
                                            {events.length > 0 && (
                                                <>
                                                    {events.slice(0, 4).map((e) => (
                                                        <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getCountryColor(e.country[lang]).color }} />
                                                    ))}
                                                    {events.length > 4 && <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                                                </>
                                            )}
                                        </div>

                                        {/* Desktop View: Full Bars */}
                                        <div className="hidden md:flex flex-col gap-0.5 mt-0.5">
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
                                                        ${isSel ? 'scale-105 shadow-md z-10 brightness-110' : 'hover:scale-105 hover:shadow-sm hover:z-10 hover:brightness-110'}`}
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
                                <div key={`empty-end-${i}`} className="min-h-[60px] md:min-h-[80px] bg-gray-50/20 border-b border-r border-gray-50" />
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Filters - Span 5 */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Series Filter */}
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        {lang === 'ko' ? '시리즈 필터' : 'Filter by Series'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => { setSelectedSeries([]); setSelectedEvent(null); }}
                                    className="text-[10px] text-gray-400 hover:text-blue-500"
                                >
                                    Reset
                                </button>
                            </div>

                            <FilterSection
                                items={allSeries}
                                selected={selectedSeries}
                                onSelect={(s) => {
                                    setSelectedSeries((prev) => (
                                        prev.includes(s)
                                            ? prev.filter((item) => item !== s)
                                            : [...prev, s]
                                    ));
                                    setSelectedEvent(null);
                                }}
                                type="text"
                                lang={lang}
                            />
                        </div>

                        {/* Country Filter */}
                        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        {lang === 'ko' ? '국가 필터' : 'Filter by Country'}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => { setSelectedCountriesEn([]); setSelectedEvent(null); }}
                                    className="text-[10px] text-gray-400 hover:text-blue-500"
                                >
                                    Reset
                                </button>
                            </div>

                            <FilterSection
                                items={countryOptions}
                                selected={selectedCountriesEn}
                                onSelect={(c) => {
                                    setSelectedCountriesEn((prev) => (
                                        prev.includes(c)
                                            ? prev.filter((item) => item !== c)
                                            : [...prev, c]
                                    ));
                                    setSelectedEvent(null);
                                }}
                                type="country"
                                lang={lang}
                                valueKey="en"
                                labelKey={lang}
                            />
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Upcoming Events (Master-Detail View) */}
                <div className="pt-8 space-y-5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-l-4 border-blue-600 pl-3">
                                {lang === 'ko' ? '다가오는 일정' : 'Upcoming Events'}
                            </h3>
                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                Total {upcomingEvents.length}
                            </span>
                        </div>
                    </div>

                    {/* Mobile Selected Date Events */}
                    <div id="day-events-list" className="block lg:hidden mb-6 scroll-mt-24">
                        {selectedDate && (
                            <div className="animate-fade-in space-y-3 mb-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {lang === 'ko' ? `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 일정` : `Events on ${MONTH_NAMES_EN[selectedDate.getMonth()]} ${selectedDate.getDate()}`}
                                    </h4>
                                </div>
                                {getEventsForDay(selectedDate.getDate()).length > 0 ? (
                                    getEventsForDay(selectedDate.getDate()).map(event => {
                                        const cc = getCountryColor(event.country[lang]);
                                        return (
                                            <div
                                                key={event.id}
                                                onClick={() => setSelectedEvent(event)}
                                                className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 cursor-pointer"
                                            >
                                                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: cc.color }} />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{event.series}</span>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{event.name[lang]}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.city[lang]}, {event.country[lang]}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </div>
                                        )
                                    })
                                ) : (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 py-2">
                                        {lang === 'ko' ? '등록된 일정이 없습니다.' : 'No events scheduled for this day.'}
                                    </p>
                                )}
                            </div>
                        )}
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
                                        className={`group bg-white dark:bg-gray-900 rounded-xl p-4 border shadow-sm cursor-pointer transition-all relative overflow-hidden flex items-center justify-between gap-4 shrink-0 min-h-[72px]
                                             ${isFocused
                                                ? 'border-blue-500 ring-1 ring-blue-100 dark:ring-blue-900 shadow-md scale-[1.01] z-10'
                                                : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md hover:scale-[1.005] hover:bg-gray-50/50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1.5 transition-all"
                                            style={{ backgroundColor: cc.color }}
                                        />

                                        <div className="flex items-center gap-4 pl-3 flex-1 min-w-0">
                                            <div className="flex flex-col items-center justify-center w-14 shrink-0 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100/50 dark:border-gray-700">
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-none mb-0.5">{lang === 'ko' ? `${startDate.getMonth() + 1}월` : MONTH_NAMES_EN[startDate.getMonth()].substring(0, 3)}</span>
                                                <span className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">{startDate.getDate()}</span>
                                            </div>

                                            <div className="min-w-0 flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {isOngoing && (
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 animate-pulse uppercase">LIVE</span>
                                                    )}
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                        {event.series}
                                                    </span>
                                                </div>
                                                <h4 className={`text-base font-bold transition-colors truncate ${isFocused ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400'}`}>
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
                                <div className="h-64 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 dark:text-gray-500">
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
