import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = '1wA1YzPatil0qnhZk1EkS4r4Roc-Mx1I-iBSlmtyJNm8';
const SERVICE_ACCOUNT_KEY_B64 = 'eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6ImFlc3RoZXRpYy00ODIxMTEiLCJwcml2YXRlX2tleV9pZCI6ImU5ODVkZjBjM2I3N2VhOGQyM2IxN2Q1NmI2YTRhOTJmOWQ4NzJmNGQiLCJwcml2YXRlX2tleSI6Ii0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZRSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2N3Z2dTakFnRUFBb0lCQVFESVBYTUZFT3p4WWpDS1xuNnZvVnJqeUpmbS8vOHkrWi82SEFMbG9Jd1dXaFBsdUJNRC9pSy9sOFRlRTdoMVd6bjlsZ3Fsc2dDcFpiUmtsTFxuV2F2WUg4U2VrTWNiK081aDJSaHNyb1g1M3RmYklWcDFDVkJXbGJSdXhtZ1cyelJPZUlmWnduY2lYeHBwV1FOK1xucFM3QWlIaVNwMk56Yzk2VzcrVWdkMFUrT1BYa3lJZ1pRWXBFSGFVZS85MHcwSkxVa1RrSEt3OTdUcDlmM1NkRlxuVFRsQ3h0eUdrSFhLMGc1SWRDWUVJT1ZZNmxmWWhIY09TcXdmV1lvQ0w3YmNOOHBKZngxQ0VMRGdSQTlKQjB1TlxuZWhJNzAxUzhsdjdQNGdGWnVnUGlsc21rNVIzSEppYnpTbTFuZDJFWUMrSlpVWXgrRzNkckpkZWZnTjhmQ0ZwdFxuZHZDaVdqSDFBZ01CQUFFQ2dnRUFDZmc5Uk5CTjY4ckd2ZlByRmE5Q0pscGNPek1oZUpwb3RFZmFoYnNUVTA3bVxuZ1cwa2tSODlZYm9DNzlMU0tvcFg2Vjh5QUV0bXB3NjkwWG1hZTcxQkxkL3BlZlFQOG1FN3ZSV0hhQ1IzUE5yUlxuUlNoOGpvTVBvOEJQS0d3cms0aWV3dkhTdXF4ZmhVVkFUa3J0SS9ybmZlM0ZudGJ6Q3pMUWhxaEprMHFFdTZwRlxudHhGQkU2WHFwSmRQQVJMNUlvVjkzcmxXQkZSbmpPMWZwT2lCTUxNRUt4K2Q3QncxR1hMWmlnSnV3bVN2dTd1MFxuekRFSUV2V1JGeEhhRGRCWHpVbTZpbmNPS3hUMU1RK1d5RzMwZGlCMUxRc05uWVlmcDhEZFIybE05bDVHdk5hcVxuVHFHNG15cDhFaWNJZWpoa01uVnAwaWVYOGoxRU5SYXdaSDhMVEVtS1lRS0JnUUQwMmNnODVmM205Q3Z2ak5Bclxuby9MNEVTWHNZdFk1M1RhYk1OaVhxbUw4OHRnUU03TGJFazZVNnhPYVhObHc4Zis0SDlvVnBrdG5hS1Z2MTNhMFxuQzlBT2ZLMUsyS0ZrZVlESlFWZndyUmxER2VlVnk0V3AzOU9vNkNTd3BIWkh4Y1FRdTZEakwrcnlsNExxUlM4cFxuaXduWUtETlUrNzZxTjJnbk5aR3VXVGhpUFFLQmdRRFJXNlJJMHk0VHpQKzg5OTlIVEZlYytPZ2hBT2FPckdVU1xuRDBRUFFvc3duRW50a3pCZGhxVmZJZitBdllDSXVKWnZZcmxmb2gyV1JZVGFzcWlqa1c2ODJURFMxakxZeUxlT1xuVExQOC9hdExwemUyeksySGJBMElCNENWSk9WZnI0WEZ4ditDSlJxN0xuWm5keWZFWnlLTDZyc2M1V2k3Z2FSU1xuQ1dwcDlVYWlHUUtCZ0hNbFI4bDd6MStoVEZnblBHNkpkMlc1aXNBVDZ2TGpXUjY2WmVGTk82Z0EvQ01DYlFZaFxuSWR0ZWdhV0NMSyswM3JGVUtWY3RFU0RjVVpDN0h4T2t5bjlGbXFrc0h4b0ZHYytMYnpPNzg3bGVvVTRNbkJzN1xuSzJxdllUSEE1ZTd5empXZ1J4VVFIOGxkL3k3MHdpMGpPY254ZmRKbFlWRGpKWlBxMlV2SW9YOXhBb0dBV25tQ1xuRzc2M3NQTHNxaHRzc0lFN2M2alZtRDJ0WlliMi9zRCtKcUlaU042aHpEdkpzUUZaUWkyTkgzUEZzbEFqSXV2RlxuTktENHJGSkt3Y0JueEpnN0JQM1BiYTRIdDB1Mmw1WnFTakROOEJuSnFBUDRFZ2dOOGFSY1d4ZmcwR01vS25wL1xuUFIwUDJraVAvdEt0cXVEdk93d3I1S2IzaGVEV3hHVXhTYTBuNHpFQ2dZRUFrbWxSbWpoVU12U3lNQkg4bllqVVxucjRYenk0eTJRRDFjczQ0K2FVYW5ES3hHVG5jSS9nUFV1TGU2RmJtbWRkOUQ0Z0hkVGRzODE5SXV5SDZQTkkyN1xuMWdUU1JVbWNSVHFHWEVUK0g5K2RkVXByQU5uaVF3dzRlOWtGNlRlVE5sbjhFNTErTDBGRUE1amRFV0FyRERYdFxuZUdqRWNwclpTYnE4NE9MWFJoNlJoeE09XG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLCJjbGllbnRfZW1haWwiOiJuZXdzLWJvdEBhZXN0aGV0aWMtNDgyMTExLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwiY2xpZW50X2lkIjoiMTEwMzIzODA1MTgzNjQ1ODcyMzgzIiwiYXV0aF91cmkiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsInRva2VuX3VyaSI6Imh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuIiwiYXV0aF9wcm92aWRlcl94NTA5X2NlcnRfdXJsIjoiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwiY2xpZW50X3g1MDlfY2VydF91cmwiOiJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L25ld3MtYm90JTQwYWVzdGhldGljLTQ4MjExMS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVuaXZlcnNlX2RvbWFpbiI6Imdvb2dsZWFwaXMuY29tIn0=';

