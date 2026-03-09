'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { useUser } from '@/components/UserContext';
import { useLanguage } from '@/components/LanguageContext';
import { useTier } from '@/hooks/useTier';

export default function AccountPage() {
    const router = useRouter();
    const { userId, deleteAccount, isLoading } = useUser();
    const { language } = useLanguage();
    const { tier } = useTier();
    const isKo = language === 'ko';

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

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

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 md:px-8 transition-colors duration-300">
            <div className="max-w-md mx-auto">
                <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-100 mb-6">
                    {isKo ? '내 계정' : 'My Account'}
                </h1>

                {/* Account Info */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 space-y-4">
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

                {/* Spacer to push delete to bottom */}
                <div className="mt-40" />

                {/* Delete Account — small, at the bottom */}
                {!showDeleteConfirm ? (
                    <button
                        onClick={() => { setShowDeleteConfirm(true); setDeletePassword(''); setDeleteError(''); }}
                        className="text-[11px] text-gray-400 hover:text-red-400 transition-colors"
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
