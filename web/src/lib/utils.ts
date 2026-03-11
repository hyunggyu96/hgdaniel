import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Format a publish date to KST date/time strings */
export function fmtDateKST(pubDate: Date | null) {
    if (!pubDate) return { dateStr: '', timeStr: '' };
    const dateStr = pubDate.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '');
    const timeStr = pubDate.toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false });
    return { dateStr, timeStr };
}

/** Get yesterday's date string in en-CA/Asia/Seoul format */
export function getYesterdayStr() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

/** Get article date string in en-CA/Asia/Seoul format */
export function toDateKey(pubDate: Date | null) {
    return pubDate?.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }) ?? '';
}

/** Filter valid unique keywords from tag arrays */
export function uniqueKws(arrays: string[][]) {
    const SKIP = new Set(['기타', '-', '|', '', 'None']);
    return Array.from(new Set(arrays.flat().filter(k => k && !SKIP.has(k.trim()))));
}
