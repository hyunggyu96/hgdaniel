
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { keyword, category, reason } = await req.json();

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        // 1. Initialize Auth
        console.log('--- Suggestion API Start ---');
        const sheetId = (process.env.GOOGLE_SHEET_ID || '').replace(/\s/g, '');
        console.log('Sheet ID:', sheetId);

        const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // 2. Initialize Doc
        const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
        await doc.loadInfo();
        console.log('Doc title:', doc.title);

        // 3. Get or Create "키워드제안" Sheet
        let sheet = doc.sheetsByTitle['키워드제안'];
        if (!sheet) {
            console.log('Creating new sheet: 키워드제안');
            sheet = await doc.addSheet({
                title: '키워드제안',
                headerValues: ['제안일시', '제안 키워드', '카테고리', '제안 사유', '누적 제안 횟수', '상태']
            });
        }

        // 4. Check for duplicates and update count or append new
        const rows = await sheet.getRows();
        const existingRow = rows.find(r => r.get('제안 키워드') === keyword);

        if (existingRow) {
            console.log('Updating existing keyword:', keyword);
            const currentCount = parseInt(existingRow.get('누적 제안 횟수') || '1', 10);
            existingRow.set('누적 제안 횟수', currentCount + 1);
            existingRow.set('제안일시', new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
            await existingRow.save();
        } else {
            console.log('Adding new keyword:', keyword);
            await sheet.addRow({
                '제안일시': new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
                '제안 키워드': keyword,
                '카테고리': category || '미지정',
                '제안 사유': reason || '-',
                '누적 제안 횟수': 1,
                '상태': '대기중'
            });
        }

        console.log('--- Suggestion Success ---');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Suggestion Error:', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
