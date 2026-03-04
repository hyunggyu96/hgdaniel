import { NextResponse } from 'next/server';
import type { AuthUser } from './authSession';
import { hasFeature, type Feature } from './tiers';

export function requireFeature(
    user: AuthUser | null,
    feature: Feature
): NextResponse | null {
    if (!user) {
        return NextResponse.json(
            { error: 'Login required', code: 'AUTH_REQUIRED' },
            { status: 401 }
        );
    }
    if (!hasFeature(user.tier, feature)) {
        return NextResponse.json(
            { error: 'Upgrade required', code: 'TIER_REQUIRED', requiredFeature: feature },
            { status: 403 }
        );
    }
    return null;
}
