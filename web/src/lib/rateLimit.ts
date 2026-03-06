// Simple in-memory sliding-window rate limiter.
// In serverless (Vercel), each instance has its own Map, so this provides
// per-instance protection. For full distributed rate limiting, use Upstash Redis.

// IPv4 or IPv6 basic pattern check — rejects garbage / injection attempts
const IP_PATTERN = /^[\da-fA-F.:]+$/;

/**
 * Extract client IP from request headers with validation.
 * On Vercel/Cloudflare, x-forwarded-for is set by the edge and cannot be spoofed
 * by end users. We still validate format to reject garbage values.
 */
export function getClientIp(headers: { get(name: string): string | null }): string {
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first && IP_PATTERN.test(first)) return first;
    }
    const realIp = headers.get('x-real-ip')?.trim();
    if (realIp && IP_PATTERN.test(realIp)) return realIp;
    return 'unknown';
}

const windows = new Map<string, { count: number; resetAt: number }>();

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    windows.forEach((val, key) => {
        if (val.resetAt < now) windows.delete(key);
    });
}

export function rateLimit(
    key: string,
    { maxRequests = 10, windowMs = 60_000 } = {},
): { allowed: boolean; remaining: number; retryAfterMs: number } {
    cleanup();
    const now = Date.now();
    const entry = windows.get(key);

    if (!entry || entry.resetAt < now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
    }

    if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
    }

    entry.count++;
    return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}
