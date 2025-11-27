/**
 * Test helper utilities for authenticated test contexts
 *
 * These helpers simplify testing of authenticated Convex functions by providing:
 * - `createTestUser(ctx, options?)` - Create a test user with sensible defaults
 * - `asUser(t, userId)` - Wrap convexTest with authenticated identity
 *
 * @example
 * ```typescript
 * import { createTestUser, asUser } from "./test.helpers";
 *
 * describe("quotes.create", () => {
 *   it("should create a quote when authenticated", async () => {
 *     // Create user
 *     const userId = await t.run(async (ctx) => createTestUser(ctx));
 *
 *     // Use authenticated context
 *     const quoteId = await asUser(t, userId).mutation(api.quotes.create, {
 *       text: "Test quote",
 *       personId,
 *     });
 *
 *     expect(quoteId).toBeDefined();
 *   });
 * });
 * ```
 */
import { convexTest } from "convex-test";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Options for creating a test user
 */
export interface TestUserOptions {
  /** Email address (default: auto-generated unique email) */
  email?: string;
  /** Display name (default: "Test User") */
  name?: string;
  /** User role (default: "user") */
  role?: "user" | "admin";
}

/**
 * Creates a test user with sensible defaults
 *
 * @param ctx - Convex mutation context
 * @param options - Optional user properties to override defaults
 * @returns The created user's ID
 *
 * @example
 * ```typescript
 * // Create default user
 * const userId = await t.run((ctx) => createTestUser(ctx));
 *
 * // Create admin user
 * const adminId = await t.run((ctx) => createTestUser(ctx, { role: "admin" }));
 *
 * // Create user with custom email
 * const customId = await t.run((ctx) =>
 *   createTestUser(ctx, { email: "jane@example.com", name: "Jane" })
 * );
 * ```
 */
export async function createTestUser(
  ctx: MutationCtx,
  options: TestUserOptions = {}
): Promise<Id<"users">> {
  const now = Date.now();
  const uniqueId = now + Math.random().toString(36).substring(2, 8);

  const email = options.email ?? `test-${uniqueId}@example.com`;
  const name = options.name ?? "Test User";
  const role = options.role ?? "user";

  // Generate slug from email (before @ sign, sanitized)
  const emailPrefix = email.split("@")[0] ?? "test";
  const slug = emailPrefix.replace(/[^a-z0-9-]/gi, "-").toLowerCase();

  return await ctx.db.insert("users", {
    email,
    name,
    slug: `${slug}-${uniqueId}`,
    role,
    createdAt: now,
    updatedAt: now,
  });
}

/**
 * Wraps a convexTest instance with authenticated identity
 *
 * This is the primary helper for testing authenticated functions. It sets up
 * the identity context so that `getAuthUserId()` returns the provided userId.
 *
 * @param t - The convexTest instance
 * @param userId - The user ID to authenticate as
 * @returns A new convexTest instance with the identity set
 *
 * @example
 * ```typescript
 * const userId = await t.run((ctx) => createTestUser(ctx));
 *
 * // Now all operations use authenticated context
 * const authT = asUser(t, userId);
 *
 * // Can call mutations that require auth
 * const quoteId = await authT.mutation(api.quotes.create, { ... });
 *
 * // Can use run for custom operations
 * await authT.run(async (ctx) => {
 *   const authUserId = await requireAuth(ctx);
 *   expect(authUserId).toBe(userId);
 * });
 * ```
 */
export function asUser<T extends ReturnType<typeof convexTest>>(
  t: T,
  userId: Id<"users">
): T {
  return t.withIdentity({ subject: userId }) as T;
}
