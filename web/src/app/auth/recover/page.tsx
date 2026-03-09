'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, LockKeyhole, CheckCircle2, Eye, EyeOff, Search } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

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
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const pwStrength = passwordStrength(newPassword);
    const pwValid = pwStrength.minLen && pwStrength.hasLower && pwStrength.hasUpper && pwStrength.hasSpecial;

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = identifier.trim();
        if (!trimmed) {
            setError(isEnglish ? 'Please enter your username or email.' : '아이디 또는 이메일을 입력해주세요.');
            return;
        }
        setSubmitting(true);
        setError(null);
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
            } else if (res.status === 404) {
                setError(json?.error || (isEnglish ? 'Account not found.' : '계정을 찾을 수 없습니다.'));
            } else {
                setError(json?.error || (isEnglish ? 'Failed to send recovery email.' : '복구 이메일 전송에 실패했습니다.'));
            }
        } catch {
            setError(isEnglish ? 'Failed to send recovery email.' : '복구 이메일 전송에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (code.length !== 6) {
            setError(isEnglish ? 'Please enter the 6-digit code.' : '6자리 인증코드를 입력해주세요.');
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
                if (msg.toLowerCase().includes('verification code')) {
                    setError(isEnglish ? 'Invalid or expired code. Please try again.' : '인증 코드가 유효하지 않거나 만료되었습니다.');
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
                            {/* Masked email notification */}
                            <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
                                {maskedEmail && (
                                    <span className="block mb-0.5 font-mono text-[11px]">{maskedEmail}</span>
                                )}
                                {t('recover_sent')}
                            </p>

                            {/* Code input */}
                            <div>
                                <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                    {t('recover_code')}
                                </span>
                                <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder={t('auth_code_placeholder')}
                                        className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400 tracking-widest"
                                    />
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
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || code.length !== 6 || !pwValid || newPassword !== confirmPassword}
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
