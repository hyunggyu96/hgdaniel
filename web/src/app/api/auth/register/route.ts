import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
    buildSessionCookie,
    createSessionToken,
    hashPassword,
    validatePassword,
    validateUsername,
} from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const ip = getClientIp(request.headers);
        const { allowed, retryAfterMs } = await rateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 60_000 });
        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } },
            );
        }

        const body = await request.json();
        const usernameRaw = String(body?.username || '');
        const password = String(body?.password || '');
        const email = String(body?.email || '').trim().toLowerCase();
        const birthYear = Number(body?.birthYear) || 0;
        const agreedPrivacy = !!body?.agreedPrivacy;
        const agreedTerms = !!body?.agreedTerms;

        const usernameCheck = validateUsername(usernameRaw);
        if (!usernameCheck.ok) {
            return NextResponse.json({ error: usernameCheck.reason }, { status: 400 });
        }
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.ok) {
            return NextResponse.json({ error: passwordCheck.reason }, { status: 400 });
        }

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
        }

        // Validate birth year
        const currentYear = new Date().getFullYear();
        if (!birthYear || birthYear < 1900 || birthYear > currentYear) {
            return NextResponse.json({ error: 'Valid birth year is required' }, { status: 400 });
        }

        // Validate consent
        if (!agreedPrivacy || !agreedTerms) {
            return NextResponse.json({ error: 'You must agree to the Terms of Service and Privacy Policy' }, { status: 400 });
        }

        const username = usernameCheck.username;

        // Check username uniqueness
        const { data: existing } = await supabaseAdmin
            .from('accounts')
            .select('id')
            .eq('username', username)
            .maybeSingle();

        if (existing) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        }

        // Check email uniqueness
        const { data: existingEmail } = await supabaseAdmin
            .from('accounts')
            .select('id')
            .eq('email', email)
            .maybeSingle();

        if (existingEmail) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);
        const { data, error } = await supabaseAdmin
            .from('accounts')
            .insert({
                username,
                password_hash: passwordHash,
                email,
                birth_year: birthYear,
                agreed_privacy: agreedPrivacy,
                agreed_terms: agreedTerms,
            })
            .select('id, username, tier, is_admin, session_version')
            .single();

        if (error || !data) {
            console.error('[auth/register] insert error:', error);
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
        }

        const token = createSessionToken(data.id, data.username, data.session_version ?? 0);
        const response = NextResponse.json({
            user: { id: data.id, username: data.username, tier: data.tier || 'free', isAdmin: !!data.is_admin },
        });
        response.headers.set('Set-Cookie', buildSessionCookie(token));
        return response;
    } catch (error) {
        console.error('[auth/register] error', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
