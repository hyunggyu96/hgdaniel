
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, X, Send, CheckCircle2 } from 'lucide-react';

export default function KeywordSuggestionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('기업');
    const [reason, setReason] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword, category, reason }),
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
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-[#1e1e20] border border-white/10 rounded-2xl shadow-2xl z-[101] overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <MessageSquarePlus className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Keyword 추천/제안</h3>
                                        <p className="text-xs text-white/40 mt-0.5">새로운 수집 대상을 제안해주세요.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5 text-white/40" />
                                </button>
                            </div>

                            {status === 'success' ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4"
                                    >
                                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                                    </motion.div>
                                    <h4 className="text-xl font-bold text-white">감사합니다!</h4>
                                    <p className="text-sm text-white/50 mt-2">제안하신 키워드가 구글 시트에 기록되었습니다.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">키워드 이름</label>
                                        <input
                                            required
                                            type="text"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            placeholder="예: 제테마, HA필러 등"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">카테고리</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['기업', '성분', '기타'].map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setCategory(cat)}
                                                    className={`py-2 rounded-lg text-xs font-bold transition-all ${category === cat
                                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">제안 사유 (선택)</label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="이 키워드를 추천하시는 이유를 적어주세요."
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                                        />
                                    </div>

                                    <button
                                        disabled={status === 'loading'}
                                        type="submit"
                                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-4"
                                    >
                                        {status === 'loading' ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                제안 제출하기
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
