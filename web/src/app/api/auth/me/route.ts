import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromNextRequest } from '@/lib/authSession';

export async function GET(request: NextRequest) {
    const user = await getAuthUserFromNextRequest(request);
    if (!user) {
        return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user }, { status: 200 });
}
