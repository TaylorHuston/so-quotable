/**
 * Password validation helper that matches backend requirements
 *
 * Backend requirements from convex/auth.ts:27-52:
 * - Minimum 12 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special character from: !@#$%^&*()_+-=[]{};\':\"\\|,.<>/?
 *
 * This ensures frontend validation matches backend validation exactly,
 * preventing confusing server errors for users.
 */

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate password against all backend requirements
 *
 * @param password - The password to validate
 * @returns Object with `valid` boolean and `errors` array
 *
 * @example
 * ```typescript
 * const result = validatePassword("MyPass123!");
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Check minimum length (must match backend: convex/auth.ts:28-31)
  if (!password || password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  // Check uppercase letter (must match backend: convex/auth.ts:34-36)
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check lowercase letter (must match backend: convex/auth.ts:39-41)
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Check number (must match backend: convex/auth.ts:44-46)
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check special character (must match backend: convex/auth.ts:49-51)
  // Regex matches exact backend pattern
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
