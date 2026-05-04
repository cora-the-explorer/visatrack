/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@visa-track/ui',
    '@visa-track/db',
    '@visa-track/auth',
    '@visa-track/api-types',
    '@visa-track/observability',
  ],
  typedRoutes: true,
};

export default nextConfig;
