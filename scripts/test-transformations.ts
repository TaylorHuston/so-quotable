/**
 * Manual Transformation Testing Script
 *
 * Generates sample Cloudinary transformation URLs for visual verification.
 * This script demonstrates how to use the transformation helpers to create
 * quote images with text overlays, backgrounds, and optimizations.
 *
 * Run: npx tsx scripts/test-transformations.ts
 */

import {
  buildImageUrl,
  addTextOverlay,
  addBackgroundOverlay,
  optimizeImage,
  resizeImage,
  type ImageTransformation,
} from "../src/lib/cloudinary-transformations";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: resolve(__dirname, "../.env.local") });

// Get cloud name from environment
const cloudName =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "YOUR_CLOUD_NAME";

console.log("\n=== Cloudinary Transformation URL Testing ===\n");
console.log(`Cloud Name: ${cloudName}\n`);

if (cloudName === "YOUR_CLOUD_NAME") {
  console.error(
    "❌ ERROR: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set in .env.local"
  );
  console.error("   Please set it before running this script.\n");
  process.exit(1);
}

// Example 1: Basic resize and optimization
console.log("1. Basic Image Resize & Optimization");
console.log("=====================================");
const basicTransformations: ImageTransformation[] = [
  resizeImage(800, 600),
  optimizeImage(),
];
const basicUrl = buildImageUrl(
  "so-quotable/people/example-person",
  basicTransformations,
  cloudName
);
console.log("Transformations:", basicTransformations);
console.log("URL:", basicUrl);
console.log(
  "Expected: 800x600 image, auto format (WebP for Chrome), auto quality\n"
);

// Example 2: Simple quote with centered text
console.log("2. Simple Quote with Centered Text");
console.log("===================================");
const simpleQuoteTransformations: ImageTransformation[] = [
  resizeImage(1200, 630), // Social media size (Twitter/Facebook)
  addTextOverlay("Be yourself; everyone else is already taken.", {
    fontFamily: "Arial",
    fontSize: 48,
    fontWeight: "bold",
    color: "ffffff",
    gravity: "center",
    maxWidth: 1000,
  }),
  optimizeImage(),
];
const simpleQuoteUrl = buildImageUrl(
  "so-quotable/people/oscar-wilde",
  simpleQuoteTransformations,
  cloudName
);
console.log("Transformations:", simpleQuoteTransformations);
console.log("URL:", simpleQuoteUrl);
console.log("Expected: 1200x630 image with centered white text, wrapped\n");

// Example 3: Quote with background overlay for readability
console.log("3. Quote with Semi-Transparent Background");
console.log("==========================================");
const backgroundQuoteTransformations: ImageTransformation[] = [
  resizeImage(1200, 630),
  addBackgroundOverlay(60), // 60% opacity black background
  addTextOverlay("The only source of knowledge is experience.", {
    fontFamily: "Arial",
    fontSize: 52,
    fontWeight: "bold",
    color: "ffffff",
    gravity: "center",
    maxWidth: 1000,
  }),
  addTextOverlay("- Albert Einstein", {
    fontFamily: "Arial",
    fontSize: 36,
    color: "ffffff",
    gravity: "south",
    yOffset: 80,
  }),
  optimizeImage(),
];
const backgroundQuoteUrl = buildImageUrl(
  "so-quotable/people/albert-einstein",
  backgroundQuoteTransformations,
  cloudName
);
console.log("Transformations:", backgroundQuoteTransformations);
console.log("URL:", backgroundQuoteUrl);
console.log(
  "Expected: Quote with semi-transparent black background, attribution at bottom\n"
);

// Example 4: Multi-line quote with special characters
console.log("4. Quote with Special Characters");
console.log("=================================");
const specialCharsTransformations: ImageTransformation[] = [
  resizeImage(1200, 630),
  addBackgroundOverlay(70, "rgb:1a1a1a"), // Dark gray background
  addTextOverlay(
    `"Two things are infinite: the universe and human stupidity; and I'm not sure about the universe."`,
    {
      fontFamily: "Arial",
      fontSize: 44,
      color: "ffffff",
      gravity: "center",
      maxWidth: 1000,
    }
  ),
  addTextOverlay("- Albert Einstein", {
    fontFamily: "Arial",
    fontSize: 32,
    color: "cccccc", // Light gray
    gravity: "south",
    yOffset: 60,
  }),
  optimizeImage(),
];
const specialCharsUrl = buildImageUrl(
  "so-quotable/people/albert-einstein",
  specialCharsTransformations,
  cloudName
);
console.log("Transformations:", specialCharsTransformations);
console.log("URL:", specialCharsUrl);
console.log(
  "Expected: Quote with quotation marks, comma, semicolon properly encoded\n"
);

