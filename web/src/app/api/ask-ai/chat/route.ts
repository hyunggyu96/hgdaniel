import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { searchSimilarChunks, getSourcesForSession } from '@/lib/embedding';

export async function POST(request: Request) {
    try {
        const { session_id, message, history } = await request.json();

        if (!session_id) {
            return NextResponse.json({ error: 'session_id required' }, { status: 400 });
        }
        if (!message) {
            return NextResponse.json({ error: 'message required' }, { status: 400 });
        }

        const groqApiKey = process.env.GROQ_API_KEY?.trim();
        if (!groqApiKey) {
            console.error('GROQ_API_KEY is missing');
            return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
        }

        const groq = new Groq({ apiKey: groqApiKey });

        // 1. Search similar chunks (with error handling)
        let chunks: any[] = [];
        try {
            chunks = await searchSimilarChunks(session_id, message, 10);
        } catch (searchError) {
            console.warn('RAG search failed, continuing without context:', searchError);
            // Don't fail the request, just proceed with empty chunks
        }

        // 2. Get source metadata
        const sources = await getSourcesForSession(session_id);
        const sourceMap = new Map(sources.map(s => [s.id, s]));

        // 3. Build context with source references
        const contextParts: string[] = [];
        const usedSources = new Map<string, { index: number; source: any }>();
        let sourceIndex = 1;

        for (const chunk of chunks) {
            const source = sourceMap.get(chunk.source_id);
            if (!source) continue;

            if (!usedSources.has(chunk.source_id)) {
                usedSources.set(chunk.source_id, { index: sourceIndex, source });
                sourceIndex++;
            }

            const ref = usedSources.get(chunk.source_id)!;
            const label = source.source_type === 'paper'
                ? source.paper_title
                : source.file_name;

            contextParts.push(`[Source ${ref.index}: ${label}]\n${chunk.content}`);
        }

        const contextStr = contextParts.join('\n\n---\n\n');

        // 4. Build source references for response
        const sourceRefs = Array.from(usedSources.entries()).map(([, v]) => ({
            index: v.index,
            type: v.source.source_type,
            title: v.source.source_type === 'paper' ? v.source.paper_title : v.source.file_name,
            journal: v.source.paper_journal || null,
            link: v.source.paper_link || null,
        }));

        // 5. Build chat history for Groq
        const chatHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant', // Groq uses 'assistant' not 'model'
            content: msg.content,
        }));

        // 6. Create RAG prompt
        const systemPrompt = `You are a research assistant specializing in academic paper analysis.
Answer questions based ONLY on the provided context sources below.
Always cite your sources using [Source N] format where N matches the source number.
If the context doesn't contain enough information to fully answer, say so explicitly.
Answer in the same language as the user's question.
Be concise but thorough.

## Context Sources:
${contextStr || 'No context sources available. Please inform the user to add papers or upload files first.'}

## Source References:
${sourceRefs.map(s => `[Source ${s.index}] ${s.title}${s.journal ? ` (${s.journal})` : ''}`).join('\n')}`;

        // 7. Stream response from Groq
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                ...chatHistory,
                { role: 'user', content: message }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 2048,
            stream: true,
        });

        // Create a ReadableStream for streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of completion) {
                        const text = chunk.choices[0]?.delta?.content || '';
                        if (text) {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
                            );
                        }
                    }
                    // Send source references at the end
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ sources: sourceRefs, done: true })}\n\n`)
                    );
                    controller.close();
                } catch (err: any) {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (err: any) {
        console.error('[chat] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
