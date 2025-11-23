import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import schema from "./schema";
import { modules } from "./test.setup";

describe("email verification", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    // Set environment variable for email verification tests
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    t = convexTest(schema, modules);
  });

  describe("generateVerificationToken mutation", () => {
    it("should generate verification token for user", async () => {
      // Given: A user without verification
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "test@example.com",
          name: "Test User",
          slug: "test-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Generating verification token
      const tAuth = t.withIdentity({ subject: userId });
      const token = await tAuth.mutation(
        api.emailVerification.generateVerificationToken,
        {}
      );

      // Then: Token should be generated and stored
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);

      // And: User should have token and expiry
      const user = await t.run(async (ctx) => ctx.db.get(userId));
      expect(user!.verificationToken).toBe(token);
      expect(user!.tokenExpiry).toBeDefined();
      expect(user!.tokenExpiry!).toBeGreaterThan(Date.now());
    });

    it("should set token expiry to 24 hours from now", async () => {
      // Given: A user
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "expiry@example.com",
          name: "Expiry User",
          slug: "expiry-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Generating token
      const before = Date.now();
      const tAuth = t.withIdentity({ subject: userId });
      await tAuth.mutation(api.emailVerification.generateVerificationToken, {});
      const after = Date.now();

      // Then: Token expiry should be ~24 hours from now
      const user = await t.run(async (ctx) => ctx.db.get(userId));
      const expectedExpiry = before + 24 * 60 * 60 * 1000;
      const expectedExpiryEnd = after + 24 * 60 * 60 * 1000;
      expect(user!.tokenExpiry!).toBeGreaterThanOrEqual(expectedExpiry);
      expect(user!.tokenExpiry!).toBeLessThanOrEqual(expectedExpiryEnd);
    });

    it("should replace existing token when called again", async () => {
      // Given: A user with existing token
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "replace@example.com",
          name: "Replace User",
          slug: "replace-user",
          role: "user",
          verificationToken: "old-token",
          tokenExpiry: now + 1000,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Generating new token
      const tAuth = t.withIdentity({ subject: userId });
      const newToken = await tAuth.mutation(
        api.emailVerification.generateVerificationToken,
        {}
      );

      // Then: Token should be replaced
      expect(newToken).not.toBe("old-token");
      const user = await t.run(async (ctx) => ctx.db.get(userId));
      expect(user!.verificationToken).toBe(newToken);
    });

    it("should throw error when user not authenticated", async () => {
      // When: Generating token without authentication
      // Then: Should throw error
      await expect(
        t.mutation(api.emailVerification.generateVerificationToken, {})
      ).rejects.toThrow();
    });

    it("should throw error when user not found", async () => {
      // Given: A non-existent user
      const fakeUserId = "j57cu1paqwkycsvvhdwrcstg316q96pk" as Id<"users">;

      // When: Generating token with fake user
      const tAuth = t.withIdentity({ subject: fakeUserId });

      // Then: Should throw error
      await expect(
        tAuth.mutation(api.emailVerification.generateVerificationToken, {})
      ).rejects.toThrow();
    });
  });

  describe("verifyEmail mutation", () => {
    it("should verify email with valid token", async () => {
      // Given: A user with verification token
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "verify@example.com",
          name: "Verify User",
          slug: "verify-user",
          role: "user",
          verificationToken: "valid-token-123456789012345",
          tokenExpiry: now + 24 * 60 * 60 * 1000,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Verifying email with valid token
      const result = await t.mutation(api.emailVerification.verifyEmail, {
        token: "valid-token-123456789012345",
      });

      // Then: Email should be verified
      expect(result.success).toBe(true);

      // And: User should be updated
      const user = await t.run(async (ctx) => ctx.db.get(userId));
      expect(user!.emailVerificationTime).toBeDefined();
      expect(user!.verificationToken).toBeUndefined();
      expect(user!.tokenExpiry).toBeUndefined();
    });

    it("should reject expired token", async () => {
      // Given: A user with expired token
      await t.run(async (ctx) => {
        const now = Date.now();
        await ctx.db.insert("users", {
          email: "expired@example.com",
          name: "Expired User",
          slug: "expired-user",
          role: "user",
          verificationToken: "expired-token-123456789012345",
          tokenExpiry: now - 1000, // Expired 1 second ago
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Verifying with expired token
      const result = await t.mutation(api.emailVerification.verifyEmail, {
        token: "expired-token-123456789012345",
      });

      // Then: Should reject
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
          verificationToken: "correct-token",
          tokenExpiry: now + 24 * 60 * 60 * 1000,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Verifying with wrong token
      const result = await t.mutation(api.emailVerification.verifyEmail, {
        token: "wrong-token",
      });

      // Then: Should reject
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid");
    });

    it("should handle non-existent token", async () => {
      // When: Verifying with non-existent token
      const result = await t.mutation(api.emailVerification.verifyEmail, {
        token: "non-existent-token",
      });

      // Then: Should reject
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid");
    });

    it("should not verify already verified email", async () => {
      // Given: A user with already verified email
      const _userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "already@example.com",
          name: "Already User",
          slug: "already-user",
          role: "user",
          emailVerificationTime: now - 1000,
          verificationToken: "some-token-123456789012345",
          tokenExpiry: now + 24 * 60 * 60 * 1000,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Trying to verify again
      const result = await t.mutation(api.emailVerification.verifyEmail, {
        token: "some-token-123456789012345",
      });

      // Then: Should indicate already verified
      expect(result.success).toBe(true);
      expect(result.message).toContain("already verified");
    });
  });

  describe("resendVerificationEmail mutation", () => {
    it("should resend verification email for authenticated user", async () => {
      // Given: An unverified user
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "resend@example.com",
          name: "Resend User",
          slug: "resend-user",
          role: "user",
          verificationToken: "old-token",
          tokenExpiry: now - 1000, // Expired
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Resending verification email
      const tAuth = t.withIdentity({ subject: userId });
      const token = await tAuth.mutation(
        api.emailVerification.resendVerificationEmail,
        {}
      );

      // Then: New token should be generated
      expect(token).toBeDefined();
      expect(token).not.toBe("old-token");

      // And: Token should be updated in database
      const user = await t.run(async (ctx) => ctx.db.get(userId));
      expect(user!.verificationToken).toBe(token);
      expect(user!.tokenExpiry!).toBeGreaterThan(Date.now());
    });

    it("should throw error when user not authenticated", async () => {
      // When: Resending without authentication
      // Then: Should throw error
      await expect(
        t.mutation(api.emailVerification.resendVerificationEmail, {})
      ).rejects.toThrow();
    });

    it("should throw error if email already verified", async () => {
      // Given: A verified user
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "verified@example.com",
          name: "Verified User",
          slug: "verified-user",
          role: "user",
          emailVerificationTime: now,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Trying to resend
      const tAuth = t.withIdentity({ subject: userId });

      // Then: Should throw error
      await expect(
        tAuth.mutation(api.emailVerification.resendVerificationEmail, {})
      ).rejects.toThrow(/already verified/i);
    });

    it("should throw error when user not found", async () => {
      // Given: A non-existent user
      const fakeUserId = "j57cu1paqwkycsvvhdwrcstg316q96pk" as Id<"users">;

      // When: Resending with fake user
      const tAuth = t.withIdentity({ subject: fakeUserId });

      // Then: Should throw error
      await expect(
        tAuth.mutation(api.emailVerification.resendVerificationEmail, {})
      ).rejects.toThrow();
    });
  });

  describe("sendVerificationEmail action", () => {
    it("should log verification email to console (MVP)", async () => {
      // Given: A user with verification token
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "send@example.com",
          name: "Send User",
          slug: "send-user",
          role: "user",
          verificationToken: "test-token-123",
          tokenExpiry: now + 24 * 60 * 60 * 1000,
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Sending verification email
      const tAuth = t.withIdentity({ subject: userId });
      const token = await tAuth.mutation(
        api.emailVerification.generateVerificationToken,
        {}
      );

      const result = await tAuth.action(
        api.emailVerificationActions.sendVerificationEmail,
        {
          userId,
          token, // Use actual token
        }
      );

      // Then: Should return success
      expect(result.success).toBe(true);
      expect(result.message).toContain("console");
    });
  });
});
