import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // TODO(TASK-005): Add runtime environment variable validation
  // Convex validates NEXT_PUBLIC_CONVEX_URL at build time via client initialization
};

export default nextConfig;
