import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Use Hardcoded ID as safety net
const SHEET_ID = '1wA1YzPatil0qnhZk1EkS4r4Roc-Mx1I-iBSlmtyJNm8';
const SERVICE_ACCOUNT_KEY = Buffer.from('ewogICAgInR5cGUiOiAic2VydmljZV9hY2NvdW50IiwKICAgICJwcm9qZWN0X2lkIjogImFlc3RoZXRpYy00ODIxMTEiLAogICAgInByaXZhdGVfa2V5X2lkIjogImU5ODVkZjBjM2I3N2VhOGQyM2IxN2Q1NmI2YTRhOTJmOWQ4NzJmNGQiLAogICAgInByaXZhdGVfa2V5IjogIi0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZRSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2N3Z2dTakFnRUFBb0lCQVFESVBYTUZFT3p4WWpDS1xuNnZvVnJqeUpmbS8vOHkrWi82SEFMbG9Jd1dXaFBsdUJNRC9pSy9sOFRlRTdoMVd6bjlsZ3Fsc2dDcFpiUmtsTFxuV2F2WUg4U2VrTWNiK081aDJSaHNyb1g1M3RmYklWcDFDVkJXbGJSdXhtZ1cyelJPZUlmWnduY2lYeHBwV1FOK1xucFM3QWlIaVNwMk56Yzk2VzcrVWdkMFUrT1BYa3lJZ1pRWXBFSGFVZS85MHcwSkxVa1RrSEt3OTdUcDlmM1NkRlxuVFRsQ3h0eUdrSFhLMGc1SWRDWUVJT1ZZNmxmWWhIY09TcXdmV1lvQ0w3YmNOOHBKZngxQ0VMRGdSQTlKQjB1TlxuZWhJNzAxUzhsdjdQNGdGWnVnUGlsc21rNVIzSEppYnpTbTFuZDJFWUMrSlpVWXgrRzNkckpkZWZnTjhmQ0ZwdFxuZHZDaVdqSDFBZ01CQUFFQ2dnRUFDZmc5Uk5CTjY4ckd2ZlByRmE5Q0pscGNPek1oZUpwb3RFZmFoYnNUVTA3bVxuZ1cwa2tSODlZYm9DNzlMU0tvcFg2Vjh5QUV0bXB3NjkwWG1hZTcxQkxkL3BlZlFQOG1FN3ZSV0hhQ1IzUE5yUlxuUlNoOGpvTVBvOEJQS0d3cms0aWV3dkhTdXF4ZmhVVkFUa3J0SS9ybmZlM0ZudGJ6Q3pMUWhxaEprMHFFdTZwRlxudHhGQkU2WHFwSmRQQVJMNUlvVjkzcmxXQkZSbmpPMWZwT2lCTUxNRUt4K2Q3QncxR1hMWmlnSnV3bVN2dTd1MFxuekRFSUV2V1JGeEhhRGRCWHpVbTZpbmNPS3hUMU1RK1d5RzMwZGlCMUxRc05uWVlmcDhEZFIybE05bDVHdk5hcVxuVHFHNG15cDhFaWNJZWpoa01uVnAwaWVYOGoxRU5SYXdaSDhMVEVtS1lRS0JnUUQwMmNnODVmM205Q3Z2ak5Bclxuby9MNEVTWHNZdFk1M1RhYk1OaVhxbUw4OHRnUU03TGJFazZVNnhPYVhObHc4Zis0SDlvVnBrdG5hS1Z2MTNhMFxuQzlBT2ZLMUsyS0ZrZVlESlFWZndyUmxER2VlVnk0V3AzOU9vNkNTd3BIWkh4Y1FRdTZEakwrcnlsNExxUlM4cFxuaXduWUtETlUrNzZxTjJnbk5aR3VXVGhpUFFLQmdRRFJXNlJJMHk0VHpQKzg5OTlIVEZlYytPZ2hBT2FPckdVU1xuRDBRUFFvc3duRW50a3pCZGhxVmZJZitBdllDSXVKWnZZcmxmb2gyV1JZVGFzcWlqa1c2ODJURFMxakxZeUxlT1xuVExQOC9hdExwemUyeksySGJBMElCNENWSk9WZnI0WEZ4ditDSlJxN0xuWm5keWZFWnlLTDZyc2M1V2k3Z2FSU1xuQ1dwcDlVYWlHUUtCZ0hNbFI4bDd6MStoVEZnblBHNkpkMlc1aXNBVDZ2TGpXUjY2WmVGTk82Z0EvQ01DYlFZaFxuSWR0ZWdhV0NMSyswM3JGVUtWY3RFU0RjVVpDN0h4T2t5bjlGbXFrc0h4b0ZHYytMYnpPNzg3bGVvVTRNbkJzN1xuSzJxdllUSEE1ZTd5empXZ1J4VVFIOGxkL3k3MHdpMGpPY254ZmRKbFlWRGpKWlBxMlV2SW9YOXhBb0dBV25tQ1xuRzc2M3NQTHNxaHRzc0lFN2M2alZtRDJ0WlliMi9zRCtKcUlaU042aHpEdkpzUUZaUWkyTkgzUEZzbEFqSXV2RlxuTktENHJGSkt3Y0JueEpnN0JQM1BiYTRIdDB1Mmw1WnFTakROOEJuSnFBUDRFZ2dOOGFSY1d4ZmcwR01vS25wL1xuUFIwUDJraVAvdEt0cXVEdk93d3I1S2IzaGVEV3hHVXhTYTBuNHpFQ2dZRUFrbWxSbWpoVU12U3lNQkg4bllqVVxucjRYenk0eTJRRDFjczQ0K2FVYW5ES3hHVG5jSS9nUFV1TGU2RmJtbWRkOUQ0Z0hkVGRzODE5SXV5SDZQTkkyN1xuMWdUU1JVbWNSVHFHWEVUK0g5K2RkVXByQU5uaVF3dzRlOWtGNlRlVE5sbjhFNTErTDBGRUE1amRFV0FyRERYdFxuZUdqRWNwclpTYnE4NE9MWFJoNlJoeE09XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLAogICAgImNsaWVudF9lbWFpbCI6ICJuZXdzLWJvdEBhZXN0aGV0aWMtNDgyMTExLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwKICAgICJjbGllbnRfaWQiOiAiMTEwMzIzODA1MTgzNjQ1ODcyMzgzIiwKICAgICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsCiAgICAidG9rZW5fdXJpIjogImh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuIiwKICAgICJhdXRoX3Byb3ZpZGVyX3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAgICJjbGllbnRfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L25ld3MtYm90JTQwYWVzdGhldGljLTQ4MjExMS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgICAidW5pdmVyc2VfZG9tYWluIjogImdvb2dsZWFwaXMuY29tIgp9', 'base64').toString('utf-8');

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
