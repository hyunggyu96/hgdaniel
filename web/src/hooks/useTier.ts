'use client';

import { useUser } from '@/components/UserContext';
import { hasFeature, getTierConfig, type Feature } from '@/lib/tiers';
import type { Tier } from '@/lib/authSession';

export function useTier() {
    const { userId, userTier } = useUser();

    const effectiveTier: Tier = userId ? userTier : 'free';
    const config = getTierConfig(effectiveTier);

    return {
        tier: effectiveTier,
        isLoggedIn: !!userId,
        isPro: effectiveTier === 'pro' || effectiveTier === 'enterprise',
        isEnterprise: effectiveTier === 'enterprise',
        config,
        can: (feature: Feature) => hasFeature(effectiveTier, feature),
    };
}
