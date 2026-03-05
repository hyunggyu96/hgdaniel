/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable Gzip compression for smaller, faster API responses and static assets.
    compress: true,

    // Standard Next.js optimizations
    reactStrictMode: true,

    eslint: {
        ignoreDuringBuilds: true,
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://vercel.live wss://ws-us3.pusher.com; frame-ancestors 'none';" },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
