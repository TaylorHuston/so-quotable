import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import schema from "./schema";
import { modules } from "./test.setup";
import { createTestUser, asUser } from "./test.helpers";
import { requireAuth } from "./lib/auth";

describe("test.helpers", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("createTestUser", () => {
    it("should create a user with default values", async () => {
      // When: Creating a test user with no options
      const userId = await t.run(async (ctx) => {
        return await createTestUser(ctx);
      });

      // Then: User should be created with defaults
      expect(userId).toBeDefined();
      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });
      expect(user).not.toBeNull();
      expect(user?.email).toMatch(/^test-\d+[a-z0-9]+@example\.com$/);
      expect(user?.name).toBe("Test User");
      expect(user?.role).toBe("user");
    });

    it("should create a user with custom email", async () => {
      // When: Creating a test user with custom email
      const userId = await t.run(async (ctx) => {
        return await createTestUser(ctx, { email: "custom@example.com" });
      });

      // Then: User should have the custom email
      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });
      expect(user?.email).toBe("custom@example.com");
    });

    it("should create a user with custom name", async () => {
      // When: Creating a test user with custom name
      const userId = await t.run(async (ctx) => {
        return await createTestUser(ctx, { name: "Jane Doe" });
      });

      // Then: User should have the custom name
      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });
      expect(user?.name).toBe("Jane Doe");
    });

    it("should create an admin user when role is admin", async () => {
      // When: Creating an admin test user
      const userId = await t.run(async (ctx) => {
        return await createTestUser(ctx, { role: "admin" });
      });

      // Then: User should have admin role
      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });
      expect(user?.role).toBe("admin");
    });

    it("should generate unique slugs for multiple users", async () => {
      // When: Creating multiple test users
      const [user1Id, user2Id] = await t.run(async (ctx) => {
        const id1 = await createTestUser(ctx);
        const id2 = await createTestUser(ctx);
        return [id1, id2];
      });

      // Then: Users should have unique slugs
      const [user1, user2] = await t.run(async (ctx) => {
        return [await ctx.db.get(user1Id), await ctx.db.get(user2Id)];
      });
      expect(user1?.slug).not.toBe(user2?.slug);
    });
  });

  describe("asUser", () => {
    it("should create authenticated test context", async () => {
      // Given: A test user exists
      const userId = await t.run(async (ctx) => {
        return await createTestUser(ctx);
      });

      // When: Using asUser to get authenticated context
      const authT = asUser(t, userId);

      // Then: Should be able to call auth-requiring functions
      const result = await authT.run(async (ctx) => {
        return await requireAuth(ctx);
      });
      expect(result).toBe(userId);
    });

    it("should allow chaining multiple authenticated operations", async () => {
      // Given: A test user exists
      const userId = await t.run(async (ctx) => {
        return await createTestUser(ctx);
      });

      // When: Using asUser for multiple operations
      const authT = asUser(t, userId);

      // Then: All operations should see the same identity
      const results = await Promise.all([
        authT.run(async (ctx) => requireAuth(ctx)),
        authT.run(async (ctx) => requireAuth(ctx)),
      ]);
      expect(results[0]).toBe(userId);
      expect(results[1]).toBe(userId);
    });
  });
});
