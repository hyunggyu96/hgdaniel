'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { useTier } from '@/hooks/useTier';
import { useLanguage } from './LanguageContext';
import { User, LogIn, LogOut, Settings, AlertTriangle } from 'lucide-react';
import AuthModal from './auth/AuthModal';

export default function LoginButton() {
    const { userId, logout, deleteAccount, isLoading } = useUser();
    const { tier } = useTier();
    const { language } = useLanguage();
    const isKo = language === 'ko';
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMenu]);

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
        setShowDeleteConfirm(false);
        setDeletePassword('');
    };

    if (isLoading) {
        return (
            <div className="h-8 w-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        );
    }

    if (userId) {
        return (
            <>
                <div className="relative flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 h-8 rounded-lg" ref={menuRef}>
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-blue-500" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">{userId}</span>
                    {tier !== 'free' && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            tier === 'enterprise'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                            {tier === 'enterprise' ? 'ENT' : 'PRO'}
                        </span>
                    )}
                    <button
                        onClick={() => setShowMenu((v) => !v)}
                        aria-label="Settings"
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <Settings className="w-3 h-3 text-gray-400" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
                            <button
                                onClick={() => { setShowMenu(false); void logout(); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <LogOut className="w-3.5 h-3.5 text-gray-400" />
                                {isKo ? '로그아웃' : 'Logout'}
                            </button>
                            <button
                                onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); setDeletePassword(''); setDeleteError(''); }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {isKo ? '회원탈퇴' : 'Delete Account'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Delete Account Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setShowDeleteConfirm(false)}>
                        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
                            <div className="mb-4 flex items-center gap-2 text-red-500">
                                <AlertTriangle className="h-5 w-5" />
                                <h3 className="text-base font-bold">{isKo ? '회원탈퇴' : 'Delete Account'}</h3>
                            </div>
                            <p className="mb-4 text-[13px] text-gray-600 dark:text-gray-400">
                                {isKo
                                    ? '계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다. 본인 확인을 위해 비밀번호를 입력해주세요.'
                                    : 'Deleting your account will permanently remove all your data and cannot be undone. Enter your password to confirm.'}
                            </p>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder={isKo ? '비밀번호 입력' : 'Enter password'}
                                autoComplete="current-password"
                                className="mb-3 h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-red-300 dark:border-gray-700 dark:bg-gray-800"
                                onKeyDown={(e) => { if (e.key === 'Enter') void handleDeleteAccount(); }}
                            />
                            {deleteError && (
                                <p className="mb-3 text-xs text-red-500">{deleteError}</p>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                >
                                    {isKo ? '취소' : 'Cancel'}
                                </button>
                                <button
                                    onClick={() => void handleDeleteAccount()}
                                    disabled={deleting}
                                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60"
                                >
                                    {deleting ? (isKo ? '처리 중...' : 'Deleting...') : (isKo ? '탈퇴하기' : 'Delete')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 bg-[#3182f6] hover:bg-[#1b64da] px-3 sm:px-4 h-8 rounded-lg text-white text-[11px] font-bold transition-all shadow-sm active:scale-95 group uppercase tracking-wider shrink-0"
            >
                <LogIn className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Login</span>
            </button>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode="login"
            />
        </>
    );
}
