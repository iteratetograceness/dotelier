import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        hostname: 'nnzpbbiqbkjjyijfropj.supabase.co',
        protocol: 'https',
        port: '',
        pathname: '/**',
      },
      {
        hostname: 'replicate.delivery',
        protocol: 'https',
        port: '',
        pathname: '/**',
      },
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
  webpack: (config) => {
    config.externals.push({
      sharp: 'commonjs sharp',
    })
    return config
  },
}

export default nextConfig
