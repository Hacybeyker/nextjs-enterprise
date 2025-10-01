import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'consoleminis3.cosorio.dev',
        // No especificar puerto para HTTPS (usa 443 por defecto)
        pathname: '/nextjs-enterprise/**',
      },
    ],
  },
};

export default nextConfig;
