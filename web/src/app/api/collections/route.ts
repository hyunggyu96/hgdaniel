import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEET_ID_LOGINS || '';
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';

async function getUserSheet(userId: string) {
    if (!SHEET_ID || !SERVICE_ACCOUNT_KEY) return null;

    try {
        const cleanKey = SERVICE_ACCOUNT_KEY.trim().replace(/^['"]|['"]$/g, '');
        const creds = JSON.parse(cleanKey);

        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file',
            ],
        });

        const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();

        let sheet = doc.sheetsByTitle[userId];
        if (!sheet) {
            sheet = await doc.addSheet({
                title: userId,
                headerValues: ['시간', 'IP', '국가', '기사 제목', '링크']
            });
        }
        return sheet;
    } catch (e) {
        console.error('[GoogleSheets] Connection failed:', e);
        return null;
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('user_collections')
            .select('article_link')
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json(data.map((item: any) => item.article_link));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { userId, link, title } = await req.json();

    if (!userId || !link) {
        return NextResponse.json({ error: 'User ID and Link are required' }, { status: 400 });
    }

    try {
        // 1. Supabase
        const { error } = await supabaseAdmin
            .from('user_collections')
            .upsert({ user_id: userId, article_link: link }, { onConflict: 'user_id,article_link' });

        if (error) throw error;

        // 2. Google Sheets Sync
        const sheet = await getUserSheet(userId);
        if (sheet) {
            const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
            const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0];
            const country = req.headers.get('x-vercel-ip-country') || 'Unknown';

            await sheet.addRow({
                '시간': now,
                'IP': ip,
                '국가': country,
                '기사 제목': title || '제목 없음',
                '링크': link
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API] POST error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { userId, link } = await req.json();

    if (!userId || !link) {
        return NextResponse.json({ error: 'User ID and Link are required' }, { status: 400 });
    }

    try {
        // 1. Supabase
        const { error } = await supabaseAdmin
            .from('user_collections')
            .delete()
            .eq('user_id', userId)
            .eq('article_link', link);

        if (error) throw error;

        // 2. Google Sheets Sync (Delete Row)
        const sheet = await getUserSheet(userId);
        if (sheet) {
            const rows = await sheet.getRows();
            const rowsToDelete = rows.filter(row => row.get('링크') === link);

            for (const row of rowsToDelete) {
                await row.delete();
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API] DELETE error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
