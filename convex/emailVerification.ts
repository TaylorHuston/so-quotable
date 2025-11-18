import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Generate a cryptographically secure email verification token
 *
 * Creates a unique verification token for the authenticated user and stores it
 * in their user record with a 24-hour expiration. The token is generated using
 * crypto.randomUUID() for cryptographic security.
 *
 * @returns The generated verification token (64-character hex string)
 * @throws Error if user is not authenticated or not found
 *
 * @example
 * ```typescript
 * const token = await ctx.runMutation(api.emailVerification.generateVerificationToken);
 * // Token format: "a1b2c3d4e5f6..." (64 characters, no hyphens)
 * ```
 *
 * **Process**:
 * 1. Validates user authentication
 * 2. Generates random token using crypto.randomUUID() (two UUIDs concatenated)
 * 3. Sets 24-hour expiration timestamp
 * 4. Stores token and expiry in user record
 * 5. Returns token for email delivery
 *
 * **Security**: Token is cryptographically secure (based on UUID v4)
 * **Expiration**: 24 hours from generation
 *
 * @see {@link sendVerificationEmail} To send the token via email
 * @see {@link verifyEmail} To verify the token
 */
export const generateVerificationToken = mutation({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Generate random token using crypto.randomUUID (available in Convex runtime)
    // Use multiple UUIDs to get longer token
    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");

    // Set expiry to 24 hours from now
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    // Update user with token
    await ctx.db.patch(user._id, {
      verificationToken: token,
      tokenExpiry,
      updatedAt: Date.now(),
    });

    return token;
  },
});

/**
 * Verify a user's email address using a verification token
 *
 * Validates the provided token, checks expiration, and marks the user's
 * email as verified. Tokens are single-use and expire after 24 hours.
 *
 * @param args.token - The verification token from the email link
 * @returns Object with success status and message
 * @returns {boolean} success - Whether verification succeeded
 * @returns {string} error - Error message if verification failed
 * @returns {string} message - Success message if verification succeeded
 *
 * @example
 * ```typescript
 * const result = await ctx.runMutation(api.emailVerification.verifyEmail, {
 *   token: "a1b2c3d4e5f6..."
 * });
 *
 * if (result.success) {
 *   console.log(result.message); // "Email verified successfully"
 * } else {
 *   console.error(result.error); // "Invalid verification token"
 * }
 * ```
 *
 * **Validation Checks**:
 * 1. Token format validation (minimum 20 characters)
 * 2. Token exists in database
 * 3. Token hasn't expired (24-hour limit)
 * 4. Email not already verified (idempotent operation)
 *
 * **Error Messages**:
 * - "Invalid verification token" - Token not found or malformed
 * - "Verification token has expired" - Token older than 24 hours
 *
 * **Success Cases**:
 * - First verification: "Email verified successfully"
 * - Already verified: "Email already verified" (success: true)
 *
 * @see {@link generateVerificationToken} To generate a new token
 * @see {@link resendVerificationEmail} To request a new verification email
 */
export const verifyEmail = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate token format
    if (!args.token || args.token.length < 20) {
      return {
        success: false,
        error: "Invalid verification token",
      };
    }

    // Find user by verification token
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("verificationToken"), args.token))
      .first();

    if (!user) {
      return {
        success: false,
        error: "Invalid verification token",
      };
    }

    // Check if already verified
    if (user.emailVerificationTime) {
      return {
        success: true,
        message: "Email already verified",
      };
    }

    // Check token hasn't expired
    if (!user.tokenExpiry || user.tokenExpiry < Date.now()) {
      return {
        success: false,
        error: "Verification token has expired",
      };
    }

    // Verify email
    await ctx.db.patch(user._id, {
      emailVerificationTime: Date.now(),
      verificationToken: undefined,
      tokenExpiry: undefined,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  },
});

/**
 * Generate a new verification token for email re-verification
 *
 * Allows authenticated users to request a new verification email if their
 * original token expired or was lost. Only works if email is not already verified.
 *
 * @returns The new verification token (64-character hex string)
 * @throws Error if user is not authenticated
 * @throws Error if user is not found
 * @throws Error if email is already verified
 *
 * @example
 * ```typescript
 * try {
 *   const token = await ctx.runMutation(api.emailVerification.resendVerificationEmail);
 *   // Send new verification email with this token
 * } catch (error) {
 *   if (error.message === "Email already verified") {
 *     console.log("No need to verify - already done!");
 *   }
 * }
 * ```
 *
 * **Process**:
 * 1. Validates user authentication
 * 2. Checks email not already verified
 * 3. Generates new cryptographically secure token
 * 4. Invalidates any previous tokens
 * 5. Sets new 24-hour expiration
 * 6. Returns token for email delivery
 *
 * **Security**: Invalidates previous tokens to prevent token reuse
 *
 * @see {@link generateVerificationToken} Used internally to create token
 * @see {@link sendVerificationEmail} To send the token via email
 */
export const resendVerificationEmail = mutation({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if already verified
    if (user.emailVerificationTime) {
      throw new Error("Email already verified");
    }

    // Generate new token using crypto.randomUUID
    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
    const tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    await ctx.db.patch(user._id, {
      verificationToken: token,
      tokenExpiry,
      updatedAt: Date.now(),
    });

    return token;
  },
});