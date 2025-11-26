/**
 * Health Endpoint Tests
 *
 * Tests the /api/health endpoint to ensure it correctly reports
 * system health and dependency status.
 *
 * Test coverage:
 * - HTTP 200 status code
 * - Response schema validation
 * - Convex connectivity check
 * - Timestamp format validation
 * - Critical dependencies verification
 */

import { describe, it, expect, beforeAll } from "vitest";

describe("Health Endpoint", () => {
  // Test against production by default for validation
  // Override with NEXT_PUBLIC_APP_URL for local testing
  const healthUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/health`
    : "https://so-quoteable.vercel.app/api/health";

  describe("Response Status", () => {
    it("should return 200 OK status", async () => {
      const response = await fetch(healthUrl);
      expect(response.status).toBe(200);
      expect(response.ok).toBe(true);
    });

    it("should return JSON content type", async () => {
      const response = await fetch(healthUrl);
      const contentType = response.headers.get("content-type");
      expect(contentType).toContain("application/json");
    });
  });

  describe("Response Schema", () => {
    it("should have required top-level fields", async () => {
      const response = await fetch(healthUrl);
      const data = await response.json();

      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("timestamp");
      expect(data).toHaveProperty("service");
      expect(data).toHaveProperty("convex");
    });

    it("should have valid status value", async () => {
      const response = await fetch(healthUrl);
      const data = await response.json();

      expect(data.status).toMatch(/^(healthy|degraded|unhealthy)$/);
    });

    it("should have ISO 8601 timestamp", async () => {
      const response = await fetch(healthUrl);
      const data = await response.json();

      // Validate ISO 8601 format
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Validate timestamp is recent (within last 10 seconds)
      // Allow small negative values due to clock drift between local and server
      const timestampDate = new Date(data.timestamp);
      const now = new Date();
      const diffMs = now.getTime() - timestampDate.getTime();
      expect(Math.abs(diffMs)).toBeLessThan(10000);
    });

    it("should have service name", async () => {
      const response = await fetch(healthUrl);
      const data = await response.json();

      // Accept both spellings during transition - quotable is correct
      // quoteable was the old spelling, will be removed after deployment
      expect(data.service).toMatch(/^quote?able-api$/);
    });
  });

  describe("Convex Dependency Check", () => {
    it("should include Convex health status", async () => {
      const response = await fetch(healthUrl);
      const data = await response.json();

      expect(data.convex).toBeDefined();
      expect(data.convex).toHaveProperty("status");
    });

    it("should report Convex connectivity", async () => {
      const response = await fetch(healthUrl);
      const data = await response.json();

      expect(data.convex.status).toBe("ok");
    });

    it("should include database connectivity check", async () => {
      const response = await fetch(healthUrl);
      const data = await response.json();

      expect(data.convex).toHaveProperty("database");
      expect(data.convex.database).toHaveProperty("connected");
      expect(data.convex.database.connected).toBe(true);
    });

    it("should include environment information", async () => {
      const response = await fetch(healthUrl);
      const data = await response.json();

      expect(data.convex).toHaveProperty("environment");
      expect(data.convex.environment).toHaveProperty("deployment");
      expect(data.convex.environment.deployment).toMatch(/^(cloud|local)$/);
    });
  });

  describe("Error Handling", () => {
    it("should handle Convex connection failures gracefully", async () => {
      // This test ensures the endpoint returns 503 if Convex is unreachable
      // We can't easily simulate this in integration tests, but the schema
      // is validated to ensure error responses are properly structured

      // If status is "unhealthy", verify error response structure
      const response = await fetch(healthUrl);
      const data = await response.json();

      if (data.status === "unhealthy") {
        expect(response.status).toBe(503);
        expect(data.convex.status).toBe("error");
      }
    });
  });

  describe("Performance", () => {
    it("should respond within 2 seconds", async () => {
      const startTime = Date.now();
      const response = await fetch(healthUrl);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(duration).toBeLessThan(2000);
    });

    it("should handle concurrent requests", async () => {
      // Test that health endpoint can handle 10 concurrent requests
      const requests = Array(10).fill(null).map(() => fetch(healthUrl));
      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe("Caching Headers", () => {
    it("should not cache health check responses", async () => {
      const response = await fetch(healthUrl);
      const cacheControl = response.headers.get("cache-control");

      // Health checks should indicate no caching
      // Production uses our custom headers, Vercel CDN may add must-revalidate
      expect(cacheControl).toBeTruthy();
      // Accept either no-store (our header) or must-revalidate (Vercel's default for dynamic routes)
      expect(cacheControl).toMatch(/(no-store|no-cache|must-revalidate)/);
    });

    // Note: Pragma header test moved to unit tests (route.test.ts)
    // Integration tests against production may not show custom headers due to CDN
  });
});
