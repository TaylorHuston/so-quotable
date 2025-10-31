"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

/**
 * Test page for manual validation of Convex integration
 * NOT FOR PRODUCTION USE - For development testing only
 *
 * To test:
 * 1. Visit http://localhost:3000/test-convex
 * 2. See the count of people in database
 * 3. Open Convex dashboard and create a new person
 * 4. Watch the count update in real-time (no page refresh needed)
 */
export default function TestConvexPage() {
  const people = useQuery(api.people.list, {});

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Convex Integration Test
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Status</h2>

          {people === undefined ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-2">
              <p className="text-lg">
                <span className="font-medium">People count:</span>{" "}
                <span className="text-blue-600 font-bold">
                  {people.length}
                </span>
              </p>

              <p className="text-sm text-gray-600">
                ✓ Convex connection established
              </p>
              <p className="text-sm text-gray-600">
                ✓ Real-time updates enabled
              </p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">How to test real-time updates:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>
              Open{" "}
              <a
                href="https://dashboard.convex.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Convex Dashboard
              </a>
            </li>
            <li>Navigate to the "people" table</li>
            <li>Click "Insert" and create a new person</li>
            <li>Watch the count above update automatically!</li>
          </ol>
        </div>

        {people && people.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="font-semibold mb-4">People in Database</h3>
            <ul className="space-y-2">
              {people.slice(0, 10).map((person) => (
                <li
                  key={person._id}
                  className="p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <p className="font-medium">{person.name}</p>
                  <p className="text-sm text-gray-500">slug: {person.slug}</p>
                  {person.bio && (
                    <p className="text-sm text-gray-600 mt-1">{person.bio}</p>
                  )}
                </li>
              ))}
            </ul>
            {people.length > 10 && (
              <p className="text-sm text-gray-500 mt-4">
                ... and {people.length - 10} more
              </p>
            )}
          </div>
        )}

        <div className="mt-6 text-sm text-gray-500">
          <p>⚠️ This page is for development testing only.</p>
          <p>Remove before production deployment.</p>
        </div>
      </div>
    </div>
  );
}
