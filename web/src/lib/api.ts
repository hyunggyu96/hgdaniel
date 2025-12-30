import { supabaseAdmin } from './supabaseAdmin';
import { unstable_noStore as noStore } from 'next/cache';

export async function getNews() {
    noStore(); // Opt out of static generation for this data fetch
    console.log('[API] getNews called');
    try {
        const { data, error } = await supabaseAdmin
            .from('articles')
            .select('*')
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

        const uniqueNews = data.reduce((acc: any[], current) => {
            const isDuplicate = acc.some(item => {
                const normalize = (text: string) => text.replace(/[^a-zA-Z0-9가-힣]/g, '');
                const norm1 = normalize(item.title).slice(0, 25);
                const norm2 = normalize(current.title).slice(0, 25);
                return (item.link === current.link) || (norm1.length > 5 && norm1 === norm2);
            });
            if (!isDuplicate) acc.push(current);
            return acc;
        }, []);

        return uniqueNews;
    } catch (e) {
        console.error("Error fetching news:", e);
        return [];
    }
}
