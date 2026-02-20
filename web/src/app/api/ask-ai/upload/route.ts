import { NextResponse } from 'next/server';
import { addUploadSource } from '@/lib/embedding';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function extractText(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'txt') {
        return buffer.toString('utf-8');
    }

    if (ext === 'pdf') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
        const result = await pdfParse(buffer);
        return result.text;
    }

    if (ext === 'docx') {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    }

    throw new Error(`Unsupported file type: ${ext}`);
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const sessionId = formData.get('session_id') as string;
        const file = formData.get('file') as File;

        if (!sessionId) {
            return NextResponse.json({ error: 'session_id required' }, { status: 400 });
        }
        if (!file) {
            return NextResponse.json({ error: 'file required' }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
        }

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['pdf', 'txt', 'docx'].includes(ext || '')) {
            return NextResponse.json({ error: 'Supported formats: PDF, TXT, DOCX' }, { status: 400 });
        }

        // Extract text from file
        const textContent = await extractText(file);
        if (!textContent || textContent.trim().length < 10) {
            return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
        }

        // Add source and generate embeddings
        const { sourceId, chunkCount } = await addUploadSource(
            sessionId,
            file.name,
            ext || 'unknown',
            file.size,
            textContent
        );

        return NextResponse.json({
            success: true,
            source_id: sourceId,
            file_name: file.name,
            chunk_count: chunkCount,
            text_length: textContent.length,
        });
    } catch (err: any) {
        console.error('[upload] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
