import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEET_ID_MARKET || '';
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
        console.error('Suggest Auth Error:', e);
        throw new Error('Auth Failed');
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { keyword, category, reason, userId } = req.body;

        // 로그인 사용자만 제안 가능
        if (!userId) return res.status(401).json({ error: '로그인이 필요합니다.' });
        if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
        const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        const keywordToMatch = keyword.trim();

        const doc = await getDoc();

        // ============================================
        // 1. 제안이력 시트: 모든 제안 기록 (개별 로그)
        // ============================================
        let historySheet = doc.sheetsByTitle['제안이력'];
        if (!historySheet) {
            historySheet = await doc.addSheet({
                title: '제안이력',
                headerValues: ['제안일시', '제안자', '키워드', '카테고리', '제안 사유', 'IP']
            });
        }

        // Prepend: 항상 새 행 추가
        // @ts-ignore
        await historySheet.insertDimension('ROWS', { startIndex: 1, endIndex: 2 }, false);
        await historySheet.loadCells('A2:F2');
        const historyValues = [now, userId, keywordToMatch, category || '미지정', reason || '-', ip];
        for (let i = 0; i < historyValues.length; i++) {
            const cell = historySheet.getCell(1, i);
            cell.value = historyValues[i];
            // @ts-ignore
            cell.backgroundColor = { red: 1, green: 1, blue: 1 };
        }
        await historySheet.saveUpdatedCells();

        // ============================================
        // 2. 키워드제안 시트: 키워드별 요약 (중복 없음)
        // ============================================
        let summarySheet = doc.sheetsByTitle['키워드제안'];
        if (!summarySheet) {
            summarySheet = await doc.addSheet({
                title: '키워드제안',
                headerValues: ['키워드', '총 제안 횟수', '제안자 목록', '상태']
            });
        }

        const rows = await summarySheet.getRows();
        const existingRow = rows.find(r => r.get('키워드')?.toString().trim() === keywordToMatch);

        if (existingRow) {
            // 기존 키워드: 횟수 증가 + 제안자 추가
            const count = parseInt(existingRow.get('총 제안 횟수') || '1', 10);
            const existingSuggesters = existingRow.get('제안자 목록')?.toString() || '';

            // 제안자 목록에 없으면 추가
            const suggesterList = existingSuggesters.split(',').map((s: string) => s.trim()).filter(Boolean);
            if (!suggesterList.includes(userId)) {
                suggesterList.push(userId);
            }

            existingRow.set('총 제안 횟수', (count + 1).toString());
            existingRow.set('제안자 목록', suggesterList.join(', '));
            await existingRow.save();
        } else {
            // 새 키워드: prepend
            // @ts-ignore
            await summarySheet.insertDimension('ROWS', { startIndex: 1, endIndex: 2 }, false);
            await summarySheet.loadCells('A2:D2');
            const summaryValues = [keywordToMatch, '1', userId, '대기중'];
            for (let i = 0; i < summaryValues.length; i++) {
                const cell = summarySheet.getCell(1, i);
                cell.value = summaryValues[i];
                // @ts-ignore
                cell.backgroundColor = { red: 1, green: 1, blue: 1 };
            }
            await summarySheet.saveUpdatedCells();
        }

        return res.status(200).json({ success: true });

    } catch (e: any) {
        console.error('Suggest API Error:', e.message);
        return res.status(500).json({ error: e.message });
    }
}

