import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET() {
  try {
    // Call Convex health check
    const convexHealth = await convex.query(api.health.ping, {});

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "quoteable-api",
        convex: {
          status: convexHealth.status,
          database: convexHealth.database,
          environment: convexHealth.environment,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        convex: {
          status: "error",
        },
      },
      { status: 503 }
    );
  }
}
