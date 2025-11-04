"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GoogleIcon } from "./GoogleIcon";

type PasswordStrength = "weak" | "medium" | "strong";

function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

export function RegisterForm() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(
    () => (password ? calculatePasswordStrength(password) : null),
    [password]
  );

  const passwordsMatch = password === confirmPassword;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters long");
      return;
    }

    if (passwordStrength === "weak") {
      setError("Please choose a stronger password");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", "signUp");

      await signIn("password", formData);

      // Successful registration - redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    setLoading(true);

    try {
      await signIn("google");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = (strength: PasswordStrength | null) => {
    if (!strength) return "bg-gray-300";
    switch (strength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
    }
  };

  const getStrengthText = (strength: PasswordStrength | null) => {
    if (!strength) return "";
    switch (strength) {
      case "weak":
        return "Weak";
      case "medium":
        return "Medium";
      case "strong":
        return "Strong";
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
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
          {password && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${getStrengthColor(
                      passwordStrength
                    )}`}
                    style={{
                      width:
                        passwordStrength === "weak"
                          ? "33%"
                          : passwordStrength === "medium"
                            ? "66%"
                            : "100%",
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-600">
                  {getStrengthText(passwordStrength)}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use 12+ characters with a mix of letters, numbers & symbols
              </p>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          {confirmPassword && !passwordsMatch && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
          {confirmPassword && passwordsMatch && (
            <p className="mt-1 text-xs text-green-600">Passwords match</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !passwordsMatch}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {loading ? "Creating account..." : "Sign Up"}
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
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="mt-4 w-full py-2 px-4 border border-gray-300 bg-white text-gray-700 font-semibold rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          Sign up with Google
        </button>
      </div>

      <div className="mt-4 text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <a href="/login" className="text-blue-600 hover:underline font-semibold">
          Sign in
        </a>
      </div>
    </div>
  );
}
