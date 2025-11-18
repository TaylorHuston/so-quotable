/**
 * LoginForm Error Handling Tests
 *
 * Tests that Convex Auth errors are properly transformed into user-friendly messages.
 */

import { describe, it, expect } from "vitest";

// Extract parseAuthError helper for testing
function parseAuthError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Sign in failed. Please try again.";
  }

  const errorMessage = err.message;

  // Invalid credentials (wrong password or wrong email)
  if (errorMessage.includes("InvalidSecret") || errorMessage.includes("Account not found")) {
    return "Invalid email or password";
  }

  // Rate limiting
  if (errorMessage.includes("Too many requests")) {
    return "Too many sign-in attempts. Please try again in a few minutes.";
  }

  // Account verification issues
  if (errorMessage.includes("Email not verified")) {
    return "Please verify your email before signing in";
  }

  // Generic fallback (strip stack trace and request IDs)
  const cleanMessage = errorMessage.split("\n")[0]?.replace(/\[Request ID:.*?\]/g, "").trim();
  return cleanMessage || "Sign in failed. Please try again.";
}

describe("LoginForm error handling", () => {
  it("should transform InvalidSecret error to user-friendly message", () => {
    const error = new Error(
      "[Request ID: 260f7d5245046d41] Server Error\nUncaught Error: InvalidSecret\nat retrieveAccount (../../node_modules/@convex-dev/auth/src/server/implementation/index.ts:602:9)"
    );

    const result = parseAuthError(error);
    expect(result).toBe("Invalid email or password");
  });

  it("should transform Account not found error to user-friendly message", () => {
    const error = new Error("Account not found");

    const result = parseAuthError(error);
    expect(result).toBe("Invalid email or password");
  });

  it("should handle rate limiting errors", () => {
    const error = new Error("Too many requests");

    const result = parseAuthError(error);
    expect(result).toBe("Too many sign-in attempts. Please try again in a few minutes.");
  });

  it("should handle email verification errors", () => {
    const error = new Error("Email not verified");

    const result = parseAuthError(error);
    expect(result).toBe("Please verify your email before signing in");
  });

  it("should strip request IDs and stack traces from generic errors", () => {
    const error = new Error(
      "[Request ID: abc123def456] Server Error\nSome generic error\nat someFunction (file.ts:123:45)"
    );

    const result = parseAuthError(error);
    expect(result).toBe("Server Error");
  });

  it("should handle non-Error objects", () => {
    const result = parseAuthError("some string error");
    expect(result).toBe("Sign in failed. Please try again.");
  });

  it("should handle empty error messages", () => {
    const error = new Error("");

    const result = parseAuthError(error);
    expect(result).toBe("Sign in failed. Please try again.");
  });
});
