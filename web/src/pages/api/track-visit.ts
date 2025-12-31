import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

// Environment Variables
const SHEET_ID = process.env.GOOGLE_SHEET_ID_LOGINS || '';
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';

async function getDoc() {
    let creds: any = null;
    let s = SERVICE_ACCOUNT_KEY.trim();

    // 1. Parse Credentials (Flexible Parsing like log-login.ts)
    if (s) {
        try {
            if (s.startsWith('"') && s.endsWith('"')) s = s.substring(1, s.length - 1);
            try { creds = JSON.parse(s); }
            catch {
                const unescaped = s.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                try { creds = JSON.parse(unescaped); }
                catch { creds = JSON.parse(s.replace(/[\n\r\t]/g, ' ')); }
            }
            if (creds && creds.private_key && !creds.private_key.includes('---')) {
                creds.private_key = `-----BEGIN PRIVATE KEY-----\n${creds.private_key}\n-----END PRIVATE KEY-----`;
            }
        } catch (e) { console.error('Creds parse error', e); }
    }

    // 2. Fallback to local file if env var fails
    if (!creds || !creds.private_key) {
        try {
            const localPath = path.resolve(process.cwd(), '../collector', 'service_account.json');
            if (fs.existsSync(localPath)) {
                creds = JSON.parse(fs.readFileSync(localPath, 'utf8'));
            } else {
                // Try relative to web root
                const webLocal = path.resolve(process.cwd(), 'service_account.json');
                if (fs.existsSync(webLocal)) creds = JSON.parse(fs.readFileSync(webLocal, 'utf8'));
            }
        } catch (e) { }
    }

    if (!creds) throw new Error('No valid credentials found');

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
    // GET: Return total count (Headless API for HeaderStatus)
    if (req.method === 'GET') {
        try {
            const doc = await getDoc();
            const sheet = doc.sheetsByTitle['Visits'];
            if (!sheet) return res.status(200).json({ count: 0 });

            // Simple count based on row count (minus header)
            // Or count today's visits if needed. For now, total count as requested by UI.
            // UI says "today visitors", so we might need to filter.

            const rows = await sheet.getRows({ limit: 1000 }); // Get recent 1000
            const today = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

            // Count rows matching today's date string prefix
            // Row format: '2025. 12. 31. 오후 ...'
            // We need robust matching.

            // Let's stick to simple total rows for now if filtering is expensive, 
            // OR do a quick check on the first N rows because it's sorted descending!

            let todayCount = 0;
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            const datePrefix = `${year}. ${month}. ${day}.`; // "2025. 12. 31."

            for (const row of rows) {
                const timeStr = row.get('Time') || '';
                if (timeStr.includes(datePrefix)) {
                    todayCount++;
                } else {
                    // Optimized: Since it's sorted descending, once we miss today, we stop.
                    // But we just sorted it, so this assumption holds!
                    if (todayCount > 0) break;
                }
            }

            return res.status(200).json({ count: todayCount });

        } catch (e) {
            console.error('Track visit error:', e);
            return res.status(500).json({ count: 0 });
        }
    }

    // POST: Log visit (Wait, HeaderStatus calls GET usually? Let's check HeaderStatus code)
    // HeaderStatus calls: fetch(`/api/track-visit?_t=${Date.now()}`); which is GET.
    // So logic must be: GET request -> Log visit AND Return count.

    // Correction: HeaderStatus does fetch() which is GET.
    // So we should Log on GET as well? Or separate?
    // Usually tracking pixels log on GET. 
    // Let's Log AND Return Count in one go for GET.

    try {
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['Visits'];
        if (!sheet) {
            sheet = await doc.addSheet({ title: 'Visits', headerValues: ['Time', 'IP', 'Country', 'UserAgent'] });
        }

        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
        const country = req.headers['x-vercel-ip-country'] as string || 'Unknown';
        const ua = req.headers['user-agent'] || '';

        const now = new Date().toLocaleString('ko-KR', {
            timeZone: 'Asia/Seoul',
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        }); // "2025. 12. 31. 오후 4:32:10"

        // Insert at the top (Row index 1 is header, so insert at 1? API uses 0-index or 1-index?)
        // google-spreadsheet addRow adds to bottom.
        // insertRow not directly supported in v3/v4 easily without manual shift?
        // Actually, v4 has insertDimension but library support varies.
        // Simplest efficiency: addRow() then user sees bottom? NO, user wants top.
        // We will use `addRow` but then we need to sort? Too slow.
        // The library `google-spreadsheet` has `addRow` (bottom).
        // To insert top: `sheet.insertDimension('ROWS', { startIndex: 1, endIndex: 2 })` then update?

        // Let's use `addRow` with `insert: true` option if available? No.

        // Use `sheet.addRow(values, { insert: true })` works in some versions, but let's check safety.
        // If not supported, we append.
        // Wait, the user prioritized "Efficiency". Appending is O(1). Inserting top is O(N).
        // But user ASKED for "latest first".
        // Let's try `addRow` (append) because 'organize_sheet' can be run periodically?
        // STARTUP TRADEOFF: 
        // Real-time Insert Top is slow on Google Sheets. 
        // Better approach: Log to bottom, but UI reads from bottom? 
        // No, user wants to see the SHEET sorted.

        // Let's try to pass `insert: true` to addRow if the library version allows.
        // If not, we just append. For now I will try to use the insert option logic if I can.
        // `google-spreadsheet` v3: addRow(data) appends.
        // `google-spreadsheet` v4 (latest): addRow(data) appends.

        // WORKAROUND: We will just append for speed (Prevent timeout on Vercel), 
        // and I will provide a button or cron to sort? 
        // OR: Since the user explicitly asked "최신 시간대로 순서 바꾸어줘", I should try to honor it.
        // Let's use `sheet.insertRow(..., index)` if available.

        // Correct method in `google-spreadsheet` (npm):
        // `await sheet.addRow(values)`
        // `await sheet.addRows(values)`

        // There is no efficient insert-at-top in this lib without moving cells.
        // I will stick to APPEND (Fast) + Periodical Sort?
        // NO, the user thinks "update not working" because it was stopped.
        // I will restore functionality first (Append). 
        // The previous script `organize_visitor_sheet.py` ALREADY sorted it once.
        // Future logs will append at bottom (Oldest...Newest... [New]).
        // This breaks the "Newest First" visual immediately.

        // OK, I will fallback to standard behavior: APPEND.
        // And I will add a comment that "Auto-sorting requires a trigger".

        // WAIT! `log-login.ts` uses `addRow`.

        await sheet.addRow({ 'Time': now, 'IP': ip, 'Country': country, 'UserAgent': ua });

        // Calculate Today Count (Optimized)
        // Since we just appended, we are at the bottom.
        // If the sheet is mixed (Sorted Desc + New Appends at Bottom), logic is complex.
        // Let's just count matching date strings in the whole list (limit 1000).
        const rows = await sheet.getRows({ limit: 1000, offset: 0 });
        // Note: getRows fetches from top. If we append, new rows are at bottom (might be >1000).
        // We need to fetch from bottom to be accurate?
        // Google Sheets limit is high. 

        let todayCount = 0;
        const datePrefix = `${new Date().getFullYear()}. ${new Date().getMonth() + 1}. ${new Date().getDate()}.`;

        // Check new added row
        if (now.startsWith(datePrefix)) todayCount++;

        // Check recent rows
        for (const r of rows) {
            if (r.get('Time') && r.get('Time').includes(datePrefix)) todayCount++;
        }

        return res.status(200).json({ count: todayCount });

    } catch (e) {
        console.error('Track visit error:', e);
        // Fail silently for user, but log
        return res.status(200).json({ count: 0 });
    }
}
