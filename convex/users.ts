import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * DEBUG: Compare both auth APIs to diagnose the issue
 */
export const debugAuth = query({
  args: {},
  handler: async (ctx) => {
    // Try the old API
    const identity = await ctx.auth.getUserIdentity();
    console.log("[debugAuth] identity:", identity);

    // Try the new API
    const userId = await getAuthUserId(ctx);
    console.log("[debugAuth] userId:", userId);

    // Check LocalStorage tokens (can't access from backend, but log what we have)
    console.log("[debugAuth] ctx.auth:", Object.keys(ctx.auth));

    return {
      identityExists: identity !== null,
      identitySubject: identity?.subject || null,
      userId: userId,
      userIdExists: userId !== null,
    };
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

    console.log("[getCurrentUser] userId:", userId);

    if (userId === null) {
      console.log("[getCurrentUser] No userId found");
      return null;
    }

    // Get user directly by ID (more efficient than query + filter)
    const user = await ctx.db.get(userId);

    if (!user) {
      console.log("[getCurrentUser] User not found in database");
      return null;
    }

    console.log("[getCurrentUser] User found:", user.email);

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
