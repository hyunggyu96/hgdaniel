import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const RESET_TTL = 300; // 5 minutes

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
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return String(arr[0] % 1_000_000).padStart(6, '0');
}

/** Mask email: johnapple@gmail.com → j*******e@g****.com */
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';

    // Mask local part: first + stars + last
    let maskedLocal: string;
    if (local.length <= 1) {
        maskedLocal = local;
    } else if (local.length === 2) {
        maskedLocal = local[0] + '*';
    } else {
        maskedLocal = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
    }

    // Mask domain: split by dots, mask each part except last (TLD)
    const domainParts = domain.split('.');
    const maskedParts = domainParts.map((part, i) => {
        if (i === domainParts.length - 1) return part; // keep TLD
        if (part.length <= 1) return part;
        return part[0] + '*'.repeat(part.length - 1);
    });

    return maskedLocal + '@' + maskedParts.join('.');
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed } = await rateLimit(`recover:${ip}`, { maxRequests: 3, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const body = await request.json();
        const identifier = String(body?.identifier || '').trim().toLowerCase();

        if (!identifier) {
            return NextResponse.json({ error: 'Username or email is required' }, { status: 400 });
        }

        const redis = getRedis();
        if (!redis) {
            return NextResponse.json({ error: 'Recovery service is not configured' }, { status: 503 });
        }

        const resend = getResend();
        if (!resend) {
            return NextResponse.json({ error: 'Email service is not configured' }, { status: 503 });
        }

        // Determine if input is email or username
        const isEmail = identifier.includes('@');
        const query = supabaseAdmin
            .from('accounts')
            .select('username, email')
            .eq(isEmail ? 'email' : 'username', identifier)
            .maybeSingle();

        const { data: account } = await query;

        if (!account || !account.email) {
            return NextResponse.json(
                { error: isEmail ? 'No account found with this email' : 'No account found with this username' },
                { status: 404 },
            );
        }

        const code = generateCode();
        const redisKey = `pw-reset:${account.email}`;
        await redis.set(redisKey, code, { ex: RESET_TTL });

        const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@coauths.com';
        await resend.emails.send({
            from: `Aesthetic Intelligence <${fromAddress}>`,
            to: account.email,
            subject: '계정 복구 코드 / Account Recovery Code',
            html: `
                <div style="font-family: -apple-system, sans-serif; max-width: 400px; margin: 0 auto; padding: 32px;">
                    <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">계정 복구</h2>
                    <p style="font-size: 14px; color: #666; margin-bottom: 8px;">아이디: <strong>${account.username}</strong></p>
                    <p style="font-size: 14px; color: #666; margin-bottom: 24px;">아래 인증 코드를 입력하여 비밀번호를 재설정하세요. 코드는 5분간 유효합니다.</p>
                    <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 12px; margin-bottom: 24px;">${code}</div>
                    <p style="font-size: 12px; color: #999;">본인이 요청하지 않은 경우 이 이메일을 무시해주세요.</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
                    <p style="font-size: 14px; color: #666; margin-bottom: 8px;">Username: <strong>${account.username}</strong></p>
                    <p style="font-size: 12px; color: #999;">Enter the code above to reset your password. Valid for 5 minutes.</p>
                </div>
            `,
        });

        return NextResponse.json({
            ok: true,
            maskedEmail: maskEmail(account.email),
        });
    } catch (error) {
        console.error('[auth/recover] error:', error);
        return NextResponse.json({ error: 'Failed to process recovery request' }, { status: 500 });
    }
}
