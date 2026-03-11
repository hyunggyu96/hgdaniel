import type { NextApiRequest, NextApiResponse } from 'next';

// Debug endpoint disabled in production for security.
// It previously exposed Google Sheets credentials and stack traces.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json({
        success: true,
        message: 'Debug endpoint available in development only',
        envCheck: {
            hasSheetId: !!process.env.GOOGLE_SHEET_ID_LOGINS,
            hasServiceKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
        }
    });
}
