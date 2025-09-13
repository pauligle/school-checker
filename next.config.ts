import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable all caching and optimizations in development
  experimental: {
    optimizeCss: false,
  },
  images: {
    unoptimized: true,
  },
  compress: false,
  generateEtags: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Simplified webpack config
  webpack: (config, { dev }) => {
    if (dev) {
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
