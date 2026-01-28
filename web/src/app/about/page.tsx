'use client';

import React from 'react';
import { Title, Text, Card } from "@tremor/react";
import { useLanguage } from '@/components/LanguageContext';

export default function AboutPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-12 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Hero Section */}
                <div className="text-center space-y-6 py-12">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-500/30">
                        AI
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                        {t('about_mission_title')}
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        {t('about_mission_desc')}
                    </p>
                </div>

                {/* Mission Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="p-8 border-t-4 border-t-blue-500 hover:shadow-lg transition-all text-center space-y-4 rounded-3xl">
                        <div className="text-4xl">🚀</div>
                        <h3 className="text-lg font-bold">{t('about_card_news')}</h3>
                        <p className="text-sm text-gray-500">
                            {t('about_card_news_desc')}
                        </p>
                    </Card>
                    <Card className="p-8 border-t-4 border-t-indigo-500 hover:shadow-lg transition-all text-center space-y-4 rounded-3xl">
                        <div className="text-4xl">📊</div>
                        <h3 className="text-lg font-bold">{t('about_card_data')}</h3>
                        <p className="text-sm text-gray-500">
                            {t('about_card_data_desc')}
                        </p>
                    </Card>
                    <Card className="p-8 border-t-4 border-t-purple-500 hover:shadow-lg transition-all text-center space-y-4 rounded-3xl">
                        <div className="text-4xl">⚖️</div>
                        <h3 className="text-lg font-bold">{t('about_card_policy')}</h3>
                        <p className="text-sm text-gray-500">
                            {t('about_card_policy_desc')}
                        </p>
                    </Card>
                </div>



            </div>
        </main>
    );
}
