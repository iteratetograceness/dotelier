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
}

export default nextConfig
