import { v } from "convex/values";
import { mutation, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { normalizeEmail } from "../src/lib/email-utils";

/**
 * Request a password reset for a user account
 *
 * Generates a secure password reset token and sends it via email. Implements
 * rate limiting (3 requests per hour per email) to prevent abuse. Returns
 * success regardless of whether email exists (prevents enumeration attacks).
 *
 * @param args.email - The user's email address
 * @returns Object with success status and message
 *
 * @example
 * ```typescript
 * const result = await ctx.runMutation(api.passwordReset.requestPasswordReset, {
 *   email: "user@example.com"
 * });
 *
 * if (result.success) {
 *   console.log(result.message); // "If email exists, password reset email sent"
 * }
 * ```
 *
 * **Process**:
 * 1. Normalize email (lowercase, trim)
 * 2. Check if user exists (if not, return success without revealing)
 * 3. Verify rate limit not exceeded (3 requests/hour)
 * 4. Generate cryptographically secure token (64 chars)
 * 5. Set 1-hour expiration
 * 6. Store token and update rate limit counters
 * 7. Send password reset email via Resend
 * 8. Return success message (same whether user exists or not)
 *
 * **Rate Limiting**:
 * - Max 3 requests per hour per email
 * - Counter resets after 1 hour from first request
 * - If limit exceeded, returns success but doesn't send email
 *
 * **Security**:
 * - Always returns success (prevents email enumeration)
 * - Token is cryptographically secure (based on UUID v4)
 * - 1-hour expiration enforced
 * - Rate limiting prevents spam/abuse
 *
 * **Token Format**: 64-character hex string (no hyphens)
 *
 * @see {@link resetPasswordWithToken} To validate token and reset password
 * @see {@link sendPasswordResetEmail} Email delivery action
 */
export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Normalize email for lookup
    const email = normalizeEmail(args.email);

    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    // If user doesn't exist, return success (prevent enumeration)
    if (!user) {
      return {
        success: true,
        message: "If an account with that email exists, a password reset email has been sent.",
      };
    }

    // Check rate limit: max 3 requests per hour
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    let requestCount = user.passwordResetRequests || 0;
    const lastRequest = user.lastPasswordResetRequest || 0;

    // Reset counter if more than 1 hour has passed
    if (lastRequest < oneHourAgo) {
      requestCount = 0;
    }

    // If rate limit exceeded, return success but don't send email (prevent enumeration)
    if (requestCount >= 3) {
      return {
        success: true,
        message: "If an account with that email exists, a password reset email has been sent.",
      };
    }

    // Generate secure password reset token
    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");

    // Set expiry to 1 hour from now (not 24 hours like email verification)
    const tokenExpiry = now + 60 * 60 * 1000;

    // Update user with token and rate limit info
    await ctx.db.patch(user._id, {
      passwordResetToken: token,
      passwordResetTokenExpiry: tokenExpiry,
      passwordResetRequests: requestCount + 1,
      lastPasswordResetRequest: now,
      updatedAt: now,
    });

    // Schedule password reset email to be sent (don't await - fire and forget)
    // This prevents errors from revealing whether email exists
    void ctx.scheduler.runAfter(0, internal.passwordResetActions.sendPasswordResetEmailInternal, {
      email: user.email!,
      token,
    }).catch((error) => {
      console.error("Failed to schedule password reset email:", error);
    });

    return {
      success: true,
      message: "If an account with that email exists, a password reset email has been sent.",
    };
  },
});


/**
 * Internal mutation to clear password reset token after successful reset
 *
 * @internal
 */
export const clearPasswordResetToken = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      passwordResetToken: undefined,
      passwordResetTokenExpiry: undefined,
      passwordResetRequests: undefined,
      lastPasswordResetRequest: undefined,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Internal query to find a user by password reset token
 * @internal
 */
export const getUserByResetToken = internalQuery({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("passwordResetToken"), args.token))
      .first();
  },
});
