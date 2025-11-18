"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

/**
 * Forgot Password page component
 *
 * Allows users to request a password reset by entering their email address.
 * Sends a password reset email with a magic link token (1-hour expiration).
 *
 * @returns React component
 *
 * @example
 * ```tsx
 * // Accessed via /forgot-password route
 * // User enters email → backend sends reset email
 * // Always shows success message (prevents email enumeration)
 * ```
 *
 * **Features**:
 * - Email input form with validation
 * - Success state with helpful instructions
 * - Error handling for network issues
 * - Rate limiting (3 requests/hour/email handled by backend)
 * - Always shows success (prevents revealing if email exists)
 * - Link back to login page
 *
 * **Security**:
 * - Backend never reveals whether email exists
 * - Rate limiting prevents abuse (max 3 requests/hour/email)
 * - Tokens expire after 1 hour
 * - Clear messaging about next steps
 *
 * **UX Flow**:
 * 1. User enters email
 * 2. Submits form
 * 3. Backend sends reset email (if email exists)
 * 4. Shows success message with instructions
 * 5. User checks email for reset link
 *
 * @see {@link /reset-password} Where the reset link points to
 * @see {@link convex/passwordReset.ts} Backend implementation
 */
export default function ForgotPasswordPage() {
  const requestPasswordReset = useMutation(api.passwordReset.requestPasswordReset);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus("loading");

    try {
      const result = await requestPasswordReset({ email });

      if (result.success) {
        setStatus("success");
      } else {
        // This shouldn't happen (backend always returns success), but handle it
        setError("Failed to request password reset. Please try again.");
        setStatus("error");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred. Please try again."
      );
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {status === "success" ? (
          // Success State
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              If an account exists with <strong>{email}</strong>, you will receive a password reset email shortly.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The reset link will expire in <strong>1 hour</strong>. If you don&apos;t see the email, check your spam folder.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmail("");
                  setStatus("idle");
                }}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send Another Reset Link
              </button>
              <Link
                href="/login"
                className="block w-full py-2 px-4 border border-gray-300 bg-white text-gray-700 font-semibold rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          // Form State
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Forgot Password?
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={status === "loading"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  autoFocus={true}
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-blue-600 hover:underline text-sm font-semibold"
              >
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
