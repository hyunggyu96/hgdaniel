'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, LockKeyhole, CheckCircle2, Eye, EyeOff, Search, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

const CODE_LENGTH = 8;
const RESEND_COOLDOWN = 60; // seconds

function passwordStrength(pw: string) {
    return {
        minLen: pw.length >= 8,
        hasLower: /[a-z]/.test(pw),
        hasUpper: /[A-Z]/.test(pw),
        hasSpecial: /[^a-zA-Z0-9]/.test(pw),
    };
}

export default function RecoverPage() {
    const { language, t } = useLanguage();
    const isEnglish = language === 'en';

    const [step, setStep] = useState<'identify' | 'code' | 'done'>('identify');
    const [identifier, setIdentifier] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [codeChars, setCodeChars] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [codeError, setCodeError] = useState(false);
    const [codeVerified, setCodeVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [attemptInfo, setAttemptInfo] = useState<string | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const code = codeChars.join('');
    const pwStrength = passwordStrength(newPassword);
    const pwValid = pwStrength.minLen && pwStrength.hasLower && pwStrength.hasUpper && pwStrength.hasSpecial;

    // Resend countdown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Auto-focus first code box when entering step 2
    useEffect(() => {
        if (step === 'code') {
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    // Auto-verify when all 8 characters are entered
    useEffect(() => {
        if (code.length !== CODE_LENGTH || codeVerified || verifying || codeError) return;

        const verify = async () => {
            setVerifying(true);
            setError(null);
            setAttemptInfo(null);
            try {
                const res = await fetch('/api/auth/verify-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ identifier: identifier.trim(), code }),
                });
                if (res.ok) {
                    setCodeVerified(true);
                    setAttemptInfo(null);
                } else {
                    const json = await res.json().catch(() => ({}));
                    const msg = json?.error || '';
                    const attempts = json?.attempts;
                    const maxAttempts = json?.maxAttempts;
                    setCodeError(true);

                    if (json?.locked) {
                        setError(isEnglish ? 'Account recovery is temporarily locked. Please try again later.' : '계정 복구가 일시적으로 잠겼습니다. 나중에 다시 시도해주세요.');
                        setAttemptInfo(null);
                    } else if (msg.toLowerCase().includes('too many failed')) {
                        setError(isEnglish ? 'Too many failed attempts. Please request a new code.' : '실패 횟수가 초과되었습니다. 새 코드를 요청해주세요.');
                        setAttemptInfo(null);
                    } else {
                        setError(isEnglish ? 'Invalid or expired code.' : '인증 코드가 유효하지 않거나 만료되었습니다.');
                        if (typeof attempts === 'number' && typeof maxAttempts === 'number') {
                            setAttemptInfo(`${attempts}/${maxAttempts}`);
                        }
                    }
                }
            } catch {
                setCodeError(true);
                setError(isEnglish ? 'Failed to verify code.' : '코드 검증에 실패했습니다.');
            } finally {
                setVerifying(false);
            }
        };
        verify();
    }, [code, codeVerified, verifying, codeError, identifier, isEnglish]);

    const handleCodeInput = useCallback((index: number, value: string) => {
        const char = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (!char) return;

        setCodeError(false);
        setCodeVerified(false);
        setAttemptInfo(null);
        setCodeChars(prev => {
            const next = [...prev];
            next[index] = char[0];
            return next;
        });

        if (index < CODE_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    }, []);

    const handleCodePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH);
        if (!pasted) return;
        setCodeError(false);
        setCodeVerified(false);
        setAttemptInfo(null);
        const newChars = Array(CODE_LENGTH).fill('');
        for (let i = 0; i < pasted.length; i++) {
            newChars[i] = pasted[i];
        }
        setCodeChars(newChars);
        const nextEmpty = newChars.findIndex(c => !c);
        inputRefs.current[nextEmpty >= 0 ? nextEmpty : CODE_LENGTH - 1]?.focus();
    }, []);

    const handleCodeKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            setCodeChars(prev => {
                const next = [...prev];
                if (next[index]) {
                    next[index] = '';
                    return next;
                }
                if (index > 0) {
                    next[index - 1] = '';
                    inputRefs.current[index - 1]?.focus();
                    return next;
                }
                return prev;
            });
        }
    }, []);

    const sendCode = useCallback(async () => {
        const trimmed = identifier.trim();
        if (!trimmed) {
            setError(isEnglish ? 'Please enter your username or email.' : '아이디 또는 이메일을 입력해주세요.');
            return;
        }
        setSubmitting(true);
        setError(null);
        setAttemptInfo(null);
        try {
            const res = await fetch('/api/auth/recover', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: trimmed }),
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok) {
                setMaskedEmail(json.maskedEmail || '');
                setStep('code');
                setResendCooldown(RESEND_COOLDOWN);
            } else {
                setError(json?.error || (isEnglish ? 'Failed to send recovery email.' : '복구 이메일 전송에 실패했습니다.'));
            }
        } catch {
            setError(isEnglish ? 'Failed to send recovery email.' : '복구 이메일 전송에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    }, [identifier, isEnglish]);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        await sendCode();
    };

    const handleResend = async () => {
        if (resendCooldown > 0 || submitting) return;
        setCodeChars(Array(CODE_LENGTH).fill(''));
        setCodeError(false);
        setCodeVerified(false);
        setAttemptInfo(null);
        setError(null);
        await sendCode();
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setAttemptInfo(null);

        if (code.length !== CODE_LENGTH) {
            setError(isEnglish ? `Please enter the ${CODE_LENGTH}-character code.` : `${CODE_LENGTH}자리 인증코드를 입력해주세요.`);
            return;
        }
        if (!pwValid) {
            setError(t('auth_pw_hint'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t('recover_mismatch'));
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: identifier.trim(), code, newPassword }),
            });
            if (res.ok) {
                setStep('done');
            } else {
                const json = await res.json().catch(() => ({}));
                const msg = json?.error || '';
                const attempts = json?.attempts;
                const maxAttempts = json?.maxAttempts;

                if (json?.locked) {
                    setCodeError(true);
                    setError(isEnglish ? 'Account recovery is temporarily locked. Please try again later.' : '계정 복구가 일시적으로 잠겼습니다. 나중에 다시 시도해주세요.');
                } else if (msg.toLowerCase().includes('too many failed')) {
                    setCodeError(true);
                    setError(isEnglish ? 'Too many failed attempts. Please request a new code.' : '실패 횟수가 초과되었습니다. 새 코드를 요청해주세요.');
                } else if (msg.toLowerCase().includes('verification code')) {
                    setCodeError(true);
                    setError(isEnglish ? 'Invalid or expired code. Please try again.' : '인증 코드가 유효하지 않거나 만료되었습니다.');
                    if (typeof attempts === 'number' && typeof maxAttempts === 'number') {
                        setAttemptInfo(`${attempts}/${maxAttempts}`);
                    }
                } else if (msg.toLowerCase().includes('password must')) {
                    setError(t('auth_pw_hint'));
                } else {
                    setError(msg || (isEnglish ? 'Failed to reset password.' : '비밀번호 재설정에 실패했습니다.'));
                }
            }
        } catch {
            setError(isEnglish ? 'Failed to reset password.' : '비밀번호 재설정에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCooldown = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    return (
        <main className="min-h-[calc(100vh-180px)] bg-gray-50/70 dark:bg-gray-950 px-4 py-10">
            <div className="mx-auto w-full max-w-lg">
                <Link
                    href="/auth"
                    className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {isEnglish ? 'Back to Login' : '로그인으로'}
                </Link>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {t('recover_title')}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {t('recover_desc')}
                        </p>
                    </div>

                    {/* Step 1: Username or Email */}
                    {step === 'identify' && (
                        <form onSubmit={handleSendCode} className="space-y-3">
                            <div>
                                <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                    {t('recover_identifier_label')}
                                </span>
                                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                                    <Search className="mr-2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        placeholder={isEnglish ? 'username or email' : '아이디 또는 이메일'}
                                        autoComplete="username"
                                        className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || !identifier.trim()}
                                className="h-11 w-full rounded-xl bg-[#3182f6] text-sm font-bold text-white transition-colors hover:bg-[#1b64da] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
                            >
                                {submitting ? (isEnglish ? 'Searching...' : '검색 중...') : t('recover_send')}
                            </button>
                        </form>
                    )}

                    {/* Step 2: Code + New Password */}
                    {step === 'code' && (
                        <form onSubmit={handleReset} className="space-y-3">
                            {/* Masked email + generic notification */}
                            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900/40 dark:bg-green-900/20">
                                {maskedEmail ? (
                                    <span className="block mb-0.5 font-mono text-[11px] text-green-700 dark:text-green-300">{maskedEmail}</span>
                                ) : null}
                                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                                    {t('recover_sent')}
                                </span>
                            </div>

                            {/* Code input — 8 individual boxes */}
                            <div>
                                <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                    {t('recover_code')}
                                    {verifying && (
                                        <span className="text-blue-500 font-normal">{isEnglish ? 'Verifying...' : '확인 중...'}</span>
                                    )}
                                    {codeVerified && (
                                        <span className="text-green-500 flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" />{isEnglish ? 'Verified' : '확인됨'}</span>
                                    )}
                                </span>
                                <div className="flex gap-1.5 justify-center">
                                    {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                                        <input
                                            key={i}
                                            ref={el => { inputRefs.current[i] = el; }}
                                            type="text"
                                            inputMode="text"
                                            maxLength={1}
                                            value={codeChars[i]}
                                            onChange={e => handleCodeInput(i, e.target.value)}
                                            onKeyDown={e => handleCodeKeyDown(i, e)}
                                            onPaste={handleCodePaste}
                                            disabled={codeVerified}
                                            className={`w-10 h-12 text-center text-lg font-bold uppercase rounded-xl border bg-white dark:bg-gray-800 outline-none transition-colors ${
                                                codeError
                                                    ? 'border-red-400 dark:border-red-500 text-red-600 dark:text-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                    : codeVerified
                                                        ? 'border-green-400 dark:border-green-600 text-green-600 dark:text-green-400'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                            }`}
                                        />
                                    ))}
                                </div>

                                {/* Resend button with timer */}
                                <div className="mt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendCooldown > 0 || submitting}
                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-blue-500 disabled:hover:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <RotateCcw className="h-3 w-3" />
                                        {resendCooldown > 0
                                            ? `${isEnglish ? 'Resend in' : '재전송'} ${formatCooldown(resendCooldown)}`
                                            : (isEnglish ? 'Resend code' : '코드 재전송')
                                        }
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                    {t('recover_new_pw')}
                                    <span className="ml-1 font-normal text-gray-400 dark:text-gray-500">
                                        {t('auth_pw_hint')}
                                    </span>
                                </span>
                                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                                    <LockKeyhole className="mr-2 h-4 w-4 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={isEnglish ? 'at least 8 characters' : '8자 이상'}
                                        autoComplete="new-password"
                                        className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="ml-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {newPassword.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                                        <span className={pwStrength.minLen ? 'text-green-500' : 'text-gray-400'}>{isEnglish ? '8+ chars' : '8자 이상'}</span>
                                        <span className={pwStrength.hasLower ? 'text-green-500' : 'text-gray-400'}>{isEnglish ? 'a-z' : '소문자'}</span>
                                        <span className={pwStrength.hasUpper ? 'text-green-500' : 'text-gray-400'}>{isEnglish ? 'A-Z' : '대문자'}</span>
                                        <span className={pwStrength.hasSpecial ? 'text-green-500' : 'text-gray-400'}>{isEnglish ? 'Special' : '특수문자'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                    {t('recover_confirm_pw')}
                                </span>
                                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                                    <LockKeyhole className="mr-2 h-4 w-4 text-gray-400" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={isEnglish ? 're-enter password' : '비밀번호를 다시 입력'}
                                        autoComplete="new-password"
                                        className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="ml-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                                    {error}
                                    {attemptInfo && (
                                        <span className="ml-1.5 font-bold text-red-500 dark:text-red-400">({attemptInfo})</span>
                                    )}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || code.length !== CODE_LENGTH || !pwValid || newPassword !== confirmPassword}
                                className="h-11 w-full rounded-xl bg-[#3182f6] text-sm font-bold text-white transition-colors hover:bg-[#1b64da] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
                            >
                                {submitting ? (isEnglish ? 'Resetting...' : '재설정 중...') : t('recover_reset')}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 'done' && (
                        <div className="text-center py-4">
                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                {t('recover_success')}
                            </p>
                            <Link
                                href="/auth"
                                className="inline-block rounded-xl bg-[#3182f6] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1b64da] transition-colors"
                            >
                                {t('recover_go_login')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
