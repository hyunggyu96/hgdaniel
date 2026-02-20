import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from './supabaseAdmin';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const EMBEDDING_MODELS = ['gemini-embedding-001', 'text-embedding-004'] as const;

function isModelNotFoundError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('404') || message.includes('is not found');
}

// --- Text chunking ---

export function chunkText(text: string, maxChars = 800, overlap = 200): string[] {
    if (!text || text.length <= maxChars) return [text].filter(Boolean);

    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        let end = start + maxChars;
        // Try to break at sentence boundary
        if (end < text.length) {
            const slice = text.slice(start, end + 100);
            const lastPeriod = Math.max(
                slice.lastIndexOf('. '),
                slice.lastIndexOf('.\n'),
                slice.lastIndexOf('? '),
                slice.lastIndexOf('! ')
            );
            if (lastPeriod > maxChars * 0.5) {
                end = start + lastPeriod + 1;
            }
        }
        chunks.push(text.slice(start, Math.min(end, text.length)).trim());
        start = end - overlap;
        if (start >= text.length) break;
    }
    return chunks.filter(c => c.length > 10);
}

// --- Embedding generation ---

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!process.env.GEMINI_API_KEY?.trim()) {
        throw new Error('Server configuration error: Missing GEMINI_API_KEY');
    }

    for (const modelName of EMBEDDING_MODELS) {
        const model = genAI.getGenerativeModel({ model: modelName });
        try {
            const result = await model.embedContent({
                content: { role: 'user', parts: [{ text }] },
                outputDimensionality: 768,
            } as any);
            return result.embedding.values;
        } catch (error) {
            if (isModelNotFoundError(error) && modelName !== EMBEDDING_MODELS[EMBEDDING_MODELS.length - 1]) {
                continue;
            }
            console.error('Embedding generation failed:', error);
            throw error;
        }
    }

    throw new Error('Embedding generation failed: no compatible embedding model available');
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Process in batches of 5 to avoid rate limits
    const embeddings: number[][] = [];
    for (let i = 0; i < texts.length; i += 5) {
        const batch = texts.slice(i, i + 5);
        const results = await Promise.all(batch.map(t => generateEmbedding(t)));
        embeddings.push(...results);
    }
    return embeddings;
}

// --- Database operations ---

export async function createSession(userId?: string): Promise<string> {
    const { data, error } = await supabaseAdmin
        .from('ask_ai_sessions')
        .insert({ user_id: userId || null })
        .select('id')
        .single();

    if (error) throw new Error(`Failed to create session: ${error.message}`);
    return data.id;
}

export async function addPaperSources(
    sessionId: string,
    papers: Array<{ id: string; title: string; abstract: string; journal: string; link: string }>
): Promise<string[]> {
    const sourceIds: string[] = [];

    for (const paper of papers) {
        // Insert source
        const { data: source, error: sourceErr } = await supabaseAdmin
            .from('ask_ai_sources')
            .insert({
                session_id: sessionId,
                source_type: 'paper',
                paper_id: paper.id,
                paper_title: paper.title,
                paper_journal: paper.journal,
                paper_link: paper.link,
            })
            .select('id')
            .single();

        if (sourceErr) throw new Error(`Failed to add paper source: ${sourceErr.message}`);

        // Chunk the paper content
        const content = `Title: ${paper.title}\n\nAbstract: ${paper.abstract || ''}`;
        const chunks = chunkText(content);

        // Generate embeddings and save chunks
        const embeddings = await generateEmbeddings(chunks);
        const chunkRows = chunks.map((chunk, i) => ({
            source_id: source.id,
            session_id: sessionId,
            chunk_index: i,
            content: chunk,
            embedding: JSON.stringify(embeddings[i]),
        }));

        const { error: chunkErr } = await supabaseAdmin
            .from('ask_ai_chunks')
            .insert(chunkRows);

        if (chunkErr) throw new Error(`Failed to save chunks: ${chunkErr.message}`);
        sourceIds.push(source.id);
    }

    return sourceIds;
}

export async function addUploadSource(
    sessionId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    textContent: string
): Promise<{ sourceId: string; chunkCount: number }> {
    // Insert source
    const { data: source, error: sourceErr } = await supabaseAdmin
        .from('ask_ai_sources')
        .insert({
            session_id: sessionId,
            source_type: 'upload',
            file_name: fileName,
            file_type: fileType,
            file_size: fileSize,
        })
        .select('id')
        .single();

    if (sourceErr) throw new Error(`Failed to add upload source: ${sourceErr.message}`);

    // Chunk the text
    const chunks = chunkText(textContent);

    // Generate embeddings and save chunks
    const embeddings = await generateEmbeddings(chunks);
    const chunkRows = chunks.map((chunk, i) => ({
        source_id: source.id,
        session_id: sessionId,
        chunk_index: i,
        content: chunk,
        embedding: JSON.stringify(embeddings[i]),
    }));

    const { error: chunkErr } = await supabaseAdmin
        .from('ask_ai_chunks')
        .insert(chunkRows);

    if (chunkErr) throw new Error(`Failed to save upload chunks: ${chunkErr.message}`);

    return { sourceId: source.id, chunkCount: chunks.length };
}

// --- RAG search ---

export async function searchSimilarChunks(
    sessionId: string,
    query: string,
    matchCount = 10
): Promise<Array<{ id: string; source_id: string; content: string; chunk_index: number; similarity: number }>> {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabaseAdmin.rpc('match_chunks', {
        query_embedding: JSON.stringify(queryEmbedding),
        match_session_id: sessionId,
        match_count: matchCount,
        match_threshold: 0.3,
    });

    if (error) throw new Error(`Search failed: ${error.message}`);
    return data || [];
}

export async function getChunksForSession(
    sessionId: string,
    limit = 10
): Promise<Array<{ id: string; source_id: string; content: string; chunk_index: number }>> {
    const { data, error } = await supabaseAdmin
        .from('ask_ai_chunks')
        .select('id, source_id, content, chunk_index')
        .eq('session_id', sessionId)
        .order('source_id', { ascending: true })
        .order('chunk_index', { ascending: true })
        .limit(limit);

    if (error) throw new Error(`Failed to get fallback chunks: ${error.message}`);
    return data || [];
}

export async function getSourcesForSession(sessionId: string) {
    const { data, error } = await supabaseAdmin
        .from('ask_ai_sources')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get sources: ${error.message}`);
    return data || [];
}
