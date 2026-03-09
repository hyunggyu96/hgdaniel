// Distributed rate limiter using Upstash Redis.
// Falls back to in-memory rate limiting if Upstash env vars are not configured.

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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

// --- Upstash Redis rate limiter ---

const useRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = useRedis
    ? new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL!.trim(),
          token: process.env.UPSTASH_REDIS_REST_TOKEN!.trim(),
      })
    : null;

// Cache of Ratelimit instances keyed by "maxRequests:windowMs"
const limiters = new Map<string, Ratelimit>();

function getRedisLimiter(maxRequests: number, windowMs: number): Ratelimit {
    const cacheKey = `${maxRequests}:${windowMs}`;
    let limiter = limiters.get(cacheKey);
    if (!limiter) {
        limiter = new Ratelimit({
            redis: redis!,
            limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
            prefix: 'rl',
        });
        limiters.set(cacheKey, limiter);
    }
    return limiter;
}

// --- In-memory fallback (for local dev without Upstash) ---

const windows = new Map<string, { count: number; resetAt: number }>();
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

function inMemoryRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number,
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

// --- Unified rate limit function ---

export async function rateLimit(
    key: string,
    { maxRequests = 10, windowMs = 60_000 } = {},
): Promise<{ allowed: boolean; remaining: number; retryAfterMs: number }> {
    if (useRedis) {
        const limiter = getRedisLimiter(maxRequests, windowMs);
        const result = await limiter.limit(key);
        return {
            allowed: result.success,
            remaining: result.remaining,
            retryAfterMs: result.success ? 0 : Math.max(0, result.reset - Date.now()),
        };
    }
    return inMemoryRateLimit(key, maxRequests, windowMs);
}
