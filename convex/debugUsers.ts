import { internalQuery } from "./_generated/server";

/**
 * Debug functions for development only.
 * Marked as internal to prevent public API access.
 * Can only be called from other Convex functions (e.g., via ctx.runQuery).
 *
 * SECURITY: These expose sensitive user data and should never be public.
 */

export const listAllUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return {
      count: users.length,
      users: users.map((u) => ({
        id: u._id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
      })),
    };
  },
});

export const listAllAuthAccounts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();
    return {
      count: accounts.length,
      accounts: accounts.map((a) => ({
        id: a._id,
        userId: a.userId,
        provider: a.provider,
      })),
    };
  },
});
