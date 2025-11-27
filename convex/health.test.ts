import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";
import { createTestUser, asUser } from "./test.helpers";

describe("health endpoint", () => {
  let t: ReturnType<typeof convexTest>;

  beforeEach(() => {
    t = convexTest(schema, modules);
  });

  describe("ping query", () => {
    it("should return ok status with timestamp", async () => {
      // When: Calling health ping
      const result = await t.query(api.health.ping, {});

      // Then: Should return ok status with current timestamp
      expect(result.status).toBe("ok");
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it("should indicate database is connected", async () => {
      // When: Calling health ping
      const result = await t.query(api.health.ping, {});

      // Then: Should show database connectivity
      expect(result.database.connected).toBe(true);
    });

    it("should verify database connectivity without full table scan", async () => {
      // When: Calling health ping
      const result = await t.query(api.health.ping, {});

      // Then: Should indicate database is connected
      // Note: peopleCount was removed for performance (avoided full table scan)
      // Health check now uses .take(1) to verify connectivity efficiently
      expect(result.database.connected).toBe(true);
      expect(result.database).not.toHaveProperty("peopleCount");
    });

    it("should still work with populated database", async () => {
      // Given: An authenticated user and three people in database
      const userId = await t.run(async (ctx) => createTestUser(ctx));
      const authT = asUser(t, userId);

      await authT.mutation(api.people.create, {
        name: "Person 1",
        slug: "person-1",
      });
      await authT.mutation(api.people.create, {
        name: "Person 2",
        slug: "person-2",
      });
      await authT.mutation(api.people.create, {
        name: "Person 3",
        slug: "person-3",
      });

      // When: Calling health ping
      const result = await t.query(api.health.ping, {});

      // Then: Should still report connected (uses .take(1), not full scan)
      expect(result.database.connected).toBe(true);
    });

    it("should include environment information", async () => {
      // When: Calling health ping
      const result = await t.query(api.health.ping, {});

      // Then: Should include deployment environment
      expect(result.environment).toBeDefined();
      expect(result.environment.deployment).toBeDefined();
      expect(["cloud", "local"]).toContain(result.environment.deployment);
    });
  });
});
