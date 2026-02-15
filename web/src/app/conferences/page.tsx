'use client';

import React, { useState, useMemo } from 'react';

// ─── 2026 IMCAS & AMWC Conference Data ───
interface ConferenceEvent {
    id: string;
    name: string;
    brand: 'IMCAS' | 'AMWC';
    startDate: string; // YYYY-MM-DD
    endDate: string;
    city: string;
    country: string;
    venue: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

const CONFERENCES: ConferenceEvent[] = [
    // IMCAS Events
    {
        id: 'imcas-world-2026',
        name: 'IMCAS World Congress 2026',
        brand: 'IMCAS',
        startDate: '2026-01-29',
        endDate: '2026-01-31',
        city: '파리',
        country: '프랑스',
        venue: 'Palais des Congrès de Paris',
        color: '#1e40af',
        bgColor: '#dbeafe',
        borderColor: '#3b82f6',
    },
    {
        id: 'imcas-americas-2026',
        name: 'IMCAS Americas 2026',
        brand: 'IMCAS',
        startDate: '2026-03-13',
        endDate: '2026-03-15',
        city: '상파울루',
        country: '브라질',
        venue: 'The World Trade Center Sao Paulo',
        color: '#1e40af',
        bgColor: '#dbeafe',
        borderColor: '#3b82f6',
    },
    {
        id: 'imcas-asia-2026',
        name: 'IMCAS Asia 2026',
        brand: 'IMCAS',
        startDate: '2026-06-19',
        endDate: '2026-06-21',
        city: '방콕',
        country: '태국',
        venue: 'The Athenee Hotel',
        color: '#1e40af',
        bgColor: '#dbeafe',
        borderColor: '#3b82f6',
    },
    {
        id: 'imcas-china-2026',
        name: 'IMCAS China 2026',
        brand: 'IMCAS',
        startDate: '2026-08-27',
        endDate: '2026-08-29',
        city: '상하이',
        country: '중국',
        venue: 'TBD',
        color: '#1e40af',
        bgColor: '#dbeafe',
        borderColor: '#3b82f6',
    },

    // AMWC Events
    {
        id: 'amwc-americas-2026',
        name: 'AMWC Americas',
        brand: 'AMWC',
        startDate: '2026-02-14',
        endDate: '2026-02-16',
        city: '마이애미',
        country: '미국',
        venue: 'JW Marriott Miami Turnberry Resort',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
    {
        id: 'amwc-monaco-2026',
        name: 'AMWC Monaco (본부)',
        brand: 'AMWC',
        startDate: '2026-03-26',
        endDate: '2026-03-28',
        city: '몬테카를로',
        country: '모나코',
        venue: 'Grimaldi Forum',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
    {
        id: 'amwc-asia-2026',
        name: 'AMWC Asia (TDAC)',
        brand: 'AMWC',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        city: '타이베이',
        country: '대만',
        venue: 'Taipei Intl Convention Center (TICC)',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
    {
        id: 'amwc-brazil-2026',
        name: 'AMWC Brazil',
        brand: 'AMWC',
        startDate: '2026-06-17',
        endDate: '2026-06-19',
        city: '상파울루',
        country: '브라질',
        venue: 'TBD',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
    {
        id: 'amwc-korea-2026',
        name: 'AMWC Korea 2026',
        brand: 'AMWC',
        startDate: '2026-06-19',
        endDate: '2026-06-20',
        city: '서울',
        country: '대한민국',
        venue: '인터컨티넨탈 그랜드 서울 파르나스',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
    {
        id: 'amwc-japan-2026',
        name: 'AMWC Japan',
        brand: 'AMWC',
        startDate: '2026-09-12',
        endDate: '2026-09-13',
        city: '도쿄',
        country: '일본',
        venue: 'The Prince Park Tower Tokyo',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
    {
        id: 'amwc-china-2026',
        name: 'AMWC China',
        brand: 'AMWC',
        startDate: '2026-10-16',
        endDate: '2026-10-18',
        city: '청두',
        country: '중국',
        venue: 'TBD',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
    {
        id: 'amwc-dubai-2026',
        name: 'AMWC Dubai',
        brand: 'AMWC',
        startDate: '2026-10-21',
        endDate: '2026-10-23',
        city: '두바이',
        country: 'UAE',
        venue: 'TBD',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
    {
        id: 'amwc-latam-2026',
        name: 'AMWC Latin America',
        brand: 'AMWC',
        startDate: '2026-10-29',
        endDate: '2026-10-31',
        city: '메델린',
        country: '콜롬비아',
        venue: 'TBD',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
    {
        id: 'amwc-sea-2026',
        name: 'AMWC Southeast Asia',
        brand: 'AMWC',
        startDate: '2026-11-26',
        endDate: '2026-11-28',
        city: '방콕',
        country: '태국',
        venue: 'InterContinental Hotel, Bangkok',
        color: '#9f1239',
        bgColor: '#fce7f3',
        borderColor: '#ec4899',
    },
];

// ─── Utility ───
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

function formatDateRange(start: string, end: string): string {
    const s = new Date(start);
    const e = new Date(end);
    const sMonth = s.getMonth() + 1;
    const eMonth = e.getMonth() + 1;
    if (sMonth === eMonth) {
        return `${sMonth}월 ${s.getDate()}일 - ${e.getDate()}일`;
    }
    return `${sMonth}월 ${s.getDate()}일 - ${eMonth}월 ${e.getDate()}일`;
}

function isDateInRange(year: number, month: number, day: number, start: string, end: string): boolean {
    const d = new Date(year, month, day);
    const s = new Date(start);
    const e = new Date(end);
    // Normalize to date-only comparison
    d.setHours(0, 0, 0, 0);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
}

function isToday(year: number, month: number, day: number): boolean {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
}

// ─── Components ───

function EventBadge({ event, onClick, isSelected }: { event: ConferenceEvent; onClick: () => void; isSelected: boolean }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="w-full text-left group"
            title={event.name}
        >
            <div
                className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md truncate transition-all duration-200 border
          ${isSelected ? 'ring-2 ring-offset-1 scale-[1.02] shadow-md' : 'hover:scale-[1.02] hover:shadow-sm'}
        `}
                style={{
                    backgroundColor: event.bgColor,
                    color: event.color,
                    borderColor: isSelected ? event.borderColor : 'transparent',
                    ['--tw-ring-color' as string]: event.borderColor,
                } as React.CSSProperties}
            >
                {event.name.replace(' 2026', '')}
            </div>
        </button>
    );
}

function EventDetailPanel({ event, onClose }: { event: ConferenceEvent; onClose: () => void }) {
    const isPast = new Date(event.endDate) < new Date();
    const isOngoing = new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();

    return (
        <div
            className="rounded-2xl border p-5 sm:p-6 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
            style={{
                backgroundColor: event.bgColor + '40',
                borderColor: event.borderColor + '60',
            }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                            className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: event.bgColor, color: event.color }}
                        >
                            {event.brand}
                        </span>
                        {isOngoing && (
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                진행 중
                            </span>
                        )}
                        {isPast && (
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                                종료
                            </span>
                        )}
                        {!isPast && !isOngoing && (
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                                예정
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 leading-tight">{event.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                            <span className="text-base mt-0.5">📅</span>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">일정</p>
                                <p className="font-semibold text-gray-800">{formatDateRange(event.startDate, event.endDate)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-base mt-0.5">📍</span>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">개최 도시</p>
                                <p className="font-semibold text-gray-800">{event.city}, {event.country}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2">
                            <span className="text-base mt-0.5">🏛️</span>
                            <div>
                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">장소</p>
                                <p className="font-semibold text-gray-800">{event.venue}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 shrink-0"
                >
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
    const currentDate = new Date();
    const [year, setYear] = useState(2026);
    const [month, setMonth] = useState(currentDate.getFullYear() === 2026 ? currentDate.getMonth() : 0);
    const [selectedEvent, setSelectedEvent] = useState<ConferenceEvent | null>(null);
    const [brandFilter, setBrandFilter] = useState<'ALL' | 'IMCAS' | 'AMWC'>('ALL');

    const filteredConferences = useMemo(() => {
        if (brandFilter === 'ALL') return CONFERENCES;
        return CONFERENCES.filter((c) => c.brand === brandFilter);
    }, [brandFilter]);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Events for current month
    const monthEvents = useMemo(() => {
        return filteredConferences.filter((conf) => {
            const s = new Date(conf.startDate);
            const e = new Date(conf.endDate);
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month, daysInMonth);
            return s <= monthEnd && e >= monthStart;
        });
    }, [year, month, filteredConferences, daysInMonth]);

    // Get events for a specific day
    function getEventsForDay(day: number): ConferenceEvent[] {
        return filteredConferences.filter((conf) => isDateInRange(year, month, day, conf.startDate, conf.endDate));
    }

    function prevMonth() {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
        setSelectedEvent(null);
    }

    function nextMonth() {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
        setSelectedEvent(null);
    }

    function goToToday() {
        const now = new Date();
        setYear(now.getFullYear());
        setMonth(now.getMonth());
        setSelectedEvent(null);
    }

    // Upcoming events (sorted)
    const upcomingEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return filteredConferences
            .filter((c) => new Date(c.endDate) >= today)
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }, [filteredConferences]);

    // Total counts
    const imcasCount = CONFERENCES.filter((c) => c.brand === 'IMCAS').length;
    const amwcCount = CONFERENCES.filter((c) => c.brand === 'AMWC').length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {/* ── Page Header ── */}
                <div className="mb-8 sm:mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="text-white text-lg">🌍</span>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                                Global Conferences
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">
                                {year}년 주요 글로벌 미용의학 컨퍼런스 일정
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Filter & Stats Bar ── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    {/* Brand Filter */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { setBrandFilter('ALL'); setSelectedEvent(null); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 border ${brandFilter === 'ALL'
                                ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            ALL ({CONFERENCES.length})
                        </button>
                        <button
                            onClick={() => { setBrandFilter('IMCAS'); setSelectedEvent(null); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 border ${brandFilter === 'IMCAS'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-100'
                                }`}
                        >
                            IMCAS ({imcasCount})
                        </button>
                        <button
                            onClick={() => { setBrandFilter('AMWC'); setSelectedEvent(null); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 border ${brandFilter === 'AMWC'
                                ? 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-600/20'
                                : 'bg-pink-50 text-pink-700 border-pink-200 hover:border-pink-300 hover:bg-pink-100'
                                }`}
                        >
                            AMWC ({amwcCount})
                        </button>
                    </div>

                    {/* Today button */}
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 rounded-xl text-xs font-bold tracking-wide bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    >
                        📌 오늘
                    </button>
                </div>

                {/* ── Selected Event Detail ── */}
                {selectedEvent && (
                    <div className="mb-6">
                        <EventDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
                    </div>
                )}

                {/* ── Calendar ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-gray-100 bg-gray-50/60">
                        <button
                            onClick={prevMonth}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                        >
                            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="text-center">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                                {MONTH_NAMES[month]} {year}
                            </h2>
                            {monthEvents.length > 0 && (
                                <p className="text-xs text-gray-400 font-semibold mt-1">
                                    {monthEvents.length}개 컨퍼런스
                                </p>
                            )}
                        </div>
                        <button
                            onClick={nextMonth}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm"
                        >
                            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-gray-100">
                        {DAY_NAMES.map((day) => (
                            <div
                                key={day}
                                className={`text-center py-3 text-[11px] font-bold tracking-wider uppercase ${day === 'Sun' ? 'text-red-400' : day === 'Sat' ? 'text-blue-400' : 'text-gray-400'
                                    }`}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7">
                        {/* Empty cells before first day */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[110px] border-b border-r border-gray-50 bg-gray-50/30" />
                        ))}

                        {/* Day cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const dayOfWeek = (firstDay + i) % 7;
                            const events = getEventsForDay(day);
                            const today = isToday(year, month, day);

                            return (
                                <div
                                    key={`day-${day}`}
                                    className={`min-h-[80px] sm:min-h-[110px] border-b border-r border-gray-100 p-1 sm:p-1.5 transition-colors duration-150 ${today ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'
                                        }`}
                                >
                                    {/* Day Number */}
                                    <div className="flex items-center justify-between mb-1">
                                        <span
                                            className={`text-xs sm:text-sm font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg ${today
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                                                : dayOfWeek === 0
                                                    ? 'text-red-400'
                                                    : dayOfWeek === 6
                                                        ? 'text-blue-400'
                                                        : 'text-gray-700'
                                                }`}
                                        >
                                            {day}
                                        </span>
                                    </div>

                                    {/* Event Badges */}
                                    <div className="space-y-0.5">
                                        {events.slice(0, 3).map((event) => (
                                            <EventBadge
                                                key={event.id}
                                                event={event}
                                                onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                                                isSelected={selectedEvent?.id === event.id}
                                            />
                                        ))}
                                        {events.length > 3 && (
                                            <p className="text-[10px] text-gray-400 font-semibold px-1">+{events.length - 3} more</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty cells after last day to fill the row */}
                        {Array.from({ length: (7 - ((firstDay + daysInMonth) % 7)) % 7 }).map((_, i) => (
                            <div key={`empty-end-${i}`} className="min-h-[80px] sm:min-h-[110px] border-b border-r border-gray-50 bg-gray-50/30" />
                        ))}
                    </div>
                </div>

                {/* ── Upcoming Events List ── */}
                <div className="mt-10">
                    <h2 className="text-lg font-black tracking-tight text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-pink-500 rounded-full" />
                        다가오는 컨퍼런스
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {upcomingEvents.map((event) => {
                            const isOngoing = new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date();
                            return (
                                <button
                                    key={event.id}
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        // Navigate to the month of the event
                                        const s = new Date(event.startDate);
                                        setYear(s.getFullYear());
                                        setMonth(s.getMonth());
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="text-left group bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: event.bgColor, color: event.color }}
                                        >
                                            {event.brand}
                                        </span>
                                        {isOngoing && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                                LIVE
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1.5 leading-tight">
                                        {event.name}
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span>📅 {formatDateRange(event.startDate, event.endDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span>📍 {event.city}, {event.country}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {upcomingEvents.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-sm font-medium">남은 컨퍼런스가 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* ── Legend ── */}
                <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300" />
                        <span>IMCAS</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm bg-pink-100 border border-pink-300" />
                        <span>AMWC</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
