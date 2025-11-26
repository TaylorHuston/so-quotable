/**
 * Health Endpoint Unit Tests
 *
 * Unit tests for /api/health endpoint with mocked Convex client.
 * Tests both success and error scenarios.
 *
 * Test coverage:
 * - Success responses (200)
 * - Error handling for Convex failures (503 responses)
 * - Response schema validation
 * - Cache control headers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Create mock query function
const mockQuery = vi.fn();

// Mock the Convex client - using class-style mock
vi.mock("convex/browser", () => {
  return {
    ConvexHttpClient: class MockConvexHttpClient {
      query = mockQuery;
      constructor() {}
    },
  };
});

// Mock the API import
vi.mock("@/../convex/_generated/api", () => ({
  api: {
    health: {
      ping: "health:ping",
    },
  },
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Success Scenarios", () => {
    it("should return 200 with healthy status", async () => {
      // Given: Convex returns healthy status
      mockQuery.mockResolvedValueOnce({
        status: "ok",
        timestamp: Date.now(),
        database: { connected: true },
        environment: { deployment: "cloud" },
      });

      // Dynamic import to pick up fresh mocks
      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();
      const data = await response.json();

      // Then: Should return healthy status
      expect(response.status).toBe(200);
      expect(data.status).toBe("healthy");
      expect(data.timestamp).toBeDefined();
      expect(data.service).toBe("quotable-api");
    });

    it("should return ISO timestamp", async () => {
      // Given: Convex returns healthy status
      mockQuery.mockResolvedValueOnce({
        status: "ok",
        timestamp: Date.now(),
        database: { connected: true },
        environment: { deployment: "cloud" },
      });

      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();
      const data = await response.json();

      // Then: Timestamp should be valid ISO string
      const timestamp = new Date(data.timestamp);
      expect(timestamp.toISOString()).toBe(data.timestamp);
    });

    it("should include Convex health status", async () => {
      // Given: Convex returns healthy status
      mockQuery.mockResolvedValueOnce({
        status: "ok",
        timestamp: Date.now(),
        database: { connected: true },
        environment: { deployment: "cloud" },
      });

      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();
      const data = await response.json();

      // Then: Verify Convex health information is included
      expect(data.convex).toBeDefined();
      expect(data.convex.status).toBe("ok");
      expect(data.convex.database).toBeDefined();
      expect(data.convex.database.connected).toBe(true);
      expect(data.convex.environment).toBeDefined();
      expect(data.convex.environment.deployment).toBe("cloud");
    });

    it("should include cache control headers on success", async () => {
      // Given: Convex returns healthy status
      mockQuery.mockResolvedValueOnce({
        status: "ok",
        timestamp: Date.now(),
        database: { connected: true },
        environment: { deployment: "cloud" },
      });

      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();

      // Then: Should have no-cache headers
      expect(response.headers.get("Cache-Control")).toContain("no-store");
      expect(response.headers.get("Cache-Control")).toContain("no-cache");
      expect(response.headers.get("Pragma")).toBe("no-cache");
      expect(response.headers.get("Expires")).toBe("0");
    });
  });

  describe("Error Scenarios", () => {
    it("should return 503 when Convex query throws an error", async () => {
      // Given: Convex query throws an error
      mockQuery.mockRejectedValueOnce(new Error("Connection refused"));

      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();
      const data = await response.json();

      // Then: Should return 503 with error details
      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.error).toBe("Connection refused");
      expect(data.convex.status).toBe("error");
    });

    it("should return 503 with generic message for non-Error exceptions", async () => {
      // Given: Convex query throws a non-Error value
      mockQuery.mockRejectedValueOnce("string error");

      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();
      const data = await response.json();

      // Then: Should return 503 with unknown error message
      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.error).toBe("Unknown error");
    });

    it("should return 503 when Convex times out", async () => {
      // Given: Convex query times out
      mockQuery.mockRejectedValueOnce(new Error("Request timeout"));

      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();
      const data = await response.json();

      // Then: Should return 503 with timeout error
      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.error).toBe("Request timeout");
    });

    it("should return 503 when Convex returns network error", async () => {
      // Given: Convex has network error
      mockQuery.mockRejectedValueOnce(new Error("Network request failed"));

      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();
      const data = await response.json();

      // Then: Should return 503 with network error
      expect(response.status).toBe(503);
      expect(data.status).toBe("unhealthy");
      expect(data.error).toBe("Network request failed");
    });

    it("should include cache control headers on error", async () => {
      // Given: Convex query throws an error
      mockQuery.mockRejectedValueOnce(new Error("Service unavailable"));

      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();

      // Then: Should have no-cache headers even on error
      expect(response.headers.get("Cache-Control")).toContain("no-store");
      expect(response.headers.get("Pragma")).toBe("no-cache");
      expect(response.headers.get("Expires")).toBe("0");
    });

    it("should have valid error response schema", async () => {
      // Given: Convex query throws an error
      mockQuery.mockRejectedValueOnce(new Error("Database unavailable"));

      const { GET } = await import("./route");

      // When: Calling the health endpoint
      const response = await GET();
      const data = await response.json();

      // Then: Error response should have required fields
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("error");
      expect(data).toHaveProperty("convex");
      expect(data.convex).toHaveProperty("status");
      expect(data.convex.status).toBe("error");
    });
  });
});
