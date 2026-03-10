'use client';

import { AreaChart as RAreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { useEffect, useState, useCallback } from 'react';
import { useLanguage } from './LanguageContext';

interface TrendData {
    [key: string]: string | number;
}

type Mode = 'daily' | 'hourly';

const CATEGORY_COLORS: Record<string, string> = {
    'Filler': '#3182f6',
    'Botulinum Toxin': '#10b981',
    'Collagen Stimulator': '#f59e0b',
    'Exosome': '#ec4899',
    'PDRN/PN': '#8b5cf6',
    'Skinboosters/Threads': '#06b6d4',
    'Energy-Based Devices': '#f97316',
    'Corporate News': '#94a3b8',
};

const getColor = (category: string) => CATEGORY_COLORS[category] || '#3182f6';

function HourlyTooltip({ active, payload, label, yesterday, categories, isEnglish }: any) {
    if (!active || !payload?.length) return null;
    const yd = yesterday?.[label];
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 text-[10px] max-w-[200px]">
            <div className="text-[10px] font-bold text-gray-500 mb-1">{label}</div>
            {payload
                .filter((p: any) => p.value > 0 || (yd && yd[p.dataKey] > 0))
                .sort((a: any, b: any) => b.value - a.value)
                .map((p: any) => {
                    const ydVal = yd?.[p.dataKey] ?? 0;
                    const diff = p.value - ydVal;
                    const diffStr = diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '0';
                    const diffColor = diff > 0 ? '#ef4444' : diff < 0 ? '#3b82f6' : '#94a3b8';
                    return (
                        <div key={p.dataKey} className="flex items-center gap-1.5 py-0.5">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                            <span className="font-semibold text-gray-700 dark:text-gray-200 truncate flex-1">
                                {p.dataKey.length > 10 ? p.dataKey.slice(0, 9) + '..' : p.dataKey}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-gray-100">{p.value}</span>
                            <span className="font-bold" style={{ color: diffColor }}>
                                ({diffStr})
                            </span>
                        </div>
                    );
                })}
            {payload.filter((p: any) => p.value > 0 || (yd && yd[p.dataKey] > 0)).length === 0 && (
                <div className="text-gray-400">{isEnglish ? 'No data' : '데이터 없음'}</div>
            )}
            <div className="mt-1 pt-1 border-t border-gray-100 dark:border-gray-700 text-[9px] text-gray-400">
                {isEnglish ? 'cumul. vs yesterday' : '어제 동시간 누적 대비'}
            </div>
        </div>
    );
}

export default function TrendChartCompact() {
    const { t, language } = useLanguage();
    const isEnglish = language === 'en';

    const [mode, setMode] = useState<Mode>('daily');
    const [data, setData] = useState<TrendData[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [yesterday, setYesterday] = useState<Record<string, Record<string, number>> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (m: Mode) => {
        setLoading(true);
        try {
            const url = m === 'hourly' ? '/api/trends?mode=hourly' : '/api/trends';
            const res = await fetch(url);
            const json = await res.json();
            if (json.data && json.categories) {
                setData(json.data);
                setCategories(json.categories);
                setYesterday(json.yesterday || null);
            }
        } catch (err) {
            console.error("Failed to fetch trend data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(mode); }, [mode, fetchData]);

    const xKey = mode === 'daily' ? 'date' : 'time';

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 h-full">
                <div className="h-full w-full animate-pulse bg-gray-50 dark:bg-gray-700 rounded-lg" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground tracking-tight">
                    {t('trend_title')}
                </span>
                {/* Toggle: 일별 / 시간별 */}
                <div className="flex items-center p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setMode('daily')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                            mode === 'daily'
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        {isEnglish ? '7D' : '일별'}
                    </button>
                    <button
                        onClick={() => setMode('hourly')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                            mode === 'hourly'
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                    >
                        {isEnglish ? '10m' : '시간별'}
                    </button>
                </div>
            </div>

            {/* Mini legend */}
            <div className="px-3 flex flex-wrap gap-x-2 gap-y-0.5 mb-1">
                {categories.slice(0, 6).map((c) => (
                    <div key={c} className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getColor(c) }} />
                        <span className="text-[8px] font-medium text-gray-400">{c.length > 12 ? c.slice(0, 10) + '..' : c}</span>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0 px-1 pb-1">
                <ResponsiveContainer width="100%" height="100%">
                    <RAreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                            {categories.map((c) => (
                                <linearGradient key={`cg-${c}`} id={`compact-${c}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={getColor(c)} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={getColor(c)} stopOpacity={0.02} />
                                </linearGradient>
                            ))}
                            {/* 빗금 패턴 (진행중 표시) */}
                            <pattern id="hatch-today" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" strokeWidth="0.8" strokeOpacity="0.18" />
                            </pattern>
                        </defs>
                        <XAxis
                            dataKey={xKey}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 9 }}
                            dy={4}
                            interval={mode === 'hourly' ? 5 : undefined}
                        />
                        <YAxis hide />
                        {mode === 'hourly' ? (
                            <RTooltip
                                content={<HourlyTooltip yesterday={yesterday} categories={categories} isEnglish={isEnglish} />}
                            />
                        ) : (
                            <RTooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    padding: '8px',
                                    fontSize: '11px',
                                }}
                                itemStyle={{ fontSize: '10px', fontWeight: 600, padding: '1px 0' }}
                                labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px', fontWeight: 700 }}
                                itemSorter={(item: any) => -item.value}
                            />
                        )}
                        {/* 일별: 어제→오늘 구간 빗금 배경 */}
                        {mode === 'daily' && data.length >= 2 && (
                            <ReferenceArea
                                x1={data[data.length - 2]?.[xKey] as string}
                                x2={data[data.length - 1]?.[xKey] as string}
                                fill="url(#hatch-today)"
                                fillOpacity={1}
                                stroke="none"
                            />
                        )}
                        {categories.map((c) => (
                            <Area
                                key={c}
                                type="monotone"
                                dataKey={c}
                                stroke={getColor(c)}
                                fill={`url(#compact-${c})`}
                                strokeWidth={1.5}
                                fillOpacity={0.1}
                                dot={false}
                                animationDuration={800}
                            />
                        ))}
                    </RAreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
