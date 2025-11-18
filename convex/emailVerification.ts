"use node";

import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { Resend } from "resend";

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

/**
 * Send verification email to user via Resend
 *
 * Sends a professional HTML email with a verification link to the user's email address.
 * Uses Resend for reliable email delivery with tracking and bounce handling.
 *
 * @param args.userId - The user's unique identifier
 * @param args.token - The verification token to include in email link
 * @returns Object with success status and message (or error)
 * @throws Error if user is not found
 * @throws Error if SITE_URL is not configured
 * @throws Error if RESEND_API_KEY is not configured
 * @throws Error if email sending fails
 *
 * @example
 * ```typescript
 * // After generating a token, send verification email
 * const token = await ctx.runMutation(api.emailVerification.generateVerificationToken);
 * await ctx.runAction(api.emailVerification.sendVerificationEmail, {
 *   userId: user._id,
 *   token
 * });
 * ```
 *
 * **Verification Link Format**:
 * ```
 * {SITE_URL}/verify-email?token={token}
 * ```
 *
 * **Email Content**:
 * - From: "So Quotable" <onboarding@resend.dev>
 * - Subject: Verify your email address - So Quotable
 * - HTML template with branded verification button
 * - 24-hour expiration notice
 * - Support contact information
 *
 * **Required Environment Variables** (set in Convex Dashboard):
 * - RESEND_API_KEY: Resend API key for sending emails
 * - SITE_URL: Base URL for verification links (e.g., https://quotable.app)
 *
 * **Development vs Production**:
 * - Development: Emails sent to verified sender address only
 * - Production: Requires domain verification in Resend dashboard
 *
 * **Error Handling**:
 * - Missing API key: Throws error with setup instructions
 * - Missing SITE_URL: Throws error with configuration guidance
 * - Email send failure: Throws error with Resend error details
 * - Invalid user: Throws error if user not found
 *
 * @see {@link https://resend.com/docs | Resend Documentation}
 * @see {@link https://resend.com/docs/send-with-nodejs | Resend Node.js Guide}
 * @see {@link generateVerificationToken} To create a verification token
 * @see {@link verifyEmail} To validate the token
 */
export const sendVerificationEmail = action({
  args: {
    userId: v.id("users"),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user details
    const user = await ctx.runQuery(api.users.getCurrentUser, {});

    if (!user) {
      throw new Error("User not found");
    }

    // Validate required environment variables
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable not set. Please add it to Convex Dashboard > Settings > Environment Variables.");
    }

    const siteUrl = process.env.SITE_URL;
    if (!siteUrl) {
      throw new Error("SITE_URL environment variable not set. Please add it to Convex Dashboard > Settings > Environment Variables.");
    }

    // Construct verification link
    const verificationLink = `${siteUrl}/verify-email?token=${args.token}`;

    // Initialize Resend
    const resend = new Resend(apiKey);

    try {
      // Send verification email
      const { data, error } = await resend.emails.send({
        from: "So Quotable <onboarding@resend.dev>",
        to: [user.email],
        subject: "Verify your email address - So Quotable",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify your email</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">So Quotable</h1>
              </div>
              <div style="background: #ffffff; padding: 40px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <h2 style="color: #333; margin-top: 0;">Hello ${user.name},</h2>
                <p style="font-size: 16px; color: #555;">Thank you for signing up for So Quotable! To get started, please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${verificationLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email Address</a>
                </div>
                <p style="font-size: 14px; color: #777; margin-top: 30px;">
                  This verification link will expire in <strong>24 hours</strong>. If you didn't create an account with So Quotable, you can safely ignore this email.
                </p>
                <p style="font-size: 14px; color: #777; margin-top: 20px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <a href="${verificationLink}" style="color: #667eea; word-break: break-all;">${verificationLink}</a>
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
        throw new Error(`Failed to send verification email: ${error.message}`);
      }

      console.log(`✅ Verification email sent successfully to ${user.email} (Resend ID: ${data?.id})`);

      return {
        success: true,
        message: "Verification email sent successfully",
        emailId: data?.id,
      };
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error(`Failed to send verification email: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});
