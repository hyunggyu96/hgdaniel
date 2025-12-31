import { supabaseAdmin } from './supabaseAdmin';
import { unstable_noStore as noStore } from 'next/cache';

export async function getNews() {
    // noStore(); // Caching enabled via page.tsx revalidate
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

        // MATCHING FILTER: Use same logic as processor.py
        const CAR_BRANDS = ["르노코리아", "르노삼성", "현대차", "기아차", "쌍용차", "KG모빌리티", "쉐보레", "폭스바겐", "메르세데스", "벤츠", "BMW", "아르카나", "토레스", "그랜저"];
        const NOISE = ["시승기", "자동차 리콜", "타이어 교체", "중고차", "당구(PBA)"];

        const full_text_match = (text: string, kw: string) => text.includes(kw);
        const getWords = (text: string) => {
            const clean = text.replace(/[^a-zA-Z0-9가-힣\s]/g, '').toLowerCase();
            const words = clean.split(/\s+/).filter(w => w.length > 1);
            return new Set(words);
        };

        const filteredNews = data.reduce((acc: any[], current) => {
            const fullText = `${current.title} ${current.description || ''}`;

            // 1. Noise Filter
            if (CAR_BRANDS.some(b => full_text_match(fullText, b)) || NOISE.some(n => full_text_match(fullText, n))) return acc;

            // 2. Similarity Filter (Jaccard 85%)
            const currentWords = getWords(current.title);
            const isDuplicate = acc.some(item => {
                const refWords = getWords(item.title);
                const currentWordsArray = Array.from(currentWords);
                const intersectionCount = currentWordsArray.filter(x => refWords.has(x)).length;
                const unionCount = currentWords.size + refWords.size - intersectionCount;
                const similarity = intersectionCount / unionCount;
                return similarity > 0.85;
            });

            if (!isDuplicate) acc.push(current);
            return acc;
        }, []);

        return filteredNews;
    } catch (e) {
        console.error("Error fetching news:", e);
        return [];
    }
}
