/**
 * Upload Presets Verification Script
 *
 * Verifies that the required upload presets exist and are accessible.
 *
 * Usage: npx tsx scripts/verify-upload-presets.ts
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

async function verifyUploadPresets() {
  console.log("🔍 Verifying Cloudinary upload presets...\n");

  const requiredPresets = ["base-images", "generated-images"];

  try {
    // Fetch all upload presets
    const result = await cloudinary.api.upload_presets({ max_results: 100 });
    const presets = result.presets;

    console.log(`📋 Found ${presets.length} upload preset(s) in your account\n`);

    // Check for required presets
    for (const presetName of requiredPresets) {
      const preset = presets.find((p: any) => p.name === presetName);

      if (preset) {
        console.log(`✅ "${presetName}" preset found`);
        console.log(`   Signing Mode: ${preset.unsigned ? "Unsigned" : "Signed"}`);
        console.log(`   Folder: ${preset.folder || "(none)"}`);
        console.log(`   Use Filename: ${preset.use_filename || false}`);
        console.log(`   Unique Filename: ${preset.unique_filename || false}\n`);
      } else {
        console.log(`❌ "${presetName}" preset NOT found`);
        console.log(`   Please create this preset in your Cloudinary dashboard\n`);
      }
    }

    // Check if all required presets exist
    const allPresetsExist = requiredPresets.every((presetName) =>
      presets.some((p: any) => p.name === presetName)
    );

    if (allPresetsExist) {
      console.log("✅ All required upload presets are configured!\n");
      console.log("📝 Phase 1 completion status:");
      console.log("   ✅ Cloudinary account created");
      console.log("   ✅ Dependencies installed (next-cloudinary, cloudinary)");
      console.log("   ✅ Environment variables configured");
      console.log("   ✅ Upload presets created");
      console.log("   ✅ API connection verified\n");
      console.log("🎉 Phase 1 is complete! Ready for Phase 1a.\n");
    } else {
      console.log("⚠️  Some upload presets are missing. Please create them in your Cloudinary dashboard.\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Failed to fetch upload presets\n");

    if (error instanceof Error) {
      console.error(`Error: ${error.message}\n`);
    }

    process.exit(1);
  }
}

// Run verification
verifyUploadPresets();
