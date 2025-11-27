# Testing Guide

This guide provides practical instructions for running and debugging tests in the So Quotable project.

For the strategic testing rationale and framework decisions, see [ADR-002: Testing Framework and Strategy](../docs/project/adrs/ADR-002-testing-framework.md).

## Test Structure

```
tests/
├── e2e/                 # End-to-end tests (Playwright)
│   └── auth.spec.ts    # Authentication flow tests
├── fixtures/            # Shared test data
│   └── testData.ts     # Common test fixtures
├── helpers/             # Test utilities
│   ├── e2eAuth.ts      # E2E authentication helpers
│   └── testHelpers.ts  # Shared test utilities
└── setup.ts             # Global test setup (Vitest)
```

## Running Tests Locally

### Unit & Integration Tests (Vitest)

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once (CI mode)
npm run test:run

# Run with UI (visual test explorer)
npm run test:ui

# Run with coverage report
npm run test:coverage
```

**Coverage Targets**:
- Unit/Integration: 95% coverage threshold
- Backend (convex/): Currently 92%+
- Frontend (src/lib/): Currently 100%

### End-to-End Tests (Playwright)

**Prerequisites**: Convex dev server must be running in a separate terminal:
```bash
# Terminal 1: Start Convex backend
npx convex dev
```

Then run E2E tests:

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive, headed browser)
npm run test:e2e:ui

# Run with debugging (step-through)
npm run test:e2e:debug

# Run in CI mode (sequential execution)
npm run test:e2e:ci
```

**Current E2E Test Status**:
- 22 authentication flow tests written
- 10/22 passing (45% - expected failures due to 007 auth redirect issue)
- Quote search/generation tests skipped (features not implemented yet)

## Debugging E2E Tests

### 1. UI Mode (Recommended)

UI mode provides a visual test explorer with time-travel debugging:

```bash
npm run test:e2e:ui
```

Features:
- Watch mode with automatic re-runs
- Visual timeline of test execution
- DOM snapshots at each step
- Network requests inspection

### 2. Trace Viewer

If a test fails in CI, download the `playwright-traces` artifact and view it:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

Features:
- Step-by-step action replay
- Screenshots at each step
- Network activity
- Console logs
- Source code integration

### 3. Debug Mode

Step through tests line-by-line:

```bash
npm run test:e2e:debug
```

Features:
- Headed browser (visible)
- Pauses before each action
- Browser DevTools available
- Console logs visible

### 4. Adding Debug Output

Use Playwright's built-in debugging helpers:

```typescript
// Pause execution
await page.pause();

// Take a screenshot
await page.screenshot({ path: 'debug.png' });

// Log page content
console.log(await page.content());

// Wait and inspect
await page.waitForTimeout(5000); // Not recommended for production tests
```

## Test Data Management

### Fixtures

Shared test data is defined in `tests/fixtures/testData.ts`:

```typescript
import { testUsers, testPeople, testQuotes } from './fixtures/testData';
```

### Database Seeding

For E2E tests, use the `seedTestData()` helper:

```typescript
import { seedTestData, cleanupTestData } from '../helpers/e2eAuth';

test.beforeEach(async () => {
  await seedTestData();
});

test.afterEach(async () => {
  await cleanupTestData();
});
```

## Writing New Tests

### Unit/Integration Tests (Vitest)

Create tests next to the code they test:

```
convex/quotes.ts          # Implementation
convex/quotes.test.ts     # Tests
```

Use `convex-test` for Convex backend functions:

```typescript
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

describe("quotes", () => {
  test("should create a quote", async () => {
    const t = convexTest(schema);
    const quoteId = await t.mutation(api.quotes.create, {
      personId: testPersonId,
      text: "Test quote",
    });
    expect(quoteId).toBeDefined();
  });
});
```

### E2E Tests (Playwright)

Create tests in `tests/e2e/` with the `.spec.ts` suffix:

```typescript
import { test, expect } from '@playwright/test';
import { signup, login, logout } from '../helpers/e2eAuth';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/So Quotable/);
  });
});
```

## CI Pipeline

Tests run automatically on:
- All pushes to any branch
- Pull requests to `main` or `develop`

**CI Test Stages**:
1. TypeScript type checking (`npm run type-check`)
2. Linting (`npm run lint`)
3. Unit/Integration tests (`npm run test:run`)
4. E2E tests (`npm run test:e2e:ci`)
5. Build verification (`npm run build`)

**E2E CI Configuration**:
- Browser: Chromium only (MVP)
- Execution: Sequential (`--workers=1`)
- Traces: Uploaded on failure (retained 7 days)

## Known Issues

### 007: Auth Redirect Race Condition

**Issue**: 12/22 E2E auth tests fail due to post-authentication redirect timeout.

**Cause**: `router.push("/dashboard")` executes before `convex-token` cookie is set.

**Status**: Fix planned in 007 (cookie polling before redirect).

**Workaround**: Tests are correctly written; failures reveal implementation gap (TDD working as intended).

## Post-MVP Enhancements

The following features are documented but not yet implemented:

### Cross-Browser Testing

Currently testing chromium only. Future:

```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

### Visual Regression Testing

Screenshot comparison for UI changes:

```typescript
await expect(page).toHaveScreenshot('homepage.png');
```

### Vercel Preview Deployment Testing

Test against preview deployments (per ADR-003):

```yaml
# .github/workflows/test.yml
- name: Wait for Vercel deployment
  uses: patrickedqvist/wait-for-vercel-preview@v1.3.1

- name: Run E2E tests against preview
  env:
    BASE_URL: ${{ steps.vercel.outputs.preview-url }}
  run: npm run test:e2e:ci
```

### Full Quote Generation E2E Test

Test complete flow with real Cloudinary uploads:

```typescript
test('should generate quote image', async ({ page }) => {
  await page.goto('/create-quote');
  await page.fill('[name="text"]', 'Test quote');
  await page.click('button:has-text("Generate")');
  await expect(page.locator('.generated-image')).toBeVisible();
});
```

## Troubleshooting

### "Cannot find module" errors

Ensure dependencies are installed:
```bash
npm install
```

### Playwright browser not found

Install browsers:
```bash
npx playwright install chromium
```

### E2E tests timeout

1. Check Convex dev server is running: `npx convex dev`
2. Increase timeout in `playwright.config.ts` (currently 30s)
3. Check for network issues or slow backend responses

### Coverage not updating

Clear coverage cache:
```bash
rm -rf coverage/
npm run test:coverage
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [convex-test Documentation](https://docs.convex.dev/testing)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [ADR-002: Testing Framework and Strategy](../docs/project/adrs/ADR-002-testing-framework.md)
