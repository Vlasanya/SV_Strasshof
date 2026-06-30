import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    // proxy.ts buffers POST bodies; default 10MB truncates large phone photos.
    proxyClientMaxBodySize: "25mb",
  },
};

export default nextConfig;