// Example 5: Long quote with wrapping
console.log("5. Long Quote with Text Wrapping");
console.log("=================================");
const longQuoteTransformations: ImageTransformation[] = [
  resizeImage(1200, 900), // Taller image for more text
  addBackgroundOverlay(65, "black"),
  addTextOverlay(
    "In the end, we will remember not the words of our enemies, but the silence of our friends.",
    {
      fontFamily: "Arial",
      fontSize: 56,
      fontWeight: "bold",
      color: "ffffff",
      gravity: "center",
      maxWidth: 1000,
    }
  ),
  addTextOverlay("- Martin Luther King Jr.", {
    fontFamily: "Arial",
    fontSize: 40,
    color: "e0e0e0",
    gravity: "south",
    yOffset: 100,
  }),
  optimizeImage(),
];
const longQuoteUrl = buildImageUrl(
  "so-quotable/people/martin-luther-king",
  longQuoteTransformations,
  cloudName
);
console.log("Transformations:", longQuoteTransformations);
console.log("URL:", longQuoteUrl);
console.log("Expected: Long quote wrapped to fit within max width\n");

// Example 6: Different positioning options
console.log("6. Different Text Positioning");
console.log("==============================");
const positioningTransformations: ImageTransformation[] = [
  resizeImage(800, 1200), // Portrait orientation
  addBackgroundOverlay(50),
  addTextOverlay("Top Text", {
    fontSize: 42,
    color: "ffffff",
    gravity: "north",
    yOffset: 50,
  }),
  addTextOverlay("Middle Text", {
    fontSize: 48,
    fontWeight: "bold",
    color: "ffffff",
    gravity: "center",
  }),
  addTextOverlay("Bottom Text", {
    fontSize: 38,
    color: "ffffff",
    gravity: "south",
    yOffset: 50,
  }),
  optimizeImage(),
];
const positioningUrl = buildImageUrl(
  "so-quotable/people/example-person",
  positioningTransformations,
  cloudName
);
console.log("Transformations:", positioningTransformations);
console.log("URL:", positioningUrl);
console.log("Expected: Text at top, center, and bottom with different sizes\n");

// Example 7: High quality for print/download
console.log("7. High Quality Image (Print/Download)");
console.log("=======================================");
const highQualityTransformations: ImageTransformation[] = [
  resizeImage(2400, 1260), // Double size for high-res displays
  addBackgroundOverlay(55),
  addTextOverlay("Success is not final, failure is not fatal.", {
    fontFamily: "Arial",
    fontSize: 72,
    fontWeight: "bold",
    color: "ffffff",
    gravity: "center",
    maxWidth: 2000,
  }),
  addTextOverlay("- Winston Churchill", {
    fontFamily: "Arial",
    fontSize: 56,
    color: "ffffff",
    gravity: "south",
    yOffset: 120,
  }),
  optimizeImage("jpg", 95), // High quality JPEG
];
const highQualityUrl = buildImageUrl(
  "so-quotable/people/winston-churchill",
  highQualityTransformations,
  cloudName
);
console.log("Transformations:", highQualityTransformations);
console.log("URL:", highQualityUrl);
console.log("Expected: Large high-quality image suitable for printing\n");

// Example 8: Square format (Instagram)
console.log("8. Square Format (Instagram)");
console.log("=============================");
const squareTransformations: ImageTransformation[] = [
  resizeImage(1080, 1080, "fill"), // Instagram square
  addBackgroundOverlay(65, "rgb:2c2c2c"),
  addTextOverlay("The best time to plant a tree was 20 years ago.", {
    fontFamily: "Arial",
    fontSize: 44,
    fontWeight: "bold",
    color: "ffffff",
    gravity: "center",
    yOffset: -50,
    maxWidth: 900,
  }),
  addTextOverlay("The second best time is now.", {
    fontFamily: "Arial",
    fontSize: 40,
    color: "ffcc00", // Yellow accent
    gravity: "center",
    yOffset: 50,
  }),
  addTextOverlay("- Chinese Proverb", {
    fontFamily: "Arial",
    fontSize: 32,
    color: "cccccc",
    gravity: "south",
    yOffset: 80,
  }),
  optimizeImage(),
];
const squareUrl = buildImageUrl(
  "so-quotable/people/example-person",
  squareTransformations,
  cloudName
);
console.log("Transformations:", squareTransformations);
console.log("URL:", squareUrl);
console.log("Expected: Square 1080x1080 image with multi-line quote\n");

// Summary
console.log("\n=== Manual Verification Checklist ===\n");
console.log("✓ Copy URLs above and open in browser");
console.log("✓ Verify images display correctly");
console.log("✓ Check text is readable against background");
console.log("✓ Verify text wrapping works for long quotes");
console.log("✓ Test special characters (quotes, commas, apostrophes)");
console.log("✓ Confirm different positioning (top, center, bottom)");
console.log("✓ Check different image sizes and aspect ratios");
console.log("✓ Verify optimization (WebP in Chrome, JPEG in Safari)");
console.log(
  "\nNote: These URLs will only work if you have uploaded test images to Cloudinary"
);
console.log(
  "      with the corresponding public IDs (so-quotable/people/...).\n"
);

// Generate sample transformation strings for documentation
console.log("\n=== Sample Transformation Strings for Documentation ===\n");
console.log("Resize:", resizeImage(800, 600));
console.log("Optimize:", optimizeImage());
console.log("Background:", addBackgroundOverlay(60));
console.log(
  "Text:",
  addTextOverlay("Hello World", {
    fontSize: 48,
    color: "ffffff",
    gravity: "center",
  })
);
console.log();
