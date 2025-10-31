import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("should return 200 with healthy status", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.timestamp).toBeDefined();
    expect(data.service).toBe("quoteable-api");
  });

  it("should return ISO timestamp", async () => {
    const response = await GET();
    const data = await response.json();

    // Verify timestamp is valid ISO string
    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);
  });

  it("should include Convex health status", async () => {
    const response = await GET();
    const data = await response.json();

    // Verify Convex health information is included
    expect(data.convex).toBeDefined();
    expect(data.convex.status).toBe("ok");
    expect(data.convex.database).toBeDefined();
    expect(data.convex.database.connected).toBe(true);
    expect(data.convex.database.peopleCount).toBeGreaterThanOrEqual(0);
    expect(data.convex.environment).toBeDefined();
  });
});
