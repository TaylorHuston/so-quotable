import { query } from "./_generated/server";

export const listAllUsers = query({
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

export const listAllAuthAccounts = query({
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
