"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, AlertCircle, RefreshCw, Copy, Download, X, FileText, Paperclip, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { toast } from "sonner";

interface Paper {
    id: string;
    title: string;
    journal: string;
}

interface UploadedFile {
    id: string;
    name: string;
    status: 'uploading' | 'done' | 'error';
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: Array<{
        index: number;
        type: string;
        title: string;
        journal?: string;
        link?: string;
    }>;
    isError?: boolean;
}

interface ChatPanelProps {
    sessionId: string | null;
    hasContext: boolean;
    selectedPapers?: Paper[];
    uploadedFiles?: UploadedFile[];
    onRemovePaper?: (id: string) => void;
    onRemoveFile?: (id: string) => void;
}

export default function ChatPanel({
    sessionId,
    hasContext,
    selectedPapers = [],
    uploadedFiles = [],
    onRemovePaper,
    onRemoveFile,
    onEmbed
}: ChatPanelProps & { onEmbed?: () => void }) {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const hasSelectedItems = selectedPapers.length > 0 || uploadedFiles.length > 0;

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isStreaming]);

    const handleSubmit = async () => {
        if (!input.trim() || !sessionId || isStreaming) return;

        // Auto-embed if context is not ready but items are selected
        if (!hasContext && hasSelectedItems && onEmbed) {
            setIsStreaming(true);
            try {
                await onEmbed();
            } catch (error) {
                console.error("Embedding failed:", error);
                toast.error("Failed to analyze papers. Please try again.");
                setIsStreaming(false);
                return;
            }
            // Continue to chat logic...
        }

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input.trim(),
        };

        const assistantMessage: Message = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: '',
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);
        setInput("");
        setIsStreaming(true);

        // Reset height
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.focus({ preventScroll: true });
        }

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));

            const res = await fetch('/api/ask-ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: userMessage.content,
                    history,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Chat request failed');
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error('No stream reader');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    try {
                        const data = JSON.parse(line.slice(6));

                        if (data.error) {
                            setMessages(prev =>
                                prev.map(m => m.id === assistantMessage.id
                                    ? { ...m, content: data.error, isError: true }
                                    : m
                                )
                            );
                            break;
                        }

                        if (data.text) {
                            setMessages(prev =>
                                prev.map(m => m.id === assistantMessage.id
                                    ? { ...m, content: m.content + data.text }
                                    : m
                                )
                            );
                        }

                        if (data.sources) {
                            setMessages(prev =>
                                prev.map(m => m.id === assistantMessage.id
                                    ? { ...m, sources: data.sources }
                                    : m
                                )
                            );
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        } catch (err: any) {
            setMessages(prev =>
                prev.map(m => m.id === assistantMessage.id
                    ? { ...m, content: err.message, isError: true }
                    : m
                )
            );
        } finally {
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
            // Prevent scroll on Enter
            return false;
        }
    };

    const handleCopyChat = () => {
        const text = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n');
        navigator.clipboard.writeText(text);
        toast.success("Chat copied to clipboard");
    };

    const handleExportChat = () => {
        const text = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Chat exported as text file");
    };

    // Render source citations as clickable links
    const renderContent = (content: string, sources?: Message['sources']) => {
        if (!sources || sources.length === 0) return content;

        // Split by source citation pattern [Source N]
        const parts = content.split(/(\[Source \d+\])/g);
        return parts.map((part, i) => {
            const match = part.match(/\[Source (\d+)\]/);
            if (match) {
                const idx = parseInt(match[1]);
                const source = sources.find(s => s.index === idx);
                if (source) {
                    return (
                        <span
                            key={i}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors align-middle"
                            title={`${source.title}${source.journal ? ` (${source.journal})` : ''}`}
                            onClick={() => source.link && window.open(source.link, '_blank')}
                        >
                            {idx}
                        </span>
                    );
                }
            }
            return part;
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950/50">
            {/* Context Header: Selected Items */}
            {(selectedPapers.length > 0 || uploadedFiles.length > 0) && (
                <div className="shrink-0 px-4 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto custom-scrollbar">
                    {selectedPapers.map(paper => (
                        <div key={paper.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-medium border border-blue-100 dark:border-blue-800/50 whitespace-nowrap group shrink-0 max-w-[200px]">
                            <FileText className="w-3 h-3 shrink-0" />
                            <span className="truncate">{paper.title}</span>
                            <button
                                onClick={() => onRemovePaper?.(paper.id)}
                                className="p-0.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {uploadedFiles.map((file) => (
                        <div key={file.id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium border border-purple-100 dark:border-purple-800/50 whitespace-nowrap group shrink-0 max-w-[200px]">
                            <Paperclip className="w-3 h-3 shrink-0" />
                            <span className="truncate">{file.name}</span>
                            <button
                                onClick={() => onRemoveFile?.(file.id)}
                                className="p-0.5 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-400 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-300 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Messages area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-80">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 animate-pulse-slow">
                            <Bot className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                            {t('ask_ai_title') || 'Ask AI Assistant'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
                            {hasContext
                                ? (t('ask_ai_ready') || 'Context loaded! I can answer questions based on your selected papers.')
                                : hasSelectedItems
                                    ? 'Papers selected. Click "Start Analysis" to process them.'
                                    : (t('ask_ai_no_context') || 'Please add papers or upload files on the left to start analyzing.')
                            }
                        </p>


                    </div>
                ) : (
                    <>
                        <div className="flex justify-end gap-2 mb-4 px-2">
                            <button
                                onClick={handleCopyChat}
                                className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors"
                                title="Copy full conversation"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                            </button>
                            <button
                                onClick={handleExportChat}
                                className="text-xs flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors"
                                title="Export as text file"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Export
                            </button>
                        </div>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${msg.isError ? 'bg-red-100 text-red-500 border border-red-200' : 'bg-white dark:bg-slate-800 text-blue-600 border border-slate-100 dark:border-slate-700'}`}>
                                        {msg.isError ? <AlertCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                                    </div>
                                )}

                                <div className={`relative max-w-[85%] lg:max-w-[75%] space-y-2 group`}>
                                    <div className={`px-5 py-3.5 shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                        : msg.isError
                                            ? 'bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200 border border-red-100 dark:border-red-900/30 rounded-2xl rounded-tl-sm'
                                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm'
                                        }`}>
                                        {msg.role === 'assistant' && !msg.content && isStreaming ? (
                                            <div className="flex items-center gap-2 py-1">
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                                <span className="text-slate-400 text-xs font-medium">Analyzing papers...</span>
                                            </div>
                                        ) : (
                                            renderContent(msg.content, msg.sources)
                                        )}
                                    </div>

                                    {/* Source references block */}
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="ml-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700/50">
                                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                                Cited Sources
                                            </p>
                                            <div className="grid gap-1.5">
                                                {msg.sources.map(s => (
                                                    <a
                                                        key={s.index}
                                                        href={s.link || '#'}
                                                        target={s.link ? "_blank" : undefined}
                                                        rel="noopener noreferrer"
                                                        className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors group/link"
                                                    >
                                                        <span className="flex items-center justify-center w-4 h-4 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                                                            {s.index}
                                                        </span>
                                                        <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
                                                            {s.title}
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                                        <User className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className={`relative flex flex-col gap-2 transition-all duration-300 ${!hasContext ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                    {/* Status bar inside input area */}
                    {!hasContext && hasSelectedItems && (
                        <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none z-10 opacity-0"></div>
                    )}

                    {!hasContext && !hasSelectedItems && (
                        <div className="absolute -top-10 left-0 right-0 flex justify-center pointer-events-none">
                            <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 shadow-sm font-medium flex items-center gap-1.5 backdrop-blur-sm">
                                <AlertCircle className="w-3 h-3" />
                                Add papers to start chat
                            </span>
                        </div>
                    )}

                    <div className="relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!sessionId || isStreaming || (!hasContext && !hasSelectedItems)}
                            placeholder={hasContext ? (t('ask_ai_placeholder') || 'Ask a question about the papers...') : hasSelectedItems ? 'Type a question to start analyzing...' : 'Waiting for papers...'}
                            rows={1}
                            className="w-full pl-5 pr-14 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm resize-none disabled:cursor-not-allowed"
                            style={{ minHeight: '52px', maxHeight: '160px' }}
                            onInput={(e) => {
                                const el = e.target as HTMLTextAreaElement;
                                el.style.height = 'auto';
                                el.style.height = Math.min(el.scrollHeight, 160) + 'px';
                            }}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim() || !sessionId || isStreaming || (!hasContext && !hasSelectedItems)}
                            className={`absolute right-2 bottom-2 p-2 rounded-xl flex items-center justify-center transition-all duration-200 ${input.trim() && !isStreaming
                                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {isStreaming ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 ml-0.5" />
                            )}
                        </button>
                    </div>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        AI can make mistakes. Please verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
