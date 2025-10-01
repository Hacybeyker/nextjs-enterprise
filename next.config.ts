import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'minis3.cosorio.dev',
        port: '9000', // Puerto API de MinIO (HTTP)
        pathname: '/nextjs-enterprise/**',
      },
    ],
  },
};

export default nextConfig;
