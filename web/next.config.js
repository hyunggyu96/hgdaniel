const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable Gzip compression for smaller, faster API responses and static assets.
    compress: true,

    // Standard Next.js optimizations
    reactStrictMode: true,

    // Ensuring consistent response headers for caching if needed

    eslint: {
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
// module.exports = withSentryConfig(
//     nextConfig,
//     {
//         // https://github.com/getsentry/sentry-webpack-plugin#options
//         silent: true,
//         org: "a-l9b",
//         project: "javascript-nextjs",
//         dryRun: true,
//     },
//     {
//         // For all available options, see:
//         // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
//         widenClientFileUpload: true,
//         transpileClientSDK: true,
//         tunnelRoute: "/monitoring",
//         hideSourceMaps: true,
//         disableLogger: true,
//         automaticVercelMonitors: true,
//     }
// );
