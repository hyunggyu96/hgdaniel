'use client';

import { Newspaper, Sparkles } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface FeedModeToggleProps {
    feedMode: 'classic' | 'ai';
    onToggle: () => void;
}

export default function FeedModeToggle({ feedMode, onToggle }: FeedModeToggleProps) {
    const { t } = useLanguage();

    return (
        <button
            onClick={onToggle}
            className="relative flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-[10px] font-bold uppercase tracking-wider"
            title={feedMode === 'classic' ? t('feed_mode_ai') : t('feed_mode_classic')}
        >
            {feedMode === 'classic' ? (
                <>
                    <Newspaper size={14} className="text-gray-600 dark:text-gray-300" />
                    <span className="hidden sm:inline text-gray-600 dark:text-gray-300">{t('feed_mode_classic')}</span>
                </>
            ) : (
                <>
                    <Sparkles size={14} className="text-blue-500" />
                    <span className="hidden sm:inline text-blue-500">{t('feed_mode_ai')}</span>
                </>
            )}
        </button>
    );
}
