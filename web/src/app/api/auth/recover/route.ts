import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const RESET_TTL = 300; // 5 minutes
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // exclude confusing: I,O,L,0,1

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
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => CODE_CHARS[b % CODE_CHARS.length]).join('');
}

/** Mask email: johnapple@gmail.com → j*******e@g****.com */
function maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!local || !domain) return '***@***.***';

    let maskedLocal: string;
    if (local.length <= 1) {
        maskedLocal = local;
    } else if (local.length === 2) {
        maskedLocal = local[0] + '*';
    } else {
        maskedLocal = local[0] + '*'.repeat(local.length - 2) + local[local.length - 1];
    }

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
        const { data: account } = await supabaseAdmin
            .from('accounts')
            .select('id, username, email')
            .eq(isEmail ? 'email' : 'username', identifier)
            .maybeSingle();

        // Always return 200 to prevent account enumeration
        if (!account || !account.email) {
            return NextResponse.json({ ok: true });
        }

        const code = generateCode();
        const redisKey = `pw-reset:${account.email}`;
        await redis.set(redisKey, code, { ex: RESET_TTL });

        // Reset attempt counter on new code
        await redis.del(`pw-reset-attempts:${account.email}`);

        const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@coauths.com';
        await resend.emails.send({
            from: `Aesthetic Intelligence <${fromAddress}>`,
            to: account.email,
            subject: '계정 복구 코드 / Account Recovery Code',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 440px; margin: 0 auto; padding: 32px;">
                    <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #111;">계정 복구 / Account Recovery</h2>
                    <p style="font-size: 15px; color: #333; margin-bottom: 16px;"><strong>${account.username}</strong> 님,</p>
                    <p style="font-size: 13px; color: #666; margin-bottom: 8px;">아이디: <strong style="color: #111;">${account.username}</strong></p>
                    <p style="font-size: 13px; color: #666; margin-bottom: 20px;">아래 인증 코드를 복사하여 입력하세요. 코드는 5분간 유효합니다.<br/>Copy and paste the code below. Valid for 5 minutes.</p>
                    <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 36px; font-weight: 900; letter-spacing: 6px; font-family: 'SF Mono', 'Consolas', 'Monaco', monospace; color: #111; user-select: all; -webkit-user-select: all;">${code}</div>
                    </div>
                    <p style="font-size: 12px; color: #999; margin-bottom: 0;">본인이 요청하지 않은 경우 이 이메일을 무시해주세요.<br/>If you didn't request this, please ignore this email.</p>
                </div>
            `,
        });

        // Log recovery attempt
        const { error: logErr } = await supabaseAdmin.from('recovery_logs').insert({
            account_id: account.id,
            identifier_used: identifier,
            ip_address: ip,
            code_sent: true,
            code_verified: false,
            password_reset: false,
        });
        if (logErr) console.error('[auth/recover] log error:', logErr);

        return NextResponse.json({
            ok: true,
            maskedEmail: maskEmail(account.email),
        });
    } catch (error) {
        console.error('[auth/recover] error:', error);
        // Still return 200 to prevent information leakage
        return NextResponse.json({ ok: true });
    }
}
