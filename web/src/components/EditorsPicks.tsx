'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Plus, Trash2, ChevronUp, ChevronDown, Check, Search, Pencil } from 'lucide-react';
import { useEditorsPicks, type EditorsPickSection } from '@/hooks/useEditorsPicks';
import { useUser } from './UserContext';
import { useLanguage } from './LanguageContext';
import { fmtDateKST } from '@/lib/utils';

interface EditorsPicksProps {
    allNews: any[];
}

// =============================================
// PUBLIC DISPLAY
// =============================================

export default function EditorsPicks({ allNews }: EditorsPicksProps) {
    const { sections, isLoading, mutate } = useEditorsPicks();
    const { isAdmin } = useUser();
    const { t } = useLanguage();
    const [showAdmin, setShowAdmin] = useState(false);

    // Don't render if no sections with items
    const sectionsWithItems = sections.filter(s => s.items.length > 0);
    if (isLoading || (sectionsWithItems.length === 0 && !isAdmin)) return null;

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

    return (
        <div className="mx-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">
                        {t('editors_picks_curated')}
                    </span>
                    <span className="text-[9px] text-muted-foreground/50">
                        {new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul', month: 'long', day: 'numeric' })}
                    </span>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowAdmin(true)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-foreground"
                        title={t('editors_picks_settings')}
                    >
                        <Settings className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Sections Table */}
            {sectionsWithItems.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {sectionsWithItems.map((section, idx) => (
                        <div key={section.id}>
                            {/* Section Header */}
                            <div
                                className="px-4 py-1.5 text-center"
                                style={{ backgroundColor: section.color }}
                            >
                                <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">
                                    {section.name}
                                </span>
                            </div>
                            {/* Items */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {section.items.map((item) => {
                                    if (!item.article) return null;
                                    const pubDateObj = item.article.published_at ? new Date(item.article.published_at) : null;
                                    const { dateStr } = fmtDateKST(pubDateObj);
                                    const pubDate = item.article.published_at?.slice(0, 10) || '';
                                    const isToday = pubDate === today;

                                    return (
                                        <div key={item.id} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <a
                                                            href={item.article.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-bold text-foreground hover:text-blue-500 transition-colors line-clamp-1"
                                                        >
                                                            {item.article.title}
                                                        </a>
                                                        {isToday && (
                                                            <span className="text-[7px] font-black text-white bg-red-500 px-1 py-0.5 rounded leading-none shrink-0">NEW</span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed">
                                                        {item.article.description}
                                                    </p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <span className={`text-[9px] font-mono font-bold ${isToday ? 'text-red-500' : 'text-gray-400'}`}>
                                                        {dateStr}
                                                    </span>
                                                    <div className="text-[8px] text-muted-foreground/50">
                                                        {item.article.source}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Divider between sections (but not after last) */}
                            {idx < sectionsWithItems.length - 1 && (
                                <div className="h-px bg-gray-200 dark:bg-gray-700" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state for admin */}
            {sectionsWithItems.length === 0 && isAdmin && (
                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                    <p className="text-xs text-muted-foreground">{t('editors_picks_no_sections')}</p>
                    <button
                        onClick={() => setShowAdmin(true)}
                        className="mt-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                        {t('editors_picks_settings')}
                    </button>
                </div>
            )}

            {/* Admin Modal */}
            <AnimatePresence>
                {showAdmin && (
                    <AdminModal
                        onClose={() => setShowAdmin(false)}
                        sections={sections}
                        allNews={allNews}
                        mutate={mutate}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// =============================================
// ADMIN MODAL
// =============================================

function AdminModal({
    onClose,
    sections,
    allNews,
    mutate,
}: {
    onClose: () => void;
    sections: EditorsPickSection[];
    allNews: any[];
    mutate: () => void;
}) {
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState<number | null>(sections[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingName, setEditingName] = useState<number | null>(null);
    const [editNameValue, setEditNameValue] = useState('');

    const currentSection = sections.find(s => s.id === activeSection);
    const currentLinks = new Set(currentSection?.items.map(i => i.article_link) || []);

    const filteredNews = useMemo(() => {
        if (!searchQuery.trim()) return allNews.slice(0, 50);
        const q = searchQuery.toLowerCase().trim();
        return allNews.filter(a =>
            a.title?.toLowerCase().includes(q) ||
            a.description?.toLowerCase().includes(q) ||
            a.source?.toLowerCase().includes(q)
        ).slice(0, 50);
    }, [allNews, searchQuery]);

    const apiCall = async (url: string, method: string, body?: any) => {
        setLoading(true);
        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Operation failed');
                return null;
            }
            const data = await res.json();
            mutate();
            return data;
        } catch {
            alert('Network error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const addSection = async () => {
        const name = prompt(t('editors_picks_section_name'));
        if (!name?.trim()) return;
        const data = await apiCall('/api/editors-picks', 'POST', { name: name.trim() });
        if (data?.section) setActiveSection(data.section.id);
    };

    const deleteSection = async (id: number) => {
        if (!confirm('Delete this section?')) return;
        await apiCall(`/api/editors-picks/sections/${id}`, 'DELETE');
        if (activeSection === id) {
            setActiveSection(sections.find(s => s.id !== id)?.id || null);
        }
    };

    const renameSection = async (id: number) => {
        if (!editNameValue.trim()) return;
        await apiCall(`/api/editors-picks/sections/${id}`, 'PUT', { name: editNameValue.trim() });
        setEditingName(null);
    };

    const addArticle = async (articleLink: string) => {
        if (!activeSection) return;
        await apiCall(`/api/editors-picks/sections/${activeSection}/items`, 'POST', { article_link: articleLink });
    };

    const removeArticle = async (articleLink: string) => {
        if (!activeSection) return;
        await apiCall(`/api/editors-picks/sections/${activeSection}/items`, 'DELETE', { article_link: articleLink });
    };

    const moveItem = async (articleLink: string, direction: 'up' | 'down') => {
        if (!currentSection) return;
        const items = [...currentSection.items].sort((a, b) => a.display_order - b.display_order);
        const idx = items.findIndex(i => i.article_link === articleLink);
        if (idx < 0) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= items.length) return;

        const newItems = items.map((item, i) => ({
            article_link: item.article_link,
            display_order: i === idx ? items[swapIdx].display_order : i === swapIdx ? items[idx].display_order : item.display_order,
        }));

        await apiCall(`/api/editors-picks/sections/${currentSection.id}/items`, 'PUT', { items: newItems });
    };

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="fixed inset-4 z-[101] flex items-center justify-center pointer-events-none"
            >
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden pointer-events-auto">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
                        <h3 className="text-sm font-bold text-foreground">{t('editors_picks_settings')}</h3>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Section Tabs */}
                        <div className="px-5 pt-4 pb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                {sections.map(sec => (
                                    <button
                                        key={sec.id}
                                        onClick={() => setActiveSection(sec.id)}
                                        className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                                            activeSection === sec.id
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                                                : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: sec.color }}
                                        />
                                        {editingName === sec.id ? (
                                            <input
                                                autoFocus
                                                value={editNameValue}
                                                onChange={e => setEditNameValue(e.target.value)}
                                                onBlur={() => renameSection(sec.id)}
                                                onKeyDown={e => e.key === 'Enter' && renameSection(sec.id)}
                                                className="bg-transparent border-none outline-none w-20 text-[11px]"
                                            />
                                        ) : (
                                            <span
                                                onDoubleClick={() => { setEditingName(sec.id); setEditNameValue(sec.name); }}
                                            >
                                                {sec.name}
                                            </span>
                                        )}
                                        {activeSection === sec.id && (
                                            <div className="flex items-center gap-0.5 ml-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingName(sec.id); setEditNameValue(sec.name); }}
                                                    className="p-0.5 hover:text-blue-500 transition-colors"
                                                    title="Rename"
                                                >
                                                    <Pencil className="w-2.5 h-2.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }}
                                                    className="p-0.5 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        )}
                                    </button>
                                ))}
                                {sections.length < 3 && (
                                    <button
                                        onClick={addSection}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:text-blue-500 transition-all"
                                    >
                                        <Plus className="w-3 h-3" />
                                        {t('editors_picks_add_section')}
                                    </button>
                                )}
                            </div>
                            {sections.length >= 3 && (
                                <p className="text-[9px] text-muted-foreground mt-1 ml-1">{t('editors_picks_max_sections')}</p>
                            )}
                        </div>

                        {/* Current Section Items */}
                        {currentSection && (
                            <div className="px-5 py-3">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    {currentSection.name} ({currentSection.items.length}/5)
                                </p>
                                <div className="space-y-1">
                                    {[...currentSection.items]
                                        .sort((a, b) => a.display_order - b.display_order)
                                        .map((item, idx) => (
                                            <div key={item.id} className="flex items-center gap-2 py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span className="text-[10px] text-muted-foreground font-mono w-4">{idx + 1}</span>
                                                <span className="text-xs text-foreground flex-1 line-clamp-1">
                                                    {item.article?.title || item.article_link}
                                                </span>
                                                <div className="flex items-center gap-0.5 shrink-0">
                                                    <button
                                                        onClick={() => moveItem(item.article_link, 'up')}
                                                        disabled={idx === 0 || loading}
                                                        className="p-0.5 text-gray-400 hover:text-foreground disabled:opacity-30 transition-colors"
                                                    >
                                                        <ChevronUp className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => moveItem(item.article_link, 'down')}
                                                        disabled={idx === currentSection.items.length - 1 || loading}
                                                        className="p-0.5 text-gray-400 hover:text-foreground disabled:opacity-30 transition-colors"
                                                    >
                                                        <ChevronDown className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => removeArticle(item.article_link)}
                                                        disabled={loading}
                                                        className="p-0.5 text-gray-400 hover:text-red-500 transition-colors ml-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* News List for Adding */}
                        {currentSection && currentSection.items.length < 5 && (
                            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                    {t('editors_picks_add_articles')}
                                </p>
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder={t('editors_picks_search_articles')}
                                        className="w-full pl-8 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
                                    {filteredNews.map(article => {
                                        const isAdded = currentLinks.has(article.link);
                                        return (
                                            <div
                                                key={article.link}
                                                className={`flex items-center gap-2 py-1.5 px-3 rounded-lg transition-colors ${
                                                    isAdded
                                                        ? 'bg-blue-50 dark:bg-blue-900/20'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }`}
                                            >
                                                <button
                                                    onClick={() => isAdded ? removeArticle(article.link) : addArticle(article.link)}
                                                    disabled={loading || (!isAdded && currentSection.items.length >= 5)}
                                                    className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                                        isAdded
                                                            ? 'bg-blue-500 border-blue-500 text-white'
                                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                                                    }`}
                                                >
                                                    {isAdded && <Check className="w-3 h-3" />}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-medium text-foreground line-clamp-1">{article.title}</p>
                                                    <p className="text-[9px] text-muted-foreground">
                                                        {article.source} · {article.published_at?.slice(0, 10)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-[#3182f6] hover:bg-[#1b64da] text-white text-xs font-bold rounded-lg transition-colors"
                        >
                            {t('confirm') || '확인'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
