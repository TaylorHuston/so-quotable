"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";

function AuthenticatedProfile() {
  const { signOut } = useAuthActions();
  const user = useQuery(api.users.getCurrentUser);
  const debugInfo = useQuery(api.users.debugAuth);

  if (user === undefined) {
    // Loading state
    return (
      <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow" data-auth-state="loading">
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (user === null) {
    // This shouldn't happen inside <Authenticated>, but handle it gracefully
    return (
      <div className="p-4 bg-white rounded-lg shadow" data-auth-state="error">
        <p className="text-gray-600">Authentication error: User not found</p>
        {debugInfo && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs">
            <p className="font-bold text-red-900">DEBUG INFO:</p>
            <pre className="mt-2 text-red-800">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const isVerified = user.emailVerified;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md" data-auth-state="authenticated" data-user-email={user.email}>
      <div className="flex items-start gap-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={64}
              height={64}
              className="rounded-full border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
              {(user.name || user.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-semibold text-gray-900 truncate">
              {user.name || user.email || "User"}
            </h3>
            {isVerified && (
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-label="Email verified"
              >
                <title>Email verified</title>
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">{user.email}</p>
          <p className="text-xs text-gray-500">@{user.slug}</p>
          {user.role === "admin" && (
            <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded">
              Admin
            </span>
          )}
          {!isVerified && (
            <div className="mt-2 flex items-center gap-1 text-xs text-yellow-700">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Email not verified</span>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Sign Out
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Member since</dt>
            <dd className="text-gray-900 font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">Last updated</dt>
            <dd className="text-gray-900 font-medium">
              {new Date(user.updatedAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function UnauthenticatedProfile() {
  return (
    <div className="p-4 bg-white rounded-lg shadow" data-auth-state="unauthenticated">
      <p className="text-gray-600" data-testid="not-signed-in">Not signed in</p>
      <div className="mt-3 flex gap-2">
        <a
          href="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Sign In
        </a>
        <a
          href="/register"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
}

export function UserProfile() {
  return (
    <>
      <Authenticated>
        <AuthenticatedProfile />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedProfile />
      </Unauthenticated>
    </>
  );
}
