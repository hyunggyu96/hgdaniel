'use client';

import { useState, useEffect } from 'react';

export default function HeaderStatus() {
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            setDateStr(new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }));
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 60_000);

        return () => clearInterval(interval);
    }, []);

    if (!dateStr) return null;

    return (
        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground shrink-0">
            <span>{dateStr}</span>
            <span className="text-gray-300 dark:text-gray-600">·</span>
            <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3182f6] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3182f6]"></span>
            </span>
            <span className="text-[#3182f6] font-black text-[9px] tracking-wider">LIVE</span>
        </div>
    );
}
