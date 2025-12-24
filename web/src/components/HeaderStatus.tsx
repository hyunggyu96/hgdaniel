'use client';

import { useState, useEffect } from 'react';

export default function HeaderStatus() {
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        setDateStr(new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }));
    }, []);

    if (!dateStr) return null;

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="text-[11px] font-bold text-white/70 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                {dateStr}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-medium text-white/30 uppercase tracking-tighter">
                <span>REAL-TIME MONITORING</span>
                <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3182f6]"></span>
                </span>
                <span className="text-blue-400 font-bold">ACTIVE</span>
            </div>
        </div>
    );
}
