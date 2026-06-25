/** @type {import('next').NextConfig} */
const LEARN_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://learn.mantraai.cloud').replace(
  /\/$/,
  '',
);

const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@constel/types', '@constel/config'],
  devIndicators: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async redirects() {
    // Apex + legacy hosts → canonical student subdomain (learn.mantraai.cloud)
    const legacyHosts = [
      'mantraai.cloud',
      'www.mantraai.cloud',
      'training-accelerator-program-api.vercel.app',
      'training-accelarator-program-api.vercel.app',
    ];

    return legacyHosts.map((host) => ({
      source: '/:path*',
      has: [{ type: 'host', value: host }],
      destination: `${LEARN_URL}/:path*`,
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
        ],
      },
    ];
  },
};

module.exports = nextConfig;
