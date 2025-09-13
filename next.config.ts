import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable all caching and optimizations in development
  experimental: {
    optimizeCss: false,
  },
  turbopack: {
    // Turbopack configuration
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    unoptimized: true,
  },
  compress: false,
  generateEtags: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Only use webpack config when not using Turbopack
  webpack: (config, { dev, isServer }) => {
    if (dev && !process.env.TURBOPACK) {
      config.cache = false;
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
