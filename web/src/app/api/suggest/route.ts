
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

const DEPLOY_VERSION = '2025-12-26-T1926';

export async function POST(req: Request) {
    try {
        const { keyword, category, reason } = await req.json();

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        console.log(`--- [v${DEPLOY_VERSION}] Keyword Suggestion Start ---`);

        // 1. Spreadsheet ID (Strict)
        const sheetId = '1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic';

        // 2. Recursive/Bulletproof Service Account Key Parser
        let rawKeyEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';

        const bulletproofParse = (input: string): any => {
            let current = input.trim();

            // Step 1: Handle wrapping quotes
            if ((current.startsWith('"') && current.endsWith('"')) || (current.startsWith("'") && current.endsWith("'"))) {
                current = current.substring(1, current.length - 1);
            }

            // Step 2: Recursive Parse (Handles double-serialized strings)
            let result = current;
            let attempts = 0;
            while (typeof result === 'string' && attempts < 5) {
                try {
                    // Try to parse as-is
                    result = JSON.parse(result);
                } catch (e) {
                    // If parse fails, try basic sanitization for control characters and retry once
                    try {
                        const sanitized = result
                            .replace(/\\n/g, '\n')
                            .replace(/\\"/g, '"')
                            .replace(/[\u0000-\u001F]/g, (match) => match === '\n' ? '\\n' : '');
                        result = JSON.parse(sanitized);
                    } catch (innerE) {
                        // If everything fails, break and let the outer catch handle it
                        break;
                    }
                }
                attempts++;
            }

            if (typeof result !== 'object' || result === null) {
                throw new Error(`Failed to parse Service Account Key into an object. Type: ${typeof result}`);
            }
            return result;
        };

        const creds = bulletproofParse(rawKeyEnv);
        console.log('Credentials object identified successfully');

        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: (creds.private_key || '').replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // 3. Initialize Doc
        const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
        await doc.loadInfo();
        console.log(`Connected to Sheet: ${doc.title}`);

        // 4. Get/Create "키워드제안" Sheet
        let sheet = doc.sheetsByTitle['키워드제안'];
        if (!sheet) {
            console.log('Creating "키워드제안" sheet');
            sheet = await doc.addSheet({
                title: '키워드제안',
                headerValues: ['제안일시', '제안 키워드', '카테고리', '제안 사유', '누적 제안 횟수', '상태']
            });
        }

        // 5. Deduplication & Incremental Counter
        const rows = await sheet.getRows();
        const existingRow = rows.find(r => r.get('제안 키워드')?.toString().trim() === keyword.trim());

        const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        if (existingRow) {
            console.log(`Updating existing keyword: ${keyword}`);
            const currentCount = parseInt(existingRow.get('누적 제안 횟수') || '1', 10);
            existingRow.set('누적 제안 횟수', currentCount + 1);
            existingRow.set('제안일시', now);
            await existingRow.save();
        } else {
            console.log(`Adding new keyword: ${keyword}`);
            await sheet.addRow({
                '제안일시': now,
                '제안 키워드': keyword,
                '카테고리': category || '미지정',
                '제안 사유': reason || '-',
                '누적 제안 횟수': 1,
                '상태': '대기중'
            });
        }

        console.log('--- Suggestion Process Completed Successfully ---');
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('CRITICAL Suggestion Error:', error);
        return NextResponse.json({
            error: error.message,
            version: DEPLOY_VERSION
        }, { status: 500 });
    }
}
