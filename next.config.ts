import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/track-order",
        destination: "/track",
        permanent: true,
      },
      {
        source: "/orders",
        destination: "/track",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
