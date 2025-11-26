---
issue_number: TASK-005
type: task
spec: SPEC-001
status: done
created: 2025-10-30
jira_issue_key: null
---

# TASK-005: Set up testing infrastructure

**Epic**: EPIC-001 - MVP Infrastructure Setup
**Status**: todo

## Description

Implement the comprehensive testing infrastructure as defined in ADR-002, including Vitest for unit/integration tests, convex-test for backend testing, and Playwright for E2E tests. Configure the backend-first testing pyramid with 60% backend, 30% frontend, and 10% E2E coverage targets.

## Acceptance Criteria

- [ ] Vitest installed and configured for unit/integration tests
- [ ] convex-test configured for Convex function testing
- [ ] React Testing Library integrated for component tests
- [ ] Playwright installed and configured for E2E tests
- [ ] Test directory structure created (tests/unit, tests/e2e, tests/fixtures)
- [ ] Coverage reporting configured with thresholds (80% backend, 70% frontend)
- [ ] Test scripts added to package.json
- [ ] CI-ready test configuration
- [ ] Sample tests created for each test type
- [ ] Test helpers and utilities implemented
- [ ] Mock data fixtures created

## Technical Notes

- Install packages:
  - vitest (v2.0+)
  - @vitest/ui
  - convex-test (v0.0.17+)
  - @testing-library/react
  - @testing-library/jest-dom
  - @playwright/test (v1.45+)
  - @vitest/coverage-v8
- Configure vitest.config.ts:
  - Separate configs for frontend and backend
  - Path aliases matching tsconfig
  - Coverage thresholds enforcement
- Configure playwright.config.ts:
  - Multiple browser targets
  - Viewport sizes for responsive testing
  - Screenshot on failure
  - Video recording for debugging
- Create test utilities:
  - renderWithProviders for React components
  - convexTest helper for backend tests
  - Test data factories
- Set up npm scripts:
  - test: Vitest watch mode
  - test:ui: Vitest UI
  - test:coverage: Coverage report
  - test:e2e: Playwright tests
  - test:e2e:ui: Playwright UI mode

## Dependencies

- TASK-001: Next.js project must be initialized
- TASK-002: Convex backend for testing database functions
- Node.js test runner support

## Testing

- Run `npm test` and verify Vitest starts in watch mode
- Execute a sample Convex function test
- Run a sample React component test
- Execute a sample E2E test with Playwright
- Generate coverage report and verify thresholds work
- Confirm all test types can run in CI environment
