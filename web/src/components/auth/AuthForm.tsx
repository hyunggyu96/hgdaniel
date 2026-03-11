'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LockKeyhole, UserRound, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/components/UserContext';
import { useLanguage } from '@/components/LanguageContext';

export type AuthMode = 'login' | 'register';

interface AuthFormProps {
    initialMode?: AuthMode;
    onSuccess?: (mode: AuthMode) => void;
    onModeChange?: (mode: AuthMode) => void;
    onClose?: () => void;
    className?: string;
}

type ValidateResult =
    | { ok: false; error: string }
    | { ok: true; normalized: string };

const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
const INVALID_CHAR_RE = /[^a-z0-9._-]/;

function mapAuthError(message: string | undefined, isEnglish: boolean): string {
    const text = (message || '').toLowerCase();

    if (!text) return isEnglish ? 'Something went wrong during authentication.' : '인증 처리 중 문제가 발생했습니다.';
    if (text.includes('invalid credentials')) return isEnglish ? 'Invalid username or password.' : '아이디 또는 비밀번호가 올바르지 않습니다.';
    if (text.includes('username already exists')) return isEnglish ? 'This username is already in use.' : '이미 사용 중인 아이디입니다.';
    if (text.includes('email already exists')) return isEnglish ? 'This email is already in use.' : '이미 사용 중인 이메일입니다.';
    if (text.includes('username and password are required')) return isEnglish ? 'Please enter both username and password.' : '아이디와 비밀번호를 입력해주세요.';
    if (text.includes('password must be at least 8')) return isEnglish ? 'Password must be at least 8 characters.' : '비밀번호는 8자 이상이어야 합니다.';
    if (text.includes('password must include')) return isEnglish ? 'Password must include upper/lowercase and special characters.' : '비밀번호에 영문 대소문자 및 특수문자를 포함해주세요.';
    if (text.includes('username must be 3-32')) return isEnglish ? 'Username format is invalid.' : '아이디 형식이 올바르지 않습니다.';
    if (text.includes('verification code')) return isEnglish ? 'Invalid or expired verification code.' : '인증 코드가 유효하지 않거나 만료되었습니다.';
    if (text.includes('register failed')) return isEnglish ? 'Registration failed. Please try again.' : '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.';
    if (text.includes('login failed')) return isEnglish ? 'Login failed. Please try again.' : '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';

    return message || (isEnglish ? 'Something went wrong during authentication.' : '인증 처리 중 문제가 발생했습니다.');
}

function passwordStrength(pw: string) {
    return {
        minLen: pw.length >= 8,
        hasLower: /[a-z]/.test(pw),
        hasUpper: /[A-Z]/.test(pw),
        hasSpecial: /[^a-zA-Z0-9]/.test(pw),
    };
}

