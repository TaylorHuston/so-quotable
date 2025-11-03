/**
 * Cloudinary integration actions
 *
 * Convex actions can call external APIs (Cloudinary) and then use mutations
 * to store results in the database.
 *
 * Pattern: Action calls Cloudinary → Returns metadata → Mutation stores in DB
 *
 * IMPORTANT: This file uses "use node" directive to run in Node.js runtime
 * because the Cloudinary SDK requires Node.js built-in modules (fs, http, crypto, etc.)
 */

"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (reads from environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary and store metadata in database
 *
 * Supports two upload presets:
 * - base-images: For permanent person photos (folder: so-quotable/people)
 * - generated-images: For temporary quote images (folder: so-quotable/generated, auto-delete: 30 days)
 *
 * @param file - Base64-encoded image data URI or public image URL
 * @param personId - Person ID (required for base-images preset)
 * @param quoteId - Quote ID (required for generated-images preset)
 * @param imageId - Base image ID (required for generated-images preset)
 * @param preset - Upload preset: "base-images" or "generated-images"
 * @param transformation - Cloudinary transformation string (required for generated-images)
 * @param source - Image source attribution (optional)
 * @param license - Image license (optional)
 * @returns Cloudinary upload metadata (cloudinaryId, url, width, height, expiresAt if applicable)
 */
export const uploadToCloudinary = action({
  args: {
    file: v.string(),
    personId: v.optional(v.id("people")),
    quoteId: v.optional(v.id("quotes")),
    imageId: v.optional(v.id("images")),
    preset: v.union(v.literal("base-images"), v.literal("generated-images")),
    transformation: v.optional(v.string()),
    source: v.optional(v.string()),
    license: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate file input
    const file = args.file.trim();
    if (!file) {
      throw new Error("File is required and cannot be empty");
    }

    // Validate preset-specific required parameters
    if (args.preset === "base-images") {
      if (!args.personId) {
        throw new Error("personId is required for base-images preset");
      }

      // Verify person exists
      const person = await ctx.runQuery(api.people.get, { id: args.personId });
      if (!person) {
        throw new Error("Person not found");
      }
    } else if (args.preset === "generated-images") {
      if (!args.quoteId || !args.imageId) {
        throw new Error("quoteId and imageId are required for generated-images preset");
      }
      if (!args.transformation) {
        throw new Error("transformation is required for generated-images preset");
      }

      // Verify quote exists
      const quote = await ctx.runQuery(api.quotes.get, { id: args.quoteId });
      if (!quote) {
        throw new Error("Quote not found");
      }

      // Verify base image exists
      const image = await ctx.runQuery(api.images.get, { id: args.imageId });
      if (!image) {
        throw new Error("Image not found");
      }
    }

    // Determine folder based on preset
    const folder = args.preset === "base-images"
      ? "so-quotable/people"
      : "so-quotable/generated";

    try {
      // Upload to Cloudinary with signed upload
      const uploadResult = await cloudinary.uploader.upload(file, {
        upload_preset: args.preset,
        folder: folder,
        resource_type: "image",
        // For generated images, enable unique filename
        ...(args.preset === "generated-images" && {
          unique_filename: true,
        }),
      });

      // Extract metadata from Cloudinary response
      const cloudinaryId = uploadResult.public_id;
      const url = uploadResult.secure_url;
      const width = uploadResult.width;
      const height = uploadResult.height;

      // Calculate expiration for generated images (30 days from now)
      const expiresAt = args.preset === "generated-images"
        ? Date.now() + (30 * 24 * 60 * 60 * 1000)
        : undefined;

      // Store metadata in appropriate database table
      if (args.preset === "base-images" && args.personId) {
        // Store in images table for base images
        await ctx.runMutation(api.images.create, {
          personId: args.personId,
          cloudinaryId,
          url,
          width,
          height,
          source: args.source,
          license: args.license,
        });

        return {
          cloudinaryId,
          url,
          width,
          height,
        };
      } else if (args.preset === "generated-images" && args.quoteId && args.imageId && args.transformation && expiresAt) {
        // Store in generatedImages table for generated images
        await ctx.runMutation(api.generatedImages.create, {
          quoteId: args.quoteId,
          imageId: args.imageId,
          cloudinaryId,
          url,
          transformation: args.transformation,
          expiresAt,
        });

        return {
          cloudinaryId,
          url,
          width,
          height,
          expiresAt,
        };
      }

      // This should never happen due to validation above, but TypeScript needs it
      throw new Error("Invalid preset or missing required parameters");

    } catch (error) {
      // Handle Cloudinary API errors
      if (error instanceof Error) {
        // Re-throw with descriptive message
        throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
      }
      throw new Error("Failed to upload image to Cloudinary: Unknown error");
    }
  },
});
