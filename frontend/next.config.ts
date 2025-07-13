import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.clerk.dev https://*.clerk.dev https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline' https://cdn.clerk.dev https://rsms.me",
              "img-src 'self' data: https: https://clerk.dev https://*.clerk.dev",
              "font-src 'self' https://rsms.me https://cdn.clerk.dev https://*.clerk.dev",
              "connect-src 'self' https://api.microcms.io https://api.clerk.dev https://*.clerk.dev https://*.clerk.accounts.dev https://clerk-telemetry.com http://localhost:* ws://localhost:*",
              "frame-src 'self' https://clerk.dev https://*.clerk.dev",
              "worker-src 'self' blob:",
              "media-src 'self' blob:",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;