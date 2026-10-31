import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Inlined into the browser bundle at build time (see src/lib/supabase.ts).
  env: {
    FORE_SUPABASE_URL: process.env.SUPABASE_URL ?? '',
    FORE_SUPABASE_KEY: process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? '',
  },
  images: { unoptimized: true },
  async redirects() {
    return [{ source: '/coach-profile', destination: '/coaches', permanent: true }];
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};

export default nextConfig;
