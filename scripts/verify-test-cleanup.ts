#!/usr/bin/env tsx
/**
 * Verify Test Cleanup
 *
 * Purpose: Verifies that the test cleanup functionality works correctly by counting
 *          test users before/after cleanup and confirming all are removed.
 *
 * Last Used: 2025-11-06 (TASK-004 auth testing verification)
 *
 * Usage: npx tsx scripts/verify-test-cleanup.ts
 *
 * Note: Uses testCleanup helpers to count and clean test data. Safe for production.
 */

import { cleanupAllTestData, countTestUsers } from "../tests/helpers/testCleanup";

async function verifyCleanup() {
  console.log("🔍 Checking for test users before cleanup...\n");

  const countBefore = await countTestUsers();
  console.log(`Found ${countBefore} test users in database\n`);

  if (countBefore > 0) {
    console.log("🧹 Running cleanup...\n");
    const result = await cleanupAllTestData();
    console.log(
      `✓ Cleaned up ${result.deletedUsers} users and ${result.deletedAccounts} accounts\n`
    );

    const countAfter = await countTestUsers();
    console.log(`📊 Test users remaining: ${countAfter}\n`);

    if (countAfter === 0) {
      console.log("✅ Cleanup verification successful!");
    } else {
      console.log("❌ Cleanup incomplete - some test users remain");
      process.exit(1);
    }
  } else {
    console.log("✅ Database is already clean - no test users found");
  }
}

verifyCleanup().catch((error) => {
  console.error("❌ Verification failed:", error);
  process.exit(1);
});
