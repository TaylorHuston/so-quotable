import { query } from "./_generated/server";

/**
 * Get the current authenticated user's profile
 *
 * Returns the user profile if authenticated, null otherwise.
 * Uses ctx.auth.getUserIdentity() to get the auth state.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get the authenticated user identity from Convex Auth
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // The subject is the user ID in the database
    // Query users table to ensure we get the right type
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), identity.subject))
      .first();

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
