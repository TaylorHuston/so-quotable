import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Check if a user exists with the given email
 *
 * Used for duplicate email detection during registration.
 * Returns the user if found, null otherwise.
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Query by email index (case-insensitive)
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email.toLowerCase()))
      .first();

    return user;
  },
});

/**
 * Get the current authenticated user's profile
 *
 * Returns the user profile if authenticated, null otherwise.
 * Uses getAuthUserId() from Convex Auth (recommended approach).
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user ID using Convex Auth helper
    const userId = await getAuthUserId(ctx);

    if (userId === null) {
      return null;
    }

    // Get user directly by ID (more efficient than query + filter)
    const user = await ctx.db.get(userId);

    if (!user) {
      return null;
    }

    // Return user profile
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      slug: user.slug,
      role: user.role,
      emailVerified: user.emailVerificationTime !== undefined,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});
