import { test, expect } from "@playwright/test";
import {
  login,
  logout,
  signup,
  isAuthenticated,
} from "../helpers/e2eAuth";
import { goto, waitForPageLoad, getCurrentPath } from "../helpers/e2eNavigation";

/**
 * E2E Authentication Flow Tests
 *
 * Tests authentication flows for So Quotable application using Convex Auth
 * with Password provider (email/password) and Google OAuth.
 *
 * Test Coverage:
 * - User registration with email/password
 * - User login with email/password
 * - User logout
 * - Authentication state persistence
 * - Error handling (invalid credentials, duplicate accounts)
 * - Password validation requirements
 * - Google OAuth sign-in (redirect only - full OAuth requires real Google account)
 *
 * Architecture Notes:
 * - Auth UI: LoginForm.tsx, RegisterForm.tsx
 * - Auth Backend: convex/auth.ts (Convex Auth with Password + Google providers)
 * - Session: convex-token cookie (24 hours, extends with "remember me")
 * - Password Requirements: 12+ chars, uppercase, lowercase, number, special char
 * - Protected Routes: /dashboard, /profile, /create-quote (redirect to /login if unauthenticated)
 *
 * Test Isolation Strategy:
 * - Each test uses unique timestamped email addresses (no database cleanup needed)
 * - Tests are independent and can run in parallel
 * - Database grows with test data but doesn't affect test outcomes
 *
 * @see src/components/LoginForm.tsx
 * @see src/components/RegisterForm.tsx
 * @see convex/auth.ts
 * @see tests/helpers/e2eAuth.ts
 */

