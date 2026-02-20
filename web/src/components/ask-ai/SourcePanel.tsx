"use client";

import { BookOpen, FileText, ExternalLink, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

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

interface SourcePanelProps {
    sources: Source[];
    onRemoveSource?: (sourceId: string) => void;
}

export default function SourcePanel({ sources, onRemoveSource }: SourcePanelProps) {
    const { t } = useLanguage();

    const papers = sources.filter(s => s.source_type === 'paper');
    const uploads = sources.filter(s => s.source_type === 'upload');

    if (sources.length === 0) {
        return (
            <div className="text-center py-6 text-sm text-gray-400">
                {t('ask_ai_no_sources') || 'No sources added yet'}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Papers */}
            {papers.length > 0 && (
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        {t('ask_ai_papers') || 'Papers'} ({papers.length})
                    </h4>
                    <div className="space-y-1.5">
                        {papers.map((s, i) => (
                            <div
                                key={s.id}
                                className="group flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug">
                                        {s.paper_title}
                                    </p>
                                    {s.paper_journal && (
                                        <p className="text-[10px] text-gray-400 mt-0.5">{s.paper_journal}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {s.paper_link && (
                                        <a
                                            href={s.paper_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    )}
                                    {onRemoveSource && (
                                        <button
                                            onClick={() => onRemoveSource(s.id)}
                                            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Uploads */}
            {uploads.length > 0 && (
                <div>
                    <h4 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        {t('ask_ai_files') || 'Files'} ({uploads.length})
                    </h4>
                    <div className="space-y-1.5">
                        {uploads.map(s => (
                            <div
                                key={s.id}
                                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                                        {s.file_name}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        {s.file_type?.toUpperCase()}
                                    </p>
                                </div>
                                {onRemoveSource && (
                                    <button
                                        onClick={() => onRemoveSource(s.id)}
                                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
