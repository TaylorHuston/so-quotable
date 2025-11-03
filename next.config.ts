import type { NextConfig } from "next";

// Validate required environment variables at build time
const requiredEnvVars = [
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(
      `Missing required environment variable: ${envVar}\n` +
        `Please check your .env.local file and ensure all variables from .env.local.example are set.`
    );
  }
}

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
};

export default nextConfig;
