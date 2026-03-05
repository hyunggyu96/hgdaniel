// Simple in-memory sliding-window rate limiter.
// In serverless (Vercel), each instance has its own Map, so this provides
// per-instance protection. For full distributed rate limiting, use Upstash Redis.

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
