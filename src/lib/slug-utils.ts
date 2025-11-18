/**
 * Slug generation utilities for URL-friendly identifiers
 *
 * Used throughout the application to generate URL-safe slugs
 * from email addresses and other text.
 */

/**
 * Generates a URL-friendly slug from an email address.
 * Extracts the local part (before @), converts to lowercase,
 * and replaces non-alphanumeric characters with hyphens.
 *
 * @param email - The email address to generate slug from
 * @param fallback - Fallback slug if email is invalid (default: "user")
 * @returns URL-safe slug
 *
 * @example
 * ```typescript
 * const slug = generateSlug("John.Doe+test@example.com");
 * // Returns: "john-doe-test"
 *
 * const slug2 = generateSlug("invalid", "anonymous");
 * // Returns: "anonymous" (no @ sign, uses fallback)
 * ```
 */
export function generateSlug(email: string, fallback: string = "user"): string {
  // Extract email prefix (before @)
  const emailPrefix = email.split("@")[0];

  // If no prefix or empty, use fallback
  if (!emailPrefix || emailPrefix.length === 0) {
    return fallback;
  }

  // Convert to lowercase and replace non-alphanumeric with hyphens
  const slug = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  // If slug becomes empty after cleaning, use fallback
  return slug || fallback;
}
