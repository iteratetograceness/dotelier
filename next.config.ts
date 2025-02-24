import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'nnzpbbiqbkjjyijfropj.supabase.co',
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
