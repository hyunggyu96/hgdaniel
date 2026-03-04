'use client';

import { useLanguage } from '@/components/LanguageContext';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number | ((prev: number) => number)) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const { language } = useLanguage();
    const t = (ko: string, en: string) => language === 'ko' ? ko : en;

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-3">
            <button
                onClick={() => onPageChange(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {t('이전', 'Prev')}
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {currentPage} / {totalPages}
            </span>
            <button
                onClick={() => onPageChange(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {t('다음', 'Next')}
            </button>
        </div>
    );
}
