import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    // proxy.ts buffers POST bodies; default 10MB truncates large phone photos.
    proxyClientMaxBodySize: "25mb",
  },
  async redirects() {
    return [
      {
        source: "/patrocinio",
        destination: "/sponsoring",
        permanent: true,
      },
      {
        source: "/admin/patrocinio",
        destination: "/admin/sponsoring",
        permanent: true,
      },
      {
        source: "/admin/patrocinio/planes/:path*",
        destination: "/admin/sponsoring/pakete/:path*",
        permanent: true,
      },
      {
        source: "/admin/patrocinio/acciones/:path*",
        destination: "/admin/sponsoring/aktionen/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
