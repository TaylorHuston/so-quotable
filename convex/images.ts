import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get a single image by ID
 */
export const get = query({
  args: {
    id: v.id("images"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get all images for a person (uses by_person index)
 */
export const getByPerson = query({
  args: {
    personId: v.id("people"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("images")
      .withIndex("by_person", (q) => q.eq("personId", args.personId))
      .collect();
  },
});

/**
 * Create a new image with validation
 * Note: Primary image constraint deferred for MVP (use single image per person)
 */
export const create = mutation({
  args: {
    personId: v.id("people"),
    cloudinaryId: v.string(),
    url: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    source: v.optional(v.string()),
    license: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Basic validation
    if (!args.cloudinaryId.trim()) {
      throw new Error("Cloudinary ID is required and cannot be empty");
    }
    if (!args.url.trim()) {
      throw new Error("Image URL is required and cannot be empty");
    }

    // Verify person exists
    const person = await ctx.db.get(args.personId);
    if (!person) {
      throw new Error("Person not found");
    }

    const imageId = await ctx.db.insert("images", {
      personId: args.personId,
      cloudinaryId: args.cloudinaryId.trim(),
      url: args.url.trim(),
      width: args.width,
      height: args.height,
      source: args.source,
      license: args.license,
      createdAt: Date.now(),
    });

    return imageId;
  },
});

/**
 * Remove an image (hard delete)
 */
export const remove = mutation({
  args: {
    id: v.id("images"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
