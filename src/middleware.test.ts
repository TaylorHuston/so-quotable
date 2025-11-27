/**
 * Middleware Unit Tests
 *
 * Comprehensive tests for Next.js middleware route protection logic.
 * Tests authentication checks, route matching, and redirect behavior.
 *
 * Coverage target: >90%
 *
 * @vitest-environment node
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// Mock the Convex Auth middleware functions
const mockConvexAuthNextjsMiddleware = vi.fn((handler) => handler);
const mockCreateRouteMatcher = vi.fn((patterns: string[]) => {
  return (request: any) => {
    const pathname = request.nextUrl?.pathname || request.url;
    return patterns.some((pattern) => {
      // Convert glob pattern to regex: /dashboard(.*) -> /dashboard.*
      const regexPattern = pattern.replace("(.*)", ".*");
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(pathname);
    });
  };
});
const mockNextjsMiddlewareRedirect = vi.fn((request, destination) => {
  return { redirect: destination, request };
});

vi.mock("@convex-dev/auth/nextjs/server", () => ({
  convexAuthNextjsMiddleware: mockConvexAuthNextjsMiddleware,
  createRouteMatcher: mockCreateRouteMatcher,
  nextjsMiddlewareRedirect: mockNextjsMiddlewareRedirect,
}));

// Import middleware after mocking
const middlewareModule = await import("./middleware");
const middleware = middlewareModule.default;

// Helper to create mock NextRequest
function createMockRequest(pathname: string, url?: string): NextRequest {
  return {
    nextUrl: {
      pathname,
      clone: () => ({ pathname }),
    },
    url: url ?? `http://localhost:3000${pathname}`,
  } as unknown as NextRequest;
}

// Helper to create mock convexAuth context
function createMockConvexAuth(isAuthenticated: boolean): any {
  return {
    convexAuth: {
      isAuthenticated: vi.fn().mockResolvedValue(isAuthenticated),
    },
  };
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Auth pages (race condition fix)", () => {
    it("should allow unauthenticated access to /", async () => {
      // Arrange
      const request = createMockRequest("/");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });

    it("should allow unauthenticated access to /login", async () => {
      // Arrange
      const request = createMockRequest("/login");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });

    it("should allow unauthenticated access to /register", async () => {
      // Arrange
      const request = createMockRequest("/register");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });

    it("should allow authenticated access to auth pages", async () => {
      // Arrange
      const request = createMockRequest("/login");
      const context = createMockConvexAuth(true);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
      // Auth pages always allowed, even when authenticated (race condition fix)
      // The pages handle their own client-side redirects
    });

    it("should allow access to / when authenticated", async () => {
      // Arrange
      const request = createMockRequest("/");
      const context = createMockConvexAuth(true);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });
  });

  describe("Protected routes - /dashboard", () => {
    it("should allow authenticated access to /dashboard", async () => {
      // Arrange
      const request = createMockRequest("/dashboard");
      const context = createMockConvexAuth(true);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });

    it("should redirect unauthenticated access to /dashboard", async () => {
      // Arrange
      const request = createMockRequest("/dashboard");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(request, "/login");
      expect(result).toEqual({ redirect: "/login", request });
    });

    it("should allow authenticated access to /dashboard/settings", async () => {
      // Arrange
      const request = createMockRequest("/dashboard/settings");
      const context = createMockConvexAuth(true);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });

    it("should redirect unauthenticated access to /dashboard/settings", async () => {
      // Arrange
      const request = createMockRequest("/dashboard/settings");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(request, "/login");
      expect(result).toEqual({ redirect: "/login", request });
    });
  });

  describe("Protected routes - /profile", () => {
    it("should allow authenticated access to /profile", async () => {
      // Arrange
      const request = createMockRequest("/profile");
      const context = createMockConvexAuth(true);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });

    it("should redirect unauthenticated access to /profile", async () => {
      // Arrange
      const request = createMockRequest("/profile");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(request, "/login");
      expect(result).toEqual({ redirect: "/login", request });
    });

    it("should allow authenticated access to /profile/edit", async () => {
      // Arrange
      const request = createMockRequest("/profile/edit");
      const context = createMockConvexAuth(true);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });
  });

  describe("Protected routes - /create-quote", () => {
    it("should allow authenticated access to /create-quote", async () => {
      // Arrange
      const request = createMockRequest("/create-quote");
      const context = createMockConvexAuth(true);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });

    it("should redirect unauthenticated access to /create-quote", async () => {
      // Arrange
      const request = createMockRequest("/create-quote");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(request, "/login");
      expect(result).toEqual({ redirect: "/login", request });
    });

    it("should allow authenticated access to /create-quote/new", async () => {
      // Arrange
      const request = createMockRequest("/create-quote/new");
      const context = createMockConvexAuth(true);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });
  });

  describe("Non-protected routes", () => {
    it("should allow unauthenticated access to /about", async () => {
      // Arrange
      const request = createMockRequest("/about");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
      // Should not check authentication for non-protected routes
      expect(context.convexAuth.isAuthenticated).not.toHaveBeenCalled();
    });

    it("should allow authenticated access to /about", async () => {
      // Arrange
      const request = createMockRequest("/about");
      const context = createMockConvexAuth(true);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
      expect(context.convexAuth.isAuthenticated).not.toHaveBeenCalled();
    });

    it("should allow unauthenticated access to /help", async () => {
      // Arrange
      const request = createMockRequest("/help");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
      expect(context.convexAuth.isAuthenticated).not.toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle trailing slashes on protected routes", async () => {
      // Arrange
      const request = createMockRequest("/dashboard/");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(request, "/login");
      expect(result).toEqual({ redirect: "/login", request });
    });

    it("should handle query parameters on protected routes", async () => {
      // Arrange
      // Note: pathname doesn't include query params, so this should work normally
      const request = createMockRequest("/dashboard", "http://localhost:3000/dashboard?foo=bar");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(context.convexAuth.isAuthenticated).toHaveBeenCalledOnce();
      expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(request, "/login");
      expect(result).toEqual({ redirect: "/login", request });
    });

    it("should not redirect auth pages even with query parameters", async () => {
      // Arrange
      const request = createMockRequest("/login", "http://localhost:3000/login?redirect=/dashboard");
      const context = createMockConvexAuth(false);

      // Act
      const result = await middleware(request, context);

      // Assert
      expect(result).toBeUndefined();
      expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled();
    });
  });

  describe("Route matcher behavior", () => {
    it("should match auth pages correctly", async () => {
      // Arrange & Act
      const loginRequest = createMockRequest("/login");
      const registerRequest = createMockRequest("/register");
      const homeRequest = createMockRequest("/");
      const context = createMockConvexAuth(false);

      const loginResult = await middleware(loginRequest, context);
      const registerResult = await middleware(registerRequest, context);
      const homeResult = await middleware(homeRequest, context);

      // Assert - All auth pages should be allowed without redirect
      expect(loginResult).toBeUndefined();
      expect(registerResult).toBeUndefined();
      expect(homeResult).toBeUndefined();
    });

    it("should match protected routes with nested paths", async () => {
      // Arrange
      const dashboardNestedRequest = createMockRequest("/dashboard/settings/profile");
      const profileNestedRequest = createMockRequest("/profile/edit/photo");
      const context = createMockConvexAuth(false);

      // Act
      const dashboardResult = await middleware(dashboardNestedRequest, context);
      const profileResult = await middleware(profileNestedRequest, context);

      // Assert - All should redirect to login
      expect(dashboardResult).toEqual({ redirect: "/login", request: dashboardNestedRequest });
      expect(profileResult).toEqual({ redirect: "/login", request: profileNestedRequest });
      expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledTimes(2);
    });
  });

  describe("Middleware config", () => {
    it("should export config with correct matcher pattern", () => {
      // Assert
      expect(middlewareModule.config).toBeDefined();
      expect(middlewareModule.config.matcher).toEqual([
        "/((?!.*\\..*|_next).*)",
        "/",
        "/(api|trpc)(.*)",
      ]);
    });
  });
});
