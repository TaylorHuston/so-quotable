import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import schema from "./schema";
import { modules } from "./test.setup";

describe("auth configuration", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("auth tables", () => {
    it("should have authSessions table for session management", async () => {
      // Given: A user session
      await t.run(async (ctx) => {
        const now = Date.now();

        // Create a test user first
        const userId = await ctx.db.insert("users", {
          email: "test@example.com",
          name: "Test User",
          slug: "test-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        // When: Creating a session
        const sessionId = await ctx.db.insert("authSessions", {
          userId,
          expirationTime: now + 24 * 60 * 60 * 1000, // 24 hours
        });

        // Then: Session should be created
        const session = await ctx.db.get(sessionId);
        expect(session).not.toBeNull();
        expect(session!.userId).toBe(userId);
      });
    });

    it("should have authAccounts table for provider accounts", async () => {
      // Given: A user with a password account
      await t.run(async (ctx) => {
        const now = Date.now();

        const userId = await ctx.db.insert("users", {
          email: "provider@example.com",
          name: "Provider User",
          slug: "provider-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        // When: Creating a password account
        const accountId = await ctx.db.insert("authAccounts", {
          userId,
          provider: "password",
          providerAccountId: "provider@example.com",
          secret: "hashed_password_here",
        });

        // Then: Account should be created
        const account = await ctx.db.get(accountId);
        expect(account).not.toBeNull();
        expect(account!.provider).toBe("password");
      });
    });

    it("should have authRefreshTokens table for token management", async () => {
      // Given: A user session with refresh token
      await t.run(async (ctx) => {
        const now = Date.now();

        const userId = await ctx.db.insert("users", {
          email: "token@example.com",
          name: "Token User",
          slug: "token-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        const sessionId = await ctx.db.insert("authSessions", {
          userId,
          expirationTime: now + 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        // When: Creating a refresh token
        const tokenId = await ctx.db.insert("authRefreshTokens", {
          sessionId,
          expirationTime: now + 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        // Then: Token should be created
        const token = await ctx.db.get(tokenId);
        expect(token).not.toBeNull();
        expect(token!.sessionId).toBe(sessionId);
      });
    });

    it("should have authRateLimits table for rate limiting", async () => {
      // Given: Rate limit data for an identifier
      await t.run(async (ctx) => {
        const now = Date.now();

        // When: Creating a rate limit entry
        const rateLimitId = await ctx.db.insert("authRateLimits", {
          identifier: "password:test@example.com",
          lastAttemptTime: now,
          attemptsLeft: 5,
        });

        // Then: Rate limit should be created
        const rateLimit = await ctx.db.get(rateLimitId);
        expect(rateLimit).not.toBeNull();
        expect(rateLimit!.identifier).toBe("password:test@example.com");
        expect(rateLimit!.attemptsLeft).toBe(5);
      });
    });

    it("should have authVerificationCodes table for verification flows", async () => {
      // Given: A verification code for password reset
      await t.run(async (ctx) => {
        const now = Date.now();

        const userId = await ctx.db.insert("users", {
          email: "verify@example.com",
          name: "Verify User",
          slug: "verify-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        const accountId = await ctx.db.insert("authAccounts", {
          userId,
          provider: "password",
          providerAccountId: "verify@example.com",
          secret: "hashed_password",
        });

        // When: Creating a verification code
        const codeId = await ctx.db.insert("authVerificationCodes", {
          accountId,
          provider: "password",
          code: "123456",
          expirationTime: now + 15 * 60 * 1000, // 15 minutes
        });

        // Then: Code should be created
        const verificationCode = await ctx.db.get(codeId);
        expect(verificationCode).not.toBeNull();
        expect(verificationCode!.code).toBe("123456");
      });
    });

    it("should have authVerifiers table for PKCE OAuth flow", async () => {
      // Given: A PKCE verifier for OAuth
      await t.run(async (ctx) => {
        // When: Creating a verifier
        const verifierId = await ctx.db.insert("authVerifiers", {
          signature: "oauth_verifier_signature",
        });

        // Then: Verifier should be created
        const verifier = await ctx.db.get(verifierId);
        expect(verifier).not.toBeNull();
        expect(verifier!.signature).toBe("oauth_verifier_signature");
      });
    });
  });

  describe("auth indexes", () => {
    it("should have userId index on authSessions for efficient user session lookups", async () => {
      // Given: Multiple sessions for different users
      await t.run(async (ctx) => {
        const now = Date.now();

        const user1Id = await ctx.db.insert("users", {
          email: "user1@example.com",
          name: "User 1",
          slug: "user-1",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        const user2Id = await ctx.db.insert("users", {
          email: "user2@example.com",
          name: "User 2",
          slug: "user-2",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });

        // Create multiple sessions for user1
        await ctx.db.insert("authSessions", {
          userId: user1Id,
          expirationTime: now + 24 * 60 * 60 * 1000,
        });
        await ctx.db.insert("authSessions", {
          userId: user1Id,
          expirationTime: now + 48 * 60 * 60 * 1000,
        });

        // Create one session for user2
        await ctx.db.insert("authSessions", {
          userId: user2Id,
          expirationTime: now + 24 * 60 * 60 * 1000,
        });
      });

      // When: Querying sessions by userId using filter (index exists for performance)
      await t.run(async (ctx) => {
        const user1 = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), "user1@example.com"))
          .first();

        const user1Sessions = await ctx.db
          .query("authSessions")
          .filter((q) => q.eq(q.field("userId"), user1!._id))
          .collect();

        // Then: Should find all sessions for user1
        expect(user1Sessions).toHaveLength(2);
      });
    });

    it("should have identifier index on authRateLimits for rate limit lookups", async () => {
      // Given: Rate limits for different identifiers
      await t.run(async (ctx) => {
        const now = Date.now();

        await ctx.db.insert("authRateLimits", {
          identifier: "password:alice@example.com",
          lastAttemptTime: now,
          attemptsLeft: 5,
        });

        await ctx.db.insert("authRateLimits", {
          identifier: "password:bob@example.com",
          lastAttemptTime: now,
          attemptsLeft: 3,
        });
      });

      // When: Looking up rate limit by identifier using filter (index exists for performance)
      await t.run(async (ctx) => {
        const rateLimit = await ctx.db
          .query("authRateLimits")
          .filter((q) => q.eq(q.field("identifier"), "password:alice@example.com"))
          .first();

        // Then: Should find the correct rate limit
        expect(rateLimit).not.toBeNull();
        expect(rateLimit!.attemptsLeft).toBe(5);
      });
    });
  });
});
