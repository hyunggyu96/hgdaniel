
'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Card, Title, Text } from '@tremor/react';

interface TrendData {
    date: string;
    [key: string]: string | number;
}

export default function TrendChart() {
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
        return <div className="h-72 w-full animate-pulse bg-gray-100 rounded-lg"></div>;
    }

    return (
        <Card className="mt-4">
            <Title>키워드별 뉴스 트렌드</Title>
            <Text>최근 30일간 수집된 키워드별 뉴스 언급량 추이입니다.</Text>
            <AreaChart
                className="mt-4 h-72"
                data={data}
                index="date"
                categories={categories}
                colors={['indigo', 'cyan', 'blue', 'emerald', 'violet', 'fuchsia']}
                yAxisWidth={40}
                showAnimation={true}
            />
        </Card>
    );
}
