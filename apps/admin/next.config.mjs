const api = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Lets `next dev` be opened through a proxied preview host. Set in .env for local tunnels.
  allowedDevOrigins: (process.env.ALLOWED_DEV_ORIGINS ?? '').split(',').filter(Boolean),
  async rewrites() {
    // Browsers only ever call same-origin /api/*; the web server forwards to the API.
    return [{ source: '/api/:path*', destination: `${api}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
