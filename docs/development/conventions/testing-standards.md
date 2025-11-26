---
last_updated: "2025-11-25"
description: "Testing approach, frameworks, and conventions for So Quotable"

# === Testing Configuration ===
testing_framework: "vitest"       # Vitest v2.0+ for unit/integration
e2e_framework: "playwright"       # Playwright v1.45+ for E2E
backend_testing: "convex-test"    # convex-test v0.0.17 for Convex functions
component_testing: "react-testing-library"  # React Testing Library
test_location: "tests/"           # tests/ directory
test_priority: "backend-first"    # 60% backend, 30% frontend, 10% E2E
run_command: "npm test"
coverage_target: 80               # 80%+ backend, 70%+ frontend
---

# Testing Standards

**Referenced by Commands:** `/test-fix`, test-engineer agent

## Quick Reference

This guideline defines our testing approach, frameworks, and conventions for So Quotable. See [ADR-002: Testing Framework](../../project/adrs/ADR-002-testing-framework.md) for detailed rationale.

**Coverage Target**: See `development-loop.md` for coverage workflow (target: 80%+ backend, 70%+ frontend).

## Purpose

This document defines testing standards and practices for the So Quotable project.

## Testing Philosophy

- Write tests before or alongside code (TDD/BDD)
- Aim for high coverage, but focus on critical paths
- Tests should be fast, isolated, and repeatable
- Tests are documentation - make them readable
- Backend-first approach (business logic in Convex functions)

## Test Types

### Unit Tests

- Test individual functions and components in isolation
- Mock external dependencies
- Fast execution (< 1s for entire suite)
- Target: 80%+ coverage for business logic

**So Quotable Focus**: Convex functions (queries, mutations, actions)

### Integration Tests

- Test interactions between components
- Use minimal mocking
- Test API endpoints (Convex function calls)
- Database interactions (using convex-test with real database)

**So Quotable Focus**: Convex function integration with database

### End-to-End Tests

- Test complete user workflows
- Test critical user paths
- Keep these minimal (slow to run)
- Run before deployment

**So Quotable Focus**: Critical flows (search → generate → share)

## Testing Tools

See [ADR-002: Testing Framework and Strategy](../../project/adrs/ADR-002-testing-framework.md) for detailed rationale.

- **Test Runner**: Vitest (v2.0+) - Unit and integration tests
- **Backend Testing**: convex-test (v0.0.17) - Convex function testing with real database
- **Component Testing**: React Testing Library - User-focused component tests
- **E2E Testing**: Playwright (v1.45+) - Critical user flows
- **BDD Style**: Native describe/it with Given-When-Then comments

**Testing Pyramid** (Backend-First):

```
     /\
    /E2E\          10%: Playwright - Critical flows
   /------\
  /Frontend\       30%: React Testing Library - Key components
 /----------\
/  Backend   \     60%: Vitest + convex-test - Business logic
--------------
```

**Rationale**:
- 60%: Backend (Convex functions - core business logic)
- 30%: Frontend (React components - presentation layer)
- 10%: E2E (Critical flows - search → generate → share)

Backend-first because core business logic lives in Convex functions.

## Test Structure

```javascript
describe("Component/Function Name", () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  describe("when condition", () => {
    it("should do expected behavior", () => {
      // Arrange (Given)
      // Act (When)
      // Assert (Then)
    });
  });
});
```

### Convex Function Testing

```typescript
import { convexTest } from "convex-test";
import { describe, it, expect } from "vitest";
import schema from "../convex/schema";
import { api } from "../convex/_generated/api";

describe("quotes", () => {
  it("should create a quote", async () => {
    const t = convexTest(schema);

    // Given: A person exists
    const personId = await t.run(async (ctx) => {
      return await ctx.db.insert("people", { name: "Test Person" });
    });

    // When: Creating a quote
    const quoteId = await t.mutation(api.quotes.create, {
      personId,
      text: "Test quote",
      source: "Test source",
    });

    // Then: Quote is created
    expect(quoteId).toBeDefined();
  });
});
```

