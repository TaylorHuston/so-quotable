import { query } from "./_generated/server";

/**
 * Health check endpoint for Convex backend
 *
 * Returns:
 * - status: "ok" if backend is healthy
 * - timestamp: current server timestamp
 * - database: connectivity check (verifies query execution)
 * - environment: deployment info
 *
 * Performance: Uses .take(1) instead of .collect() to avoid full table scan.
 * For health checks, we only need to verify database connectivity, not count records.
 */
export const ping = query({
  args: {},
  handler: async (ctx) => {
    // Database connectivity check - verify we can query the database
    // Uses .take(1) to avoid full table scan - we only need to verify connectivity
    const canQuery = await ctx.db.query("people").take(1).then(() => true).catch(() => false);

    return {
      status: "ok" as const,
      timestamp: Date.now(),
      database: {
        connected: canQuery,
      },
      environment: {
        deployment: process.env.CONVEX_CLOUD_URL ? "cloud" : "local",
      },
    };
  },
});
