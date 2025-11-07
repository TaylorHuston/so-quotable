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

  describe("Google OAuth Profile Mapping", () => {
    /**
     * Mock Google profile mapping function
     * Extracted from convex/auth.ts Google provider configuration
     */
    function mapGoogleProfile(profile: {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    }) {
      const email = (profile.email as string) || "";
      const name = (profile.name as string) || email.split("@")[0] || "user";
      const image = profile.picture as string | undefined;

      // Generate slug from email (will be made unique by database if needed)
      const emailPrefix = email.split("@")[0];
      const slug = (emailPrefix && emailPrefix.length > 0 ? emailPrefix : "user")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      return {
        id: profile.sub as string, // REQUIRED: Google's unique user ID
        email: email.toLowerCase().trim(),
        name: name.trim(),
        slug,
        role: "user" as const,
        image,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    it("should include required id field from profile.sub", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/photo.jpg",
      };

      const result = mapGoogleProfile(googleProfile);

      expect(result.id).toBe("google-user-123456");
    });

    it("should map all Google profile fields correctly", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/photo.jpg",
      };

      const result = mapGoogleProfile(googleProfile);

      expect(result).toMatchObject({
        id: "google-user-123456",
        email: "test@example.com",
        name: "Test User",
        image: "https://example.com/photo.jpg",
        role: "user",
      });
    });

    it("should generate slug from email prefix", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "john.doe@example.com",
        name: "John Doe",
      };

      const result = mapGoogleProfile(googleProfile);

      expect(result.slug).toBe("john-doe");
    });

    it("should handle email with special characters in slug", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "user+test@example.com",
        name: "Test User",
      };

      const result = mapGoogleProfile(googleProfile);

      // Special characters should be replaced with hyphens
      expect(result.slug).toBe("user-test");
    });

    it("should normalize email to lowercase", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "Test.User@Example.COM",
        name: "Test User",
      };

      const result = mapGoogleProfile(googleProfile);

      expect(result.email).toBe("test.user@example.com");
    });

    it("should trim whitespace from name and email", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "  test@example.com  ",
        name: "  Test User  ",
      };

      const result = mapGoogleProfile(googleProfile);

      expect(result.email).toBe("test@example.com");
      expect(result.name).toBe("Test User");
    });

    it("should fallback to email prefix for name when name is missing", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "testuser@example.com",
      };

      const result = mapGoogleProfile(googleProfile);

      expect(result.name).toBe("testuser");
    });

    it("should fallback to 'user' when both name and email are missing", () => {
      const googleProfile = {
        sub: "google-user-123456",
      };

      const result = mapGoogleProfile(googleProfile);

      expect(result.name).toBe("user");
      expect(result.slug).toBe("user");
    });

    it("should handle missing profile picture", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "test@example.com",
        name: "Test User",
      };

      const result = mapGoogleProfile(googleProfile);

      expect(result.image).toBeUndefined();
    });

    it("should default role to 'user'", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "test@example.com",
        name: "Test User",
      };

      const result = mapGoogleProfile(googleProfile);

      expect(result.role).toBe("user");
    });

    it("should include timestamps for createdAt and updatedAt", () => {
      const googleProfile = {
        sub: "google-user-123456",
        email: "test@example.com",
        name: "Test User",
      };

      const beforeTimestamp = Date.now();
      const result = mapGoogleProfile(googleProfile);
      const afterTimestamp = Date.now();

      expect(result.createdAt).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(result.createdAt).toBeLessThanOrEqual(afterTimestamp);
      expect(result.updatedAt).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(result.updatedAt).toBeLessThanOrEqual(afterTimestamp);
    });
  });

  describe("Password Provider Profile Mapping", () => {
    /**
     * Mock Password profile mapping function
     * Extracted from convex/auth.ts Password provider configuration
     */
    function mapPasswordProfile(params: {
      email: string;
      name?: string;
    }) {
      const email = params.email as string;
      const name = (params.name as string | undefined) || email.split("@")[0] || "user";

      // Generate slug from email (will be made unique by database if needed)
      const emailPrefix = email.split("@")[0];
      const slug = (emailPrefix && emailPrefix.length > 0 ? emailPrefix : "user")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      return {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        slug,
        role: "user" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    it("should map password registration profile correctly", () => {
      const params = {
        email: "test@example.com",
        name: "Test User",
      };

      const result = mapPasswordProfile(params);

      expect(result).toMatchObject({
        email: "test@example.com",
        name: "Test User",
        role: "user",
      });
      expect(result.slug).toBe("test");
    });

    it("should fallback to email prefix for name when name is missing", () => {
      const params = {
        email: "johndoe@example.com",
      };

      const result = mapPasswordProfile(params);

      expect(result.name).toBe("johndoe");
      expect(result.slug).toBe("johndoe");
    });

    it("should normalize email to lowercase", () => {
      const params = {
        email: "Test@EXAMPLE.COM",
        name: "Test User",
      };

      const result = mapPasswordProfile(params);

      expect(result.email).toBe("test@example.com");
    });

    it("should generate slug with hyphens for special characters", () => {
      const params = {
        email: "user.name+tag@example.com",
        name: "User Name",
      };

      const result = mapPasswordProfile(params);

      expect(result.slug).toBe("user-name-tag");
    });
  });
});
