#!/usr/bin/env tsx
/**
 * Cleanup All Test Users
 *
 * Purpose: Removes all test users from the database created during E2E testing.
 *          Runs multiple batches until all test accounts and their auth data are deleted.
 *
 * Last Used: 2025-11-06 (TASK-004 auth testing cleanup)
 *
 * Usage: npx tsx scripts/cleanup-all-test-users.ts
 *
 * Note: Deletes users in batches to avoid timeout issues. Uses cleanupTestUsers mutation.
 */

import { execSync } from "child_process";

async function cleanupAllTestUsers() {
  console.log("🧹 Starting test user cleanup...\n");

  let totalDeleted = 0;
  let batchNumber = 1;

  while (true) {
    console.log(`📦 Running batch ${batchNumber}...`);

    // Run cleanup mutation
    const result = execSync(
      `npx convex run cleanupTestUsers:cleanupTestUsers '{"dryRun": false}'`,
      { encoding: "utf-8" }
    );

    const data = JSON.parse(result);

    console.log(`   ✅ Deleted ${data.deletedUsers} users and ${data.deletedAccounts} auth accounts`);
    console.log(`   📧 Sample: ${data.deletedEmails.slice(0, 3).join(", ")}`);

    totalDeleted += data.deletedUsers;

    // Check if there are more users to delete
    if (data.remainingTestUsers === 0) {
      console.log(`\n🎉 Cleanup complete! Deleted ${totalDeleted} test users total.`);
      break;
    }

    console.log(`   ⏳ ${data.remainingTestUsers} users remaining...\n`);
    batchNumber++;

    // Safety limit: prevent infinite loop
    if (batchNumber > 20) {
      console.error("⚠️  Safety limit reached (20 batches). Please investigate.");
      break;
    }
  }
}

cleanupAllTestUsers().catch((error) => {
  console.error("❌ Error during cleanup:", error);
  process.exit(1);
});
