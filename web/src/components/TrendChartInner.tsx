'use client';

import { Card, Title, Text } from '@tremor/react';
import { AreaChart as RAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
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
                if (json.data) {
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
        return <div className="h-80 w-full animate-pulse bg-white/5 rounded-lg flex items-center justify-center text-gray-400">데이터를 불러오는 중...</div>;
    }

    const CATEGORY_COLORS: Record<string, string> = {
        'Filler': '#3182f6', // Premium Blue
        'Botulinum Toxin': '#00d084', // Mint Green
        'Collagen Stimulator': '#ff6900', // Orange
        'Exosome': '#abb8c3', // Gray
        'PDRN/PN': '#eb144c', // Red/Pink
        'Skinboosters/Threads': '#f78da7', // Soft Pink
        'Machines (EBD)': '#9900ef', // Purple
        'Corporate News': '#0693e3' // Cyan
    };

    const getColor = (category: string, index: number) => {
        return CATEGORY_COLORS[category] || ['#3182f6', '#00d084', '#ff6900', '#abb8c3', '#eb144c', '#f78da7'][index % 6];
    };

    return (
        <Card className="mt-4 bg-[#1e1e20] border-white/5 shadow-2xl">
            <Title className="text-xl font-black text-white tracking-tight">키워드 뉴스 트렌드</Title>
            <Text className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Real-time Keyword Mentions (Last 7 Days)</Text>

            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 ml-1">
                {categories.map((c, i) => (
                    <div key={c} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(c, i) }} />
                        <span className="text-[10px] font-bold text-white/50">{c}</span>
                    </div>
                ))}
            </div>

            <div className="h-72 w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <RAreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            {categories.map((c, i) => (
                                <linearGradient key={`gradient-${c}`} id={`color-${c}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={getColor(c, i)} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={getColor(c, i)} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
                        />
                        <RTooltip
                            contentStyle={{ backgroundColor: '#101012', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                            itemStyle={{ fontSize: '11px', fontWeight: 800, padding: '2px 0' }}
                            labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginBottom: '4px', fontWeight: 700 }}
                            itemSorter={(item: any) => -item.value}
                        />
                        {categories.map((c, i) => (
                            <Area
                                key={c}
                                type="monotone"
                                dataKey={c}
                                stroke={getColor(c, i)}
                                fill={`url(#color-${c})`}
                                strokeWidth={2}
                                stackId={undefined}
                                animationDuration={1000}
                                fillOpacity={0.15}
                            />
                        ))}
                    </RAreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
