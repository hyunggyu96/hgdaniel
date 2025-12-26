
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

const DEPLOY_VERSION = '2025-12-26-T1933';
const SHEET_ID = '1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic'; // "시장조사 뉴스" 시트 ID

export async function POST(req: Request) {
    try {
        const { keyword, category, reason } = await req.json();

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        console.log(`--- [v${DEPLOY_VERSION}] Suggestion API Start ---`);

        // 1. Service Account Key - Working Logic from login-logs
        const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';
        if (!rawKey) throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is missing');

        // Proven cleaning logic from collections/route.ts
        const cleanKey = rawKey.trim().replace(/^['"]|['"]$/g, '');
        const creds = JSON.parse(cleanKey);

        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
            ],
        });

        // 2. Initialize Doc & Sheet
        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        console.log(`Connected to Spreadsheet: ${doc.title}`);

        let sheet = doc.sheetsByTitle['키워드제안'];
        if (!sheet) {
            console.log('Creating "키워드제안" sheet');
            sheet = await doc.addSheet({
                title: '키워드제안',
                headerValues: ['제안일시', '제안 키워드', '카테고리', '제안 사유', '누적 제안 횟수', '상태']
            });
        }

        // 3. Deduplication Logic
        const rows = await sheet.getRows();
        const keywordToMatch = keyword.trim();
        const existingRow = rows.find(r => r.get('제안 키워드')?.toString().trim() === keywordToMatch);

        const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        if (existingRow) {
            console.log(`Incrementing counter for: ${keywordToMatch}`);
            const currentCount = parseInt(existingRow.get('누적 제안 횟수') || '1', 10);
            existingRow.set('누적 제안 횟수', (currentCount + 1).toString());
            existingRow.set('제안일시', now);
            await existingRow.save();
        } else {
            console.log(`Adding new row for: ${keywordToMatch}`);
            await sheet.addRow({
                '제안일시': now,
                '제안 키워드': keywordToMatch,
                '카테고리': category || '미지정',
                '제안 사유': reason || '-',
                '누적 제안 횟수': '1',
                '상태': '대기중'
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('CRITICAL Suggestion Error:', error);
        return NextResponse.json({
            error: error.message,
            version: DEPLOY_VERSION
        }, { status: 500 });
    }
}
