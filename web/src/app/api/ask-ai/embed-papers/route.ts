import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { addPaperSources } from '@/lib/embedding';

export async function POST(request: Request) {
    try {
        const { session_id, paper_ids } = await request.json();

        if (!session_id) {
            return NextResponse.json({ error: 'session_id required' }, { status: 400 });
        }
        if (!paper_ids || !Array.isArray(paper_ids) || paper_ids.length === 0) {
            return NextResponse.json({ error: 'paper_ids required (array)' }, { status: 400 });
        }
        if (paper_ids.length > 20) {
            return NextResponse.json({ error: 'Maximum 20 papers allowed' }, { status: 400 });
        }

        // Fetch papers from pubmed_papers table
        const { data: papers, error: fetchErr } = await supabaseAdmin
            .from('pubmed_papers')
            .select('id, title, abstract, journal, link')
            .in('id', paper_ids);

        if (fetchErr) {
            return NextResponse.json({ error: fetchErr.message }, { status: 500 });
        }
        if (!papers || papers.length === 0) {
            return NextResponse.json({ error: 'No papers found for given IDs' }, { status: 404 });
        }

        // Add papers as sources and generate embeddings
        const sourceIds = await addPaperSources(session_id, papers);

        return NextResponse.json({
            success: true,
            processed: papers.length,
            source_ids: sourceIds,
        });
    } catch (err: any) {
        console.error('[embed-papers] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
