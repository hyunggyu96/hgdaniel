import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const VERIFICATION_TTL = 300; // 5 minutes

function getRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
    if (!url || !token) return null;
    return new Redis({ url, token });
}

function getResend() {
    const key = process.env.RESEND_API_KEY?.trim();
    if (!key) return null;
    return new Resend(key);
}

function generateCode(): string {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid confusion
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => charset[b % charset.length]).join('');
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed } = await rateLimit(`send-verify:${ip}`, { maxRequests: 5, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const body = await request.json();
        const email = String(body?.email || '').trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        const redis = getRedis();
        if (!redis) {
            return NextResponse.json({ error: 'Email verification is not configured' }, { status: 503 });
        }

        const resend = getResend();
        if (!resend) {
            return NextResponse.json({ error: 'Email service is not configured' }, { status: 503 });
        }

        const code = generateCode();
        const redisKey = `email-verify:${email}`;

        // Store code in Redis with TTL
        await redis.set(redisKey, code, { ex: VERIFICATION_TTL });

        // Send email
        const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@coauths.com';
        await resend.emails.send({
            from: `Aesthetic Intelligence <${fromAddress}>`,
            to: email,
            subject: '이메일 인증 코드 / Email Verification Code',
            html: `
                <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
                    <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">이메일 인증 코드</h2>
                    <p style="font-size: 14px; color: #666; margin-bottom: 24px;">아래 인증 코드를 입력해주세요. 코드는 5분간 유효합니다.</p>
                    <div style="font-size: 28px; font-weight: 900; letter-spacing: 6px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 12px; margin-bottom: 24px; font-family: monospace;">${code}</div>
                    <p style="font-size: 12px; color: #999;">본인이 요청하지 않은 경우 이 이메일을 무시해주세요.</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                    <p style="font-size: 12px; color: #999;">Email Verification Code — Enter the code above. Valid for 5 minutes.</p>
                </div>
            `,
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[send-verification] error:', error);
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }
}
