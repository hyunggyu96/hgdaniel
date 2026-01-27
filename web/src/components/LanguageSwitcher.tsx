'use client';

import { useLanguage } from '@/components/LanguageContext';

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    return (
        <button
            onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-bold text-gray-700 uppercase tracking-wide"
        >
            <span>{language === 'ko' ? 'KR' : 'EN'}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-400 font-medium">{language === 'ko' ? 'EN' : 'KR'}</span>
        </button>
    );
}
