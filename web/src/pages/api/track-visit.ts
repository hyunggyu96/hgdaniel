import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

const SHEET_ID = process.env.GOOGLE_SHEET_ID_LOGINS || '';
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
const SERVICE_ACCOUNT_FILE = process.env.SERVICE_ACCOUNT_FILE || '';

async function getVisitsSheet() {
    let creds;
    if (SERVICE_ACCOUNT_KEY) {
        try {
            const cleanKey = SERVICE_ACCOUNT_KEY.trim().replace(/^['"]|['"]$/g, '');
            try {
                creds = JSON.parse(cleanKey);
            } catch {
                creds = JSON.parse(JSON.parse(cleanKey));
            }
            if (creds && creds.private_key) {
                creds.private_key = creds.private_key.replace(/\\n/g, '\n');
            }
        } catch (err) {
            console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY');
            throw err;
        }
    } else if (SERVICE_ACCOUNT_FILE) {
        const credPath = path.resolve(SERVICE_ACCOUNT_FILE);
        if (fs.existsSync(credPath)) {
            creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        } else {
            throw new Error(`Service account file not found`);
        }
    } else {
        throw new Error('No Google credentials provided');
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

    let sheet = doc.sheetsByTitle['Visits'];
    if (!sheet) {
        sheet = await doc.addSheet({ title: 'Visits', headerValues: ['timestamp', 'ip', 'country'] });
    }
    return sheet;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
        const country = req.headers['x-vercel-ip-country'] as string || 'Unknown';
        const sheet = await getVisitsSheet();

        const now = new Date();
        const kstDateString = now.toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit'
        });

        const timestampStr = now.toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });

        await sheet.addRow({ timestamp: timestampStr, ip, country });

        const rows = await sheet.getRows();
        const todayVisits = rows.filter(row => {
            const ts = row.get('timestamp') as string;
            return ts && ts.startsWith(kstDateString);
        });

        const uniqueIps = new Set(todayVisits.map(v => v.get('ip')));

        return res.status(200).json({
            count: uniqueIps.size,
            totalToday: todayVisits.length,
            dateKey: kstDateString
        });
    } catch (e: any) {
        console.error('track-visit error:', e);
        return res.status(200).json({ count: 0, error: e.message });
    }
}
