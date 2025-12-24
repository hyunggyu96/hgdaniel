import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log(`[API] GET collections for user: ${userId}`);

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('user_collections')
            .select('article_link')
            .eq('user_id', userId);

        if (error) {
            console.error('[API] GET error:', error.message);
            throw error;
        }

        console.log(`[API] Found ${data?.length || 0} collections for ${userId}`);
        return NextResponse.json(data.map((item: any) => item.article_link));
    } catch (error: any) {
        console.error('Error fetching collections:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId, link } = await req.json();
    console.log(`[API] POST collection for user: ${userId}, link: ${link?.slice(0, 30)}...`);

    if (!userId || !link) {
        return NextResponse.json({ error: 'User ID and Link are required' }, { status: 400 });
    }

    try {
        const { error } = await supabaseAdmin
            .from('user_collections')
            .upsert({ user_id: userId, article_link: link }, { onConflict: 'user_id,article_link' });

        if (error) {
            console.error('[API] POST error:', error.message);
            throw error;
        }

        console.log(`[API] POST success for ${userId}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error adding to collection:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { userId, link } = await req.json();
    console.log(`[API] DELETE collection for user: ${userId}, link: ${link?.slice(0, 30)}...`);

    if (!userId || !link) {
        return NextResponse.json({ error: 'User ID and Link are required' }, { status: 400 });
    }

    try {
        const { error } = await supabaseAdmin
            .from('user_collections')
            .delete()
            .eq('user_id', userId)
            .eq('article_link', link);

        if (error) {
            console.error('[API] DELETE error:', error.message);
            throw error;
        }

        console.log(`[API] DELETE success for ${userId}`);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error removing from collection:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
