import type { Tier } from './authSession';

export type Feature =
    | 'news_unlimited'
    | 'insights_unlimited'
    | 'company'
    | 'analysis'
    | 'revenue'
    | 'policy'
    | 'ask_ai'
    | 'ask_ai_upload'
    | 'collections';

// ─── Prototype Mode ───
// Default: true (all features unlocked for prototype)
// Set NEXT_PUBLIC_TIER_BYPASS=false to enable tier-based access control
export const TIER_BYPASS = process.env.NEXT_PUBLIC_TIER_BYPASS !== 'false';

// ─── Public Features ───
// TIER_BYPASS=false일 때, 로그인 없이도 접근 가능한 기능
export const PUBLIC_FEATURES = new Set<Feature>([
    'company',  // 기업브리핑
    'policy',   // 정책/규제
]);

export const TIER_CONFIG = {
    free: {
        label: 'Free',
        newsDaysLimit: 3,
        insightViewsPerDay: 10,
        askAiQueriesPerDay: 0,
        features: new Set<Feature>([]),
    },
    pro: {
        label: 'Pro',
        newsDaysLimit: null as number | null,
        insightViewsPerDay: null as number | null,
        askAiQueriesPerDay: 50,
        features: new Set<Feature>([
            'news_unlimited',
            'insights_unlimited',
            'company',
            'analysis',
            'revenue',
            'policy',
            'ask_ai',
            'collections',
        ]),
    },
    enterprise: {
        label: 'Enterprise',
        newsDaysLimit: null as number | null,
        insightViewsPerDay: null as number | null,
        askAiQueriesPerDay: null as number | null,
        features: new Set<Feature>([
            'news_unlimited',
            'insights_unlimited',
            'company',
            'analysis',
            'revenue',
            'policy',
            'ask_ai',
            'ask_ai_upload',
            'collections',
        ]),
    },
} as const;

export function hasFeature(tier: Tier | null | undefined, feature: Feature): boolean {
    if (TIER_BYPASS) return true;
    if (PUBLIC_FEATURES.has(feature)) return true;
    if (!tier) return false;
    return TIER_CONFIG[tier].features.has(feature);
}

export function getTierConfig(tier: Tier | null | undefined) {
    if (TIER_BYPASS) return TIER_CONFIG['enterprise'];
    return TIER_CONFIG[tier || 'free'];
}

export function requiredTierForFeature(feature: Feature): Tier {
    if (TIER_CONFIG.free.features.has(feature)) return 'free';
    if (TIER_CONFIG.pro.features.has(feature)) return 'pro';
    return 'enterprise';
}
