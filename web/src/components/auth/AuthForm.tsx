'use client';

import { useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { useLanguage } from '@/components/LanguageContext';

export type AuthMode = 'login' | 'register';

interface AuthFormProps {
    initialMode?: AuthMode;
    onSuccess?: (mode: AuthMode) => void;
    onModeChange?: (mode: AuthMode) => void;
    className?: string;
}

type ValidateResult =
    | { ok: false; error: string }
    | { ok: true; normalized: string };

function mapAuthError(message: string | undefined, isEnglish: boolean): string {
    const text = (message || '').toLowerCase();

    if (!text) return isEnglish ? 'Something went wrong during authentication.' : '인증 처리 중 문제가 발생했습니다.';
    if (text.includes('invalid credentials')) return isEnglish ? 'Invalid username or password.' : '아이디 또는 비밀번호가 올바르지 않습니다.';
    if (text.includes('username already exists')) return isEnglish ? 'This username is already in use.' : '이미 사용 중인 아이디입니다.';
    if (text.includes('username and password are required')) return isEnglish ? 'Please enter both username and password.' : '아이디와 비밀번호를 입력해주세요.';
    if (text.includes('password must be at least 8')) return isEnglish ? 'Password must be at least 8 characters.' : '비밀번호는 8자 이상이어야 합니다.';
    if (text.includes('username must be 3-32')) return isEnglish ? 'Username format is invalid.' : '아이디 형식이 올바르지 않습니다.';
    if (text.includes('register failed')) return isEnglish ? 'Registration failed. Please try again.' : '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.';
    if (text.includes('login failed')) return isEnglish ? 'Login failed. Please try again.' : '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';

    return message || (isEnglish ? 'Something went wrong during authentication.' : '인증 처리 중 문제가 발생했습니다.');
}

export default function AuthForm({
    initialMode = 'login',
    onSuccess,
    onModeChange,
    className = '',
}: AuthFormProps) {
    const { login, register } = useUser();
    const { language } = useLanguage();
    const isEnglish = language === 'en';

    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    useEffect(() => {
        setError(null);
        setPassword('');
        setConfirmPassword('');
        onModeChange?.(mode);
    }, [mode, onModeChange]);

    const validate = (): ValidateResult => {
        const normalized = username.trim().toLowerCase();

        if (!/^[a-z0-9._-]{3,32}$/.test(normalized)) {
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

        if (mode === 'register' && password !== confirmPassword) {
            return { ok: false, error: isEnglish ? 'Password confirmation does not match.' : '비밀번호 확인이 일치하지 않습니다.' };
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
            const authAction = mode === 'login' ? login : register;
            const result = await authAction(check.normalized, password);

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

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="inline-flex w-full rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        mode === 'login'
                            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    {isEnglish ? 'Login' : '로그인'}
                </button>
                <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        mode === 'register'
                            ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-900'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                >
                    {isEnglish ? 'Register' : '회원가입'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        {isEnglish ? 'Username' : '아이디'}
                    </span>
                    <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
                        <UserRound className="mr-2 h-4 w-4 text-gray-400" />
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={isEnglish ? 'lowercase username' : '영문 소문자 아이디'}
                            autoComplete="username"
                            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                        />
                    </div>
                </label>

                <label className="block">
                    <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                        {isEnglish ? 'Password' : '비밀번호'}
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
                </label>

                {mode === 'register' && (
                    <label className="block">
                        <span className="mb-1.5 block text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                            {isEnglish ? 'Confirm Password' : '비밀번호 확인'}
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
                                aria-label={showConfirmPassword ? (isEnglish ? 'Hide password' : '비밀번호 숨기기') : (isEnglish ? 'Show password' : '비밀번호 보기')}
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </label>
                )}

                {error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-xl bg-[#3182f6] text-sm font-bold text-white transition-colors hover:bg-[#1b64da] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? (isEnglish ? 'Processing...' : '처리 중...') : mode === 'login' ? (isEnglish ? 'Login' : '로그인') : (isEnglish ? 'Create Account' : '회원가입')}
                </button>
            </form>

            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] leading-relaxed text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
                {isEnglish
                    ? 'Username is saved in lowercase. Passwords are stored as secure hashes.'
                    : '아이디는 소문자로 저장됩니다. 비밀번호는 해시 처리되어 저장됩니다.'}
            </div>
        </div>
    );
}
