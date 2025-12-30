import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

const SHEET_ID = process.env.GOOGLE_SHEET_ID_LOGINS || '';
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
const SERVICE_ACCOUNT_FILE = process.env.SERVICE_ACCOUNT_FILE || '';

async function getUserSheet(userId: string) {
    let creds: any = null;
    let s = SERVICE_ACCOUNT_KEY.trim();

    if (s) {
        try {
            if (s.startsWith('"') && s.endsWith('"')) s = s.substring(1, s.length - 1);
            try {
                creds = JSON.parse(s);
            } catch {
                const unescaped = s.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                try {
                    creds = JSON.parse(unescaped);
                } catch {
                    try {
                        creds = JSON.parse(JSON.parse(s));
                    } catch {
                        creds = JSON.parse(s.replace(/[\n\r\t]/g, ' '));
                    }
                }
            }
            if (creds && creds.private_key) {
                creds.private_key = creds.private_key.replace(/\\n/g, '\n');
                if (!creds.private_key.includes('---')) {
                    creds.private_key = `-----BEGIN PRIVATE KEY-----\n${creds.private_key}\n-----END PRIVATE KEY-----`;
                }
            }
        } catch (err) {
            console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY');
        }
    }

    if (!creds || !creds.private_key) {
        try {
            const localPath = path.resolve(process.cwd(), 'collector', 'service_account.json');
            if (fs.existsSync(localPath)) {
                creds = JSON.parse(fs.readFileSync(localPath, 'utf8'));
            }
        } catch (e) { }
    }

    if (!creds || !creds.private_key) {
        throw new Error('No valid Google credentials found');
    }

    const serviceAccountAuth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file',
        ],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle[userId];
    if (!sheet) {
        sheet = await doc.addSheet({
            title: userId,
            headerValues: ['시간', 'IP', '국가', '기사 제목', '링크']
        });
    }
    return sheet;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { userId, title, link } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
        const country = req.headers['x-vercel-ip-country'] as string || 'Unknown';
        const sheet = await getUserSheet(userId);
        const now = new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        await sheet.addRow({ '시간': now, 'IP': ip, '국가': country, '기사 제목': title, '링크': link });
        return res.status(200).json({ success: true });
    } catch (e) {
        console.error('log-login error:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
