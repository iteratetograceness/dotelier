import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@techstark/opencv-js'],
  turbopack: {
    resolveAlias: {
      // Required for @techstark/opencv-js in browser - provide empty stubs
      fs: { browser: './lib/unfake/empty.ts' },
      path: { browser: './lib/unfake/empty.ts' },
      crypto: { browser: './lib/unfake/empty.ts' },
    },
  },
  webpack: (config) => {
    // Required for @techstark/opencv-js in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    }
    return config
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        hostname: 'l34ak679fl.ufs.sh',
        protocol: 'https',
        port: '',
        pathname: '/**',
      },
      {
        hostname: 'lh3.googleusercontent.com',
        protocol: 'https',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
  cacheComponents: true,
}

export default nextConfig