async function getDoc() {
    try {
        const jsonStr = Buffer.from(SERVICE_ACCOUNT_KEY_B64, 'base64').toString('utf-8');
        const creds = JSON.parse(jsonStr);
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        return doc;
    } catch (e) {
        console.error('Auth Error:', e);
        throw new Error('Auth Failed');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Frontend (LoginButton) will send: { userId, provider }
    // Or LoginTracker sends { userId, title, link } for clicks.
    // We should handle both or at least the Login one effectively.

    // Let's support generic logging.
    const body = req.body;
    const userId = body.userId || body.email;

    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    try {
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle['LoginHistory_v2'];
        if (!sheet) {
            sheet = await doc.addSheet({ title: 'LoginHistory_v2', headerValues: ['Time', 'UserID', 'Type', 'Meta', 'IP'] });
        }

        const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';

        // Determine log type
        const type = body.provider ? 'LOGIN' : (body.title ? 'CLICK' : 'UNKNOWN');
        const meta = body.provider || body.link || body.title || '';

        // @ts-ignore
        await sheet.addRow({ 'Time': now, 'UserID': userId, 'Type': type, 'Meta': meta, 'IP': ip }, { insert: true });

        return res.status(200).json({ success: true });
    } catch (e: any) {
        console.error('Log Error:', e);
        return res.status(500).json({ error: e.message });
    }
}
