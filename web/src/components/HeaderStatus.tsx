'use client';

import { useState, useEffect } from 'react';

export default function HeaderStatus() {
    const [dateStr, setDateStr] = useState('');
    const [visitors, setVisitors] = useState<number | null>(null);
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        setDateStr(new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }));

        const fetchVisitors = async () => {
            try {
                const res = await fetch('/api/track-visit');
                if (res.ok) {
                    const json = await res.json();
                    setVisitors(json.count);
                }
            } catch (e) {
                console.error('Visitor count fetch error', e);
            }
        };

        fetchVisitors();
        const interval = setInterval(fetchVisitors, 30_000);

        const updateTime = () => {
            setTimeStr(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        };
        updateTime();
        const timeInterval = setInterval(updateTime, 60_000);

        return () => {
            clearInterval(interval);
            clearInterval(timeInterval);
        };
    }, []);

    if (!dateStr) return null;

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="text-[11px] font-bold text-white/70 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10 shadow-sm transition-all hover:bg-white/10">
                {dateStr}
            </div>
            {visitors !== null && (
                <div className="text-[10px] font-bold text-emerald-400 drop-shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    오늘 방문자: {visitors.toLocaleString()}명
                </div>
            )}
            <div className="flex items-center gap-1.5 text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">
                <span>MONITORING</span>
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3182f6] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3182f6]"></span>
                </span>
                <span className="text-[#3182f6] font-black">ACTIVE</span>
            </div>
        </div>
    );
}
