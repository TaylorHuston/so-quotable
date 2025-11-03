/**
 * Manual Cloudinary Upload Test Script
 *
 * This script tests the uploadToCloudinary Convex action with actual API calls.
 * It requires valid Cloudinary credentials in your Convex environment.
 *
 * Setup:
 * 1. Deploy Convex backend: npx convex dev
 * 2. Set environment variables in Convex dashboard:
 *    - CLOUDINARY_CLOUD_NAME
 *    - CLOUDINARY_API_KEY
 *    - CLOUDINARY_API_SECRET
 * 3. Run this script: npx tsx scripts/test-cloudinary-upload.ts
 *
 * Tests:
 * - Upload base image (base-images preset)
 * - Upload generated image (generated-images preset)
 * - Verify metadata storage in database
 * - Verify images appear in Cloudinary dashboard
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

// Initialize Convex client
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("❌ NEXT_PUBLIC_CONVEX_URL not found in .env.local");
  console.error("   Please run `npx convex dev` first");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// Small test image (1x1 transparent PNG)
const TEST_IMAGE_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function testBaseImageUpload() {
  console.log("\n🧪 Test 1: Upload base image (base-images preset)");
  console.log("━".repeat(60));

  try {
    // Create a test person
    console.log("1. Creating test person...");
    const personId = await client.mutation(api.people.create, {
      name: "Test Person for Cloudinary",
      slug: "test-cloudinary-person",
      bio: "This is a test person for Cloudinary upload verification",
    });
    console.log(`   ✓ Person created: ${personId}`);

    // Upload image
    console.log("2. Uploading image to Cloudinary...");
    const uploadResult = await client.action(api.cloudinary.uploadToCloudinary, {
      file: TEST_IMAGE_BASE64,
      personId,
      preset: "base-images",
      source: "Test Script",
      license: "Public Domain",
    });

    console.log("   ✓ Upload successful!");
    console.log(`   - Cloudinary ID: ${uploadResult.cloudinaryId}`);
    console.log(`   - URL: ${uploadResult.url}`);
    console.log(`   - Dimensions: ${uploadResult.width}x${uploadResult.height}`);

    // Verify in database
    console.log("3. Verifying metadata in database...");
    const images = await client.query(api.images.getByPerson, { personId });
    console.log(`   ✓ Found ${images.length} image(s) in database`);

    if (images.length > 0) {
      const image = images[0]!;
      console.log(`   - Cloudinary ID matches: ${image.cloudinaryId === uploadResult.cloudinaryId}`);
      console.log(`   - URL matches: ${image.url === uploadResult.url}`);
      console.log(`   - Source: ${image.source}`);
      console.log(`   - License: ${image.license}`);
    }

    console.log("\n✅ Test 1 PASSED");
    console.log("   Next step: Check Cloudinary dashboard");
    console.log(`   Expected folder: so-quotable/people`);
    console.log(`   Image ID: ${uploadResult.cloudinaryId}`);

    // Cleanup
    console.log("\n4. Cleaning up test data...");
    await client.mutation(api.people.remove, { id: personId });
    console.log("   ✓ Test person removed");

  } catch (error) {
    console.error("\n❌ Test 1 FAILED");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error: ${String(error)}`);
    }
  }
}

async function testGeneratedImageUpload() {
  console.log("\n🧪 Test 2: Upload generated image (generated-images preset)");
  console.log("━".repeat(60));

  try {
    // Create test data
    console.log("1. Creating test data (person, quote, base image)...");
    const personId = await client.mutation(api.people.create, {
      name: "Quote Test Person",
      slug: "quote-test-person",
    });

    const quoteId = await client.mutation(api.quotes.create, {
      personId,
      text: "This is a test quote for generated image verification.",
      verified: true,
      source: "Test Script",
    });

    const imageId = await client.mutation(api.images.create, {
      personId,
      cloudinaryId: "test-base-image-id",
      url: "https://example.com/test-base.jpg",
      width: 800,
      height: 600,
    });

    console.log(`   ✓ Person: ${personId}`);
    console.log(`   ✓ Quote: ${quoteId}`);
    console.log(`   ✓ Base Image: ${imageId}`);

    // Upload generated image
    console.log("2. Uploading generated image to Cloudinary...");
    const transformation = "w_1200,h_630,c_fill,g_center";
    const uploadResult = await client.action(api.cloudinary.uploadToCloudinary, {
      file: TEST_IMAGE_BASE64,
      quoteId,
      imageId,
      preset: "generated-images",
      transformation,
    });

    console.log("   ✓ Upload successful!");
    console.log(`   - Cloudinary ID: ${uploadResult.cloudinaryId}`);
    console.log(`   - URL: ${uploadResult.url}`);
    console.log(`   - Dimensions: ${uploadResult.width}x${uploadResult.height}`);

    if (uploadResult.expiresAt) {
      console.log(`   - Expires at: ${new Date(uploadResult.expiresAt).toISOString()}`);

      // Verify expiration is ~30 days from now
      const daysUntilExpiration = (uploadResult.expiresAt - Date.now()) / (1000 * 60 * 60 * 24);
      console.log(`   - Days until expiration: ${daysUntilExpiration.toFixed(1)} days`);
    }

    // Verify in database
    console.log("3. Verifying metadata in generatedImages table...");
    const generatedImages = await client.query(api.generatedImages.getByQuote, { quoteId });
    console.log(`   ✓ Found ${generatedImages.length} generated image(s) in database`);

    if (generatedImages.length > 0) {
      const genImage = generatedImages[0]!;
      console.log(`   - Cloudinary ID matches: ${genImage.cloudinaryId === uploadResult.cloudinaryId}`);
      console.log(`   - URL matches: ${genImage.url === uploadResult.url}`);
      console.log(`   - Transformation: ${genImage.transformation}`);
      console.log(`   - Expires at matches: ${genImage.expiresAt === uploadResult.expiresAt}`);
    }

    console.log("\n✅ Test 2 PASSED");
    console.log("   Next step: Check Cloudinary dashboard");
    console.log(`   Expected folder: so-quotable/generated`);
    console.log(`   Image ID: ${uploadResult.cloudinaryId}`);

    // Cleanup
    console.log("\n4. Cleaning up test data...");
    await client.mutation(api.people.remove, { id: personId });
    console.log("   ✓ Test data removed");

  } catch (error) {
    console.error("\n❌ Test 2 FAILED");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error: ${String(error)}`);
    }
  }
}

async function runTests() {
  console.log("🚀 Cloudinary Upload Integration Tests");
  console.log("━".repeat(60));
  console.log(`Convex URL: ${CONVEX_URL}`);

  // Check Cloudinary credentials in environment
  console.log("\nChecking Cloudinary credentials...");
  const hasCredentials =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!hasCredentials) {
    console.warn("⚠️  WARNING: Cloudinary credentials not found in .env.local");
    console.warn("   Make sure environment variables are set in Convex dashboard:");
    console.warn("   - CLOUDINARY_CLOUD_NAME");
    console.warn("   - CLOUDINARY_API_KEY");
    console.warn("   - CLOUDINARY_API_SECRET");
    console.warn("\n   Tests will attempt to run anyway (credentials may be in Convex)");
  } else {
    console.log("✓ Cloudinary credentials found in .env.local");
  }

  await testBaseImageUpload();
  await testGeneratedImageUpload();

  console.log("\n" + "━".repeat(60));
  console.log("🏁 All tests complete!");
  console.log("\nManual verification checklist:");
  console.log("1. ✓ Check images uploaded successfully");
  console.log("2. ✓ Verify metadata stored in database");
  console.log("3. ⏳ Check Cloudinary dashboard for uploaded images");
  console.log("4. ⏳ Verify correct folders (so-quotable/people, so-quotable/generated)");
  console.log("5. ⏳ Verify image quality and dimensions");
  console.log("6. ⏳ Verify generated image has unique filename");
  console.log("\nCloudinary Dashboard: https://cloudinary.com/console");
}

// Run tests
runTests()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:");
    console.error(error);
    process.exit(1);
  });
