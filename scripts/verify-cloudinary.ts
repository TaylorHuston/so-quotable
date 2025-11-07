/**
 * Cloudinary API Connection Verification Script
 *
 * Purpose: Tests that Cloudinary credentials are properly configured and can
 *          authenticate with the Cloudinary API. Shows account usage statistics.
 *
 * Last Used: 2025-11-02 (TASK-003 initial Cloudinary setup verification)
 *
 * Usage: npx tsx scripts/verify-cloudinary.ts
 *
 * Output: Account plan, credits, bandwidth, storage, and resource counts.
 */

import { v2 as cloudinary } from "cloudinary";

// Load environment variables from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function verifyCloudinaryConnection() {
  console.log("🔍 Verifying Cloudinary API connection...\n");

  // Check environment variables
  console.log("📋 Environment Variables:");
  console.log(`   CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing"}`);
  console.log(`   CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing"}`);
  console.log(`   CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? "✓ Set" : "✗ Missing"}`);
  console.log(`   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing"}\n`);

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("❌ Missing required Cloudinary environment variables");
    console.error("   Please check your .env.local file\n");
    process.exit(1);
  }

  try {
    // Test API connection by fetching account usage
    console.log("🌐 Testing API connection...");
    const result = await cloudinary.api.usage();

    console.log("✅ Successfully connected to Cloudinary!\n");
    console.log("📊 Account Information:");
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`   Plan: ${result.plan || "Free"}`);
    console.log(`   Credits Used: ${result.credits?.usage || 0} / ${result.credits?.limit || "Unlimited"}`);
    console.log(`   Bandwidth Used: ${formatBytes(result.bandwidth?.usage || 0)} / ${formatBytes(result.bandwidth?.limit || 0)}`);
    console.log(`   Storage Used: ${formatBytes(result.storage?.usage || 0)} / ${formatBytes(result.storage?.limit || 0)}`);
    console.log(`   Resources: ${result.resources || 0}`);
    console.log(`   Transformations: ${result.transformations?.usage || 0} / ${result.transformations?.limit || "Unlimited"}\n`);

    console.log("✅ Cloudinary is ready to use!");
    console.log("📝 Next steps:");
    console.log("   1. Create upload presets in Cloudinary dashboard");
    console.log("   2. Test image upload via Convex action\n");

  } catch (error) {
    console.error("❌ Failed to connect to Cloudinary API\n");

    if (error instanceof Error) {
      console.error(`Error: ${error.message}\n`);

      if (error.message.includes("401")) {
        console.error("This looks like an authentication error. Please check:");
        console.error("   1. Your API credentials are correct");
        console.error("   2. Your API secret hasn't been regenerated");
        console.error("   3. You're using the credentials from the correct Cloudinary account\n");
      } else if (error.message.includes("404")) {
        console.error("This looks like a cloud name error. Please check:");
        console.error("   1. Your CLOUDINARY_CLOUD_NAME is correct");
        console.error("   2. The cloud name matches your Cloudinary dashboard\n");
      }
    }

    process.exit(1);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

// Run verification
verifyCloudinaryConnection();