## Test Data Management

### Unit Tests (Convex Functions)

**In-Memory Database**: Unit tests use `convexTest` which creates an isolated, in-memory database for each test.

```typescript
import { convexTest } from "convex-test";

beforeEach(() => {
  t = convexTest(schema, modules); // Fresh database for each test
});
```

**Cleanup**: Automatic - each test gets a fresh database, no cleanup needed.

### E2E Tests (Playwright)

**Live Database**: E2E tests use the real Convex deployment to test full user flows.

**Cleanup Strategy**: Automatic cleanup after all tests complete via `afterAll` hook.

```typescript
test.describe("Authentication Flows", () => {
  test.afterAll(async () => {
    const result = await cleanupAllTestData();
    console.log(`✓ ${result.deletedUsers} users cleaned up`);
  });
});
```

**Test Isolation**: Each test uses unique timestamped email addresses to avoid conflicts:

```typescript
const testEmail = `test-${Date.now()}@example.com`;
```

**Cleanup Implementation**:
- `tests/helpers/testCleanup.ts` - Helper functions for data cleanup
- `convex/cleanupTestUsers.ts` - Mutation that deletes test users and auth accounts
- Pattern matching: `test-*@example.com`, `*@test.com`, etc.

### Cleanup Utilities

**Manual Cleanup Script**:
```bash
npx tsx scripts/cleanup-all-test-users.ts
```

**Verification Script**:
```bash
npx tsx scripts/verify-test-cleanup.ts
```

## Best Practices

- Use descriptive test names
- Test behavior, not implementation
- One assertion per test (when possible)
- Avoid test interdependencies
- Clean up after tests (automatic for unit tests, afterAll hook for E2E tests)
- Follow Given-When-Then pattern for clarity
- Use unique identifiers (timestamps) for E2E test data isolation

## Coverage Goals

- **Backend (Convex)**: 80%+ coverage
- **Frontend (React)**: 70%+ coverage
- **E2E**: Critical user flows covered
- Coverage as a guide, not a goal - focus on meaningful tests

## Continuous Integration

- All tests must pass before merging
- Run tests on every pull request
- Maintain test suite performance
- Automated via GitHub Actions (see ADR-003)

## Test Organization

**Co-located Tests**: Unit and integration tests live next to source files (`.test.ts` or `.test.tsx`).

```
convex/
├── quotes.ts              # Source
├── quotes.test.ts         # Unit tests (co-located)
├── people.ts
├── people.test.ts
├── cleanupTestUsers.ts    # Test data cleanup mutation
└── test.setup.ts          # Shared test configuration

src/
├── components/
│   ├── QuoteCard.tsx
│   └── QuoteCard.test.tsx  # Component tests (co-located)
└── lib/
    ├── password-validation.ts
    └── password-validation.test.ts

tests/
├── e2e/                    # Playwright E2E tests
│   └── auth.spec.ts        # Auth flows with cleanup
├── fixtures/               # Shared test data
│   ├── quotes.ts
│   └── people.ts
└── helpers/                # Test utilities
    ├── e2eAuth.ts          # E2E auth helpers
    ├── e2eNavigation.ts    # E2E navigation helpers
    └── testCleanup.ts      # E2E data cleanup helpers

scripts/
├── cleanup-all-test-users.ts     # Manual cleanup script
└── verify-test-cleanup.ts        # Cleanup verification
```

**Benefits of Co-location**:
- Tests stay in sync with source code
- Easier to find relevant tests
- Tests are updated when refactoring code
- Clear which code is tested vs untested

## Examples

### Good Test Names

```typescript
describe("quotes.create", () => {
  it("should create a quote with valid data", () => {});
  it("should reject quote with empty text", () => {});
  it("should require authentication", () => {});
});
```

### Poor Test Names

```typescript
describe("quotes", () => {
  it("test1", () => {});  // ✗ Not descriptive
  it("works", () => {});  // ✗ Vague
});
```

---

_Update this document as your testing practices evolve._
