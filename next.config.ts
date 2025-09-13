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
  // Remove webpack config to avoid conflicts with Turbopack
};

export default nextConfig;
