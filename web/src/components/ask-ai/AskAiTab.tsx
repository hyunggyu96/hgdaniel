"use client";

import { useState, useCallback, useEffect } from "react";
import { Bot, BookOpen, Upload, ChevronDown, ChevronUp, Loader2, Sparkles, Bookmark } from "lucide-react";
import { useUser } from "@/components/UserContext";
import { useLanguage } from "@/components/LanguageContext";
import PaperSelector from "./PaperSelector";
import FileUploader, { type UploadedFile } from "./FileUploader";
import ChatPanel from "./ChatPanel";
import SourcePanel from "./SourcePanel";
import { toast } from "sonner";

interface Paper {
    id: string;
    title: string;
    abstract: string;
    authors: string[];
    publication_date: string;
    journal: string;
    link: string;
    keywords: string[];
}

interface Source {
    id: string;
    source_type: 'paper' | 'upload';
    paper_id?: string;
    paper_title?: string;
    paper_journal?: string;
    paper_link?: string;
    file_name?: string;
    file_type?: string;
    file_size?: number;
}

export default function AskAiTab() {
    const { t } = useLanguage();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [sources, setSources] = useState<Source[]>([]);
    const [isEmbedding, setIsEmbedding] = useState(false);
    const [contextReady, setContextReady] = useState(false);
    const [showPaperSelector, setShowPaperSelector] = useState(true);
    const [showSavedPapers, setShowSavedPapers] = useState(false);
    const [showFileUploader, setShowFileUploader] = useState(true);
    const [showSources, setShowSources] = useState(false);

    // Saved papers logic
    const { userId } = useUser();
    const [savedPapers, setSavedPapers] = useState<Paper[]>([]);

    useEffect(() => {
        if (!userId) return;
        try {
            const stored = localStorage.getItem(`hg_bookmarks_${userId}`);
            if (stored) {
                setSavedPapers(JSON.parse(stored));
            }
        } catch (e) {
            console.error(e);
        }
    }, [userId, showSavedPapers]); // Refresh when toggling

    const handleAddSavedPaper = (paper: Paper) => {
        if (selectedPapers.find(p => p.id === paper.id)) return;
        setSelectedPapers(prev => [...prev, paper]);
    };

    // Create session on mount
    useEffect(() => {
        const initSession = async () => {
            try {
                const res = await fetch('/api/ask-ai/sessions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });
                const data = await res.json();
                if (data.session_id) setSessionId(data.session_id);
            } catch (err) {
                console.error('Failed to create session:', err);
            }
        };
        initSession();
    }, []);

    // Embed selected papers
    const handleEmbedPapers = useCallback(async () => {
        if (!sessionId || selectedPapers.length === 0) return;
        setIsEmbedding(true);
        try {
            const res = await fetch('/api/ask-ai/embed-papers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    paper_ids: selectedPapers.map(p => p.id),
                }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            // Update sources
            const newSources: Source[] = selectedPapers.map(p => ({
                id: p.id,
                source_type: 'paper' as const,
                paper_id: p.id,
                paper_title: p.title,
                paper_journal: p.journal,
                paper_link: p.link,
            }));
            setSources(prev => [...prev, ...newSources]);
            setContextReady(true);
            setShowPaperSelector(false);
        } catch (err: any) {
            console.error('Failed to embed papers:', err);
            const message = err?.message || 'Failed to process papers. Please try again.';
            toast.error(message);
            throw err;
        } finally {
            setIsEmbedding(false);
        }
    }, [sessionId, selectedPapers]);

    // Track file upload completions
    const handleFilesChange = useCallback((newFiles: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => {
        setUploadedFiles(prev => {
            const updated = typeof newFiles === 'function' ? newFiles(prev) : newFiles;
            // Check for newly completed uploads
            const newlyDone = updated.filter(
                f => f.status === 'done' && f.sourceId && !prev.find(p => p.sourceId === f.sourceId && p.status === 'done')
            );
            if (newlyDone.length > 0) {
                const newSources: Source[] = newlyDone.map(f => ({
                    id: f.sourceId!,
                    source_type: 'upload' as const,
                    file_name: f.name,
                    file_type: f.type,
                    file_size: f.size,
                }));
                setSources(s => [...s, ...newSources]);
                setContextReady(true);
            }
            return updated;
        });
    }, []);

    const hasContext = contextReady && sources.length > 0;

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)] min-h-[800px]">
            {/* Left: Context Builder - Scrollable on desktop */}
            <div className="w-full lg:w-[380px] shrink-0 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 custom-scrollbar">
                {/* Paper Selector */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <button
                        onClick={() => setShowPaperSelector(!showPaperSelector)}
                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {t('ask_ai_select_papers') || 'Select Papers'}
                                </h3>
                                <p className="text-[10px] text-gray-400">
                                    {selectedPapers.length > 0
                                        ? `${selectedPapers.length} selected`
                                        : t('ask_ai_max_papers') || 'Up to 20 papers'
                                    }
                                </p>
                            </div>
                        </div>
                        {showPaperSelector ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {showPaperSelector && (
                        <div className="px-5 pb-4 space-y-3">
                            <PaperSelector
                                selectedPapers={selectedPapers}
                                onPapersSelected={setSelectedPapers}
                                disabled={isEmbedding}
                            />
                            {selectedPapers.length > 0 && (
                                <button
                                    onClick={() => {
                                        void handleEmbedPapers().catch(() => { });
                                    }}
                                    disabled={isEmbedding}
                                    className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isEmbedding ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {t('ask_ai_processing') || 'Processing...'}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            {t('ask_ai_add_papers') || `Add ${selectedPapers.length} Papers to Context`}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Saved Papers (My Library) */}
                {userId && (
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <button
                            onClick={() => setShowSavedPapers(!showSavedPapers)}
                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Bookmark className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {'Saved Papers'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">
                                        {savedPapers.length > 0 ? `${savedPapers.length} saved items` : 'No saved papers yet'}
                                    </p>
                                </div>
                            </div>
                            {showSavedPapers ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                        </button>

                        {showSavedPapers && (
                            <div className="px-5 pb-4 space-y-3">
                                {savedPapers.length === 0 ? (
                                    <div className="text-center py-4 text-xs text-gray-400">
                                        You haven't saved any papers yet.
                                        <br />
                                        Go to <b>Paper Search</b> and click the bookmark icon.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                        {savedPapers.map(paper => {
                                            const isSelected = selectedPapers.some(p => p.id === paper.id);
                                            return (
                                                <div key={paper.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:border-blue-200 transition-colors">
                                                    <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2 mb-1">
                                                        {paper.title}
                                                    </h4>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                                                            {paper.journal}
                                                        </span>
                                                        <button
                                                            onClick={() => handleAddSavedPaper(paper)}
                                                            disabled={isSelected || isEmbedding}
                                                            className={`text-[10px] px-2 py-1 rounded font-semibold transition-colors ${isSelected
                                                                ? 'bg-green-100 text-green-700 cursor-default'
                                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                                                }`}
                                                        >
                                                            {isSelected ? 'Added' : 'Add to Context'}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* File Uploader */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <button
                        onClick={() => setShowFileUploader(!showFileUploader)}
                        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {t('ask_ai_upload_files') || 'Upload Files'}
                                </h3>
                                <p className="text-[10px] text-gray-400">
                                    {uploadedFiles.filter(f => f.status === 'done').length > 0
                                        ? `${uploadedFiles.filter(f => f.status === 'done').length} files uploaded`
                                        : 'PDF, TXT, DOCX'
                                    }
                                </p>
                            </div>
                        </div>
                        {showFileUploader ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {showFileUploader && (
                        <div className="px-5 pb-4">
                            <FileUploader
                                sessionId={sessionId}
                                files={uploadedFiles}
                                onFilesChange={handleFilesChange}
                                disabled={!sessionId}
                            />
                        </div>
                    )}
                </div>

                {/* Sources */}
                {sources.length > 0 && (
                    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <button
                            onClick={() => setShowSources(!showSources)}
                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                        {t('ask_ai_sources') || 'Context Sources'}
                                    </h3>
                                    <p className="text-[10px] text-gray-400">
                                        {sources.length} sources loaded
                                    </p>
                                </div>
                            </div>
                            {showSources ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                        </button>

                        {showSources && (
                            <div className="px-5 pb-4">
                                <SourcePanel sources={sources} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right: Chat Panel - Fixed height */}
            <div className="flex-1 w-full lg:min-w-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col">
                <ChatPanel
                    sessionId={sessionId}
                    hasContext={hasContext}
                    selectedPapers={selectedPapers}
                    uploadedFiles={uploadedFiles}
                    onRemovePaper={(id) => setSelectedPapers(prev => prev.filter(p => p.id !== id))}
                    onRemoveFile={(id) => setUploadedFiles(prev => prev.filter(f => f.id !== id))}
                    onEmbed={handleEmbedPapers}
                />
            </div>
        </div>
    );
}
