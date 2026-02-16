'use client';

import { Card, Title, Text } from '@tremor/react';
import { AreaChart as RAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';

interface TrendData {
    date: string;
    [key: string]: string | number;
}

export default function TrendChartInner() {
    const [data, setData] = useState<TrendData[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/trends');
                const json = await res.json();
                if (json.data && json.categories) {
                    // [변경] Corporate News 포함 모든 카테고리 표시
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
        return <div className="h-80 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-muted-foreground">데이터를 불러오는 중...</div>;
    }

    const CATEGORY_COLORS: Record<string, string> = {
        'Filler': '#3182f6', // Premium Blue
        'Botulinum Toxin': '#10b981', // Emerald Green
        'Collagen Stimulator': '#f59e0b', // Amber
        'Exosome': '#ec4899', // Pink
        'PDRN/PN': '#8b5cf6', // Purple
        'Skinboosters/Threads': '#06b6d4', // Cyan
        'Machines (EBD)': '#f97316', // Orange
        'Corporate News': '#94a3b8', // Slate (Gray)
    };

    const getColor = (category: string, index: number) => {
        return CATEGORY_COLORS[category] || '#3182f6';
    };

    return (
        <Card className="mt-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-xl transition-colors duration-300">
            <Title className="text-xl font-black text-foreground tracking-tight">키워드 뉴스 트렌드</Title>
            <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">제품 카테고리별 뉴스 발생 추이 (최근 7일)</Text>

            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 ml-1">
                {categories.map((c, i) => (
                    <div key={c} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(c, i) }} />
                        <span className="text-[10px] font-bold text-gray-500">{c}</span>
                    </div>
                ))}
            </div>

            <div className="h-96 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <RAreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            {categories.map((c, i) => (
                                <linearGradient key={`gradient-${c}`} id={`color-${c}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={getColor(c, i)} stopOpacity={0.6} />
                                    <stop offset="95%" stopColor={getColor(c, i)} stopOpacity={0.05} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                            label={{ value: '뉴스 개수', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                        />
                        <RTooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                padding: '12px',
                                color: '#0f172a'
                            }}
                            itemStyle={{ fontSize: '12px', fontWeight: 700, padding: '4px 0', color: '#334155' }}
                            labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '8px', fontWeight: 700 }}
                            itemSorter={(item: any) => -item.value}
                        />
                        {categories.map((c, i) => (
                            <Area
                                key={c}
                                type="monotone"
                                dataKey={c}
                                stroke={getColor(c, i)}
                                fill={`url(#color-${c})`}
                                strokeWidth={2.5}
                                stackId={undefined}
                                animationDuration={1200}
                                fillOpacity={0.15}
                                dot={{ r: 3, fill: getColor(c, i), strokeWidth: 0 }}
                                activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
                            />
                        ))}
                    </RAreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
