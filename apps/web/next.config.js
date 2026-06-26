/** @type {import('next').NextConfig} */
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://learn.mantraai.cloud').replace(
  /\/$/,
  '',
);

const nextConfig = {
  // Standalone is for Docker self-hosting; Vercel uses its own Next.js output.
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  transpilePackages: ['@constel/types', '@constel/config'],
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'learn.mantraai.cloud' },
      { protocol: 'https', hostname: 'mantraai.cloud' },
      { protocol: 'https', hostname: '**.mantra.ai' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
  async redirects() {
    // Legacy / alternate hosts → canonical student platform (learn.mantraai.cloud)
    const legacyHosts = [
      'mantraai.cloud',
      'www.mantraai.cloud',
      'training-accelerator-program-api.vercel.app',
      'training-accelarator-program-api.vercel.app',
    ];

    return legacyHosts.map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: `${APP_URL}/:path*`,
      permanent: true,
    }));
  },
  async rewrites() {
    const apiUrl = (
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000'
    ).replace(/\/$/, '');

    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://mantra-learn-api.onrender.com https://learn.mantraai.cloud https://*.mantra.ai; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
