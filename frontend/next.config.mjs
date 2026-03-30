import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.js");

// Environment validation (runs at build time and dev server start)
const requiredEnvVars = [
  "NEXT_PUBLIC_API_URL",
];

const missingVars = requiredEnvVars.filter(
  (name) => !process.env[name]
);

if (missingVars.length > 0) {
  console.warn(
    `\n⚠️  Missing recommended environment variables:\n` +
    missingVars.map((v) => `   - ${v}`).join("\n") +
    `\n   Defaults will be used.\n`
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // 1. SECURITY HEADERS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https://*;
              connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'} ws://localhost:*;
              media-src 'self';
              object-src 'none';
              frame-ancestors 'none';
              base-uri 'self';
              form-action 'self';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },

  // 2. API REWRITES (PROXY)
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },

  // 3. IMAGE DOMAINS
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 4. TURBOPACK (faster builds)
  turbopack: {},
};

export default withNextIntl(nextConfig);
