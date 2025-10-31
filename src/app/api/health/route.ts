import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check for now
    // Will add Convex connectivity check in TASK-002
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "quoteable-api",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
