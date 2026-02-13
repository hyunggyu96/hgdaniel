import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEET_ID_LOGINS || '';
const SERVICE_ACCOUNT_KEY_B64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64 || '';
const TARGET_SHEET_TITLE = 'UserCollections_v2'; // Upgraded with IP tracking

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
    const { userId } = req.method === 'GET' ? req.query : req.body;
    
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    
    try {
        const doc = await getDoc();
        let sheet = doc.sheetsByTitle[TARGET_SHEET_TITLE];
        
        // Auto-create unified sheet
        if (!sheet) {
            sheet = await doc.addSheet({ title: TARGET_SHEET_TITLE, headerValues: ['UserID', 'IP', 'Title', 'URL', 'Date', 'AddedAt'] });
        }

        // GET: Filter rows by UserID
        if (req.method === 'GET') {
            const rows = await sheet.getRows();
            const userRows = rows.filter(r => r.get('UserID') === userId);
            const links = userRows.map(r => r.get('URL')).filter(Boolean);
            return res.status(200).json(links);
        }

        // POST: Add row with UserID & IP
        if (req.method === 'POST') {
            const { link, title } = req.body;
            if (!link) return res.status(400).json({ error: 'Missing link' });
            
            // Capture IP
            let ip = ((req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()) || '';
            if (!ip && typeof req.headers['x-real-ip'] === 'string') ip = req.headers['x-real-ip'];
            if (!ip) ip = 'unknown';

            // Check existence for THIS user
            const rows = await sheet.getRows();
            const exists = rows.find(r => r.get('UserID') === userId && r.get('URL') === link);
            
            if (!exists) {
                const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
                // @ts-ignore
                await sheet.addRow({
                    'UserID': userId,
                    'IP': ip,
                    'Title': title || 'No Title',
                    'URL': link,
                    'Date': new Date().toISOString().split('T')[0],
                    'AddedAt': now
                }, { insert: true });
            }
            return res.status(200).json({ success: true });
        }

        // DELETE: Remove row for THIS user
        if (req.method === 'DELETE') {
            const { link } = req.body;
            const rows = await sheet.getRows();
            const rowToDelete = rows.find(r => r.get('UserID') === userId && r.get('URL') === link);
            if (rowToDelete) {
                await rowToDelete.delete();
            }
            return res.status(200).json({ success: true });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (e: any) {
        console.error('Collections API Error:', e);
        return res.status(500).json({ error: e.message });
    }
}
