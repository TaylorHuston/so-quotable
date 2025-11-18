"use node";

import { v } from "convex/values";
import { mutation, action, internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Resend } from "resend";
import { normalizeEmail } from "../src/lib/email-utils";
import { ConvexError } from "convex/values";
import { Password } from "@convex-dev/auth/providers/Password";
import { modifyAccountCredentials } from "@convex-dev/auth/server";

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
    void ctx.scheduler.runAfter(0, internal.passwordReset.sendPasswordResetEmailInternal, {
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
 * Reset user password using a valid reset token
 *
 * Validates the password reset token, checks expiration, validates the new
 * password against NIST requirements, and updates the user's password. Tokens
 * are single-use and cleared after successful reset.
 *
 * @param args.token - The password reset token from email link
 * @param args.newPassword - The new password to set
 * @returns Object with success status, message, or error
 *
 * @example
 * ```typescript
 * const result = await ctx.runMutation(api.passwordReset.resetPasswordWithToken, {
 *   token: "a1b2c3d4...",
 *   newPassword: "NewSecurePassword123!"
 * });
 *
 * if (result.success) {
 *   console.log(result.message); // "Password reset successfully"
 * } else {
 *   console.error(result.error); // "Invalid or expired reset token"
 * }
 * ```
 *
 * **Validation Checks**:
 * 1. Token format validation (minimum 20 characters)
 * 2. Token exists in database
 * 3. Token hasn't expired (1-hour limit)
 * 4. New password meets NIST requirements:
 *    - Minimum 12 characters
 *    - At least 1 uppercase letter
 *    - At least 1 lowercase letter
 *    - At least 1 number
 *    - At least 1 special character
 *
 * **Error Messages**:
 * - "Invalid password reset token" - Token not found or malformed
 * - "Password reset token has expired" - Token older than 1 hour
 * - "Password must..." - Specific password requirement not met
 *
 * **Success Cases**:
 * - Token valid, password valid → "Password reset successfully"
 * - Token cleared after successful reset (single-use)
 * - Rate limit counters cleared
 *
 * **Security**:
 * - Single-use tokens (cleared after validation)
 * - 1-hour expiration enforced
 * - NIST-compliant password validation
 *
 * @see {@link requestPasswordReset} To generate a reset token
 */
export const resetPasswordWithToken = action({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate token format
    if (!args.token || args.token.length < 20) {
      return {
        success: false,
        error: "Invalid password reset token",
      };
    }

    // Find user by reset token
    const user = await ctx.runQuery(async (ctx) => {
      return await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("passwordResetToken"), args.token))
        .first();
    });

    if (!user) {
      return {
        success: false,
        error: "Invalid password reset token",
      };
    }

    // Check token hasn't expired (1 hour)
    if (!user.passwordResetTokenExpiry || user.passwordResetTokenExpiry < Date.now()) {
      return {
        success: false,
        error: "Password reset token has expired. Please request a new password reset.",
      };
    }

    // Validate new password meets NIST requirements
    // Use same validation as Password provider
    try {
      // Check minimum length
      if (!args.newPassword || args.newPassword.length < 12) {
        return {
          success: false,
          error: "Password must be at least 12 characters long",
        };
      }

      // Check uppercase letter
      if (!/[A-Z]/.test(args.newPassword)) {
        return {
          success: false,
          error: "Password must contain at least one uppercase letter",
        };
      }

      // Check lowercase letter
      if (!/[a-z]/.test(args.newPassword)) {
        return {
          success: false,
          error: "Password must contain at least one lowercase letter",
        };
      }

      // Check number
      if (!/[0-9]/.test(args.newPassword)) {
        return {
          success: false,
          error: "Password must contain at least one number",
        };
      }

      // Check special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(args.newPassword)) {
        return {
          success: false,
          error: "Password must contain at least one special character",
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Password validation failed",
      };
    }

    // Update password using Convex Auth's modifyAccountCredentials
    // This ensures password is hashed properly and compatible with Convex Auth
    try {
      await modifyAccountCredentials(ctx, {
        provider: "password",
        account: {
          id: user.email,
          secret: args.newPassword,
        },
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update password",
      };
    }

    // Clear reset token and rate limit counters (single-use token)
    await ctx.runMutation(internal.passwordReset.clearPasswordResetToken, {
      userId: user._id,
    });

    return {
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
      userId: user._id,
    };
  },
});

/**
 * Internal action to send password reset email via Resend
 *
 * This is an internal action called by the scheduler. Use requestPasswordReset
 * to trigger password reset flow.
 *
 * @internal
 */
