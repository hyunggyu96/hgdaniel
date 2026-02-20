"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

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
}

interface ChatPanelProps {
    sessionId: string | null;
    hasContext: boolean;
}

export default function ChatPanel({ sessionId, hasContext }: ChatPanelProps) {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !sessionId || isStreaming) return;

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
                                    ? { ...m, content: `Error: ${data.error}` }
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
                    ? { ...m, content: `Error: ${err.message}` }
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
            handleSubmit(e);
        }
    };

    // Render source citations as clickable links
    const renderContent = (content: string, sources?: Message['sources']) => {
        if (!sources || sources.length === 0) return content;

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
                            className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                            title={`${source.title}${source.journal ? ` (${source.journal})` : ''}`}
                            onClick={() => source.link && window.open(source.link, '_blank')}
                        >
                            [{idx}]
                        </span>
                    );
                }
            }
            return part;
        });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <Bot className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                            {t('ask_ai_title') || 'Ask AI'}
                        </h3>
                        <p className="text-sm text-gray-400 max-w-sm">
                            {hasContext
                                ? (t('ask_ai_ready') || 'Context loaded! Ask me anything about your selected papers and files.')
                                : (t('ask_ai_no_context') || 'Add papers or upload files first, then ask your questions.')
                            }
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[80%] ${
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-md px-4 py-2.5'
                            }`}>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.role === 'assistant' && msg.content === '' && isStreaming ? (
                                        <span className="flex items-center gap-1.5 text-gray-400">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            {t('ask_ai_thinking') || 'Thinking...'}
                                        </span>
                                    ) : (
                                        renderContent(msg.content, msg.sources)
                                    )}
                                </div>

                                {/* Source references */}
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                                            References
                                        </p>
                                        <div className="space-y-1">
                                            {msg.sources.map(s => (
                                                <div
                                                    key={s.index}
                                                    className="flex items-start gap-1.5 text-xs"
                                                >
                                                    <span className="text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                                        [{s.index}]
                                                    </span>
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {s.link ? (
                                                            <a
                                                                href={s.link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                                            >
                                                                {s.title}
                                                            </a>
                                                        ) : (
                                                            s.title
                                                        )}
                                                        {s.journal && (
                                                            <span className="text-gray-400"> — {s.journal}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {msg.role === 'user' && (
                                <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                {!hasContext && (
                    <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                            {t('ask_ai_add_context') || 'Add papers or files to enable AI chat'}
                        </span>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={!sessionId || isStreaming}
                        placeholder={t('ask_ai_placeholder') || 'Ask a question about your papers...'}
                        rows={1}
                        className="flex-1 resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 max-h-32"
                        style={{ minHeight: '42px' }}
                        onInput={(e) => {
                            const el = e.target as HTMLTextAreaElement;
                            el.style.height = 'auto';
                            el.style.height = Math.min(el.scrollHeight, 128) + 'px';
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || !sessionId || isStreaming}
                        className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                        {isStreaming ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
