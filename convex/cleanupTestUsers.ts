import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

/**
 * Safely cleanup test user accounts from the database.
 *
 * SECURITY: Requires admin authentication - this is a destructive operation.
 *
 * This mutation:
 * - Filters users by test email patterns (test-*, existing-*, newuser@example.com)
 * - Deletes authAccounts first (foreign key dependency)
 * - Deletes users last (parent records)
 * - Supports dry-run mode for safe preview
 * - Processes in batches to avoid timeouts
 *
 * @param dryRun - If true, previews deletions without executing
 * @param batchSize - Maximum users to process (default: 50)
 */
export const cleanupTestUsers = mutation({
  args: {
    dryRun: v.boolean(),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, { dryRun, batchSize = 50 }) => {
    // Admin-only operation - destructive mutation
    await requireAdmin(ctx);
    // Query all users
    const allUsers = await ctx.db.query("users").collect();

    // Filter test users by email pattern (broad matching for all test accounts)
    const testUsers = allUsers.filter((u) => {
      if (!u.email) return false;
      const email = u.email.toLowerCase();

      // Match various test account patterns:
      // - test-{timestamp}@example.com (automated E2E tests)
      // - existing-{timestamp}@example.com (automated E2E tests)
      // - *@test.com (any manual test accounts using test.com domain)
      // - *test*@example.com (manual testing with "test" in name)
      // - *test*@gmail.com (manual testing)
      return (
        /^(test-\d+|existing-\d+)@example\.com$/.test(email) ||
        email === "newuser@example.com" ||
        /@test\.com$/.test(email) || // any @test.com domain
        /(test|auth).*@example\.com$/.test(email) || // any @example.com with "test" or "auth"
        /test.*@gmail\.com$/.test(email) // any @gmail.com with "test"
      );
    });

    // Apply batch limit
    const usersToProcess = testUsers.slice(0, batchSize);

    if (dryRun) {
      // Preview mode: Show what would be deleted
      const sampleEmails = usersToProcess.slice(0, 10).map((u) => u.email);

      return {
        dryRun: true,
        totalTestUsers: testUsers.length,
        usersToDelete: usersToProcess.length,
        sampleEmails,
        message: `DRY RUN: Would delete ${usersToProcess.length} test users (${testUsers.length} total found)`,
      };
    }

    // Execute deletion: authAccounts first, then users
    let deletedAccounts = 0;
    let deletedUsers = 0;
    const deletedEmails: string[] = [];

    for (const user of usersToProcess) {
      // Delete all authAccounts for this user
      const accounts = await ctx.db
        .query("authAccounts")
        .withIndex("userIdAndProvider")
        .filter((q) => q.eq(q.field("userId"), user._id))
        .collect();

      for (const account of accounts) {
        await ctx.db.delete(account._id);
        deletedAccounts++;
      }

      // Delete the user
      await ctx.db.delete(user._id);
      deletedUsers++;
      if (user.email) deletedEmails.push(user.email);
    }

    return {
      dryRun: false,
      deletedUsers,
      deletedAccounts,
      remainingTestUsers: testUsers.length - usersToProcess.length,
      deletedEmails: deletedEmails.slice(0, 10), // First 10 for verification
      message: `Deleted ${deletedUsers} test users and ${deletedAccounts} auth accounts`,
    };
  },
});
