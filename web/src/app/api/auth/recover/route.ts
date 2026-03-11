import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const RESET_TTL = 300; // 5 minutes
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // exclude confusing: I,O,L,0,1
const ACCOUNT_CODE_LIMIT = 3; // max code requests per account per hour
const ACCOUNT_CODE_WINDOW = 3600; // 1 hour in seconds

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

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

/** Generate a deterministic fake masked email from identifier to prevent enumeration */
function fakeMaskedEmail(identifier: string): string {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
        hash = ((hash << 5) - hash + identifier.charCodeAt(i)) | 0;
    }
    const h = Math.abs(hash);
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const first = chars[h % 26];
    const last = chars[(h >> 8) % 26];
    const localLen = 7 + (h % 5); // 7-11 total local length
    const stars = '*'.repeat(localLen - 2);
    const domains = ['g****.com', 'n****.com', 'h******.com', 'y*****.com', 'o******.co.kr'];
    const domain = domains[h % domains.length];
    return `${first}${stars}${last}@${domain}`;
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

        // Always return 200 with a maskedEmail to prevent account enumeration
        if (!account || !account.email) {
            return NextResponse.json({ ok: true, maskedEmail: fakeMaskedEmail(identifier) });
        }

        // Check recovery lock (set after 3 failed verification attempts)
        const lockKey = `recovery-locked:${account.email}`;
        const isLocked = await redis.get(lockKey);
        if (isLocked) {
            return NextResponse.json({ ok: true, maskedEmail: maskEmail(account.email) });
        }

        // Per-account rate limit: max 3 code requests per hour
        const accountLimitKey = `recover-account:${account.email}`;
        const accountRequests = await redis.get<number>(accountLimitKey) || 0;
        if (accountRequests >= ACCOUNT_CODE_LIMIT) {
            return NextResponse.json({ ok: true, maskedEmail: maskEmail(account.email) });
        }
        await redis.incr(accountLimitKey);
        await redis.expire(accountLimitKey, ACCOUNT_CODE_WINDOW);

        const code = generateCode();
        const redisKey = `pw-reset:${account.email}`;
        await redis.set(redisKey, code, { ex: RESET_TTL });

        // Reset attempt counter on new code
        await redis.del(`pw-reset-attempts:${account.email}`);

        const safeUsername = escapeHtml(account.username);
        const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@coauths.com';
        await resend.emails.send({
            from: `Aesthetic Intelligence <${fromAddress}>`,
            to: account.email,
            subject: '계정 복구 코드 / Account Recovery Code',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 440px; margin: 0 auto; padding: 32px;">
                    <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #111;">계정 복구 / Account Recovery</h2>
                    <p style="font-size: 15px; color: #333; margin-bottom: 16px;"><strong>${safeUsername}</strong> 님,</p>
                    <p style="font-size: 13px; color: #666; margin-bottom: 8px;">아이디: <strong style="color: #111;">${safeUsername}</strong></p>
                    <p style="font-size: 13px; color: #666; margin-bottom: 20px;">아래 인증 코드를 <strong>반드시 복사하여 붙여넣기</strong>하세요. 코드는 5분간 유효합니다.<br/>Please <strong>copy and paste</strong> the code below. Valid for 5 minutes.</p>
                    <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 36px; font-weight: 900; letter-spacing: 6px; font-family: 'SF Mono', 'Consolas', 'Monaco', monospace; color: #111; user-select: all; -webkit-user-select: all;">${code}</div>
                    </div>
                    <div style="margin-top: 24px; padding: 16px; background: #fff8f8; border: 1px solid #ffe0e0; border-radius: 8px;">
                        <p style="font-size: 12px; color: #c00; margin: 0; font-weight: 600;">⚠️ 보안 안내 / Security Notice</p>
                        <p style="font-size: 12px; color: #666; margin: 6px 0 0 0;">본인이 요청하지 않은 경우, 누군가 귀하의 계정에 접근을 시도하고 있을 수 있습니다. 이 이메일을 무시하고 비밀번호를 변경하는 것을 권장합니다.<br/>If you did not request this, someone may be trying to access your account. Please ignore this email and consider changing your password.</p>
                    </div>
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
        return NextResponse.json({ ok: true, maskedEmail: '***@***.***' });
    }
}
