import { Page } from "@playwright/test";

/**
 * E2E Navigation Helper
 *
 * Provides reusable navigation actions and common selectors for Playwright tests.
 * Simplifies page navigation, form interactions, and waiting for page states.
 *
 * @see playwright.config.ts (baseURL: http://localhost:3000)
 */

/**
 * Common CSS selectors used across the application
 *
 * These selectors provide a centralized reference for UI elements,
 * making tests more maintainable when UI structure changes.
 */
export const SELECTORS = {
  // Auth forms
  loginForm: 'form:has(input[type="email"], input[type="password"])',
  registerForm: 'form:has(input[type="email"], input[type="password"])',
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  submitButton: 'button[type="submit"]',

  // Auth buttons
  googleSignInButton: 'button:has-text("Sign in with Google")',
  googleSignUpButton: 'button:has-text("Sign up with Google")',
  signOutButton: 'button:has-text("Sign Out")',

  // Navigation links
  loginLink: 'a[href="/login"]',
  registerLink: 'a[href="/register"]',
  dashboardLink: 'a[href="/dashboard"]',

  // Error/success messages
  errorMessage: '[class*="error"], [class*="bg-red"]',
  successMessage: '[class*="success"], [class*="bg-green"]',

  // User profile
  userProfile: '[data-testid="user-profile"]',
  userEmail: '[data-testid="user-email"]',
  userName: '[data-testid="user-name"]',

  // Loading states
  loadingSpinner: '[class*="loading"], [class*="spinner"]',
  skeleton: '[class*="skeleton"], [class*="pulse"]',
} as const;

/**
 * Navigate to a path with the base URL
 *
 * Uses Playwright's configured baseURL (http://localhost:3000) and appends the path.
 * Waits for the page to load completely.
 *
 * @param page - Playwright Page object
 * @param path - Relative path (e.g., "/dashboard", "/login")
 * @param waitUntil - Wait for this state before resolving (default: "load")
 *
 * @example
 * await goto(page, "/dashboard");
 * await goto(page, "/login", "networkidle");
 */
export async function goto(
  page: Page,
  path: string,
  waitUntil: "load" | "domcontentloaded" | "networkidle" = "load"
): Promise<void> {
  await page.goto(path, { waitUntil });
}

/**
 * Wait for Next.js page to be fully hydrated and ready
 *
 * Waits for React hydration to complete, ensuring interactive elements are ready.
 * This is especially important for Next.js App Router with client components.
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 30000ms)
 *
 * @example
 * await page.goto("/dashboard");
 * await waitForPageLoad(page);
 */
export async function waitForPageLoad(
  page: Page,
  timeout = 30000
): Promise<void> {
  // Wait for Next.js hydration to complete
  // Next.js adds data-nextjs-data attribute when hydration is complete
  await page.waitForLoadState("domcontentloaded", { timeout });

  // Wait for network to be idle (all API calls complete)
  await page.waitForLoadState("networkidle", { timeout });

  // Wait for Convex queries to resolve by checking for loading indicators
  // This is more reliable than arbitrary timeouts
  try {
    await page.waitForSelector('[data-loading="true"]', {
      state: "hidden",
      timeout: 2000,
    });
  } catch {
    // If no loading indicator found, queries already complete or not present
    // This is expected for pages without explicit loading states
  }
}

/**
 * Click a link by its visible text
 *
 * Finds an <a> tag containing the specified text and clicks it.
 * Waits for the link to be visible and enabled before clicking.
 *
 * @param page - Playwright Page object
 * @param text - Link text to search for (case-sensitive, partial match)
 * @param exact - If true, match exact text only (default: false)
 *
 * @example
 * await clickLink(page, "Sign up");
 * await clickLink(page, "Dashboard", true);
 */
export async function clickLink(
  page: Page,
  text: string,
  exact = false
): Promise<void> {
  const selector = exact ? `a:has-text("${text}")` : `a:text("${text}")`;
  await page.waitForSelector(selector, { state: "visible" });
  await page.click(selector);
}

/**
 * Fill multiple form fields at once
 *
 * Takes an object mapping CSS selectors to values and fills all fields.
 * Waits for each field to be visible before filling.
 *
 * @param page - Playwright Page object
 * @param formData - Object mapping selectors to values
 *
 * @example
 * await fillForm(page, {
 *   'input[type="email"]': "test@example.com",
 *   'input[type="password"]': "SecurePass123!",
 * });
 */
export async function fillForm(
  page: Page,
  formData: Record<string, string>
): Promise<void> {
  for (const [selector, value] of Object.entries(formData)) {
    await page.waitForSelector(selector, { state: "visible" });
    await page.fill(selector, value);
  }
}

