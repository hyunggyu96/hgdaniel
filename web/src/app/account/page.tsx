'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Eye, EyeOff, Send } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { useLanguage } from '@/components/LanguageContext';
import { useTier } from '@/hooks/useTier';

export default function AccountPage() {
    const router = useRouter();
    const { userId, deleteAccount, isLoading } = useUser();
    const { language } = useLanguage();
    const { tier } = useTier();
    const isKo = language === 'ko';

    // Password change state
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);

    // Email change state
    const [newEmail, setNewEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [emailPw, setEmailPw] = useState('');
    const [emailError, setEmailError] = useState('');
    const [emailSuccess, setEmailSuccess] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [codeSending, setCodeSending] = useState(false);

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const handleChangePassword = async () => {
        setPwError('');
        setPwSuccess('');

        if (!currentPw) {
            setPwError(isKo ? '현재 비밀번호를 입력해주세요.' : 'Please enter your current password.');
            return;
        }
        if (newPw !== confirmPw) {
            setPwError(isKo ? '새 비밀번호가 일치하지 않습니다.' : 'New passwords do not match.');
            return;
        }
        if (newPw.length < 8) {
            setPwError(isKo ? '비밀번호는 8자 이상이어야 합니다.' : 'Password must be at least 8 characters.');
            return;
        }

        setPwLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                const err = (json.error || '').toLowerCase();
                if (err.includes('invalid password')) {
                    setPwError(isKo ? '현재 비밀번호가 올바르지 않습니다.' : 'Current password is incorrect.');
                } else {
                    setPwError(json.error || (isKo ? '비밀번호 변경에 실패했습니다.' : 'Failed to change password.'));
                }
                return;
            }
            setPwSuccess(isKo ? '비밀번호가 변경되었습니다.' : 'Password changed successfully.');
            setCurrentPw('');
            setNewPw('');
            setConfirmPw('');
        } catch {
            setPwError(isKo ? '네트워크 오류가 발생했습니다.' : 'Network error occurred.');
        } finally {
            setPwLoading(false);
        }
    };

    const handleSendEmailCode = async () => {
        setEmailError('');
        if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            setEmailError(isKo ? '유효한 이메일을 입력해주세요.' : 'Please enter a valid email.');
            return;
        }
        setCodeSending(true);
        try {
            const res = await fetch('/api/auth/send-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                setEmailError(json.error || (isKo ? '인증 코드 전송 실패.' : 'Failed to send code.'));
                return;
            }
            setCodeSent(true);
        } catch {
            setEmailError(isKo ? '네트워크 오류가 발생했습니다.' : 'Network error occurred.');
        } finally {
            setCodeSending(false);
        }
    };

    const handleChangeEmail = async () => {
        setEmailError('');
        setEmailSuccess('');

        if (!emailPw) {
            setEmailError(isKo ? '비밀번호를 입력해주세요.' : 'Please enter your password.');
            return;
        }
        if (!emailCode) {
            setEmailError(isKo ? '인증 코드를 입력해주세요.' : 'Please enter the verification code.');
            return;
        }

        setEmailLoading(true);
        try {
            const res = await fetch('/api/auth/change-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: emailPw, newEmail, emailCode }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                const err = (json.error || '').toLowerCase();
                if (err.includes('invalid password')) {
                    setEmailError(isKo ? '비밀번호가 올바르지 않습니다.' : 'Invalid password.');
                } else if (err.includes('already in use')) {
                    setEmailError(isKo ? '이미 사용 중인 이메일입니다.' : 'Email already in use.');
                } else if (err.includes('expired') || err.includes('invalid')) {
                    setEmailError(isKo ? '인증 코드가 올바르지 않거나 만료되었습니다.' : 'Invalid or expired verification code.');
                } else {
                    setEmailError(json.error || (isKo ? '이메일 변경에 실패했습니다.' : 'Failed to change email.'));
                }
                return;
            }
            setEmailSuccess(isKo ? '이메일이 변경되었습니다.' : 'Email changed successfully.');
            setNewEmail('');
            setEmailCode('');
            setEmailPw('');
            setCodeSent(false);
        } catch {
            setEmailError(isKo ? '네트워크 오류가 발생했습니다.' : 'Network error occurred.');
        } finally {
            setEmailLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError(isKo ? '비밀번호를 입력해주세요.' : 'Please enter your password.');
            return;
        }
        setDeleting(true);
        setDeleteError('');
        const result = await deleteAccount(deletePassword);
        setDeleting(false);
        if (!result.ok) {
            const err = (result.error || '').toLowerCase();
            if (err.includes('invalid password')) {
                setDeleteError(isKo ? '비밀번호가 올바르지 않습니다.' : 'Invalid password.');
            } else {
                setDeleteError(isKo ? '계정 삭제에 실패했습니다.' : 'Failed to delete account.');
            }
            return;
        }
        router.push('/');
    };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-4">
                <div className="max-w-md mx-auto animate-pulse space-y-4">
                    <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-800" />
                    <div className="h-32 rounded-xl bg-gray-200 dark:bg-gray-800" />
                </div>
            </main>
        );
    }

    if (!userId) {
        router.push('/auth');
        return null;
    }

    const tierLabel = tier === 'enterprise' ? 'Enterprise' : tier === 'pro' ? 'Pro' : 'Free';

    const inputCls = "h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
    const labelCls = "text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider";
    const sectionCls = "rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900";

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 md:px-8 transition-colors duration-300">
            <div className="max-w-md mx-auto space-y-6">
                <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                    {isKo ? '내 계정' : 'My Account'}
                </h1>

                {/* Account Info */}
                <div className={sectionCls}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{userId}</p>
                            <p className="text-[11px] text-gray-400">{tierLabel}</p>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className={sectionCls}>
                    <div className="flex items-center gap-2 mb-4">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {isKo ? '비밀번호 변경' : 'Change Password'}
                        </h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className={labelCls}>{isKo ? '현재 비밀번호' : 'Current Password'}</label>
                            <div className="relative mt-1">
                                <input
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={currentPw}
                                    onChange={(e) => setCurrentPw(e.target.value)}
                                    autoComplete="current-password"
                                    className={inputCls}
                                />
                                <button type="button" onClick={() => setShowCurrentPw((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>{isKo ? '새 비밀번호' : 'New Password'}</label>
                            <div className="relative mt-1">
                                <input
                                    type={showNewPw ? 'text' : 'password'}
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                    autoComplete="new-password"
                                    className={inputCls}
                                />
                                <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>{isKo ? '새 비밀번호 확인' : 'Confirm New Password'}</label>
                            <input
                                type="password"
                                value={confirmPw}
                                onChange={(e) => setConfirmPw(e.target.value)}
                                autoComplete="new-password"
                                className={`${inputCls} mt-1`}
                            />
                        </div>
                        {pwError && <p className="text-[11px] text-red-500">{pwError}</p>}
                        {pwSuccess && <p className="text-[11px] text-green-600">{pwSuccess}</p>}
                        <button
                            onClick={() => void handleChangePassword()}
                            disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                            className="w-full h-9 rounded-lg bg-[#3182f6] text-white text-[12px] font-bold hover:bg-[#1b64da] disabled:opacity-50 transition-colors"
                        >
                            {pwLoading ? (isKo ? '변경 중...' : 'Changing...') : (isKo ? '비밀번호 변경' : 'Change Password')}
                        </button>
                    </div>
                </div>

                {/* Email Change */}
                <div className={sectionCls}>
                    <div className="flex items-center gap-2 mb-4">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {isKo ? '이메일 변경' : 'Change Email'}
                        </h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className={labelCls}>{isKo ? '새 이메일' : 'New Email'}</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => { setNewEmail(e.target.value); setCodeSent(false); }}
                                    placeholder="example@email.com"
                                    className={`${inputCls} flex-1`}
                                />
                                <button
                                    onClick={() => void handleSendEmailCode()}
                                    disabled={codeSending || !newEmail}
                                    className="shrink-0 px-3 h-9 rounded-lg border border-blue-500 text-blue-500 text-[11px] font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 transition-colors flex items-center gap-1"
                                >
                                    <Send className="w-3 h-3" />
                                    {codeSending ? '...' : codeSent ? (isKo ? '재전송' : 'Resend') : (isKo ? '코드 전송' : 'Send Code')}
                                </button>
                            </div>
                        </div>
                        {codeSent && (
                            <>
                                <div>
                                    <label className={labelCls}>{isKo ? '인증 코드' : 'Verification Code'}</label>
                                    <input
                                        type="text"
                                        value={emailCode}
                                        onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        className={`${inputCls} mt-1 tracking-widest`}
                                    />
                                </div>
                                <div>
                                    <label className={labelCls}>{isKo ? '현재 비밀번호' : 'Current Password'}</label>
                                    <input
                                        type="password"
                                        value={emailPw}
                                        onChange={(e) => setEmailPw(e.target.value)}
                                        autoComplete="current-password"
                                        className={`${inputCls} mt-1`}
                                    />
                                </div>
                                {emailError && <p className="text-[11px] text-red-500">{emailError}</p>}
                                {emailSuccess && <p className="text-[11px] text-green-600">{emailSuccess}</p>}
                                <button
                                    onClick={() => void handleChangeEmail()}
                                    disabled={emailLoading || !emailCode || !emailPw}
                                    className="w-full h-9 rounded-lg bg-[#3182f6] text-white text-[12px] font-bold hover:bg-[#1b64da] disabled:opacity-50 transition-colors"
                                >
                                    {emailLoading ? (isKo ? '변경 중...' : 'Changing...') : (isKo ? '이메일 변경' : 'Change Email')}
                                </button>
                            </>
                        )}
                        {emailError && !codeSent && <p className="text-[11px] text-red-500">{emailError}</p>}
                    </div>
                </div>

                {/* Spacer to push delete to bottom */}
                <div className="mt-20" />

                {/* Delete Account — small, at the bottom */}
                {!showDeleteConfirm ? (
                    <button
                        onClick={() => { setShowDeleteConfirm(true); setDeletePassword(''); setDeleteError(''); }}
                        className="text-[11px] text-red-400 hover:text-red-500 transition-colors"
                    >
                        {isKo ? '회원탈퇴' : 'Delete Account'}
                    </button>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                        <p className="mb-3 text-[12px] text-gray-500 dark:text-gray-400">
                            {isKo
                                ? '계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다. 본인 확인을 위해 비밀번호를 입력해주세요.'
                                : 'Deleting your account will permanently remove all data and cannot be undone. Enter your password to confirm.'}
                        </p>
                        <input
                            type="password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            placeholder={isKo ? '비밀번호 입력' : 'Enter password'}
                            autoComplete="current-password"
                            className="mb-2 h-9 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-red-300 dark:border-gray-700 dark:bg-gray-800"
                            onKeyDown={(e) => { if (e.key === 'Enter') void handleDeleteAccount(); }}
                        />
                        {deleteError && (
                            <p className="mb-2 text-[11px] text-red-500">{deleteError}</p>
                        )}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 rounded-lg border border-gray-200 py-2 text-[12px] font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                                {isKo ? '취소' : 'Cancel'}
                            </button>
                            <button
                                onClick={() => void handleDeleteAccount()}
                                disabled={deleting}
                                className="flex-1 rounded-lg bg-red-500 py-2 text-[12px] font-bold text-white hover:bg-red-600 disabled:opacity-60"
                            >
                                {deleting ? (isKo ? '처리 중...' : 'Deleting...') : (isKo ? '탈퇴하기' : 'Delete')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
