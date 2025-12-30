
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = '1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic'; // Market Analysis (시장조사 뉴스)
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { keyword, category, reason } = req.body;
        if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

        console.log('--- Keyword Suggestion (Pages API) Start ---');

        if (!SERVICE_ACCOUNT_KEY) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is missing');

        // Working Creds Initialization from log-login.ts
        // Robust Creds Initialization
        let creds;
        try {
            const cleanKey = SERVICE_ACCOUNT_KEY.trim();
            // Handle if the key is wrapped in extra quotes by the shell/env
            const unquotedKey = cleanKey.replace(/^['"]|['"]$/g, '');

            try {
                // Try parsing directly (works if \n are represented as string "\n")
                creds = JSON.parse(unquotedKey);
            } catch (innerError) {
                // Try double parsing for double-serialized values
                try {
                    creds = JSON.parse(JSON.parse(unquotedKey));
                } catch (doubleError) {
                    // Failover: If there are literal newlines, escape them first
                    const escapedKey = unquotedKey.replace(/\n/g, "\\n");
                    creds = JSON.parse(escapedKey);
                }
            }
        } catch (e) {
            console.error('Auth JSON Error:', e);
            throw new Error(`Auth JSON Error: ${e.message}`);
        }

        const auth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
            ],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, auth);
        await doc.loadInfo();

        let sheet = doc.sheetsByTitle['키워드제안'];
        if (!sheet) {
            sheet = await doc.addSheet({
                title: '키워드제안',
                headerValues: ['제안일시', '제안 키워드', '카테고리', '제안 사유', '누적 제안 횟수', '상태', 'IP']
            });
        }

        const rows = await sheet.getRows();
        const keywordToMatch = keyword.trim();
        const existingRow = rows.find(r => r.get('제안 키워드')?.toString().trim() === keywordToMatch);
        const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        if (existingRow) {
            const count = parseInt(existingRow.get('누적 제안 횟수') || '1', 10);
            existingRow.set('누적 제안 횟수', (count + 1).toString());
            existingRow.set('제안일시', now);
            existingRow.set('IP', ip);
            await existingRow.save();
        } else {
            await sheet.addRow({
                '제안일시': now,
                '제안 키워드': keywordToMatch,
                '카테고리': category || '미지정',
                '제안 사유': reason || '-',
                '누적 제안 횟수': '1',
                '상태': '대기중',
                'IP': ip
            });
        }

        console.log('--- Keyword Suggestion (Pages API) Success ---');
        return res.status(200).json({ success: true });

    } catch (e: any) {
        console.error('Pages API Error:', e);
        return res.status(500).json({ error: e.message });
    }
}
