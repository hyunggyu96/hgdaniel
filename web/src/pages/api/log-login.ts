import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEET_ID_LOGINS || '';
const SERVICE_ACCOUNT_KEY_B64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64 || '';

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
        // Determine log type
        const type = body.type || (body.provider ? 'LOGIN' : (body.title ? 'CLICK' : 'UNKNOWN'));
        const meta = body.provider || body.link || body.title || body.meta || '';

        // Prepend: Insert one row at index 1 (under header)
        // @ts-ignore
        await sheet.insertDimension('ROWS', { startIndex: 1, endIndex: 2 }, false); // false = don't inherit from previous row

        // Fill the inserted row with values and FORCE WHITE BACKGROUND
        await sheet.loadCells('A2:E2');
        const values = [now, userId, type, meta, ip];
        for (let i = 0; i < values.length; i++) {
            const cell = sheet.getCell(1, i);
            cell.value = values[i];
            // @ts-ignore
            cell.backgroundColor = { red: 1, green: 1, blue: 1 }; // Force White
        }
        await sheet.saveUpdatedCells();

        return res.status(200).json({ success: true });
    } catch (e: any) {
        console.error('Log Error:', e);
        return res.status(500).json({ error: e.message });
    }
}
