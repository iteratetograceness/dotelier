import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'img.recraft.ai',
        protocol: 'https',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    ppr: true,
  },
}

export default nextConfig
