/**
 * Health Check Endpoint
 *
 * Provides a comprehensive health check for the application and its critical dependencies.
 * This endpoint is used for:
 * - Monitoring application availability
 * - Verifying Convex backend connectivity
 * - Deployment validation (post-deployment smoke tests)
 * - Load balancer health checks
 *
 * @module api/health
 */

import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/../convex/_generated/api";

/**
 * Convex HTTP client for server-side queries
 * Uses ConvexHttpClient (not ConvexClient) for Next.js server-side route handlers
 */
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Health Check Handler
 *
 * Returns comprehensive health status for the application and its dependencies.
 *
 * **Response Format (200 OK)**:
 * ```json
 * {
 *   "status": "healthy",
 *   "timestamp": "2025-11-24T04:10:08.388Z",
 *   "service": "quoteable-api",
 *   "convex": {
 *     "status": "ok",
 *     "database": {
 *       "connected": true,
 *       "peopleCount": 0
 *     },
 *     "environment": {
 *       "deployment": "cloud"
 *     }
 *   }
 * }
 * ```
 *
 * **Error Response (503 Service Unavailable)**:
 * ```json
 * {
 *   "status": "unhealthy",
 *   "error": "Error message",
 *   "convex": {
 *     "status": "error"
 *   }
 * }
 * ```
 *
 * **Checks Performed**:
 * - Convex backend connectivity (via health.ping query)
 * - Database accessibility (people table count)
 * - Environment configuration validation
 *
 * @returns {Promise<NextResponse>} JSON response with health status
 */
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
