/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix Next.js workspace root detection warning
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  transpilePackages: ['@abel-labs/ui', '@abel-labs/types', '@abel-labs/utils'],
  // ESLint configuration
  eslint: {
    // Don't fail build on ESLint errors (we have proper config, but this is a safety net)
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;














