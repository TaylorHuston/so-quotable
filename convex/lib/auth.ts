import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Standardized authentication and authorization error messages
 *
 * These error messages are displayed directly to end users in the client application.
 * Keep them user-friendly, clear, and actionable.
 *
 * @example
 * ```typescript
 * throw new Error(AUTH_ERRORS.NOT_AUTHENTICATED);
 * ```
 */
export const AUTH_ERRORS = {
  /** User must be logged in to perform this action */
  NOT_AUTHENTICATED: "Authentication required",
  /** User does not have permission to modify this resource */
  NOT_AUTHORIZED: "Not authorized to modify this resource",
  /** Action requires admin privileges */
  ADMIN_ONLY: "This action requires admin privileges",
} as const;

/**
 * Require user authentication for a query or mutation
 *
 * Validates that a user is currently authenticated using Convex Auth.
 * Returns the authenticated user's ID if successful, throws an error otherwise.
 *
 * This is the primary authentication check for protected endpoints.
 * Use this at the start of any query or mutation that requires authentication.
 *
 * @param ctx - Convex query or mutation context
 * @returns Promise resolving to the authenticated user's ID
 * @throws Error with AUTH_ERRORS.NOT_AUTHENTICATED if user is not logged in
 *
 * @example
 * ```typescript
 * // In a Convex mutation
 * export const createQuote = mutation({
 *   args: { text: v.string(), personId: v.id("people") },
 *   handler: async (ctx, args) => {
 *     const userId = await requireAuth(ctx);
 *     // ... proceed with authenticated user
 *   },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // In a Convex query
 * export const getMyQuotes = query({
 *   handler: async (ctx) => {
 *     const userId = await requireAuth(ctx);
 *     return await ctx.db
 *       .query("quotes")
 *       .filter((q) => q.eq(q.field("createdBy"), userId))
 *       .collect();
 *   },
 * });
 * ```
 *
 * @see {@link https://labs.convex.dev/auth | Convex Auth Documentation}
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);

  if (userId === null) {
    throw new Error(AUTH_ERRORS.NOT_AUTHENTICATED);
  }

  return userId;
}

/**
 * Require user to be the resource owner OR an admin
 *
 * Validates that the authenticated user either owns the resource or has admin privileges.
 * This implements the authorization pattern where:
 * 1. Regular users can only modify their own resources
 * 2. Admin users can modify any resource (admin bypass)
 *
 * Returns both the userId and isAdmin flag for flexibility in downstream logic.
 *
 * @param ctx - Convex mutation context (needs to read user document for role check)
 * @param resourceCreatedBy - The userId of the resource owner, or undefined for legacy data
 * @returns Promise resolving to { userId, isAdmin } if authorized
 * @throws Error with AUTH_ERRORS.NOT_AUTHENTICATED if user is not logged in
 * @throws Error with AUTH_ERRORS.NOT_AUTHORIZED if user is neither owner nor admin
 *
 * @example
 * ```typescript
 * // Basic usage - validate ownership
 * export const updateQuote = mutation({
 *   args: { quoteId: v.id("quotes"), text: v.string() },
 *   handler: async (ctx, { quoteId, text }) => {
 *     const quote = await ctx.db.get(quoteId);
 *     if (!quote) throw new Error("Quote not found");
 *
 *     await requireOwnerOrAdmin(ctx, quote.createdBy);
 *
 *     // User is authorized - proceed with update
 *     await ctx.db.patch(quoteId, { text, updatedAt: Date.now() });
 *   },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage - use isAdmin flag for conditional logic
 * export const deleteQuote = mutation({
 *   args: { quoteId: v.id("quotes") },
 *   handler: async (ctx, { quoteId }) => {
 *     const quote = await ctx.db.get(quoteId);
 *     if (!quote) throw new Error("Quote not found");
 *
 *     const { userId, isAdmin } = await requireOwnerOrAdmin(ctx, quote.createdBy);
 *
 *     // Soft delete for regular users, hard delete for admins
 *     if (isAdmin) {
 *       await ctx.db.delete(quoteId);
 *     } else {
 *       await ctx.db.patch(quoteId, { deleted: true });
 *     }
 *   },
 * });
 * ```
 *
 * @remarks
 * **Legacy Data Handling**: If `resourceCreatedBy` is undefined (legacy data created before
 * Phase 1.3 schema migration), the function will reject non-admin users. Only admins can
 * modify resources without ownership information.
 *
 * **Admin Bypass**: Users with `role: "admin"` can modify any resource, regardless of ownership.
 * This is useful for moderation, support, and administrative tasks.
 *
 * @see {@link requireAuth} for basic authentication checks
 * @see {@link AUTH_ERRORS} for standardized error messages
 */
export async function requireOwnerOrAdmin(
  ctx: MutationCtx,
  resourceCreatedBy: Id<"users"> | undefined
): Promise<{ userId: Id<"users">; isAdmin: boolean }> {
  // First, ensure user is authenticated
  const userId = await requireAuth(ctx);

  // Get user document to check role
  const user = await ctx.db.get(userId);

  if (!user) {
    // This shouldn't happen (user was just authenticated), but handle defensively
    throw new Error(AUTH_ERRORS.NOT_AUTHENTICATED);
  }

  const isAdmin = user.role === "admin";

  // Admin bypass - admins can modify any resource
  if (isAdmin) {
    return { userId, isAdmin: true };
  }

  // For regular users, check ownership
  // Reject if resourceCreatedBy is undefined (legacy data) or doesn't match current user
  if (!resourceCreatedBy || resourceCreatedBy !== userId) {
    throw new Error(AUTH_ERRORS.NOT_AUTHORIZED);
  }

  return { userId, isAdmin: false };
}

/**
 * Require user to have admin privileges
 *
 * Validates that the authenticated user has the admin role.
 * This is a stricter check than requireOwnerOrAdmin - it REQUIRES admin status,
 * not just allows it as a bypass.
 *
 * Use this for administrative operations that should never be performed by regular users,
 * such as:
 * - Bulk user management
 * - System configuration changes
 * - Destructive cleanup operations
 * - Accessing debug/diagnostic functions
 *
 * @param ctx - Convex query or mutation context
 * @returns Promise resolving to the admin user's ID
 * @throws Error with AUTH_ERRORS.NOT_AUTHENTICATED if user is not logged in
 * @throws Error with AUTH_ERRORS.ADMIN_ONLY if user is not an admin
 *
 * @example
 * ```typescript
 * export const cleanupTestUsers = mutation({
 *   args: { dryRun: v.boolean() },
 *   handler: async (ctx, { dryRun }) => {
 *     await requireAdmin(ctx);  // Only admins can run cleanup
 *     // ... perform cleanup
 *   },
 * });
 * ```
 *
 * @see {@link requireOwnerOrAdmin} for ownership-based authorization
 * @see {@link AUTH_ERRORS} for standardized error messages
 */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  // First, ensure user is authenticated
  const userId = await requireAuth(ctx);

  // Get user document to check role
  const user = await ctx.db.get(userId);

  if (!user) {
    // This shouldn't happen (user was just authenticated), but handle defensively
    throw new Error(AUTH_ERRORS.NOT_AUTHENTICATED);
  }

  if (user.role !== "admin") {
    throw new Error(AUTH_ERRORS.ADMIN_ONLY);
  }

  return userId;
}
