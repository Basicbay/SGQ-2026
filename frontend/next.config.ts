import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
    return [
      {
        source: "/uploads/:filename",
        destination: `${backendUrl}/upload/:filename`,
      },
    ];
  },
};

export default nextConfig;
