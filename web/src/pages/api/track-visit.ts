import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Use Hardcoded ID as safety net
const SHEET_ID = '1wA1YzPatil0qnhZk1EkS4r4Roc-Mx1I-iBSlmtyJNm8';
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';

async function getDoc() {
    let creds: any = null;
    let s = SERVICE_ACCOUNT_KEY.trim();

    if (s) {
        try {
            if (s.startsWith('"') && s.endsWith('"')) s = s.substring(1, s.length - 1);
            try { creds = JSON.parse(s); }
            catch {
                const unescaped = s.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                try { creds = JSON.parse(unescaped); }
                catch { creds = JSON.parse(s.replace(/[\n\r\t]/g, ' ')); }
            }
        } catch (e) { console.error('Env parse error', e); }
    }

    if (creds && creds.private_key && !creds.private_key.includes('---')) {
        creds.private_key = `-----BEGIN PRIVATE KEY-----\n${creds.private_key}\n-----END PRIVATE KEY-----`;
    }

    if (!creds) throw new Error('No valid credentials found in GOOGLE_SERVICE_ACCOUNT_KEY env var.');

    const serviceAccountAuth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    return doc;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Determine action - GET/POST are treated as "Log Visit" here because HeaderStatus calls GET.
    // If you want GET to be read-only, split logic. But HeaderStatus fetches to track.

    try {
        const doc = await getDoc();

        // --- 1. Visits Log (Insert at TOP for "Newest First") ---
        let sheet = doc.sheetsByTitle['Visits'];
        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Visits', headerValues: ['Time', 'IP', 'Country', 'UserAgent'] });
        }

        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
        const country = req.headers['x-vercel-ip-country'] as string || 'Unknown';
        const ua = req.headers['user-agent'] || '';

        const now = new Date();
        const nowStr = now.toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });

        // Attempt to Insert at Top (Newest First)
        // Note: { insert: true } option inserts at the top of data range in some lib versions.
        await sheet.addRow({ 'Time': nowStr, 'IP': ip, 'Country': country, 'UserAgent': ua }, { insert: true });


        // --- 2. Daily Stats (Auto-Count) ---
        let statsSheet = doc.sheetsByTitle['DailyStats'];
        if (!statsSheet) {
            statsSheet = await doc.addSheet({ title: 'DailyStats', headerValues: ['Date', 'TotalVisitors'] });
        }

        const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Find today's row
        const statsRows = await statsSheet.getRows();
        const todayRow = statsRows.find(r => r.get('Date') === dateKey);

        let todayCount = 1;

        if (todayRow) {
            const current = parseInt(todayRow.get('TotalVisitors'), 10) || 0;
            todayCount = current + 1;
            todayRow.set('TotalVisitors', String(todayCount));
            await todayRow.save();
        } else {
            // New day: Create row at TOP
            await statsSheet.addRow({ 'Date': dateKey, 'TotalVisitors': '1' }, { insert: true });
        }

        return res.status(200).json({ count: todayCount });

    } catch (e) {
        console.error('Track visit error:', e);
        return res.status(200).json({ count: 0 });
    }
}
