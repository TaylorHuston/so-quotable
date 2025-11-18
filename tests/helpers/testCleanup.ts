/**
 * Test Data Cleanup Helper
 *
 * Provides utilities to cleanup test data created during E2E tests.
 * Tracks created test users and cleans them up after tests complete.
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

/**
 * Cleanup all test users from the database.
 * Uses the same pattern matching as cleanupTestUsers mutation.
 */
export async function cleanupAllTestData(): Promise<{
  deletedUsers: number;
  deletedAccounts: number;
}> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.warn("NEXT_PUBLIC_CONVEX_URL not set, skipping cleanup");
    return { deletedUsers: 0, deletedAccounts: 0 };
  }

  const client = new ConvexHttpClient(convexUrl);

  try {
    // Call the cleanup mutation with dryRun: false
    const result = await client.mutation(
      api.cleanupTestUsers.cleanupTestUsers,
      { dryRun: false }
    );

    console.log(
      `✓ Cleaned up ${result.deletedUsers} test users and ${result.deletedAccounts} auth accounts`
    );

    // If there are more users, run again (batch processing)
    if (result.remainingTestUsers && result.remainingTestUsers > 0) {
      console.log(`  ${result.remainingTestUsers} users remaining, cleaning up...`);
      const nextResult = await cleanupAllTestData();
      return {
        deletedUsers: (result.deletedUsers || 0) + nextResult.deletedUsers,
        deletedAccounts: (result.deletedAccounts || 0) + nextResult.deletedAccounts,
      };
    }

    return {
      deletedUsers: result.deletedUsers || 0,
      deletedAccounts: result.deletedAccounts || 0,
    };
  } catch (error) {
    console.error("Failed to cleanup test data:", error);
    return { deletedUsers: 0, deletedAccounts: 0 };
  }
}

/**
 * Check if there are any test users in the database.
 * Useful for debugging or verifying cleanup worked.
 */
export async function countTestUsers(): Promise<number> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return 0;
  }

  const client = new ConvexHttpClient(convexUrl);

  try {
    const result = await client.mutation(
      api.cleanupTestUsers.cleanupTestUsers,
      { dryRun: true }
    );
    return result.totalTestUsers || 0;
  } catch (error) {
    console.error("Failed to count test users:", error);
    return 0;
  }
}
