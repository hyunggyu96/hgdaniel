
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

const DEPLOY_VERSION = '2025-12-26-T1922';

export async function POST(req: Request) {
    try {
        const { keyword, category, reason } = await req.json();

        if (!keyword) {
            return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
        }

        // 1. Initialize Auth
        console.log(`--- Suggestion API Start [v${DEPLOY_VERSION}] ---`);
        const sheetId = (process.env.GOOGLE_SHEET_ID || '').trim().replace(/\s/g, '');

        let rawKey = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '').trim();

        // Remove surrounding quotes if they exist (common Vercel/Env issue)
        if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
            rawKey = rawKey.substring(1, rawKey.length - 1);
        } else if (rawKey.startsWith("'") && rawKey.endsWith("'")) {
            rawKey = rawKey.substring(1, rawKey.length - 1);
        }

        const tryParse = (jsonString: string) => {
            // Log first 30 chars for debugging (safe, as it's usually {"type":"service_account")
            console.log('Parsing Key Start:', jsonString.substring(0, 30));

            try {
                // Attempt 1: Standard Parse
                return JSON.parse(jsonString);
            } catch (e1: any) {
                console.log(`Attempt 1 failed: ${e1.message}`);

                try {
                    // Attempt 2: Sanitize control characters (Literal Newlines, etc.)
                    // This fixes "Bad control character in string literal"
                    const sanitized = jsonString.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
                        if (match === '\n') return '\\n';
                        if (match === '\r') return '\\r';
                        if (match === '\t') return '\\t';
                        return ''; // Strip other control chars
                    });
                    return JSON.parse(sanitized);
                } catch (e2: any) {
                    console.log(`Attempt 2 failed: ${e2.message}`);

                    try {
                        // Attempt 3: If it's double-escaped (common in some env setups)
                        const unescaped = jsonString
                            .replace(/\\n/g, '\n')
                            .replace(/\\"/g, '"')
                            .replace(/\\\\/g, '\\');
                        // Then re-sanitize for control characters
                        const finalSanitized = unescaped.replace(/[\u0000-\u001F]/g, (m) => m === '\n' ? '\\n' : '');
                        return JSON.parse(finalSanitized);
                    } catch (e3: any) {
                        console.error('Final Parser Exhausted');
                        throw new Error(`Auth JSON Error: ${e3.message} (Version: ${DEPLOY_VERSION})`);
                    }
                }
            }
        };

        const creds = tryParse(rawKey);

        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: (creds.private_key || '').replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // 2. Initialize Doc
        const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
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
        console.error('Final Error Handler:', error);
        return NextResponse.json({
            error: error.message,
            version: DEPLOY_VERSION
        }, { status: 500 });
    }
}
