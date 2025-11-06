import { Page } from "@playwright/test";

/**
 * E2E Authentication Helper
 *
 * Provides reusable authentication actions for Playwright tests.
 * Based on TASK-004 Convex Auth implementation with email/password and Google OAuth.
 *
 * Auth Flow:
 * - Email/Password: LoginForm component with useAuthActions().signIn()
 * - Google OAuth: OAuth redirect flow via Convex Auth
 * - Session: Stored in LocalStorage with keys like `__convexAuthJWT_*` and `__convexAuthRefreshToken_*`
 * - Protected Routes: /dashboard, /profile, /create-quote (middleware currently disabled)
 *
 * @see src/components/LoginForm.tsx
 * @see src/components/RegisterForm.tsx
 * @see src/middleware.ts
 * @see convex/auth.ts
 */

/**
 * Login with email and password
 *
 * Navigates to /login, fills the email/password form, submits, and verifies successful login
 * by checking for redirect to dashboard or intended page.
 *
 * @param page - Playwright Page object
 * @param email - User email address
 * @param password - User password (must meet requirements: 12+ chars, uppercase, lowercase, number, special char)
 * @throws Error if login fails or elements are not found
 *
 * @example
 * await login(page, "test@example.com", "SecurePass123!");
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  // Navigate to login page
  await page.goto("/login");

  // Wait for login form to be visible
  await page.waitForSelector('input[type="email"]', { state: "visible" });

  // Fill email field
  await page.fill('input[type="email"]', email);

  // Fill password field
  await page.fill('input[type="password"]', password);

  // Click sign in button
  await page.click('button[type="submit"]');

  // Wait for successful login (redirect to dashboard or intended page)
  // The middleware redirects to /dashboard by default, or to the redirect parameter
  await page.waitForURL(/\/(dashboard|profile|create-quote)/, {
    timeout: 10000,
  });
}

/**
 * Logout the current user
 *
 * Assumes user is already logged in and on a page that has the UserProfile component.
 * Clicks the sign out button and verifies redirect to home page.
 *
 * @param page - Playwright Page object
 * @throws Error if sign out button is not found or logout fails
 *
 * @example
 * await logout(page);
 */
export async function logout(page: Page): Promise<void> {
  // Find and click the sign out button
  // UserProfile component has a button with text "Sign Out"
  await page.click('button:has-text("Sign Out")');

  // Wait for redirect to home page (or login page)
  // After sign out, middleware redirects unauthenticated users from protected routes
  await page.waitForURL(/\/(login|)$/, { timeout: 10000 });
}

/**
 * Register a new user with email and password
 *
 * Navigates to /register, fills the registration form, submits, and verifies successful registration.
 * Note: Email verification is implemented but unverified users can still access the app (limited permissions).
 *
 * @param page - Playwright Page object
 * @param email - User email address (must be unique)
 * @param password - User password (must meet requirements: 12+ chars, uppercase, lowercase, number, special char)
 * @throws Error if registration fails or elements are not found
 *
 * @example
 * await signup(page, "newuser@example.com", "SecurePass123!");
 */
export async function signup(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  // Navigate to register page
  await page.goto("/register");

  // Wait for register form to be visible
  await page.waitForSelector('input[type="email"]', { state: "visible" });

  // Fill email field
  await page.fill('input[type="email"]', email);

  // Fill password fields (password + confirmation)
  const passwordFields = await page.locator('input[type="password"]').all();
  if (passwordFields.length < 2) {
    throw new Error(
      `Expected 2 password fields in register form (password + confirmation), found ${passwordFields.length}`
    );
  }
  // Safe to use non-null assertions after length check
  await passwordFields[0]!.fill(password);
  await passwordFields[1]!.fill(password);

  // Click sign up button
  await page.click('button[type="submit"]');

  // Wait for successful registration (redirect to dashboard)
  // Convex Auth auto-creates user and logs them in after successful signup
  await page.waitForURL(/\/(dashboard|profile|create-quote)/, {
    timeout: 10000,
  });
}

/**
 * Initiate Google OAuth sign-in flow
 *
 * Clicks the "Sign in with Google" button and waits for OAuth redirect.
 * Note: This helper does NOT complete the full OAuth flow (requires real Google account interaction).
 * Use this for testing the OAuth initiation, not full end-to-end OAuth.
 *
 * @param page - Playwright Page object
 * @throws Error if Google sign-in button is not found
 *
 * @example
 * await loginWithGoogle(page);
 * // Expect redirect to Google OAuth consent screen
 */
export async function loginWithGoogle(page: Page): Promise<void> {
  // Navigate to login page
  await page.goto("/login");

  // Wait for Google sign-in button to be visible
  await page.waitForSelector('button:has-text("Sign in with Google")', {
    state: "visible",
  });

  // Click Google sign-in button
  await page.click('button:has-text("Sign in with Google")');

  // Wait for redirect to Google OAuth (or Convex Auth callback)
  // Full OAuth flow requires real Google account, so this just verifies the button works
  await page.waitForURL(/accounts\.google\.com|convex\.site.*\/api\/auth/, {
    timeout: 10000,
  });
}

/**
 * Check if user is authenticated
 *
 * Verifies presence of `convex-token` cookie, which is used by middleware to protect routes.
 *
 * @param page - Playwright Page object
 * @returns true if convex-token cookie exists, false otherwise
 *
 * @example
 * const authenticated = await isAuthenticated(page);
 * expect(authenticated).toBe(true);
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Convex Auth stores tokens in LocalStorage, not cookies
  // Check for the JWT token key pattern: __convexAuthJWT_{deploymentUrl}
  const hasAuthToken = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    return keys.some(key => key.startsWith('__convexAuthJWT_'));
  });
  return hasAuthToken;
}

/**
 * Wait for authentication to complete
 *
 * Waits for the Convex Auth JWT token to appear in LocalStorage, indicating successful authentication.
 * Useful after login/signup to ensure session is established before proceeding.
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 10000ms)
 * @throws Error if authentication does not complete within timeout
 *
 * @example
 * await login(page, "test@example.com", "password");
 * await waitForAuthentication(page);
 */
export async function waitForAuthentication(
  page: Page,
  timeout = 10000
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (await isAuthenticated(page)) {
      return;
    }
    await page.waitForTimeout(100);
  }
  throw new Error(
    `Authentication did not complete within ${timeout}ms (convex-token cookie not found)`
  );
}
