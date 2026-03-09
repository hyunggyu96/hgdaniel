import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Resend } from 'resend';
import { timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { hashPassword, validatePassword } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const RESET_KEY_PREFIX = 'pw-reset:';
const ATTEMPTS_KEY_PREFIX = 'pw-reset-attempts:';
const LOCK_KEY_PREFIX = 'recovery-locked:';
const MAX_ATTEMPTS = 3;
const LOCK_TTL = 900; // 15 minutes

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

function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a, 'utf-8'), Buffer.from(b, 'utf-8'));
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed } = await rateLimit(`reset-password:${ip}`, { maxRequests: 5, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        const body = await request.json();
        const identifier = String(body?.identifier || '').trim().toLowerCase();
        const code = String(body?.code || '').trim().toUpperCase();
        const newPassword = String(body?.newPassword || '');

        if (!identifier || !code || !newPassword) {
            return NextResponse.json({ error: 'Identifier, code, and new password are required' }, { status: 400 });
        }

        const redis = getRedis();
        if (!redis) {
            return NextResponse.json({ error: 'Recovery service is not configured' }, { status: 503 });
        }

        // Look up account by username or email
        const isEmail = identifier.includes('@');
        const { data: account } = await supabaseAdmin
            .from('accounts')
            .select('id, username, email, session_version')
            .eq(isEmail ? 'email' : 'username', identifier)
            .maybeSingle();

        if (!account || !account.email) {
            return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 });
        }

        const redisKey = `${RESET_KEY_PREFIX}${account.email}`;
        const attemptsKey = `${ATTEMPTS_KEY_PREFIX}${account.email}`;
        const lockKey = `${LOCK_KEY_PREFIX}${account.email}`;

        // Check recovery lock
        const isLocked = await redis.get(lockKey);
        if (isLocked) {
            return NextResponse.json({
                error: 'Account recovery is temporarily locked. Please try again later.',
                locked: true,
            }, { status: 400 });
        }

        // Check per-account attempt lockout
        const attempts = await redis.get<number>(attemptsKey) || 0;
        if (attempts >= MAX_ATTEMPTS) {
            await redis.del(redisKey);
            await redis.del(attemptsKey);
            await redis.set(lockKey, '1', { ex: LOCK_TTL });
            return NextResponse.json({
                error: 'Too many failed attempts. Account recovery locked for 15 minutes.',
                attempts: MAX_ATTEMPTS,
                maxAttempts: MAX_ATTEMPTS,
                locked: true,
            }, { status: 400 });
        }

        // Verify code
        const storedCode = await redis.get<string>(redisKey);
        if (!storedCode || !safeCompare(storedCode, code)) {
            const newAttempts = attempts + 1;
            await redis.incr(attemptsKey);
            await redis.expire(attemptsKey, 300);

            if (newAttempts >= MAX_ATTEMPTS) {
                await redis.del(redisKey);
                await redis.del(attemptsKey);
                await redis.set(lockKey, '1', { ex: LOCK_TTL });
                return NextResponse.json({
                    error: 'Too many failed attempts. Account recovery locked for 15 minutes.',
                    attempts: MAX_ATTEMPTS,
                    maxAttempts: MAX_ATTEMPTS,
                    locked: true,
                }, { status: 400 });
            }

            return NextResponse.json({
                error: 'Invalid or expired verification code',
                attempts: newAttempts,
                maxAttempts: MAX_ATTEMPTS,
            }, { status: 400 });
        }

        // Delete code BEFORE password update to prevent replay
        await redis.del(redisKey);
        await redis.del(attemptsKey);

        // Validate new password
        const pwCheck = validatePassword(newPassword);
        if (!pwCheck.ok) {
            return NextResponse.json({ error: pwCheck.reason }, { status: 400 });
        }

        // Hash and update password, increment session_version
        const newHash = await hashPassword(newPassword);
        const newVersion = (account.session_version ?? 0) + 1;

        const { error: updateError } = await supabaseAdmin
            .from('accounts')
            .update({ password_hash: newHash, session_version: newVersion })
            .eq('id', account.id);

        if (updateError) {
            console.error('[auth/reset-password] update error:', updateError);
            return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
        }

        // Update most recent recovery log: password_reset = true
        const { data: logRow } = await supabaseAdmin
            .from('recovery_logs')
            .select('id')
            .eq('account_id', account.id)
            .eq('password_reset', false)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (logRow) {
            const { error: logErr } = await supabaseAdmin
                .from('recovery_logs')
                .update({ password_reset: true, updated_at: new Date().toISOString() })
                .eq('id', logRow.id);
            if (logErr) console.error('[auth/reset-password] log error:', logErr);
        }

        // Send password change notification email
        const resend = getResend();
        if (resend && account.email) {
            const safeUsername = escapeHtml(account.username || '');
            const fromAddress = process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@coauths.com';
            try {
                await resend.emails.send({
                    from: `Aesthetic Intelligence <${fromAddress}>`,
                    to: account.email,
                    subject: '비밀번호 변경 알림 / Password Changed',
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 440px; margin: 0 auto; padding: 32px;">
                            <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #111;">비밀번호 변경 완료 / Password Changed</h2>
                            <p style="font-size: 15px; color: #333; margin-bottom: 16px;"><strong>${safeUsername}</strong> 님,</p>
                            <p style="font-size: 13px; color: #666; margin-bottom: 20px;">귀하의 계정 비밀번호가 성공적으로 변경되었습니다.<br/>Your account password has been successfully changed.</p>
                            <div style="margin-top: 24px; padding: 16px; background: #fff8f8; border: 1px solid #ffe0e0; border-radius: 8px;">
                                <p style="font-size: 12px; color: #c00; margin: 0; font-weight: 600;">⚠️ 보안 안내 / Security Notice</p>
                                <p style="font-size: 12px; color: #666; margin: 6px 0 0 0;">본인이 변경하지 않은 경우, 누군가 귀하의 계정에 무단으로 접근했을 수 있습니다. 즉시 비밀번호를 재설정하고 관리자에게 문의해주세요.<br/>If you did not make this change, someone may have accessed your account without authorization. Please reset your password immediately and contact support.</p>
                            </div>
                        </div>
                    `,
                });
            } catch (emailErr) {
                console.error('[auth/reset-password] notification email error:', emailErr);
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[auth/reset-password] error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
