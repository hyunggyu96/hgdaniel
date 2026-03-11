'use client';

import React from 'react';
import { useUser } from './UserContext';
import { useLanguage } from './LanguageContext';
import { Lock, Sparkles } from 'lucide-react';
import { hasFeature, requiredTierForFeature, TIER_CONFIG, type Feature } from '@/lib/tiers';
import type { Tier } from '@/lib/authSession';

interface TierGateProps {
    feature: Feature;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function TierGate({ feature, children, fallback }: TierGateProps) {
    const { userId, userTier } = useUser();
    const { t } = useLanguage();

    const effectiveTier: Tier = userId ? userTier : 'free';

    if (hasFeature(effectiveTier, feature)) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    const required = requiredTierForFeature(feature);
    const tierLabel = TIER_CONFIG[required].label;

    return (
        <div className="relative min-h-[400px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-100/80 to-gray-200/90 dark:from-gray-800/80 dark:to-gray-900/90 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-6">
                    <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {t('tier_locked_title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                    {t('tier_locked_desc')}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold">
                    <Sparkles className="w-4 h-4" />
                    {tierLabel} {t('tier_required')}
                </div>
                {!userId && (
                    <p className="mt-4 text-xs text-gray-400">
                        {t('tier_login_required')}
                    </p>
                )}
            </div>
        </div>
    );
}
