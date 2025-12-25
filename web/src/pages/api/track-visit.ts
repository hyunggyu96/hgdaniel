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
            // Remove any potential surrounding quotes if accidentally added via CLI
            const cleanKey = SERVICE_ACCOUNT_KEY.trim().replace(/^['"]|['"]$/g, '');
            creds = JSON.parse(cleanKey);
        } catch (err) {
            console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON string.');
            throw err;
        }
    } else if (SERVICE_ACCOUNT_FILE) {
        const credPath = path.resolve(SERVICE_ACCOUNT_FILE);
        if (fs.existsSync(credPath)) {
            creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
        } else {
            throw new Error(`Service account file not found at ${credPath}`);
        }
    } else {
        throw new Error('No Google credentials provided (neither key nor file)');
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
    // Prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
        const country = req.headers['x-vercel-ip-country'] as string || 'Unknown';
        const sheet = await getVisitsSheet();

        const now = new Date();
        const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // Manual KST shift if needed, but toLocaleString is better

        const timestampFormat = new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });

        const datePrefix = new Date().toLocaleDateString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: '2-digit', day: '2-digit'
        }).replace(/\. /g, '.').replace(/\.$/, ''); // Match "2024.12.25" style

        // 1. Add current visit
        await sheet.addRow({ timestamp: timestampFormat, ip, country });

        // 2. Count today's visits
        // Note: getRows() gets the last 500 rows or so by default if no offset, 
        // but for a small/medium tracker it returns all.
        const rows = await sheet.getRows();

        // Filter rows by today's date prefix
        const todayVisits = rows.filter(row => {
            const ts = row.get('timestamp') as string;
            return ts && ts.includes(datePrefix);
        });

        // Deduplicate by IP to get "Unique Visitors Today"
        const uniqueIps = new Set(todayVisits.map(v => v.get('ip')));

        return res.status(200).json({
            count: uniqueIps.size,
            totalRows: rows.length,
            debug: { datePrefix, sample: rows.length > 0 ? rows[rows.length - 1].get('timestamp') : null }
        });
    } catch (e) {
        console.error('track-visit error:', e);
        return res.status(200).json({ count: 0, error: String(e) });
    }
}
