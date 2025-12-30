
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

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

        // Ultra-Robust implementation
        let creds;
        const rawKey = SERVICE_ACCOUNT_KEY.trim();

        try {
            // Stage 1: Standard parse
            const cleanKey = rawKey.replace(/^['"]|['"]$/g, '');
            creds = JSON.parse(cleanKey);
        } catch (e) {
            try {
                // Stage 2: Handle escaped \n by turning them to spaces (safe for RSA)
                const cleanKey = rawKey.replace(/^['"]|['"]$/g, '');
                creds = JSON.parse(cleanKey.replace(/\\n/g, ' '));
            } catch (e2) {
                try {
                    // Stage 3: Double-serialized fallback
                    const cleanKey = rawKey.replace(/^['"]|['"]$/g, '');
                    creds = JSON.parse(JSON.parse(cleanKey));
                } catch (e3) {
                    // Stage 4: Local file fallback for development
                    try {
                        const localPath = path.resolve(process.cwd(), 'collector', 'service_account.json');
                        if (fs.existsSync(localPath)) {
                            creds = JSON.parse(fs.readFileSync(localPath, 'utf8'));
                            console.log('--- Using local service_account.json fallback ---');
                        }
                    } catch (e4) { }
                }
            }
        }

        if (!creds) {
            const preview = rawKey.substring(0, 50).replace(/\n/g, '\\n');
            throw new Error(`Auth JSON Error: Failed to parse credentials. Key starts with: [${preview}]`);
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
