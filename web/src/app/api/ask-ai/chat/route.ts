import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchSimilarChunks, getSourcesForSession } from '@/lib/embedding';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { session_id, message, history } = await request.json();

        if (!session_id) {
            return NextResponse.json({ error: 'session_id required' }, { status: 400 });
        }
        if (!message) {
            return NextResponse.json({ error: 'message required' }, { status: 400 });
        }

        // 1. Search similar chunks
        const chunks = await searchSimilarChunks(session_id, message, 10);

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

        // 5. Build chat history for Gemini
        const chatHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
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

        // 7. Stream response from Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
            },
        });

        const result = await chat.sendMessageStream([
            { text: systemPrompt },
            { text: `\n\nUser question: ${message}` },
        ]);

        // Create a ReadableStream for streaming response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
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
