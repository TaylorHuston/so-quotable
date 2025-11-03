import { v } from "convex/values";
import { mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Generate a verification token for the current user
 *
 * This mutation:
 * 1. Generates a random verification token
 * 2. Sets token expiry to 24 hours from now
 * 3. Stores token in user record
 * 4. Returns the token (for use in verification email)
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
 * Verify email with verification token
 *
 * This mutation:
 * 1. Finds user by verification token
 * 2. Checks token hasn't expired
 * 3. Sets emailVerificationTime
 * 4. Clears verification token and expiry
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
 * Resend verification email
 *
 * This mutation:
 * 1. Checks user is authenticated
 * 2. Checks email not already verified
 * 3. Generates new verification token
 * 4. Returns token (for use in verification email)
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
 * Send verification email action (MVP: console logging)
 *
 * For MVP, this action logs the verification link to the console.
 * In production, this should send an actual email via SendGrid, Mailgun, etc.
 *
 * This action:
 * 1. Gets user email and token
 * 2. Constructs verification link
 * 3. Logs to console (MVP) or sends email (production)
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

    // Construct verification link
    // In production, this would use actual domain
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL environment variable not set for email verification link");
    }
    const verificationLink = `${appUrl}/verify-email?token=${args.token}`;

    // MVP: Log to console
    // In production: Send email via SendGrid, Mailgun, etc.
    console.log("\n==========================================");
    console.log("EMAIL VERIFICATION (MVP - Console Log)");
    console.log("==========================================");
    console.log(`To: ${user.email}`);
    console.log(`Subject: Verify your email address`);
    console.log(`\nHello ${user.name},`);
    console.log("\nPlease verify your email address by clicking the link below:");
    console.log(`\n${verificationLink}`);
    console.log("\nThis link will expire in 24 hours.");
    console.log("\n==========================================\n");

    return {
      success: true,
      message: "Verification email logged to console (MVP)",
    };
  },
});
