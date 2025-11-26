import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireOwnerOrAdmin } from "./lib/auth";

/**
 * List people with simple pagination
 * @param limit - Max number of results (default: 50)
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db.query("people").take(limit);
  },
});

/**
 * Get a person by ID
 */
export const get = query({
  args: {
    id: v.id("people"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Get a person by slug (uses by_slug index)
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("people")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Create a new person with validation
 * Requires authentication - sets createdBy to authenticated user
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    bio: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    deathDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Require authentication
    const userId = await requireAuth(ctx);

    // Basic validation
    if (!args.name.trim()) {
      throw new Error("Name is required and cannot be empty");
    }
    if (!args.slug.trim()) {
      throw new Error("Slug is required and cannot be empty");
    }

    const now = Date.now();
    const personId = await ctx.db.insert("people", {
      name: args.name.trim(),
      slug: args.slug.trim(),
      bio: args.bio,
      birthDate: args.birthDate,
      deathDate: args.deathDate,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    return personId;
  },
});

/**
 * Update a person (sets updatedAt timestamp)
 * Requires authentication and ownership (or admin role)
 */
export const update = mutation({
  args: {
    id: v.id("people"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    bio: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    deathDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Fetch existing person and verify ownership
    const person = await ctx.db.get(id);
    if (!person) {
      throw new Error("Person not found");
    }
    await requireOwnerOrAdmin(ctx, person.createdBy);

    // Basic validation for provided fields
    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error("Name cannot be empty");
    }
    if (updates.slug !== undefined && !updates.slug.trim()) {
      throw new Error("Slug cannot be empty");
    }

    // Build update object with trimmed strings
    const updateData: {
      updatedAt: number;
      name?: string;
      slug?: string;
      bio?: string;
      birthDate?: string;
      deathDate?: string;
    } = {
      updatedAt: Date.now(),
    };

    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.slug !== undefined) updateData.slug = updates.slug.trim();
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.birthDate !== undefined) updateData.birthDate = updates.birthDate;
    if (updates.deathDate !== undefined) updateData.deathDate = updates.deathDate;

    await ctx.db.patch(id, updateData);
    return id;
  },
});

/**
 * Remove a person (hard delete)
 * Requires authentication and ownership (or admin role)
 */
export const remove = mutation({
  args: {
    id: v.id("people"),
  },
  handler: async (ctx, args) => {
    // Fetch existing person and verify ownership
    const person = await ctx.db.get(args.id);
    if (!person) {
      throw new Error("Person not found");
    }
    await requireOwnerOrAdmin(ctx, person.createdBy);

    await ctx.db.delete(args.id);
    return args.id;
  },
});
