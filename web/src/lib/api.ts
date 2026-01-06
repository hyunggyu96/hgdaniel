import { supabaseAdmin } from './supabaseAdmin';
import { unstable_noStore as noStore } from 'next/cache';

export async function getNews() {
    noStore(); // Caching disabled
    console.log('[API] getNews called');
    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('*')
            .neq('category', 'NOISE')  // 노이즈 기사 제외
            .order('published_at', { ascending: false });

        if (error) {
            console.error('[API] Supabase error:', error.message, error.details);
            throw error;
        }

        if (data) {
            console.log(`[API] Success! Fetched ${data.length} articles.`);
        } else {
            console.log('[API] No data returned from Supabase.');
        }

        if (error) throw error;
        if (!data) return [];

        // V5.0: Trust Backend Processor completely. No frontend filtering.
        return data;
    } catch (e) {
        console.error("Error fetching news:", e);
        return [];
    }
}
