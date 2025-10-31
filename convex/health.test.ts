import { convexTest } from "convex-test";
import { describe, it, expect, beforeEach } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

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

    it("should return zero people count for empty database", async () => {
      // Given: Empty database
      // When: Calling health ping
      const result = await t.query(api.health.ping, {});

      // Then: Should return zero people count
      expect(result.database.peopleCount).toBe(0);
    });

    it("should return accurate people count", async () => {
      // Given: Three people in database
      await t.mutation(api.people.create, {
        name: "Person 1",
        slug: "person-1",
      });
      await t.mutation(api.people.create, {
        name: "Person 2",
        slug: "person-2",
      });
      await t.mutation(api.people.create, {
        name: "Person 3",
        slug: "person-3",
      });

      // When: Calling health ping
      const result = await t.query(api.health.ping, {});

      // Then: Should return count of 3
      expect(result.database.peopleCount).toBe(3);
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
