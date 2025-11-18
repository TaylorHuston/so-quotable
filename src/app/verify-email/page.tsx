"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

/**
 * Email verification page component
 *
 * Handles email verification links sent to users after registration.
 * Extracts the verification token from URL query parameters, validates it
 * with the backend, and displays appropriate success/error messages.
 *
 * @returns React component
 *
 * @example
 * ```
 * // User clicks link in email:
 * // http://localhost:3000/verify-email?token=a1b2c3d4...
 * //
 * // Page automatically:
 * // 1. Extracts token from URL
 * // 2. Calls verifyEmail mutation
 * // 3. Shows success message
 * // 4. Redirects to dashboard after 3 seconds
 * ```
 *
 * **Verification Flow**:
 * 1. Extract token from URL query parameter
 * 2. Validate token is present (if missing, show error)
 * 3. Call `api.emailVerification.verifyEmail` mutation
 * 4. On success:
 *    - Show success message with checkmark
 *    - Auto-redirect to /dashboard after 3 seconds
 *    - Provide manual "Go to Dashboard" link
 * 5. On error:
 *    - Show specific error message (expired, invalid, etc.)
 *    - Provide "Resend Verification Email" button
 *    - Provide "Back to Home" link
 *
 * **Error Handling**:
 * - Missing token: "No verification token provided"
 * - Invalid token: "Invalid verification token"
 * - Expired token: "Verification token has expired"
 * - Already verified: "Email already verified" (still shows success)
 * - Network errors: Generic error with retry option
 *
 * **UX Considerations**:
 * - Auto-redirect on success reduces friction
 * - Clear error messages with actionable next steps
 * - Loading state prevents confusion during verification
 * - Manual redirect link as fallback if auto-redirect fails
 *
 * @see {@link convex/emailVerification.ts} Backend verification logic
 */
export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyEmail = useMutation(api.emailVerification.verifyEmail);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided. Please check your email and click the verification link.");
      return;
    }

    // Verify the email with the token
    const verify = async () => {
      try {
        const result = await verifyEmail({ token });

        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully!");

          // Start countdown for redirect
          let count = 3;
          const interval = setInterval(() => {
            count--;
            setCountdown(count);

            if (count === 0) {
              clearInterval(interval);
              router.push("/dashboard");
            }
          }, 1000);

          // Cleanup interval on unmount
          return () => clearInterval(interval);
        } else {
          setStatus("error");
          setMessage(result.error || "Verification failed. Please try again.");
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "An error occurred during verification. Please try again."
        );
      }
    };

    verify();
  }, [searchParams, verifyEmail, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {/* Loading State */}
        {status === "loading" && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying your email...
            </h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg
                className="w-10 h-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecting to dashboard in {countdown} second{countdown !== 1 ? "s" : ""}...
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Go to Dashboard Now
            </button>
          </div>
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            {message.includes("expired") && (
              <button
                onClick={() => router.push("/resend-verification")}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              >
                Resend Verification Email
              </button>
            )}

            <button
              onClick={() => router.push("/")}
              className="w-full py-2 px-4 border border-gray-300 bg-white text-gray-700 font-semibold rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
