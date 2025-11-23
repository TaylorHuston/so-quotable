/**
 * Email utility functions for consistent email handling across the application
 *
 * Used throughout the authentication system to ensure emails are normalized
 * consistently between frontend and backend.
 */

/**
 * Normalizes an email address to lowercase and trims whitespace.
 * Used throughout auth system for consistent email handling.
 *
 * @param email - The email address to normalize
 * @returns Normalized email (lowercase, trimmed)
 * @throws Error if email is empty or whitespace-only
 *
 * @example
 * ```typescript
 * const normalized = normalizeEmail("  User@Example.COM  ");
 * // Returns: "user@example.com"
 * ```
 */
export function normalizeEmail(email: string): string {
  // Trim whitespace first
  const trimmed = email.trim();

  // Validate not empty after trimming
  if (!trimmed) {
    throw new Error("Email is required");
  }

  // Convert to lowercase and return
  return trimmed.toLowerCase();
}
