import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEET_ID_LOGINS || '';
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (!SHEET_ID) throw new Error('SHEET_ID is missing');
        if (!SERVICE_ACCOUNT_KEY) throw new Error('SERVICE_ACCOUNT_KEY is missing');

        const cleanKey = SERVICE_ACCOUNT_KEY.trim().replace(/^['"]|['"]$/g, '');
        const creds = JSON.parse(cleanKey);

        const auth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, auth);
        await doc.loadInfo();

        const titles = doc.sheetsByIndex.map(s => s.title);
        return res.status(200).json({
            success: true,
            sheetTitle: doc.title,
            availableSheets: titles,
            envCheck: {
                hasId: !!SHEET_ID,
                hasKey: !!SERVICE_ACCOUNT_KEY,
                keyFirstChars: cleanKey.substring(0, 20) + "..."
            }
        });
    } catch (e: any) {
        return res.status(500).json({ success: false, error: e.message, stack: e.stack });
    }
}
