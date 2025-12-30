import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

const SHEET_ID = '1IDFVtmhu5EtxSacRqlklZo6V_x9aB0WVZIzkIx5Wkic'; // Market Analysis

async function getAuth() {
    // 전략: 환경 변수 파싱을 시도하지 않고, 배포된 파일을 직접 읽는다.
    // Vercel Serverless Function 환경에서 파일 위치를 찾는다.

    // 1. 로컬 및 Vercel 배포 경로 후보군
    const possiblePaths = [
        path.join(process.cwd(), 'collector', 'service_account.json'), // 로컬/Vercel 기본
        path.join(process.cwd(), '..', 'collector', 'service_account.json'), // 상위 폴더
        path.join(__dirname, '..', '..', '..', 'collector', 'service_account.json'), // 빌드된 깊은 경로에서 탈출
        '/var/task/collector/service_account.json' // AWS Lambda 절대 경로
    ];

    let creds: any = null;
    let loadedPath = '';

    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            try {
                const config = JSON.parse(fs.readFileSync(p, 'utf8'));
                // 파일 내용 유효성 검사
                if (config.private_key && config.client_email) {
                    creds = config;
                    loadedPath = p;
                    break;
                }
            } catch (e) {
                console.warn(`Found file at ${p} but failed to parse:`, e);
            }
        }
    }

    // 파일 찾기 실패 시 최후의 수단으로 환경 변수 사용 (하지만 여기에 의존하지 않음)
    if (!creds && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
            const s = process.env.GOOGLE_SERVICE_ACCOUNT_KEY.trim().replace(/^['"]|['"]$/g, '');
            // 2중 파싱 시도 없이 딱 한 번만 깔끔하게
            creds = JSON.parse(s);
        } catch (e) {
            console.error('Env var parse failed, and file not found.');
        }
    }

    if (!creds) {
        // 디버깅을 위해 현재 디렉토리 파일 목록을 에러 메시지에 포함
        let dirList = 'N/A';
        try { dirList = fs.readdirSync(process.cwd()).join(', '); } catch { }
        throw new Error(`Credential file not found. Checked: ${possiblePaths.join(', ')}. CWD: ${process.cwd()}. Files: ${dirList}`);
    }

    // RSA 키 포맷 정규화
    if (creds.private_key) {
        creds.private_key = creds.private_key.replace(/\\n/g, '\n');
    }

    return new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file',
        ],
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { keyword, category, reason } = req.body;
        if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

        const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';

        const auth = await getAuth();
        const doc = new GoogleSpreadsheet(SHEET_ID, auth);
        await doc.loadInfo();

        let sheet = doc.sheetsByTitle['키워드제안'];

        // 시트가 없으면 생성 (헤더 포함)
        if (!sheet) {
            sheet = await doc.addSheet({
                title: '키워드제안',
                headerValues: ['제안일시', '제안 키워드', '카테고리', '제안 사유', '누적 제안 횟수', '상태', 'IP']
            });
        }

        const rows = await sheet.getRows();
        const keywordToMatch = keyword.trim();
        const existingRow = rows.find(r => r.get('제안 키워드')?.toString().trim() === keywordToMatch);
        const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

        if (existingRow) {
            const count = parseInt(existingRow.get('누적 제안 횟수') || '1', 10);
            existingRow.set('누적 제안 횟수', (count + 1).toString());
            existingRow.set('제안일시', now);
            existingRow.set('IP', ip);
            await existingRow.save(); // 비동기 저장
        } else {
            await sheet.addRow({
                '제안일시': now,
                '제안 키워드': keywordToMatch,
                '카테고리': category || '미지정',
                '제안 사유': reason || '-',
                '누적 제안 횟수': '1',
                '상태': '대기중',
                'IP': ip
            });
        }

        return res.status(200).json({ success: true });

    } catch (e: any) {
        console.error('Suggest API Error:', e.message);
        // 에러 상세 내용을 클라이언트에 반환하여 디버깅 용이하게 함
        return res.status(500).json({ error: `Auth/Sheet Error: ${e.message}` });
    }
}
