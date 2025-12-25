/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix Next.js workspace root detection warning
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  transpilePackages: ['@abel-labs/ui', '@abel-labs/types', '@abel-labs/utils'],
};

module.exports = nextConfig;














