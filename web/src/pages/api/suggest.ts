import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

const SHEET_ID = '1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic'; // Market Analysis

async function getAuth() {
    const possiblePaths = [
        path.join(process.cwd(), 'collector', 'service_account.json'),
        '/var/task/collector/service_account.json'
    ];

    let creds: any = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            try {
                creds = JSON.parse(fs.readFileSync(p, 'utf8'));
                break;
            } catch (e) { }
        }
    }

    if (!creds && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
            creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY.trim().replace(/^['"]|['"]$/g, ''));
        } catch (e) { }
    }

    if (!creds) throw new Error('Credential not found');

    if (creds.private_key) creds.private_key = creds.private_key.replace(/\\n/g, '\n');

    return new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive.file'],
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { keyword, category, reason } = req.body;
        if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';

        const auth = await getAuth();
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
            // Prepend new row at index 1 (under header)
            // @ts-ignore
            await sheet.insertDimension('ROWS', { startIndex: 1, endIndex: 2 }, false);

            // Fill cells (A2:G2) and Force White Background
            await sheet.loadCells('A2:G2');
            const suggestValues = [now, keywordToMatch, category || '미지정', reason || '-', '1', '대기중', ip];
            for (let i = 0; i < suggestValues.length; i++) {
                const cell = sheet.getCell(1, i);
                cell.value = suggestValues[i];
                // @ts-ignore
                cell.backgroundColor = { red: 1, green: 1, blue: 1 };
            }
            await sheet.saveUpdatedCells();
        }

        return res.status(200).json({ success: true });

    } catch (e: any) {
        console.error('Suggest API Error:', e.message);
        return res.status(500).json({ error: e.message });
    }
}
