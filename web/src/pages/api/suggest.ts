
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

        // Failsafe implementation
        let creds: any = null;
        let s = SERVICE_ACCOUNT_KEY.trim();

        try {
            // 1. Double check for surrounding quotes and unescape them
            if (s.startsWith('"') && s.endsWith('"')) {
                s = s.substring(1, s.length - 1);
            }

            // 2. Try parsing directly
            try {
                creds = JSON.parse(s);
            } catch {
                // 3. Try unescaping common problematic characters
                const unescaped = s.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                try {
                    creds = JSON.parse(unescaped);
                } catch {
                    // 4. Double-serialized case
                    try {
                        creds = JSON.parse(JSON.parse(s));
                    } catch {
                        // 5. Hardcore cleanup: If it's a raw string starting with {
                        // but failed to parse, it might have literal newlines
                        const normalized = s.replace(/[\n\r\t]/g, ' ');
                        creds = JSON.parse(normalized);
                    }
                }
            }

            // Fix RSA Key
            if (creds && creds.private_key) {
                creds.private_key = creds.private_key.replace(/\\n/g, '\n');
                if (!creds.private_key.includes('---')) {
                    // Recover header/footer if lost
                    creds.private_key = `-----BEGIN PRIVATE KEY-----\n${creds.private_key}\n-----END PRIVATE KEY-----`;
                }
            }
        } catch (e) {
            console.warn('Primary parsing failed, trying local file...');
            // Local file fallback
            try {
                const localPath = path.resolve(process.cwd(), 'collector', 'service_account.json');
                if (fs.existsSync(localPath)) {
                    creds = JSON.parse(fs.readFileSync(localPath, 'utf8'));
                }
            } catch { }
        }

        if (!creds || !creds.private_key || !creds.client_email) {
            throw new Error(`Auth JSON Error: Failed after all attempts. Length: ${s.length}, Starts: ${s.substring(0, 10)}`);
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
