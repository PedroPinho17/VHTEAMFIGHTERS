import type { NextConfig } from "next";

const apiOrigin = process.env.INTERNAL_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // Standalone precisa de symlinks (CI/Linux/Docker). No Windows local: NEXT_STANDALONE=false
  ...(process.env.NEXT_STANDALONE === "false" ? {} : { output: "standalone" as const }),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3900" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
