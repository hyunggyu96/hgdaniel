'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getLatestNewsTimestamp() {
    try {
        const { data, error } = await supabaseAdmin
            .from('news')
            .select('published_at')
            .order('published_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error fetching latest timestamp:', error);
            return null;
        }

        if (!data || data.length === 0) {
            console.log('No news data found');
            return null;
        }

        return data[0].published_at;
    } catch (err) {
        console.error('Exception in getLatestNewsTimestamp:', err);
        return null;
    }
}
