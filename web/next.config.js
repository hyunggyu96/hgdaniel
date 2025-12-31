const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable Gzip compression for smaller, faster API responses and static assets.
    compress: true,

    // Standard Next.js optimizations
    reactStrictMode: true,

    // Ensuring consistent response headers for caching if needed
    async headers() {
        return [
            {
                source: '/api/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=30' },
                ],
            },
        ];
    },
};

module.exports = withSentryConfig(
    nextConfig,
    {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options
        silent: true,
        org: "a-l9b",
        project: "javascript-nextjs",
    },
    {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
        widenClientFileUpload: true,
        transpileClientSDK: true,
        tunnelRoute: "/monitoring",
        hideSourceMaps: true,
        disableLogger: true,
        automaticVercelMonitors: true,
    }
);
