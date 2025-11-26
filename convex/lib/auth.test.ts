import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { Id } from "../_generated/dataModel";
import schema from "../schema";
import { modules } from "../test.setup";
import { requireAuth, requireOwnerOrAdmin, requireAdmin, AUTH_ERRORS } from "./auth";

describe("auth helper functions", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("requireAuth", () => {
    it("should return userId when user is authenticated", async () => {
      // Given: An authenticated user
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "auth@example.com",
          name: "Auth User",
          slug: "auth-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Calling requireAuth with authenticated context
      const tAuth = t.withIdentity({ subject: userId });
      const result = await tAuth.run(async (ctx) => {
        return await requireAuth(ctx);
      });

      // Then: Should return the userId
      expect(result).toBe(userId);
    });

    it("should throw error when user is not authenticated", async () => {
      // Given: No authentication (no identity set)
      // When: Calling requireAuth without authentication
      // Then: Should throw authentication error
      await expect(async () => {
        await t.run(async (ctx) => {
          return await requireAuth(ctx);
        });
      }).rejects.toThrow(AUTH_ERRORS.NOT_AUTHENTICATED);
    });
  });

  describe("requireOwnerOrAdmin", () => {
    it("should pass when user is the owner of the resource", async () => {
      // Given: A user who owns a resource
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "owner@example.com",
          name: "Resource Owner",
          slug: "resource-owner",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Calling requireOwnerOrAdmin with owner's context
      const tAuth = t.withIdentity({ subject: userId });
      const result = await tAuth.run(async (ctx) => {
        return await requireOwnerOrAdmin(ctx, userId);
      });

      // Then: Should pass and return userId with isAdmin false
      expect(result.userId).toBe(userId);
      expect(result.isAdmin).toBe(false);
    });

    it("should pass when user is an admin (admin bypass)", async () => {
      // Given: An admin user
      const adminUserId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "admin@example.com",
          name: "Admin User",
          slug: "admin-user",
          role: "admin",
          createdAt: now,
          updatedAt: now,
        });
      });

      // And: A resource owned by a different user
      const ownerUserId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "owner@example.com",
          name: "Owner User",
          slug: "owner-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Admin tries to access someone else's resource
      const tAuth = t.withIdentity({ subject: adminUserId });
      const result = await tAuth.run(async (ctx) => {
        return await requireOwnerOrAdmin(ctx, ownerUserId);
      });

      // Then: Should pass with admin bypass
      expect(result.userId).toBe(adminUserId);
      expect(result.isAdmin).toBe(true);
    });

    it("should throw error when user is neither owner nor admin", async () => {
      // Given: Two regular users
      const user1Id = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "user1@example.com",
          name: "User One",
          slug: "user-one",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      const user2Id = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "user2@example.com",
          name: "User Two",
          slug: "user-two",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: User1 tries to access User2's resource
      // Then: Should throw authorization error
      const tAuth = t.withIdentity({ subject: user1Id });
      await expect(async () => {
        await tAuth.run(async (ctx) => {
          return await requireOwnerOrAdmin(ctx, user2Id);
        });
      }).rejects.toThrow(AUTH_ERRORS.NOT_AUTHORIZED);
    });

  });

  describe("requireAdmin", () => {
    it("should pass when user is an admin", async () => {
      // Given: An admin user
      const adminUserId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "admin@example.com",
          name: "Admin User",
          slug: "admin-user",
          role: "admin",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Calling requireAdmin with admin context
      const tAuth = t.withIdentity({ subject: adminUserId });
      const result = await tAuth.run(async (ctx) => {
        return await requireAdmin(ctx);
      });

      // Then: Should return the admin userId
      expect(result).toBe(adminUserId);
    });

    it("should throw error when user is not an admin", async () => {
      // Given: A regular user
      const userId = await t.run(async (ctx) => {
        const now = Date.now();
        return await ctx.db.insert("users", {
          email: "user@example.com",
          name: "Regular User",
          slug: "regular-user",
          role: "user",
          createdAt: now,
          updatedAt: now,
        });
      });

      // When: Calling requireAdmin with non-admin context
      // Then: Should throw admin-only error
      const tAuth = t.withIdentity({ subject: userId });
      await expect(async () => {
        await tAuth.run(async (ctx) => {
          return await requireAdmin(ctx);
        });
      }).rejects.toThrow(AUTH_ERRORS.ADMIN_ONLY);
    });

    it("should throw error when user is not authenticated", async () => {
      // Given: No authentication (no identity set)
      // When: Calling requireAdmin without authentication
      // Then: Should throw authentication error
      await expect(async () => {
        await t.run(async (ctx) => {
          return await requireAdmin(ctx);
        });
      }).rejects.toThrow(AUTH_ERRORS.NOT_AUTHENTICATED);
    });
  });
});
