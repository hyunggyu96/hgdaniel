"use client";

import { useState, useCallback, useEffect } from "react";
import { Bot, BookOpen, Upload, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import PaperSelector from "./PaperSelector";
import FileUploader, { type UploadedFile } from "./FileUploader";
import ChatPanel from "./ChatPanel";
import SourcePanel from "./SourcePanel";

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
    const [showFileUploader, setShowFileUploader] = useState(true);
    const [showSources, setShowSources] = useState(false);

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
        <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left: Context Builder */}
            <div className="w-full lg:w-[380px] shrink-0 space-y-4">
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
                                    onClick={handleEmbedPapers}
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

            {/* Right: Chat Panel */}
            <div className="flex-1 min-w-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden" style={{ minHeight: '600px' }}>
                <ChatPanel sessionId={sessionId} hasContext={hasContext} />
            </div>
        </div>
    );
}
