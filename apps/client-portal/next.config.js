/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix Next.js workspace root detection warning
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  transpilePackages: ['@abel-labs/ui', '@abel-labs/types', '@abel-labs/utils'],
  webpack: (config, { dev, isServer }) => {
    // Fix for webpack module loading issues in dev mode
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
      };
      
      // Improve HMR reliability
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    return config;
  },
  // Improve dev server reliability
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;






