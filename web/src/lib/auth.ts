import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'hg_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14; // 14 days

type SessionPayload = {
    uid: string;
    un: string;
    iat: number;
    exp: number;
};

const HASH_ALGO = 'sha512';
const HASH_ITERATIONS = 120000;
const HASH_KEY_LEN = 64;
const HASH_SCHEME = 'pbkdf2_v1';

function toBase64Url(input: Buffer | string): string {
    return Buffer.from(input)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function fromBase64Url(input: string): Buffer {
    const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = normalized.length % 4;
    const padded = normalized + (pad ? '='.repeat(4 - pad) : '');
    return Buffer.from(padded, 'base64');
}

function getSessionSecret() {
    const secret = process.env.AUTH_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!secret) {
        throw new Error('Missing AUTH_SESSION_SECRET (or SUPABASE_SERVICE_ROLE_KEY fallback)');
    }
    return secret;
}

export function normalizeUsername(raw: string) {
    return raw.trim().toLowerCase();
}

export function validateUsername(raw: string) {
    const username = normalizeUsername(raw);
    if (!username) return { ok: false, reason: 'Username is required' };
    if (!/^[a-z0-9._-]{3,32}$/.test(username)) {
        return { ok: false, reason: 'Username must be 3-32 chars: a-z, 0-9, ., _, -' };
    }
    return { ok: true, username };
}

export function validatePassword(password: string) {
    if (!password || password.length < 8) {
        return { ok: false, reason: 'Password must be at least 8 characters' };
    }
    if (password.length > 128) {
        return { ok: false, reason: 'Password is too long' };
    }
    return { ok: true };
}

function pbkdf2(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, HASH_ITERATIONS, HASH_KEY_LEN, HASH_ALGO, (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
        });
    });
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    const hash = await pbkdf2(password, salt);
    return `${HASH_SCHEME}$${HASH_ALGO}$${HASH_ITERATIONS}$${toBase64Url(salt)}$${toBase64Url(hash)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
        const [scheme, algo, iterRaw, saltB64, hashB64] = storedHash.split('$');
        if (scheme !== HASH_SCHEME) return false;
        if (algo !== HASH_ALGO) return false;
        const iterations = Number(iterRaw);
        if (!Number.isFinite(iterations) || iterations < 10000) return false;
        const salt = fromBase64Url(saltB64);
        const expected = fromBase64Url(hashB64);

        const actual = await new Promise<Buffer>((resolve, reject) => {
            crypto.pbkdf2(password, salt, iterations, expected.length, algo, (err, derivedKey) => {
                if (err) reject(err);
                else resolve(derivedKey);
            });
        });

        if (actual.length !== expected.length) return false;
        return crypto.timingSafeEqual(actual, expected);
    } catch {
        return false;
    }
}

export function createSessionToken(userId: string, username: string): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: SessionPayload = {
        uid: userId,
        un: username,
        iat: now,
        exp: now + SESSION_TTL_SECONDS,
    };
    const payloadEncoded = toBase64Url(JSON.stringify(payload));
    const signature = crypto
        .createHmac('sha256', getSessionSecret())
        .update(payloadEncoded)
        .digest();
    return `${payloadEncoded}.${toBase64Url(signature)}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
    if (!token) return null;
    const [payloadEncoded, sigEncoded] = token.split('.');
    if (!payloadEncoded || !sigEncoded) return null;

    try {
        const expectedSig = crypto
            .createHmac('sha256', getSessionSecret())
            .update(payloadEncoded)
            .digest();
        const receivedSig = fromBase64Url(sigEncoded);
        if (expectedSig.length !== receivedSig.length) return null;
        if (!crypto.timingSafeEqual(expectedSig, receivedSig)) return null;

        const payload = JSON.parse(fromBase64Url(payloadEncoded).toString('utf8')) as SessionPayload;
        const now = Math.floor(Date.now() / 1000);
        if (!payload.uid || !payload.un || !payload.exp || payload.exp < now) return null;
        return payload;
    } catch {
        return null;
    }
}

export function parseCookieHeader(cookieHeader?: string | null): Record<string, string> {
    const result: Record<string, string> = {};
    if (!cookieHeader) return result;
    for (const chunk of cookieHeader.split(';')) {
        const [rawKey, ...rawValueParts] = chunk.trim().split('=');
        if (!rawKey) continue;
        const rawValue = rawValueParts.join('=') || '';
        try {
            result[rawKey] = decodeURIComponent(rawValue);
        } catch {
            result[rawKey] = rawValue;
        }
    }
    return result;
}

export function buildSessionCookie(token: string) {
    const secure = process.env.NODE_ENV === 'production';
    return [
        `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        `Max-Age=${SESSION_TTL_SECONDS}`,
        secure ? 'Secure' : '',
    ]
        .filter(Boolean)
        .join('; ');
}

export function buildClearSessionCookie() {
    const secure = process.env.NODE_ENV === 'production';
    return [
        `${SESSION_COOKIE_NAME}=`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=0',
        secure ? 'Secure' : '',
    ]
        .filter(Boolean)
        .join('; ');
}
