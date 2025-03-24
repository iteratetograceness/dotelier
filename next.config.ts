import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  experimental: {
    ppr: true,
  },
  webpack: (config) => {
    // config.externals.push({
    //   sharp: 'commonjs sharp',
    // })
    return config
  },
}

export default nextConfig
