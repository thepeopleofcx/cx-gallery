import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'photos.adobe.io',
        pathname: '/v2/spaces/**',
      },
      {
        protocol: 'https',
        hostname: 'lightroom.adobe.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
