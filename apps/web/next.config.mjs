/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@spinvisa/ui',
    '@spinvisa/db',
    '@spinvisa/auth',
    '@spinvisa/api-types',
    '@spinvisa/observability',
  ],
  typedRoutes: true,
};

export default nextConfig;
