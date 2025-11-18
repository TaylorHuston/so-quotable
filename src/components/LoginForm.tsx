"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "./GoogleIcon";

/**
 * Parse Convex Auth errors into user-friendly messages
 *
 * Transforms technical Convex Auth error messages into clear, actionable
 * messages for end users. Handles common authentication errors including
 * invalid credentials, rate limiting, and verification issues.
 *
 * @param err - The error object from Convex Auth
 * @returns User-friendly error message
 *
 * **Error Mappings**:
 * - InvalidSecret/Account not found → "Invalid email or password"
 * - Too many requests → "Too many sign-in attempts. Please try again in a few minutes."
 * - Email not verified → "Please verify your email before signing in"
 * - Other errors → Cleaned message without stack traces
 */
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

/**
 * Login form component with email/password and Google OAuth authentication
 *
 * Provides a user-friendly login interface with error handling, loading states,
 * and both traditional email/password authentication and Google OAuth sign-in.
 *
 * @returns React component
 *
 * @example
 * ```tsx
 * // In a page component
 * import { LoginForm } from "@/components/LoginForm";
 *
 * export default function LoginPage() {
 *   return (
 *     <div className="min-h-screen flex items-center justify-center">
 *       <LoginForm />
 *     </div>
 *   );
 * }
 * ```
 *
 * **Features**:
 * - Email/password authentication with validation
 * - Google OAuth single sign-on
 * - User-friendly error messages
 * - Loading states during authentication
 * - Automatic redirect to dashboard on success
 * - Link to registration page for new users
 *
 * **Authentication Flow**:
 * 1. User enters email and password
 * 2. Form submits to Convex Auth (signIn with "password" provider)
 * 3. On success: 100ms delay for auth state propagation, then redirect to /dashboard
 * 4. On failure: Display user-friendly error message
 *
 * **Google OAuth Flow**:
 * 1. User clicks "Sign in with Google"
 * 2. Redirect to Google OAuth consent screen
 * 3. User approves access
 * 4. Redirect back to app with auth code
 * 5. Convex Auth validates and creates session
 *
 * **Error Handling**:
 * - Invalid credentials: "Invalid email or password"
 * - Rate limiting: "Too many sign-in attempts. Please try again in a few minutes."
 * - Network errors: Generic fallback message
 *
 * **Accessibility**:
 * - Proper label associations (htmlFor/id)
 * - Required field validation
 * - Disabled state during loading
 * - Semantic HTML form structure
 *
 * **Known Issues**:
 * - 100ms delay after sign-in to work around Convex Auth race condition
 *   (auth state may not be immediately available after signIn resolves)
 *
 * @see {@link https://labs.convex.dev/auth | Convex Auth Documentation}
 */
export function LoginForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", "signIn");

      await signIn("password", formData);

      // Wait a moment for auth state to propagate (Convex Auth race condition fix)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Successful login - redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(parseAuthError(err));
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    setLoading(true);

    // Note: For OAuth, signIn should redirect immediately
    // Don't await it - just call it and let the redirect happen
    void signIn("google").catch((err) => {
      setError(parseAuthError(err));
      setLoading(false);
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="mt-4 w-full py-2 px-4 border border-gray-300 bg-white text-gray-700 font-semibold rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
      </div>

      <div className="mt-4 text-center text-sm">
        <span className="text-gray-600">Don&apos;t have an account? </span>
        <a href="/register" className="text-blue-600 hover:underline font-semibold">
          Sign up
        </a>
      </div>
    </div>
  );
}