/**
 * Submit a form by clicking the submit button
 *
 * Finds a submit button within the specified form selector and clicks it.
 * Optionally waits for navigation after submission.
 *
 * @param page - Playwright Page object
 * @param formSelector - CSS selector for the form (optional, defaults to any submit button)
 * @param waitForNavigation - If true, wait for page navigation after submit (default: false)
 *
 * @example
 * await submitForm(page, SELECTORS.loginForm, true);
 * await submitForm(page); // Submit any form
 */
export async function submitForm(
  page: Page,
  formSelector?: string,
  waitForNavigation = false
): Promise<void> {
  const submitSelector = formSelector
    ? `${formSelector} button[type="submit"]`
    : 'button[type="submit"]';

  await page.waitForSelector(submitSelector, { state: "visible" });

  if (waitForNavigation) {
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }),
      page.click(submitSelector),
    ]);
  } else {
    await page.click(submitSelector);
  }
}

/**
 * Wait for an error message to appear
 *
 * Waits for an element with error styling to appear and returns its text content.
 * Useful for verifying validation errors or API error messages.
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 5000ms)
 * @returns Error message text
 * @throws Error if no error message appears within timeout
 *
 * @example
 * const error = await waitForError(page);
 * expect(error).toContain("Invalid credentials");
 */
export async function waitForError(
  page: Page,
  timeout = 5000
): Promise<string> {
  await page.waitForSelector(SELECTORS.errorMessage, {
    state: "visible",
    timeout,
  });
  const errorElement = page.locator(SELECTORS.errorMessage).first();
  return (await errorElement.textContent()) || "";
}

/**
 * Wait for a success message to appear
 *
 * Waits for an element with success styling to appear and returns its text content.
 * Useful for verifying successful form submissions or actions.
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 5000ms)
 * @returns Success message text
 * @throws Error if no success message appears within timeout
 *
 * @example
 * const success = await waitForSuccess(page);
 * expect(success).toContain("Account created successfully");
 */
export async function waitForSuccess(
  page: Page,
  timeout = 5000
): Promise<string> {
  await page.waitForSelector(SELECTORS.successMessage, {
    state: "visible",
    timeout,
  });
  const successElement = page.locator(SELECTORS.successMessage).first();
  return (await successElement.textContent()) || "";
}

/**
 * Wait for loading state to complete
 *
 * Waits for loading spinners or skeleton screens to disappear,
 * indicating that data has finished loading.
 *
 * @param page - Playwright Page object
 * @param timeout - Maximum time to wait in milliseconds (default: 10000ms)
 *
 * @example
 * await page.goto("/dashboard");
 * await waitForLoadingComplete(page);
 */
export async function waitForLoadingComplete(
  page: Page,
  timeout = 10000
): Promise<void> {
  // Wait for loading spinner to disappear (if present)
  try {
    await page.waitForSelector(SELECTORS.loadingSpinner, {
      state: "hidden",
      timeout: 2000,
    });
  } catch {
    // No loading spinner found, that's okay
  }

  // Wait for skeleton screens to disappear (if present)
  try {
    await page.waitForSelector(SELECTORS.skeleton, {
      state: "hidden",
      timeout,
    });
  } catch {
    // No skeleton found, that's okay
  }
}

/**
 * Check if an element is visible on the page
 *
 * Non-throwing version of waitForSelector that returns a boolean.
 * Useful for conditional logic in tests.
 *
 * @param page - Playwright Page object
 * @param selector - CSS selector to check
 * @param timeout - Maximum time to wait in milliseconds (default: 1000ms)
 * @returns true if element is visible, false otherwise
 *
 * @example
 * const isLoggedIn = await isVisible(page, SELECTORS.userProfile);
 */
export async function isVisible(
  page: Page,
  selector: string,
  timeout = 1000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: "visible", timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current page URL path
 *
 * Returns just the pathname (without origin), useful for assertions.
 *
 * @param page - Playwright Page object
 * @returns Current pathname (e.g., "/dashboard")
 *
 * @example
 * const path = await getCurrentPath(page);
 * expect(path).toBe("/dashboard");
 */
export async function getCurrentPath(page: Page): Promise<string> {
  return new URL(page.url()).pathname;
}

/**
 * Reload the page and wait for it to load
 *
 * Refreshes the current page and waits for hydration to complete.
 *
 * @param page - Playwright Page object
 *
 * @example
 * await reloadPage(page);
 */
export async function reloadPage(page: Page): Promise<void> {
  await page.reload({ waitUntil: "load" });
  await waitForPageLoad(page);
}
