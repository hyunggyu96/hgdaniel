import { supabaseAdmin } from './supabaseAdmin';

export type UsageAction = 'insight_view' | 'ask_ai_query';

function todayStart(): string {
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    return now.toISOString();
}

export async function getDailyUsageCount(
    userId: string,
    action: UsageAction
): Promise<number> {
    const { count, error } = await supabaseAdmin
        .from('usage_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('action', action)
        .gte('created_at', todayStart());

    if (error) {
        console.error('[usage] count error:', error);
        return 0;
    }
    return count || 0;
}

export async function recordUsage(
    userId: string,
    action: UsageAction
): Promise<void> {
    const { error } = await supabaseAdmin
        .from('usage_logs')
        .insert({ user_id: userId, action });

    if (error) {
        console.error('[usage] record error:', error);
    }
}
