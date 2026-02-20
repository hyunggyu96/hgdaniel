"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'uploading' | 'done' | 'error';
    sourceId?: string;
    chunkCount?: number;
    error?: string;
}

interface FileUploaderProps {
    sessionId: string | null;
    files: UploadedFile[];
    onFilesChange: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void;
    disabled?: boolean;
}

const ACCEPTED_TYPES = ['.pdf', '.txt', '.docx'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploader({ sessionId, files, onFilesChange, disabled = false }: FileUploaderProps) {
    const { t } = useLanguage();
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = useCallback(async (file: File) => {
        if (!sessionId) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['pdf', 'txt', 'docx'].includes(ext || '')) return;
        if (file.size > MAX_SIZE) return;

        const tempId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newFile: UploadedFile = {
            id: tempId,
            name: file.name,
            size: file.size,
            type: ext || 'unknown',
            status: 'uploading',
        };

        onFilesChange([...files, newFile]);

        try {
            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('file', file);

            const res = await fetch('/api/ask-ai/upload', { method: 'POST', body: formData });
            const result = await res.json();

            if (!res.ok) throw new Error(result.error || 'Upload failed');

            onFilesChange(prev =>
                prev.map(f => f.id === tempId
                    ? { ...f, status: 'done' as const, sourceId: result.source_id, chunkCount: result.chunk_count }
                    : f
                )
            );
        } catch (err: any) {
            onFilesChange(prev =>
                prev.map(f => f.id === tempId
                    ? { ...f, status: 'error' as const, error: err.message }
                    : f
                )
            );
        }
    }, [sessionId, files, onFilesChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled || !sessionId) return;
        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach(uploadFile);
    }, [disabled, sessionId, uploadFile]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || disabled || !sessionId) return;
        Array.from(e.target.files).forEach(uploadFile);
        e.target.value = '';
    }, [disabled, sessionId, uploadFile]);

    const removeFile = (fileId: string) => {
        onFilesChange(files.filter(f => f.id !== fileId));
    };

    return (
        <div className="space-y-3">
            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !disabled && sessionId && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    disabled || !sessionId
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed'
                        : dragOver
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/20 dark:hover:bg-blue-900/10'
                }`}
            >
                <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {t('ask_ai_drop_files') || 'Drop files here or click to browse'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    PDF, TXT, DOCX — max 10MB
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    aria-label="Upload files"
                />
            </div>

            {/* Uploaded files list */}
            {files.length > 0 && (
                <div className="space-y-1.5">
                    {files.map(file => (
                        <div
                            key={file.id}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
                        >
                            <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {file.name}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                    {formatSize(file.size)}
                                    {file.chunkCount ? ` · ${file.chunkCount} chunks` : ''}
                                </p>
                            </div>
                            {file.status === 'uploading' && (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
                            )}
                            {file.status === 'done' && (
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                            )}
                            {file.status === 'error' && (
                                <span title={file.error}><AlertCircle className="w-4 h-4 text-red-500 shrink-0" /></span>
                            )}
                            <button
                                type="button"
                                title="Remove file"
                                onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export type { UploadedFile };
