import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Retrieve a user by their email address
 *
 * Performs a case-insensitive email lookup using the database index.
 * Used for duplicate email detection during registration and user lookup.
 *
 * @param args.email - The email address to search for (will be normalized to lowercase)
 * @returns The user object if found, null otherwise
 *
 * @example
 * ```typescript
 * const user = await ctx.runQuery(api.users.getUserByEmail, {
 *   email: "user@example.com"
 * });
 *
 * if (user) {
 *   console.log("User exists:", user.name);
 * }
 * ```
 *
 * **Performance**: O(log n) lookup using email index
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
 * Check if an email is available for registration
 *
 * Optimized query that returns only a boolean instead of the full user object.
 * Uses the email index for fast lookups. Email is normalized to lowercase
 * for case-insensitive comparison.
 *
 * @param email - The email address to check (will be normalized to lowercase)
 * @returns true if the email is available (no user exists), false if taken
 *
 * Performance: This query is optimized for registration flows:
 * - Returns boolean only (not full user object)
 * - Uses database index for O(log n) lookup
 * - Normalizes email consistently with registration logic
 */
export const checkEmailAvailability = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    // Normalize email to lowercase for case-insensitive comparison
    // This matches the normalization in auth.ts and RegisterForm
    const normalizedEmail = email.toLowerCase().trim();

    // Query by email index for fast lookup
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .first();

    // Return true if available (no user found), false if taken
    return existingUser === null;
  },
});

/**
 * Retrieve the currently authenticated user's profile
 *
 * Returns user profile information including verification status.
 * This is the primary query for getting the logged-in user's data.
 *
 * @returns User profile object with verification status, or null if not authenticated
 *
 * @example
 * ```typescript
 * // Frontend usage (React component)
 * import { useQuery } from "convex/react";
 * import { api } from "../convex/_generated/api";
 *
 * function ProfilePage() {
 *   const user = useQuery(api.users.getCurrentUser);
 *
 *   if (user === undefined) return <div>Loading...</div>;
 *   if (user === null) return <div>Not signed in</div>;
 *
 *   return <div>Welcome, {user.name}!</div>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Backend usage (Convex function)
 * const user = await ctx.runQuery(api.users.getCurrentUser);
 * if (!user) throw new Error("Not authenticated");
 * ```
 *
 * **Profile Fields**:
 * - _id: User's unique identifier
 * - name: Display name
 * - email: Email address
 * - slug: URL-friendly username
 * - role: User role (user, admin)
 * - emailVerified: Boolean indicating email verification status
 * - image: Profile image URL (from OAuth providers)
 * - createdAt: Account creation timestamp
 * - updatedAt: Last update timestamp
 *
 * **Security**: Uses Convex Auth's getAuthUserId() to ensure only authenticated users can access their own profile
 *
 * @see {@link https://labs.convex.dev/auth | Convex Auth - User Identity}
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
