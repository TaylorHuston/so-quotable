"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  // Redirect authenticated users to dashboard
  // This handles the OAuth redirect case where Convex Auth redirects to SITE_URL (/)
  useEffect(() => {
    // Wait a moment for auth state to propagate before redirecting
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      {/* For authenticated users: show loading state while redirecting */}
      <Authenticated>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <main className="max-w-4xl mx-auto px-6 py-12 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Redirecting...
            </h1>
            <p className="text-xl text-gray-700">
              Taking you to your dashboard
            </p>
          </main>
        </div>
      </Authenticated>

      {/* For unauthenticated users: show welcome page */}
      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <main className="max-w-4xl mx-auto px-6 py-12 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              So Quoteable
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Generate beautiful quote images with verified sources and proper
              attribution
            </p>
            <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
              <p className="text-gray-600 italic text-lg">
                &quot;The only way to do great work is to love what you
                do.&quot;
              </p>
              <p className="text-gray-500 mt-4">— Steve Jobs</p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                <a
                  href="/login"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </a>
              </div>
            </div>
          </main>
        </div>
      </Unauthenticated>
    </>
  );
}
