'use client';

import { Card, Text } from "@tremor/react";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/lib/apiConfig';

const companies: { id: number; name: string }[] = [
    { id: 1, name: "한스바이오메드" },
    { id: 2, name: "엘앤씨바이오" },
    { id: 3, name: "제테마" },
    { id: 4, name: "한국비엔씨" },
    { id: 5, name: "종근당바이오" },
    { id: 6, name: "휴온스" },
    { id: 7, name: "휴온스글로벌" },
    { id: 8, name: "휴메딕스" },
    { id: 9, name: "휴젤" },
    { id: 10, name: "메디톡스" },
    { id: 11, name: "대웅제약" },
    { id: 12, name: "파마리서치" },
    { id: 13, name: "클래시스" },
    { id: 14, name: "케어젠" },
    { id: 15, name: "원텍" },
    { id: 16, name: "동방메디컬" },
    { id: 17, name: "제이시스메디칼" },
    { id: 18, name: "바이오비쥬" },
    { id: 19, name: "바이오플러스" },
    { id: 20, name: "비올" },
    { id: 21, name: "하이로닉" },
    { id: 22, name: "레이저옵텍" },
    { id: 23, name: "유바이오로직스" }
].sort((a, b) => a.name.localeCompare(b.name, 'ko'));

export default function CompanyPage() {
    const router = useRouter();
    const [rankings, setRankings] = useState<Record<string, number>>({});

    useEffect(() => {
        fetch(API_ENDPOINTS.rankings)
            .then(res => res.json())
            .then(data => setRankings(data))
            .catch(err => console.error(err));
    }, []);



    return (
        <main className="p-4 md:p-10 mx-auto max-w-7xl animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {companies.map((item) => {
                    const rank = rankings[item.name];
                    const isHighlight = rank && rank <= 3;

                    return (
                        <Card
                            key={item.id}
                            className={`relative cursor-pointer hover:bg-gray-50 border transition-all text-center flex items-center justify-center min-h-[100px] overflow-visible rounded-xl
                                ${isHighlight ? 'border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-gray-200 shadow-sm'}
                            `}
                            onClick={() => router.push(`/analysis?company=${item.name}`)}
                        >
                            {/* Pulsing Border Effect for Highlights */}
                            {isHighlight && (
                                <div className="absolute inset-0 rounded-xl border-2 border-purple-500 animate-pulse pointer-events-none z-10"></div>
                            )}

                            <Text className={`text-lg font-medium ${isHighlight ? 'text-purple-700 font-bold' : 'text-foreground'}`}>
                                {item.name}
                            </Text>
                        </Card>
                    );
                })}
            </div>
        </main>
    );
}
