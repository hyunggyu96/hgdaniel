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

// ─── Public Features ───
// 로그인 없이 접근 가능한 기능 (주석 해제로 활성화)
// Features accessible without login (uncomment to enable)
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
    if (PUBLIC_FEATURES.has(feature)) return true;
    if (!tier) return false;
    return TIER_CONFIG[tier].features.has(feature);
}

export function getTierConfig(tier: Tier | null | undefined) {
    return TIER_CONFIG[tier || 'free'];
}

export function requiredTierForFeature(feature: Feature): Tier {
    if (TIER_CONFIG.free.features.has(feature)) return 'free';
    if (TIER_CONFIG.pro.features.has(feature)) return 'pro';
    return 'enterprise';
}
