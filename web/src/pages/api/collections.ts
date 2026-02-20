import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAuthUserFromCookieHeader } from '@/lib/authSession';

type CollectionType = 'news' | 'paper';

function resolveType(raw: unknown): CollectionType {
    if (raw === 'paper') return 'paper';
    return 'news';
}

function getBody(req: NextApiRequest) {
    if (typeof req.body === 'string') {
        try {
            return JSON.parse(req.body);
        } catch {
            return {};
        }
    }
    return req.body || {};
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const authUser = await getAuthUserFromCookieHeader(req.headers.cookie);
    if (!authUser) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const type = resolveType(req.method === 'GET' ? req.query.type : getBody(req).type);

    try {
        if (req.method === 'GET') {
            const { data, error } = await supabaseAdmin
                .from('user_collections')
                .select('item_key, title, url, metadata, created_at')
                .eq('user_id', authUser.id)
                .eq('item_type', type)
                .order('created_at', { ascending: false });

            if (error) {
                return res.status(500).json({ error: 'Failed to fetch collections' });
            }

            if (type === 'news') {
                const links = (data || []).map((row) => row.item_key);
                return res.status(200).json(links);
            }

            return res.status(200).json(data || []);
        }

        if (req.method === 'POST') {
            const body = getBody(req);
            const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};

            const itemKey =
                type === 'news'
                    ? String(body.link || body.itemKey || '')
                    : String(body.itemKey || body.paperId || body.id || body.link || '');

            if (!itemKey) {
                return res.status(400).json({ error: 'Missing item key' });
            }

            const title = body.title ? String(body.title) : null;
            const url = body.url ? String(body.url) : (body.link ? String(body.link) : null);

            const { error } = await supabaseAdmin
                .from('user_collections')
                .upsert(
                    {
                        user_id: authUser.id,
                        item_type: type,
                        item_key: itemKey,
                        title,
                        url,
                        metadata,
                    },
                    { onConflict: 'user_id,item_type,item_key' }
                );

            if (error) {
                return res.status(500).json({ error: 'Failed to save collection item' });
            }

            return res.status(200).json({ ok: true });
        }

        if (req.method === 'DELETE') {
            const body = getBody(req);
            const itemKey =
                type === 'news'
                    ? String(body.link || body.itemKey || '')
                    : String(body.itemKey || body.paperId || body.id || body.link || '');

            if (!itemKey) {
                return res.status(400).json({ error: 'Missing item key' });
            }

            const { error } = await supabaseAdmin
                .from('user_collections')
                .delete()
                .eq('user_id', authUser.id)
                .eq('item_type', type)
                .eq('item_key', itemKey);

            if (error) {
                return res.status(500).json({ error: 'Failed to delete collection item' });
            }

            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[collections api] error', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