export const sendPasswordResetEmailInternal = internalAction({
  args: {
    email: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate required environment variables
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable not set. Please add it to Convex Dashboard > Settings > Environment Variables.");
    }

    const siteUrl = process.env.SITE_URL;
    if (!siteUrl) {
      throw new Error("SITE_URL environment variable not set. Please add it to Convex Dashboard > Settings > Environment Variables.");
    }

    // Construct password reset link
    const resetLink = `${siteUrl}/reset-password?token=${args.token}`;

    // In test mode, just log the email instead of sending
    if (apiKey === "test-resend-api-key" || apiKey.startsWith("test-")) {
      console.log(`
📧 [TEST MODE] Password Reset Email
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${args.email}
Subject: Reset your password - So Quotable
Reset Link: ${resetLink}
Token Expiry: 1 hour
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);

      return {
        success: true,
        message: "Password reset email logged to console (test mode)",
      };
    }

    // Initialize Resend
    const resend = new Resend(apiKey);

    try {
      // Send password reset email
      const { data, error } = await resend.emails.send({
        from: "So Quotable <onboarding@resend.dev>",
        to: [args.email],
        subject: "Reset your password - So Quotable",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset your password</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">So Quotable</h1>
              </div>
              <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                <p style="font-size: 16px; color: #555;">We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #777; margin-top: 30px;">
                  This password reset link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
                </p>
                <p style="font-size: 14px; color: #777; margin-top: 20px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                  © ${new Date().getFullYear()} So Quotable. All rights reserved.
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }

      console.log(`✅ Password reset email sent successfully to ${args.email} (Resend ID: ${data?.id})`);

      return {
        success: true,
        message: "Password reset email sent successfully",
        emailId: data?.id,
      };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

/**
 * Public wrapper for sending password reset emails (for testing and manual use)
 *
 * Sends a professional HTML email with a password reset link to the user's email address.
 * Uses Resend for reliable email delivery with tracking and bounce handling.
 *
 * @param args.email - The user's email address
 * @param args.token - The password reset token to include in email link
 * @returns Object with success status and message (or error)
 * @throws Error if SITE_URL is not configured
 * @throws Error if RESEND_API_KEY is not configured
 * @throws Error if email sending fails
 *
 * @example
 * ```typescript
 * await ctx.runAction(api.passwordReset.sendPasswordResetEmail, {
 *   email: "user@example.com",
 *   token: "a1b2c3d4..."
 * });
 * ```
 *
 * **Reset Link Format**:
 * ```
 * {SITE_URL}/reset-password?token={token}
 * ```
 *
 * **Email Content**:
 * - From: "So Quotable" <onboarding@resend.dev>
 * - Subject: Reset your password - So Quotable
 * - HTML template with branded reset button
 * - 1-hour expiration notice
 * - Support contact information
 *
 * **Required Environment Variables** (set in Convex Dashboard):
 * - RESEND_API_KEY: Resend API key for sending emails
 * - SITE_URL: Base URL for reset links (e.g., https://quotable.app)
 *
 * **Development vs Production**:
 * - Development: Logs email to console if API key is "test-mode"
 * - Production: Requires domain verification in Resend dashboard
 *
 * **Error Handling**:
 * - Missing API key: Throws error with setup instructions
 * - Missing SITE_URL: Throws error with configuration guidance
 * - Email send failure: Throws error with Resend error details
 *
 * @see {@link https://resend.com/docs | Resend Documentation}
 * @see {@link requestPasswordReset} To generate a reset token
 */
export const sendPasswordResetEmail = action({
  args: {
    email: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate required environment variables
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable not set. Please add it to Convex Dashboard > Settings > Environment Variables.");
    }

    const siteUrl = process.env.SITE_URL;
    if (!siteUrl) {
      throw new Error("SITE_URL environment variable not set. Please add it to Convex Dashboard > Settings > Environment Variables.");
    }

    // Construct password reset link
    const resetLink = `${siteUrl}/reset-password?token=${args.token}`;

    // In test mode, just log the email instead of sending
    if (apiKey === "test-resend-api-key" || apiKey.startsWith("test-")) {
      console.log(`
📧 [TEST MODE] Password Reset Email
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${args.email}
Subject: Reset your password - So Quotable
Reset Link: ${resetLink}
Token Expiry: 1 hour
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);

      return {
        success: true,
        message: "Password reset email logged to console (test mode)",
      };
    }

    // Initialize Resend
    const resend = new Resend(apiKey);

    try {
      // Send password reset email
      const { data, error } = await resend.emails.send({
        from: "So Quotable <onboarding@resend.dev>",
        to: [args.email],
        subject: "Reset your password - So Quotable",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset your password</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">So Quotable</h1>
              </div>
              <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
                <p style="font-size: 16px; color: #555;">We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
                </div>
                <p style="font-size: 14px; color: #777; margin-top: 30px;">
                  This password reset link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
                </p>
                <p style="font-size: 14px; color: #777; margin-top: 20px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${resetLink}" style="color: #667eea; word-break: break-all;">${resetLink}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                  © ${new Date().getFullYear()} So Quotable. All rights reserved.
                </p>
              </div>
            </body>
          </html>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
      }

      console.log(`✅ Password reset email sent successfully to ${args.email} (Resend ID: ${data?.id})`);

      return {
        success: true,
        message: "Password reset email sent successfully",
        emailId: data?.id,
      };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error(`Failed to send password reset email: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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
