import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import schema from "./schema";
import { modules } from "./test.setup";

describe("password reset", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    // Set environment variables for password reset tests
    process.env.SITE_URL = "http://localhost:3000";
    process.env.RESEND_API_KEY = "test-resend-api-key";
    t = convexTest(schema, modules);
  });

  describe("requestPasswordReset mutation", () => {
    it("should generate password reset token for valid email", async () => {
      // Given: A user with email
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "reset@example.com",
          name: "Reset User",
          slug: "reset-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Requesting password reset
      const result = await t.mutation(api.passwordReset.requestPasswordReset, {
        email: "reset@example.com",
      });

      // Then: Should return success (don't reveal if email exists)
      expect(result.success).toBe(true);
      expect(result.message).toContain("password reset email");

      // And: User should have reset token and expiry
      const user = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), "reset@example.com"))
          .first();
      });

      expect(user!.passwordResetToken).toBeDefined();
      expect(typeof user!.passwordResetToken).toBe("string");
      expect(user!.passwordResetToken!.length).toBeGreaterThan(20);
      expect(user!.passwordResetTokenExpiry).toBeDefined();
      expect(user!.passwordResetTokenExpiry!).toBeGreaterThan(Date.now());
    });

    it("should set token expiry to 1 hour from now (not 24 hours)", async () => {
      // Given: A user
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "expiry@example.com",
          name: "Expiry User",
          slug: "expiry-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Requesting password reset
      const before = Date.now();
      await t.mutation(api.passwordReset.requestPasswordReset, {
        email: "expiry@example.com",
      });
      const after = Date.now();

      // Then: Token expiry should be ~1 hour from now (not 24)
      const user = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), "expiry@example.com"))
          .first();
      });

      const expectedExpiry = before + 60 * 60 * 1000; // 1 hour
      const expectedExpiryEnd = after + 60 * 60 * 1000;
      expect(user!.passwordResetTokenExpiry!).toBeGreaterThanOrEqual(expectedExpiry);
      expect(user!.passwordResetTokenExpiry!).toBeLessThanOrEqual(expectedExpiryEnd);

      // Verify it's NOT 24 hours
      const twentyFourHours = before + 24 * 60 * 60 * 1000;
      expect(user!.passwordResetTokenExpiry!).toBeLessThan(twentyFourHours - 1000);
    });

    it("should not reveal if email does not exist (prevent enumeration)", async () => {
      // When: Requesting reset for non-existent email
      const result = await t.mutation(api.passwordReset.requestPasswordReset, {
        email: "nonexistent@example.com",
      });

      // Then: Should return success message (don't reveal email doesn't exist)
      expect(result.success).toBe(true);
      expect(result.message).toContain("password reset email");

      // And: No token should be created (but we can't tell from response)
      const user = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), "nonexistent@example.com"))
          .first();
      });

      expect(user).toBeNull();
    });

    it("should enforce rate limit: max 3 requests per hour per email", async () => {
      // Given: A user
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "ratelimit@example.com",
          name: "Rate Limit User",
          slug: "ratelimit-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Making 3 password reset requests (should all succeed)
      for (let i = 0; i < 3; i++) {
        const result = await t.mutation(api.passwordReset.requestPasswordReset, {
          email: "ratelimit@example.com",
        });
        expect(result.success).toBe(true);
      }

      // And: Making 4th request within same hour
      const result = await t.mutation(api.passwordReset.requestPasswordReset, {
        email: "ratelimit@example.com",
      });

      // Then: Should return success (don't reveal rate limit hit)
      // But token should NOT be updated
      expect(result.success).toBe(true);

      // And: Rate limit counter should be at 3 (not 4)
      const user = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), "ratelimit@example.com"))
          .first();
      });

      expect(user!.passwordResetRequests).toBe(3);
    });

    it("should reset rate limit counter after 1 hour", async () => {
      // Given: A user who made 3 requests over an hour ago
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        const oneHourAgo = now - 61 * 60 * 1000; // 61 minutes ago

        return await ctx.db.insert("users", {
          email: "resetlimit@example.com",
          name: "Reset Limit User",
          slug: "resetlimit-user",
          role: "user",
          passwordResetRequests: 3,
          lastPasswordResetRequest: oneHourAgo,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Making new password reset request
      const result = await t.mutation(api.passwordReset.requestPasswordReset, {
        email: "resetlimit@example.com",
      });

      // Then: Should succeed
      expect(result.success).toBe(true);

      // And: Counter should be reset to 1
      const user = await t.run(async (ctx) => ctx.db.get(userId));
      expect(user!.passwordResetRequests).toBe(1);
      expect(user!.lastPasswordResetRequest).toBeGreaterThan(Date.now() - 1000);
    });

    it("should replace existing token when called again", async () => {
      // Given: A user with existing reset token
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "replace@example.com",
          name: "Replace User",
          slug: "replace-user",
          role: "user",
          passwordResetToken: "old-reset-token",
          passwordResetTokenExpiry: now + 1000,
          passwordResetRequests: 1,
          lastPasswordResetRequest: now - 5 * 60 * 1000, // 5 minutes ago
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Requesting new reset
      await t.mutation(api.passwordReset.requestPasswordReset, {
        email: "replace@example.com",
      });

      // Then: Token should be replaced
      const user = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), "replace@example.com"))
          .first();
      });

      expect(user!.passwordResetToken).not.toBe("old-reset-token");
      expect(user!.passwordResetToken).toBeDefined();
    });

    it("should normalize email before lookup", async () => {
      // Given: A user with lowercase email
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "normalize@example.com",
          name: "Normalize User",
          slug: "normalize-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Requesting reset with uppercase email
      const result = await t.mutation(api.passwordReset.requestPasswordReset, {
        email: "NORMALIZE@EXAMPLE.COM",
      });

      // Then: Should succeed
      expect(result.success).toBe(true);

      // And: Token should be set
      const user = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), "normalize@example.com"))
          .first();
      });

      expect(user!.passwordResetToken).toBeDefined();
    });
  });

  describe("resetPasswordWithToken mutation", () => {
    it("should reset password with valid token", async () => {
      // Given: A user with valid reset token
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "validreset@example.com",
          name: "Valid Reset User",
          slug: "validreset-user",
          role: "user",
          passwordResetToken: "valid-reset-token-12345678901234",
          passwordResetTokenExpiry: now + 60 * 60 * 1000, // 1 hour from now
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Resetting password with valid token
      const result = await t.action(api.passwordResetActions.resetPasswordWithToken, {
        token: "valid-reset-token-12345678901234",
        newPassword: "NewPassword123!",
      });

      // Then: Should succeed
      expect(result.success).toBe(true);
      expect(result.message).toContain("Password reset successful");

      // And: Token should be cleared
      const user = await t.run(async (ctx) => ctx.db.get(userId));
      expect(user!.passwordResetToken).toBeUndefined();
      expect(user!.passwordResetTokenExpiry).toBeUndefined();

      // And: Rate limit counters should be cleared
      expect(user!.passwordResetRequests).toBeUndefined();
      expect(user!.lastPasswordResetRequest).toBeUndefined();
    });

    it("should validate password meets NIST requirements", async () => {
      // Given: A user with valid reset token
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "weakpass@example.com",
          name: "Weak Pass User",
          slug: "weakpass-user",
          role: "user",
          passwordResetToken: "weak-token-123456789012345",
          passwordResetTokenExpiry: now + 60 * 60 * 1000,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Trying to reset with weak password
      const result = await t.action(api.passwordResetActions.resetPasswordWithToken, {
        token: "weak-token-123456789012345",
        newPassword: "weak",
      });

      // Then: Should fail
      expect(result.success).toBe(false);
      expect(result.error).toContain("at least 12 characters");
    });

    it("should reject expired token", async () => {
      // Given: A user with expired reset token
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "expired@example.com",
          name: "Expired User",
          slug: "expired-user",
          role: "user",
          passwordResetToken: "expired-token-123456789012345",
          passwordResetTokenExpiry: now - 1000, // Expired 1 second ago
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Trying to reset with expired token
      const result = await t.action(api.passwordResetActions.resetPasswordWithToken, {
        token: "expired-token-123456789012345",
        newPassword: "NewPassword123!",
      });

      // Then: Should fail
      expect(result.success).toBe(false);
      expect(result.error).toContain("expired");
    });

    it("should reject invalid token", async () => {
      // Given: A user with different token
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "invalid@example.com",
          name: "Invalid User",
          slug: "invalid-user",
          role: "user",
          passwordResetToken: "correct-token",
          passwordResetTokenExpiry: now + 60 * 60 * 1000,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Trying to reset with wrong token
      const result = await t.action(api.passwordResetActions.resetPasswordWithToken, {
        token: "wrong-token",
        newPassword: "NewPassword123!",
      });

      // Then: Should fail
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid");
    });

    it("should reject token with invalid format", async () => {
      // When: Trying to reset with short token
      const result = await t.action(api.passwordResetActions.resetPasswordWithToken, {
        token: "short",
        newPassword: "NewPassword123!",
      });

      // Then: Should fail
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid");
    });

    it("should handle non-existent token", async () => {
      // When: Trying to reset with non-existent token
      const result = await t.action(api.passwordResetActions.resetPasswordWithToken, {
        token: "nonexistent-token-12345678901234",
        newPassword: "NewPassword123!",
      });

      // Then: Should fail
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid");
    });

    it("should be single-use: token cleared after successful reset", async () => {
      // Given: A user with valid reset token
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "singleuse@example.com",
          name: "Single Use User",
          slug: "singleuse-user",
          role: "user",
          passwordResetToken: "single-use-token-12345678901234",
          passwordResetTokenExpiry: now + 60 * 60 * 1000,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Resetting password successfully
      const result1 = await t.action(api.passwordResetActions.resetPasswordWithToken, {
        token: "single-use-token-12345678901234",
        newPassword: "NewPassword123!",
      });

      expect(result1.success).toBe(true);

      // And: Trying to use same token again
      const result2 = await t.action(api.passwordResetActions.resetPasswordWithToken, {
        token: "single-use-token-12345678901234",
        newPassword: "AnotherPassword123!",
      });

      // Then: Should fail (token no longer exists)
      expect(result2.success).toBe(false);
      expect(result2.error).toContain("Invalid");
    });
  });

  describe("sendPasswordResetEmail action", () => {
    it("should send password reset email in test mode", async () => {
      // When: Sending password reset email with test API key
      const result = await t.action(api.passwordResetActions.sendPasswordResetEmail, {
        email: "sendreset@example.com",
        token: "reset-token-123456789012345",
      });

      // Then: Should return success (test mode logs to console)
      expect(result.success).toBe(true);
      expect(result.message).toContain("test mode");
    });

    it("should throw error if SITE_URL not configured", async () => {
      // Given: SITE_URL not set
      delete process.env.SITE_URL;

      // When: Trying to send email
      // Then: Should throw error
      await expect(
        t.action(api.passwordResetActions.sendPasswordResetEmail, {
          email: "test@example.com",
          token: "test-token",
        })
      ).rejects.toThrow(/SITE_URL/);

      // Restore for other tests
      process.env.SITE_URL = "http://localhost:3000";
    });

    it("should throw error if RESEND_API_KEY not configured", async () => {
      // Given: RESEND_API_KEY not set
      delete process.env.RESEND_API_KEY;

      // When: Trying to send email
      // Then: Should throw error
      await expect(
        t.action(api.passwordResetActions.sendPasswordResetEmail, {
          email: "test@example.com",
          token: "test-token",
        })
      ).rejects.toThrow(/RESEND_API_KEY/);

      // Restore for other tests
      process.env.RESEND_API_KEY = "test-resend-api-key";
    });
  });
});
