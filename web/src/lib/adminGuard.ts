import { NextResponse } from 'next/server';
import type { AuthUser } from './authSession';

export function requireAdmin(user: AuthUser | null): NextResponse | null {
    if (!user) {
        return NextResponse.json({ error: 'Login required' }, { status: 401 });
    }
    if (!user.isAdmin) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return null;
}
