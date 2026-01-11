'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, X, Send, CheckCircle2, LogIn } from 'lucide-react';
import { useState } from 'react';
import { useUser } from './UserContext';

export default function KeywordSuggestionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { userId } = useUser();
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('기업');
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, category, reason, userId }),
            });

            if (res.ok) {
                setStatus('success');
                setTimeout(() => {
                    onClose();
                    setKeyword('');
                    setReason('');
                    setStatus('idle');
                }, 2000);
            } else {
                const data = await res.json();
                setErrorMessage(data.error || '제안 제출에 실패했습니다.');
                setStatus('error');
            }
        } catch (err: any) {
            setErrorMessage(err.message || '네트워크 오류가 발생했습니다.');
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] pointer-events-auto"
                    >
                        {/* Header: Fixed */}
                        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <MessageSquarePlus className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-foreground leading-none">Keyword 추천/제안</h3>
                                    <p className="text-[9px] text-muted-foreground mt-1 leading-none">새로운 대상을 제안해 주세요.</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-foreground"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Body: Scrollable */}
                        <div className="overflow-y-auto px-5 py-5 custom-scrollbar bg-gray-50">
                            {!userId ? (
                                <div className="py-10 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                                        <LogIn className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-foreground">로그인이 필요합니다</h4>
                                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed px-4">키워드 제안은 로그인 후 이용 가능합니다.<br />상단의 로그인 버튼을 눌러주세요.</p>
                                    <button
                                        onClick={onClose}
                                        className="mt-6 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-600 transition-colors"
                                    >
                                        확인
                                    </button>
                                </div>
                            ) : status === 'success' ? (
                                <div className="py-10 flex flex-col items-center justify-center text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                                    >
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    </motion.div>
                                    <h4 className="text-lg font-bold text-foreground">제안 완료!</h4>
                                </div>
                            ) : status === 'error' ? (
                                <div className="py-10 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                        <X className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-foreground">제출 실패</h4>
                                    <p className="text-xs text-red-400/70 mt-1.5 leading-relaxed px-4">{errorMessage}</p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="mt-6 text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors"
                                    >
                                        다시 시도하기
                                    </button>
                                </div>
                            ) : (
                                <form id="suggest-form" onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1.5 ml-1">키워드 이름</label>
                                        <input
                                            required
                                            type="text"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            placeholder="예: 제테마, 쥬베룩 등"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1.5 ml-1">카테고리</label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            {['기업', '성분', '기타'].map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setCategory(cat)}
                                                    className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${category === cat
                                                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                                                        : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-[0.1em] mb-1.5 ml-1">제안 사유 (선택)</label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="메모를 입력해 주세요."
                                            rows={2}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                                        />
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Footer: Fixed */}
                        {userId && status !== 'success' && (
                            <div className="px-5 py-4 border-t border-gray-100 bg-white shrink-0">
                                <button
                                    form="suggest-form"
                                    disabled={status === 'loading'}
                                    type="submit"
                                    className="w-full bg-[#3182f6] hover:bg-[#1b64da] disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    {status === 'loading' ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            제안 제출하기
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