export default function AuthForm({
    initialMode = 'login',
    onSuccess,
    onModeChange,
    onClose,
    className = '',
}: AuthFormProps) {
    const { login, register } = useUser();
    const { language, t } = useLanguage();
    const isEnglish = language === 'en';
    const registrationDisabled = process.env.NEXT_PUBLIC_REGISTRATION_DISABLED === 'true';

    const [mode, setMode] = useState<AuthMode>(registrationDisabled ? 'login' : initialMode);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedAll, setAgreedAll] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [agreedPrivacy, setAgreedPrivacy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Username check
    const [usernameChecked, setUsernameChecked] = useState<null | boolean>(null); // null=unchecked, true=available, false=taken
    const [checkingUsername, setCheckingUsername] = useState(false);

    // Email verification
    const [emailCode, setEmailCode] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);

    // Username validation
    const usernameNorm = username.trim().toLowerCase();
    const hasInvalidChars = username.trim().length > 0 && INVALID_CHAR_RE.test(usernameNorm);
    const usernameError = hasInvalidChars;

    useEffect(() => {
        setMode(registrationDisabled ? 'login' : initialMode);
    }, [initialMode, registrationDisabled]);

    useEffect(() => {
        setError(null);
        setPassword('');
        setConfirmPassword('');
        setEmail('');
        setBirthYear('');
        setEmailCode('');
        setEmailVerified(false);
        setCodeSent(false);
        setUsernameChecked(null);
        setAgreedAll(false);
        setAgreedTerms(false);
        setAgreedPrivacy(false);
        onModeChange?.(mode);
    }, [mode, onModeChange]);

    // Reset username check when username changes
    useEffect(() => {
        setUsernameChecked(null);
    }, [username]);

    // Reset email verification when email changes
    useEffect(() => {
        setEmailVerified(false);
        setCodeSent(false);
        setEmailCode('');
    }, [email]);

    const handleCheckUsername = useCallback(async () => {
        if (!USERNAME_RE.test(usernameNorm) || checkingUsername) return;
        setCheckingUsername(true);
        try {
            const res = await fetch('/api/auth/check-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameNorm }),
            });
            const json = await res.json().catch(() => ({}));
            setUsernameChecked(!!json?.available);
        } catch {
            setUsernameChecked(null);
        } finally {
            setCheckingUsername(false);
        }
    }, [usernameNorm, checkingUsername]);

    const handleSendCode = useCallback(async () => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || sendingCode) return;
        setSendingCode(true);
        setError(null);
        try {
            const res = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setCodeSent(true);
            } else {
                const json = await res.json().catch(() => ({}));
                setError(json?.error || (isEnglish ? 'Failed to send code.' : '코드 전송에 실패했습니다.'));
            }
        } catch {
            setError(isEnglish ? 'Failed to send code.' : '코드 전송에 실패했습니다.');
        } finally {
            setSendingCode(false);
        }
    }, [email, sendingCode, isEnglish]);

    const pwStrength = passwordStrength(password);
    const pwValid = pwStrength.minLen && pwStrength.hasLower && pwStrength.hasUpper && pwStrength.hasSpecial;

    // Register button enabled check
    const registerReady = mode === 'register'
        && USERNAME_RE.test(usernameNorm)
        && usernameChecked === true
        && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        && codeSent && emailCode.length === 8
        && pwValid
        && password === confirmPassword
        && birthYear
        && agreedTerms
        && agreedPrivacy;

    const loginReady = mode === 'login'
        && usernameNorm.length >= 3
        && password.length >= 8;

    const canSubmit = mode === 'login' ? loginReady : registerReady;

    const validate = (): ValidateResult => {
        const normalized = usernameNorm;

        if (!USERNAME_RE.test(normalized)) {
            return {
                ok: false,
                error: isEnglish
                    ? 'Username must be 3-32 chars and use only lowercase letters, numbers, ., _, -.'
                    : '아이디는 3-32자, 영문 소문자/숫자/._- 만 사용할 수 있습니다.',
            };
        }

        if (password.length < 8) {
            return { ok: false, error: isEnglish ? 'Password must be at least 8 characters.' : '비밀번호는 8자 이상이어야 합니다.' };
        }

        if (mode === 'register') {
            if (!pwValid) {
                return { ok: false, error: t('auth_pw_hint') };
            }
            if (password !== confirmPassword) {
                return { ok: false, error: isEnglish ? 'Password confirmation does not match.' : '비밀번호 확인이 일치하지 않습니다.' };
            }
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return { ok: false, error: isEnglish ? 'Please enter a valid email address.' : '유효한 이메일 주소를 입력해주세요.' };
            }
            if (usernameChecked !== true) {
                return { ok: false, error: isEnglish ? 'Please check username availability.' : '아이디 중복확인을 해주세요.' };
            }
            const yr = Number(birthYear);
            if (!yr || yr < 1900 || yr > new Date().getFullYear()) {
                return { ok: false, error: isEnglish ? 'Please enter a valid birth year.' : '유효한 생년을 입력해주세요.' };
            }
            if (!agreedTerms || !agreedPrivacy) {
                return { ok: false, error: isEnglish ? 'You must agree to all required terms.' : '필수 약관에 모두 동의해주세요.' };
            }
        }

        return { ok: true, normalized };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const check = validate();
        if (!check.ok) {
            setError(check.error);
            return;
        }

        setSubmitting(true);
        try {
            const result = mode === 'login'
                ? await login(check.normalized, password)
                : await register(check.normalized, password, email, Number(birthYear), emailCode);

            if (!result.ok) {
                setError(mapAuthError(result.error, isEnglish));
                return;
            }

            setUsername('');
            setPassword('');
            setConfirmPassword('');
            onSuccess?.(mode);
        } finally {
            setSubmitting(false);
        }
    };

    const reqStar = <span className="text-red-500 ml-0.5">*</span>;

    return (
        <div className={`space-y-4 ${className}`}>
            {registrationDisabled ? (
                <div className="w-full rounded-xl bg-gray-100 p-2 dark:bg-gray-800 text-center">
                    <span className="text-xs font-semibold text-blue-600">
                        {isEnglish ? 'Login' : '로그인'}
                    </span>
                </div>
            ) : (
                <div className="relative inline-flex w-full rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                    <motion.div
                        className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm dark:bg-gray-900"
                        style={{ width: 'calc(50% - 4px)' }}
                        animate={{ x: mode === 'login' ? 0 : '100%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                    <button
                        type="button"
                        onClick={() => setMode('login')}
                        className={`relative z-10 flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                            mode === 'login' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        {isEnglish ? 'Login' : '로그인'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('register')}
                        className={`relative z-10 flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                            mode === 'register' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                    >
                        {isEnglish ? 'Register' : '회원가입'}
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* Username */}
                <div className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        {isEnglish ? 'Username' : '아이디'}{mode === 'register' && reqStar}
                        {mode === 'register' && (
                            <span className="ml-1 font-normal text-gray-400 dark:text-gray-500">
                                {t('auth_username_hint')}
                            </span>
                        )}
                    </span>
                    <div className="flex gap-2">
                        <div className={`flex flex-1 items-center rounded-xl border bg-white px-3 dark:bg-gray-900 transition-colors ${
                            usernameError ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                        }`}>
                            <UserRound className={`mr-2 h-4 w-4 ${usernameError ? 'text-red-400' : 'text-gray-400'}`} />
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={isEnglish ? 'lowercase username' : '영문 소문자 아이디'}
                                autoComplete="username"
                                className={`h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400 ${
                                    usernameError ? 'text-red-500' : ''
                                }`}
                            />
                        </div>
                        {mode === 'register' && (
                            <button
                                type="button"
                                onClick={() => void handleCheckUsername()}
                                disabled={!USERNAME_RE.test(usernameNorm) || checkingUsername}
                                className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 h-10 text-[11px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                            >
                                {checkingUsername ? '...' : t('auth_check_username')}
                            </button>
                        )}
                    </div>
                    {/* Username check result */}
                    {mode === 'register' && usernameChecked !== null && (
                        <p className={`mt-1 text-[11px] ${usernameChecked ? 'text-green-500' : 'text-red-500'}`}>
                            {usernameChecked ? t('auth_username_available') : t('auth_username_taken')}
                        </p>
                    )}
                    {usernameError && (
                        <p className="mt-1 text-[11px] text-red-500">
                            {isEnglish ? 'Only lowercase letters, numbers, ., _, - allowed.' : '영문 소문자, 숫자, ., _, - 만 사용 가능합니다.'}
                        </p>
                    )}
                </div>

                {/* Email (register only) */}
                <div className="grid transition-[grid-template-rows] duration-300 ease-in-out" style={{ gridTemplateRows: mode === 'register' ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                        <div className="block pt-0.5">
                            <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                {t('auth_email')}{reqStar}
                            </span>
                            <div className="flex gap-2">
                                <div className="flex flex-1 items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        autoComplete="email"
                                        tabIndex={mode === 'register' ? 0 : -1}
                                        className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void handleSendCode()}
                                    disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || sendingCode || emailVerified}
                                    tabIndex={mode === 'register' ? 0 : -1}
                                    className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 h-10 text-[11px] font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                                >
                                    {sendingCode ? '...' : emailVerified ? t('auth_email_verified') : t('auth_send_code')}
                                </button>
                            </div>
                            {codeSent && (
                                <p className="mt-1 text-[11px] text-green-500">{t('auth_code_sent')}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Email Verification Code (register only, after code sent) */}
                <div className="grid transition-[grid-template-rows] duration-300 ease-in-out" style={{ gridTemplateRows: mode === 'register' && codeSent && !emailVerified ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                        <div className="block pt-0.5">
                            <div className="flex gap-2">
                                <div className="flex flex-1 items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        inputMode="text"
                                        maxLength={8}
                                        value={emailCode}
                                        onChange={(e) => {
                                            const v = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
                                            setEmailCode(v);
                                        }}
                                        placeholder={t('auth_code_placeholder')}
                                        tabIndex={mode === 'register' && codeSent ? 0 : -1}
                                        className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400 tracking-widest"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Birth Year (register only) */}
                <div className="grid transition-[grid-template-rows] duration-300 ease-in-out" style={{ gridTemplateRows: mode === 'register' ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                        <label className="block pt-0.5">
                            <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                {t('auth_birth_year')}
                                <span className="ml-1 font-normal text-gray-400 dark:text-gray-500">
                                    {t('auth_birth_hint')}
                                </span>
                            </span>
                            <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={birthYear}
                                    onChange={(e) => setBirthYear(e.target.value)}
                                    placeholder="1990"
                                    min={1900}
                                    max={new Date().getFullYear()}
                                    tabIndex={mode === 'register' ? 0 : -1}
                                    className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                />
                            </div>
                        </label>
                    </div>
                </div>

                {/* Password */}
                <div className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        {isEnglish ? 'Password' : '비밀번호'}{mode === 'register' && reqStar}
                        {mode === 'register' && (
                            <span className="ml-1 font-normal text-gray-400 dark:text-gray-500">
                                {t('auth_pw_hint')}
                            </span>
                        )}
                    </span>
                    <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                        <LockKeyhole className="mr-2 h-4 w-4 text-gray-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={isEnglish ? 'at least 8 characters' : '8자 이상'}
                            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="ml-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            aria-label={showPassword ? (isEnglish ? 'Hide password' : '비밀번호 숨기기') : (isEnglish ? 'Show password' : '비밀번호 보기')}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {/* Password strength indicators (register only) */}
                    {mode === 'register' && password.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px]">
                            <span className={pwStrength.minLen ? 'text-green-500' : 'text-gray-400'}>{isEnglish ? '8+ chars' : '8자 이상'}</span>
                            <span className={pwStrength.hasLower ? 'text-green-500' : 'text-gray-400'}>{isEnglish ? 'a-z' : '소문자'}</span>
                            <span className={pwStrength.hasUpper ? 'text-green-500' : 'text-gray-400'}>{isEnglish ? 'A-Z' : '대문자'}</span>
                            <span className={pwStrength.hasSpecial ? 'text-green-500' : 'text-gray-400'}>{isEnglish ? 'Special' : '특수문자'}</span>
                        </div>
                    )}
                </div>

                {/* Confirm Password (register only) */}
                <div className="grid transition-[grid-template-rows] duration-300 ease-in-out" style={{ gridTemplateRows: mode === 'register' ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                        <div className="block pt-0.5">
                            <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                                {isEnglish ? 'Confirm Password' : '비밀번호 확인'}{reqStar}
                            </span>
                            <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                                <LockKeyhole className="mr-2 h-4 w-4 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={isEnglish ? 're-enter password' : '비밀번호를 다시 입력'}
                                    autoComplete="new-password"
                                    tabIndex={mode === 'register' ? 0 : -1}
                                    className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    tabIndex={mode === 'register' ? 0 : -1}
                                    className="ml-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                    aria-label={showConfirmPassword ? (isEnglish ? 'Hide password' : '비밀번호 숨기기') : (isEnglish ? 'Show password' : '비밀번호 보기')}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms Agreement (register only) */}
                <div className="grid transition-[grid-template-rows] duration-300 ease-in-out" style={{ gridTemplateRows: mode === 'register' ? '1fr' : '0fr' }}>
                    <div className="overflow-hidden">
                        <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-700 dark:bg-gray-900/60">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreedAll}
                                    onChange={(e) => {
                                        const v = e.target.checked;
                                        setAgreedAll(v);
                                        setAgreedTerms(v);
                                        setAgreedPrivacy(v);
                                    }}
                                    tabIndex={mode === 'register' ? 0 : -1}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
                                />
                                <span className="text-[12px] font-bold text-gray-800 dark:text-gray-200">{t('auth_agree_all')}</span>
                            </label>
                            <div className="ml-1 space-y-1.5 border-t border-gray-200 pt-2 dark:border-gray-700">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreedTerms}
                                        onChange={(e) => {
                                            setAgreedTerms(e.target.checked);
                                            if (!e.target.checked) setAgreedAll(false);
                                            else if (agreedPrivacy) setAgreedAll(true);
                                        }}
                                        tabIndex={mode === 'register' ? 0 : -1}
                                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 accent-blue-600"
                                    />
                                    <span className="text-[11px] text-gray-600 dark:text-gray-400">
                                        {t('auth_agree_terms')} <span className="text-red-500">{t('auth_required')}</span>
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={agreedPrivacy}
                                        onChange={(e) => {
                                            setAgreedPrivacy(e.target.checked);
                                            if (!e.target.checked) setAgreedAll(false);
                                            else if (agreedTerms) setAgreedAll(true);
                                        }}
                                        tabIndex={mode === 'register' ? 0 : -1}
                                        className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 accent-blue-600"
                                    />
                                    <span className="text-[11px] text-gray-600 dark:text-gray-400">
                                        <Link href="/privacy" target="_blank" className="underline hover:text-blue-600">{t('auth_agree_privacy')}</Link>{' '}
                                        <span className="text-red-500">{t('auth_required')}</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting || !canSubmit}
                    className="h-11 w-full rounded-xl bg-[#3182f6] text-sm font-bold text-white transition-colors hover:bg-[#1b64da] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700 dark:disabled:text-gray-500"
                >
                    {submitting ? (isEnglish ? 'Processing...' : '처리 중...') : mode === 'login' ? (isEnglish ? 'Login' : '로그인') : (isEnglish ? 'Create Account' : '회원가입')}
                </button>

                {mode === 'login' && (
                    <div className="text-center pt-1">
                        <Link
                            href="/auth/recover"
                            onClick={() => onClose?.()}
                            className="text-[12px] text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
                        >
                            {t('recover_forgot')}
                        </Link>
                    </div>
                )}
            </form>
        </div>
    );
}
