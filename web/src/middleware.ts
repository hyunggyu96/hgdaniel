import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter for middleware (per Vercel instance)
const windows = new Map<string, { count: number; resetAt: number }>();

function rateLimitCheck(key: string, max: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const entry = windows.get(key);

    if (!entry || entry.resetAt < now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterMs: 0 };
    }
    if (entry.count >= max) {
        return { allowed: false, retryAfterMs: entry.resetAt - now };
    }
    entry.count++;
    return { allowed: true, retryAfterMs: 0 };
}

// Periodic cleanup
let lastCleanup = Date.now();
function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < 300_000) return;
    lastCleanup = now;
    windows.forEach((val, key) => {
        if (val.resetAt < now) windows.delete(key);
    });
}

// Rate limit configs per route pattern
const RATE_LIMITS: { pattern: RegExp; maxRequests: number; windowMs: number }[] = [
    // Auth endpoints (already have per-route limits, this is a global safety net)
    { pattern: /^\/api\/auth\/(login|register)$/, maxRequests: 15, windowMs: 60_000 },
    // Admin endpoints
    { pattern: /^\/api\/admin\//, maxRequests: 10, windowMs: 60_000 },
    // Expensive data endpoints
    { pattern: /^\/api\/trends$/, maxRequests: 30, windowMs: 60_000 },
    { pattern: /^\/api\/news$/, maxRequests: 60, windowMs: 60_000 },
    { pattern: /^\/api\/insights$/, maxRequests: 60, windowMs: 60_000 },
    { pattern: /^\/api\/mfds-products$/, maxRequests: 60, windowMs: 60_000 },
    { pattern: /^\/api\/nedrug-products$/, maxRequests: 60, windowMs: 60_000 },
    { pattern: /^\/api\/company-news\//, maxRequests: 60, windowMs: 60_000 },
    // Ask-AI (expensive external API calls)
    { pattern: /^\/api\/ask-ai\/chat$/, maxRequests: 20, windowMs: 60_000 },
    { pattern: /^\/api\/ask-ai\/upload$/, maxRequests: 5, windowMs: 60_000 },
    { pattern: /^\/api\/ask-ai\//, maxRequests: 30, windowMs: 60_000 },
    // Editor's picks
    { pattern: /^\/api\/editors-picks/, maxRequests: 60, windowMs: 60_000 },
    // Catch-all for any other API routes
    { pattern: /^\/api\//, maxRequests: 60, windowMs: 60_000 },
];

export function middleware(request: NextRequest) {
    cleanup();

    const { pathname } = request.nextUrl;

    // Only rate-limit API routes
    if (!pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Skip rate limiting for Vercel Cron (authenticated by CRON_SECRET in the handler)
    if (pathname.startsWith('/api/cron/')) {
        return NextResponse.next();
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';

    // Find matching rate limit config
    for (const cfg of RATE_LIMITS) {
        if (cfg.pattern.test(pathname)) {
            const key = `mw:${ip}:${cfg.pattern.source}`;
            const { allowed, retryAfterMs } = rateLimitCheck(key, cfg.maxRequests, cfg.windowMs);

            if (!allowed) {
                return NextResponse.json(
                    { error: 'Too many requests. Please try again later.' },
                    {
                        status: 429,
                        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
                    },
                );
            }
            break; // First match wins
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
