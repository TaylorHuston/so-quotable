"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Resend } from "resend";
import { modifyAccountCredentials } from "@convex-dev/auth/server";
export const resetPasswordWithToken = action({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string; message?: string; userId?: any }> => {
    // Validate token format
    if (!args.token || args.token.length < 20) {
      return {
        success: false,
        error: "Invalid password reset token",
      };
    }

    // Find user by reset token
    const user = await ctx.runQuery(internal.passwordReset.getUserByResetToken, {
      token: args.token,
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

    // Check user has email
    if (!user.email) {
      return {
        success: false,
        error: "User email not found",
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
  handler: async (ctx, args): Promise<{ success: boolean; message: string; emailId?: string }> => {
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
  handler: async (ctx, args): Promise<{ success: boolean; message: string; emailId?: string }> => {
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
