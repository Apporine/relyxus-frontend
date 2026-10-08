import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Applied to every response. Referrer is suppressed entirely because console URLs carry
// workspace and incident identifiers that must never reach another origin.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  // Self-hosted and air-gapped deployments run the console from a container image.
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  // The design system is consumed from source; there is no separate package build to drift.
  transpilePackages: ['@relyxus/ui'],
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

export default withNextIntl(nextConfig);
