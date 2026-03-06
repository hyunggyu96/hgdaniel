'use client';

import { AreaChart as RAreaChart, Area, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { useLanguage } from './LanguageContext';

interface TrendData {
    date: string;
    [key: string]: string | number;
}

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

export default function TrendChartCompact() {
    const { t } = useLanguage();
    const [data, setData] = useState<TrendData[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/trends');
                const json = await res.json();
                if (json.data && json.categories) {
                    setData(json.data);
                    setCategories(json.categories);
                }
            } catch (err) {
                console.error("Failed to fetch trend data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 h-full">
                <div className="h-full w-full animate-pulse bg-gray-50 dark:bg-gray-700 rounded-lg" />
            </div>
        );
    }

    const getColor = (category: string) => CATEGORY_COLORS[category] || '#3182f6';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                <span className="text-[11px] font-bold text-foreground tracking-tight">
                    {t('trend_title')}
                </span>
                <span className="text-[9px] font-bold text-[#3182f6] bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                    {t('trend_7d')}
                </span>
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
                        </defs>
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 9 }}
                            dy={4}
                        />
                        <YAxis hide />
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
