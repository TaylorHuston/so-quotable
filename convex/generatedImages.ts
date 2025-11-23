import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get all generated images for a quote (uses by_quote index)
 */
export const getByQuote = query({
  args: {
    quoteId: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generatedImages")
      .withIndex("by_quote", (q) => q.eq("quoteId", args.quoteId))
      .collect();
  },
});

/**
 * Get generated images expiring within specified days (uses by_expires index)
 * @param days - Number of days to look ahead (default: 7)
 */
export const getExpiringSoon = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 7;
    const now = Date.now();
    const expirationThreshold = now + days * 24 * 60 * 60 * 1000;

    return await ctx.db
      .query("generatedImages")
      .withIndex("by_expires", (q) =>
        q.gte("expiresAt", now).lt("expiresAt", expirationThreshold)
      )
      .collect();
  },
});

/**
 * Create a new generated image with validation
 */
export const create = mutation({
  args: {
    quoteId: v.id("quotes"),
    imageId: v.id("images"),
    cloudinaryId: v.string(),
    url: v.string(),
    transformation: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Basic validation
    if (!args.cloudinaryId.trim()) {
      throw new Error("Cloudinary ID is required and cannot be empty");
    }
    if (!args.url.trim()) {
      throw new Error("Image URL is required and cannot be empty");
    }
    if (!args.transformation.trim()) {
      throw new Error("Transformation is required and cannot be empty");
    }

    // Verify quote exists
    const quote = await ctx.db.get(args.quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    // Verify image exists
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Image not found");
    }

    const generatedImageId = await ctx.db.insert("generatedImages", {
      quoteId: args.quoteId,
      imageId: args.imageId,
      cloudinaryId: args.cloudinaryId.trim(),
      url: args.url.trim(),
      transformation: args.transformation.trim(),
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });

    return generatedImageId;
  },
});

/**
 * Remove a generated image (hard delete)
 */
export const remove = mutation({
  args: {
    id: v.id("generatedImages"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
