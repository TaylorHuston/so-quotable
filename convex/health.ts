import { query } from "./_generated/server";

/**
 * Health check endpoint for Convex backend
 *
 * Returns:
 * - status: "ok" if backend is healthy
 * - timestamp: current server timestamp
 * - database: connectivity check (count of people table)
 * - environment: deployment info
 */
export const ping = query({
  args: {},
  handler: async (ctx) => {
    // Database connectivity check - count people in database
    const peopleCount = await ctx.db.query("people").collect().then(p => p.length);

    return {
      status: "ok" as const,
      timestamp: Date.now(),
      database: {
        connected: true,
        peopleCount,
      },
      environment: {
        deployment: process.env.CONVEX_CLOUD_URL ? "cloud" : "local",
      },
    };
  },
});
