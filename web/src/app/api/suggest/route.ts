
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
        const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key.replace(/\\n/g, '\n'), // Fix escaped newlines
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // 2. Initialize Doc
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID || '', serviceAccountAuth);
        await doc.loadInfo();

        // 3. Get or Create "키워드제안" Sheet
        let sheet = doc.sheetsByTitle['키워드제안'];
        if (!sheet) {
            sheet = await doc.addSheet({
                title: '키워드제안',
                headerValues: ['제안일시', '제안 키워드', '카테고리', '제안 사유', '누적 제안 횟수', '상태']
            });
        }

        // 4. Check for duplicates and update count or append new
        const rows = await sheet.getRows();
        const existingRow = rows.find(r => r.get('제안 키워드') === keyword);

        if (existingRow) {
            const currentCount = parseInt(existingRow.get('누적 제안 횟수') || '1', 10);
            existingRow.set('누적 제안 횟수', currentCount + 1);
            existingRow.set('제안일시', new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
            await existingRow.save();
        } else {
            await sheet.addRow({
                '제안일시': new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
                '제안 키워드': keyword,
                '카테고리': category || '미지정',
                '제안 사유': reason || '-',
                '누적 제안 횟수': 1,
                '상태': '대기중'
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Suggestion Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
