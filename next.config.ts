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
  // Environment variable validation will be added when Convex is installed
  // This ensures build fails early if required env vars are missing
};

export default nextConfig;
