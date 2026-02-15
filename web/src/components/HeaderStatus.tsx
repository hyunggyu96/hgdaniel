'use client';

import { useState, useEffect } from 'react';

export default function HeaderStatus() {
    const [dateStr, setDateStr] = useState('');
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            setDateStr(new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }));
            setTimeStr(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 60_000); // Update every minute

        return () => clearInterval(interval);
    }, []);

    if (!dateStr) return null;

    return (
        <>
            {/* Desktop View */}
            <div className="hidden lg:flex flex-col items-end gap-1">
                <div className="text-[11px] font-bold text-foreground uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm transition-all hover:bg-gray-50">
                    {dateStr}
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">
                    <span>MONITORING</span>
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3182f6] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3182f6]"></span>
                    </span>
                    <span className="text-[#3182f6] font-black">LIVE</span>
                </div>
            </div>

            {/* Mobile View (Simple Pulse) */}
            <div className="lg:hidden flex items-center justify-center p-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3182f6] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3182f6]"></span>
                </span>
            </div>
        </>
    );
}