test.describe("Authentication Flows", () => {

  test.describe("User Registration", () => {
    test("should successfully register a new user with valid credentials", async ({
      page,
    }) => {
      // Arrange: Navigate to registration page
      await goto(page, "/register");
      await waitForPageLoad(page);

      // Act: Fill registration form with valid data
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = "SecurePass123!@#";

      await page.fill('input[type="email"]', testEmail);

      // Fill password fields (password + confirmation)
      const passwordFields = await page.locator('input[type="password"]').all();
      await passwordFields[0]!.fill(testPassword);
      await passwordFields[1]!.fill(testPassword);

      // Submit registration form
      await page.click('button[type="submit"]');

      // Assert: Verify successful registration
      // - User should be redirected to a protected route (dashboard, profile, or create-quote)
      // - convex-token cookie should be set
      await page.waitForURL(/\/(dashboard|profile|create-quote)/, {
        timeout: 10000,
      });

      // Verify authentication cookie exists
      expect(await isAuthenticated(page)).toBe(true);

      // Verify user is on a protected route (not login or register)
      const currentPath = await getCurrentPath(page);
      expect(currentPath).not.toBe("/login");
      expect(currentPath).not.toBe("/register");
    });

    test("should show error when passwords do not match", async ({ page }) => {
      // Arrange: Navigate to registration page
      await goto(page, "/register");
      await waitForPageLoad(page);

      // Act: Fill registration form with mismatched passwords
      const testEmail = `test-${Date.now()}@example.com`;

      await page.fill('input[type="email"]', testEmail);

      const passwordFields = await page.locator('input[type="password"]').all();
      await passwordFields[0]!.fill("SecurePass123!@#");
      await passwordFields[1]!.fill("DifferentPass123!@#");

      // Assert: Verify password mismatch indicator appears
      // RegisterForm.tsx shows "Passwords do not match" when confirmPassword is filled
      await expect(
        page.locator("text=Passwords do not match")
      ).toBeVisible();

      // Submit button should be disabled when passwords don't match
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeDisabled();
    });

    test("should show error for weak password", async ({ page }) => {
      // Arrange: Navigate to registration page
      await goto(page, "/register");
      await waitForPageLoad(page);

      // Act: Fill registration form with weak password
      const testEmail = `test-${Date.now()}@example.com`;
      const weakPassword = "weak"; // Too short, missing requirements

      await page.fill('input[type="email"]', testEmail);

      const passwordFields = await page.locator('input[type="password"]').all();
      await passwordFields[0]!.fill(weakPassword);
      await passwordFields[1]!.fill(weakPassword);

      // Assert: Password strength indicator should show "Weak"
      // RegisterForm.tsx shows strength indicator when password is entered
      await expect(page.locator("text=Weak")).toBeVisible();

      // Submit form (button is enabled despite weak password)
      // RegisterForm.tsx validates on submit, not by disabling button
      await page.click('button[type="submit"]');

      // Verify error message appears after submission
      // RegisterForm displays specific validation errors from password-validation.ts
      // For password "weak" (4 chars), first error is length requirement
      await expect(
        page.locator("text=Password must be at least 12 characters long")
      ).toBeVisible({ timeout: 5000 });

      // User should remain on registration page
      expect(await getCurrentPath(page)).toBe("/register");
    });

    test("should show error for password that does not meet length requirement", async ({
      page,
    }) => {
      // Arrange: Navigate to registration page
      await goto(page, "/register");
      await waitForPageLoad(page);

      // Act: Fill registration form with short password
      const testEmail = `test-${Date.now()}@example.com`;
      const shortPassword = "Short1!"; // Less than 12 characters

      await page.fill('input[type="email"]', testEmail);

      const passwordFields = await page.locator('input[type="password"]').all();
      await passwordFields[0]!.fill(shortPassword);
      await passwordFields[1]!.fill(shortPassword);

      // Submit form
      await page.click('button[type="submit"]');

      // Assert: Verify error message appears
      await expect(
        page.locator("text=Password must be at least 12 characters long")
      ).toBeVisible({ timeout: 5000 });

      // User should remain on registration page
      expect(await getCurrentPath(page)).toBe("/register");
    });

    test("should show error when registering with existing email", async ({
      page,
    }) => {
      // Arrange: Register a user first through the UI
      const existingEmail = `existing-${Date.now()}@example.com`;
      const password = "SecurePass123!@#";

      // Register first user through UI
      await signup(page, existingEmail, password);

      // Wait for registration to complete and navigate back to register page
      await goto(page, "/register");
      await waitForPageLoad(page);

      // Act: Try to register with the same email
      await page.fill('input[type="email"]', existingEmail);

      const passwordFields = await page.locator('input[type="password"]').all();
      await passwordFields[0]!.fill(password);
      await passwordFields[1]!.fill(password);

      await page.click('button[type="submit"]');

      // Assert: Verify error message appears
      // Convex Auth should return error for duplicate account
      // The error is caught and displayed in the error div with bg-red-100 class
      const errorMessage = page.locator('.bg-red-100');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      // Verify error message contains meaningful text (Convex Auth error)
      await expect(errorMessage).toContainText(/account|email|exists|already/i, { timeout: 5000 });

      // User should remain on registration page
      expect(await getCurrentPath(page)).toBe("/register");
    });

    test("should display password strength indicator", async ({ page }) => {
      // Arrange: Navigate to registration page
      await goto(page, "/register");
      await waitForPageLoad(page);

      // Act: Fill password field with strong password
      const passwordFields = await page.locator('input[type="password"]').all();
      await passwordFields[0]!.fill("VerySecurePassword123!@#");

      // Assert: Verify password strength indicator appears
      // RegisterForm.tsx shows strength indicator when password is entered
      await expect(page.locator("text=Strong")).toBeVisible();
    });
  });

  test.describe("User Login", () => {
    let testUser: { email: string; password: string };

    test.beforeEach(async ({ page }) => {
      // Create a test user before each login test
      testUser = {
        email: `test-${Date.now()}@example.com`,
        password: "SecurePass123!@#",
      };

      // Register user through UI and ensure logged out state
      await signup(page, testUser.email, testUser.password);
      await logout(page);
    });

    test("should successfully log in with valid email and password", async ({
      page,
    }) => {
      // Act: Log in with the pre-created test user
      await login(page, testUser.email, testUser.password);

      // Assert: Verify successful login
      // - User should be on a protected route
      // - Authentication cookie should exist
      const currentPath = await getCurrentPath(page);
      expect(currentPath).toMatch(/\/(dashboard|profile|create-quote)/);

      expect(await isAuthenticated(page)).toBe(true);
    });

    test("should show error for invalid email", async ({ page }) => {
      // Arrange: Navigate to login page
      await goto(page, "/login");
      await waitForPageLoad(page);

      // Act: Try to log in with non-existent email
      const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;
      const password = "SecurePass123!@#";

      await page.fill('input[type="email"]', nonExistentEmail);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"]');

      // Assert: Verify error message appears
      const errorMessage = page.locator('[class*="bg-red"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      // User should remain on login page
      expect(await getCurrentPath(page)).toBe("/login");

      // User should not be authenticated
      expect(await isAuthenticated(page)).toBe(false);
    });

    test("should show error for incorrect password", async ({ page }) => {
      // Arrange: Use pre-created test user, but with wrong password
      const incorrectPassword = "WrongPassword123!@#";

      // Navigate to login page
      await goto(page, "/login");
      await waitForPageLoad(page);

      // Act: Try to log in with wrong password
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', incorrectPassword);
      await page.click('button[type="submit"]');

      // Assert: Verify error message appears
      const errorMessage = page.locator('[class*="bg-red"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      // User should remain on login page
      expect(await getCurrentPath(page)).toBe("/login");

      // User should not be authenticated
      expect(await isAuthenticated(page)).toBe(false);
    });

    test("should show loading state during sign-in", async ({ page }) => {
      // Arrange: Use pre-created test user
      // Navigate to login page
      await goto(page, "/login");
      await waitForPageLoad(page);

      // Act: Fill login form
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);

      // Click submit and immediately check for loading state
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Assert: Verify loading state appears
      // LoginForm.tsx shows "Signing in..." during loading
      await expect(submitButton).toContainText("Signing in...");

      // Wait for login to complete
      await page.waitForURL(/\/(dashboard|profile|create-quote)/, {
        timeout: 10000,
      });
    });

    test("should navigate to register page from login page", async ({
      page,
    }) => {
      // Arrange: Navigate to login page
      await goto(page, "/login");
      await waitForPageLoad(page);

      // Act: Click sign up link
      await page.click('a[href="/register"]');

      // Assert: Verify navigation to register page
      await page.waitForURL("/register", { timeout: 5000 });
      expect(await getCurrentPath(page)).toBe("/register");

      // Verify register form is visible
      await expect(page.locator("text=Create Account")).toBeVisible();
    });
  });

  test.describe("User Logout", () => {
    let testUser: { email: string; password: string };

    test.beforeEach(async ({ page }) => {
      // Create and log in a test user before each logout test
      testUser = {
        email: `test-${Date.now()}@example.com`,
        password: "SecurePass123!@#",
      };

      // Register user through UI (automatically logs in)
      await signup(page, testUser.email, testUser.password);
    });

    test("should successfully log out", async ({ page }) => {
      // Arrange: Verify user is authenticated (from beforeEach)
      expect(await isAuthenticated(page)).toBe(true);

      // Act: Log out
      await logout(page);

      // Assert: Verify successful logout
      // - User should be redirected to home or login page
      // - Authentication cookie should be removed
      const currentPath = await getCurrentPath(page);
      expect(currentPath).toMatch(/^\/(login)?$/);

      expect(await isAuthenticated(page)).toBe(false);
    });

    test("should redirect to login when accessing protected route after logout", async ({
      page,
    }) => {
      // Arrange: User is already logged in from beforeEach
      // Act: Log out
      await logout(page);

      // Try to access protected route
      await goto(page, "/dashboard");

      // Assert: Verify redirect to login page
      // Middleware should redirect unauthenticated users to /login
      await page.waitForURL("/login", { timeout: 10000 });
      expect(await getCurrentPath(page)).toBe("/login");
    });
  });

  test.describe("Authentication State Persistence", () => {
    let testUser: { email: string; password: string };

    test.beforeEach(async ({ page }) => {
      // Create and log in a test user before each test
      testUser = {
        email: `test-${Date.now()}@example.com`,
        password: "SecurePass123!@#",
      };

      // Register user through UI (automatically logs in)
      await signup(page, testUser.email, testUser.password);
    });

    test("should maintain authentication across page reloads", async ({
      page,
    }) => {
      // Arrange: Verify initial authentication (from beforeEach)
      expect(await isAuthenticated(page)).toBe(true);

      // Act: Reload the page
      await page.reload();
      await waitForPageLoad(page);

      // Assert: Verify authentication persists
      expect(await isAuthenticated(page)).toBe(true);

      // User should still be on protected route
      const currentPath = await getCurrentPath(page);
      expect(currentPath).toMatch(/\/(dashboard|profile|create-quote)/);
    });

    test("should maintain authentication when navigating between pages", async ({
      page,
    }) => {
      // Arrange: Verify initial authentication (from beforeEach)
      expect(await isAuthenticated(page)).toBe(true);

      // Act: Navigate to home page
      await goto(page, "/");
      await waitForPageLoad(page);

      // Assert: Verify authentication persists
      expect(await isAuthenticated(page)).toBe(true);

      // Act: Navigate to profile (if route exists)
      await goto(page, "/profile");

      // Assert: Verify authentication still persists
      // Should either be on profile page or stay authenticated on error page
      expect(await isAuthenticated(page)).toBe(true);
    });
  });

  test.describe("Google OAuth Sign-In", () => {
    test("should redirect to Google OAuth when clicking Google sign-in button", async ({
      page,
    }) => {
      // Arrange: Navigate to login page
      await goto(page, "/login");
      await waitForPageLoad(page);

      // Act: Click Google sign-in button
      await page.click('button:has-text("Sign in with Google")');

      // Assert: Verify redirect to Google OAuth or Convex Auth callback
      // Full OAuth flow requires real Google account interaction
      // This test verifies the button triggers the redirect
      await page.waitForURL(/accounts\.google\.com|convex\.site.*\/api\/auth/, {
        timeout: 10000,
      });
    });

    test("should redirect to Google OAuth when clicking Google sign-up button", async ({
      page,
    }) => {
      // Arrange: Navigate to register page
      await goto(page, "/register");
      await waitForPageLoad(page);

      // Act: Click Google sign-up button
      await page.click('button:has-text("Sign up with Google")');

      // Assert: Verify redirect to Google OAuth or Convex Auth callback
      await page.waitForURL(/accounts\.google\.com|convex\.site.*\/api\/auth/, {
        timeout: 10000,
      });
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect unauthenticated user to login from protected route", async ({
      page,
    }) => {
      // Arrange: Ensure no authentication cookie exists (fresh page context)
      // Playwright creates a new browser context for each test, so no cookies by default

      // Act: Try to access protected route without authentication
      await goto(page, "/dashboard");

      // Assert: Verify redirect to login page
      // Middleware should redirect to /login (may include redirect query parameter)
      await page.waitForURL(/\/login/, { timeout: 10000 });
      const currentPath = await getCurrentPath(page);
      expect(currentPath).toMatch(/^\/login/);
    });

    test.describe("Authenticated Access", () => {
      let testUser: { email: string; password: string };

      test.beforeEach(async ({ page }) => {
        // Create and log in a test user before each test
        testUser = {
          email: `test-${Date.now()}@example.com`,
          password: "SecurePass123!@#",
        };

        // Register user through UI (automatically logs in)
        await signup(page, testUser.email, testUser.password);
      });

      test("should allow authenticated user to access protected routes", async ({
        page,
      }) => {
        // Arrange: User is already logged in from beforeEach

        // Act: Navigate to protected routes
        await goto(page, "/dashboard");

        // Assert: Verify access is granted
        // Should either be on dashboard or another protected route (no redirect to login)
        const currentPath = await getCurrentPath(page);
        expect(currentPath).not.toBe("/login");
        expect(await isAuthenticated(page)).toBe(true);
      });
    });
  });

  test.describe("Form Validation", () => {
    test("should require email field in login form", async ({ page }) => {
      // Arrange: Navigate to login page
      await goto(page, "/login");
      await waitForPageLoad(page);

      // Act: Try to submit form without email
      await page.fill('input[type="password"]', "SecurePass123!@#");
      await page.click('button[type="submit"]');

      // Assert: Browser HTML5 validation should prevent submission
      // Form should not submit without required email field
      expect(await getCurrentPath(page)).toBe("/login");
    });

    test("should require password field in login form", async ({ page }) => {
      // Arrange: Navigate to login page
      await goto(page, "/login");
      await waitForPageLoad(page);

      // Act: Try to submit form without password
      await page.fill('input[type="email"]', "test@example.com");
      await page.click('button[type="submit"]');

      // Assert: Browser HTML5 validation should prevent submission
      expect(await getCurrentPath(page)).toBe("/login");
    });

    test("should require valid email format in login form", async ({
      page,
    }) => {
      // Arrange: Navigate to login page
      await goto(page, "/login");
      await waitForPageLoad(page);

      // Act: Try to submit form with invalid email format
      const emailInput = page.locator('input[type="email"]');
      await emailInput.fill("not-an-email");

      // Assert: Verify HTML5 validation error
      // Browser should show validation message for invalid email
      const isValid = await emailInput.evaluate(
        (el: HTMLInputElement) => el.validity.valid
      );
      expect(isValid).toBe(false);
    });
  });
});
