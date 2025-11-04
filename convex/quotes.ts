import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List quotes with pagination and optional person filter
 * @param limit - Max number of results (default: 50)
 * @param personId - Optional filter by person
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    personId: v.optional(v.id("people")),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    if (args.personId !== undefined) {
      // Filter by person using index
      return await ctx.db
        .query("quotes")
        .withIndex("by_person", (q) => q.eq("personId", args.personId!))
        .take(limit);
    }

    // No filter - return all quotes
    return await ctx.db.query("quotes").take(limit);
  },
});

/**
 * Get quotes by person (uses by_person index)
 */
export const getByPerson = query({
  args: {
    personId: v.id("people"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("quotes")
      .withIndex("by_person", (q) => q.eq("personId", args.personId))
      .take(limit);
  },
});

/**
 * Get a quote by ID
 */
export const get = query({
  args: {
    id: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new quote with validation
 */
export const create = mutation({
  args: {
    personId: v.id("people"),
    text: v.string(),
    source: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    verified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Basic validation
    if (!args.text.trim()) {
      throw new Error("Quote text is required and cannot be empty");
    }

    // Verify person exists
    const person = await ctx.db.get(args.personId);
    if (!person) {
      throw new Error("Person not found");
    }

    const now = Date.now();
    const quoteId = await ctx.db.insert("quotes", {
      personId: args.personId,
      text: args.text.trim(),
      source: args.source,
      sourceUrl: args.sourceUrl,
      verified: args.verified ?? false,
      createdAt: now,
      updatedAt: now,
    });

    return quoteId;
  },
});

/**
 * Update a quote (supports verified flag, sets updatedAt timestamp)
 */
export const update = mutation({
  args: {
    id: v.id("quotes"),
    text: v.optional(v.string()),
    source: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    verified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Basic validation for text if provided
    if (updates.text !== undefined && !updates.text.trim()) {
      throw new Error("Quote text cannot be empty");
    }

    // Build update object
    const updateData: {
      updatedAt: number;
      text?: string;
      source?: string;
      sourceUrl?: string;
      verified?: boolean;
    } = {
      updatedAt: Date.now(),
    };

    if (updates.text !== undefined) updateData.text = updates.text.trim();
    if (updates.source !== undefined) updateData.source = updates.source;
    if (updates.sourceUrl !== undefined) updateData.sourceUrl = updates.sourceUrl;
    if (updates.verified !== undefined) updateData.verified = updates.verified;

    await ctx.db.patch(id, updateData);
    return id;
  },
});

/**
 * Remove a quote (hard delete)
 */
export const remove = mutation({
  args: {
    id: v.id("quotes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});
