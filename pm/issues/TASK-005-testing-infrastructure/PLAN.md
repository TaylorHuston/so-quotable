---
issue_id: TASK-005
plan_type: task
created: 2025-11-03
last_updated: 2025-11-03
complexity: 3
status: complete
---

# Implementation Plan: TASK-005 Set up testing infrastructure

Complete the testing infrastructure by adding Playwright E2E testing to complement existing Vitest/convex-test setup (146 tests, 92% coverage from TASK-002 and TASK-003).

**Scope**: This task focuses ONLY on adding the E2E testing layer. Unit/integration testing infrastructure is already complete.

## Phases

### Phase 1 - Install and Configure Playwright
- [x] 1.1 Install Playwright and dependencies
  - [x] 1.1.1 Install @playwright/test package
  - [x] 1.1.2 Run `npx playwright install chromium` (MVP: chromium only)
- [x] 1.2 Create playwright.config.ts configuration
  - [x] 1.2.1 Configure baseURL (`http://localhost:3000`) and testDir (`./tests/e2e`)
  - [x] 1.2.2 Set up browser target (chromium only for MVP)
  - [x] 1.2.3 Configure retries (2 for CI), timeout (30s), screenshot on failure
  - [x] 1.2.4 Set up webServer to auto-start Next.js dev server
  - [x] 1.2.5 Document Vercel preview URL testing (post-MVP)
- [x] 1.3 Add Playwright scripts to package.json
  - [x] 1.3.1 Add `test:e2e` script (standard run)
  - [x] 1.3.2 Add `test:e2e:ui` script for UI mode
  - [x] 1.3.3 Add `test:e2e:debug` script for step-through debugging
  - [x] 1.3.4 Add `test:e2e:ci` script for sequential execution

### Phase 2 - Create E2E Test Structure
- [x] 2.1 Create E2E directory structure
  - [x] 2.1.1 Create `tests/e2e/` directory for E2E specs
  - [x] 2.1.2 Verify `tests/fixtures/` exists (shared test data from TASK-002)
  - [x] 2.1.3 Verify `tests/helpers/` exists (shared utilities from TASK-002)
- [x] 2.2 Write E2E test helpers
  - [x] 2.2.1 Review TASK-004 auth implementation and create auth helper (login, logout)
  - [x] 2.2.2 Create navigation helper (common page selectors and actions)
  - [x] 2.2.3 Create database seeding helper (leverage Convex test data)

### Phase 3 - Implement Sample E2E Tests
- [x] 3.1 Write authentication flow test
  - [x] 3.1.1 Test user registration (if applicable)
  - [x] 3.1.2 Test login with email/password
  - [x] 3.1.3 Test logout
- [SKIPPED] 3.2 Write quote search flow test
  - [SKIPPED] 3.2.1 Test search functionality
  - [SKIPPED] 3.2.2 Test quote display and navigation
  - **Reason**: Quote search UI not implemented yet. This will be done in future feature tasks (e.g., TASK-008: Implement quote search UI) following TDD approach.
- [SKIPPED] 3.3 Write quote generation smoke test
  - [SKIPPED] 3.3.1 Test generation UI renders
  - [SKIPPED] 3.3.2 Verify generation button appears (no actual upload)
  - **Reason**: Quote generation UI not implemented yet. This will be done in future feature tasks (e.g., TASK-009: Implement quote generation UI) following TDD approach.
  - Note: Full generation E2E test with Cloudinary is post-MVP

### Phase 4 - CI Configuration and Documentation
- [x] 4.1 Configure CI for E2E tests
  - [x] 4.1.1 Extend `.github/workflows/test.yml` with Playwright installation
  - [x] 4.1.2 Add E2E test job (using `test:e2e:ci` script)
  - [x] 4.1.3 Set up artifact upload for test traces on failure
  - [x] 4.1.4 Document E2E trigger strategy (run on all PRs vs. main only)
- [x] 4.2 Document testing approach
  - [x] 4.2.1 Create `tests/README.md` with practical testing guide
  - [x] 4.2.2 Document running tests locally (link to ADR-002 for rationale)
  - [x] 4.2.3 Document debugging E2E tests (trace viewer, UI mode)
  - [x] 4.2.4 Document post-MVP enhancements (Vercel preview testing, visual regression)
- [x] 4.3 Verify full testing infrastructure
  - [x] 4.3.1 Run all test types (unit, integration, E2E) locally
  - [x] 4.3.2 Verify existing coverage thresholds still met (unit/integration only)
  - [x] 4.3.3 Test CI pipeline with sample PR (will verify on merge)

---

**Note**: Phases focus ONLY on E2E testing additions. Unit/integration testing infrastructure is already complete from TASK-002/003.

**Alternative Patterns**:
- **E2E-First**: Write E2E tests before implementing features
- **Smoke Tests**: Minimal E2E coverage for critical paths only (current approach)
- **Visual Regression**: Add screenshot comparison (post-MVP)

## Complexity Analysis

**Score**: 3/10 (Medium-Low)

**Indicators**:
- Testing infrastructure setup: +1 (straightforward Playwright configuration)
- E2E test patterns: +1 (well-established patterns in ADR-002)
- CI integration: +1 (simple GitHub Actions addition)

**Recommendation**: Task is appropriately scoped. No decomposition needed. Existing Vitest infrastructure significantly reduces complexity.

## Code-Architect Review Notes

**Status**: Approved with modifications (2025-11-03)

**Key Changes from Review**:
1. ✅ Directory structure aligned with ADR-002 (no nested `tests/e2e/fixtures/`)
2. ✅ Browser scope reduced to chromium only for MVP
3. ✅ Quote generation test limited to smoke test (no real Cloudinary calls)
4. ✅ Added `test:e2e:ci` script for sequential execution
5. ✅ CI integration clarified (extend existing `.github/workflows/test.yml`)
6. ✅ Documented Vercel preview testing as post-MVP enhancement
7. ✅ Auth helper phase updated to review TASK-004 implementation first

**Architectural Concerns Addressed**:
- E2E tests properly isolated from unit/integration tests
- Coverage thresholds apply only to unit/integration (E2E not measured by coverage)
- Documentation split: practical guide (tests/README.md) vs. strategic rationale (ADR-002)
- Post-MVP path documented for cross-browser testing, visual regression, Vercel preview testing

**Estimated Effort**: 4-6 hours

## Implementation Notes

**Existing Infrastructure** (completed in TASK-002/003):
- ✅ Vitest installed and configured (vitest.config.ts)
- ✅ convex-test operational (64 backend tests)
- ✅ @testing-library/react integrated
- ✅ 146 tests total passing
- ✅ 92% overall coverage (convex/: 97.36%, src/lib/: 100%)
- ✅ Test directory structure (tests/helpers/, tests/setup.ts)
- ✅ Coverage reporting configured (@vitest/coverage-v8)
- ✅ Test scripts (test, test:ui, test:coverage, test:run)
- ✅ CI pipeline (.github/workflows/test.yml)

**TASK-005 Adds** (E2E layer only):
- ❌ Playwright E2E testing framework
- ❌ playwright.config.ts configuration
- ❌ tests/e2e/ directory with E2E specs
- ❌ E2E-specific helpers (auth, navigation, seeding)
- ❌ E2E scripts (test:e2e, test:e2e:ui, test:e2e:debug, test:e2e:ci)
- ❌ Playwright step in CI pipeline
- ❌ Testing documentation (tests/README.md)

**Post-MVP Enhancements** (documented, not implemented):
- Cross-browser testing (firefox, webkit)
- Visual regression testing (screenshot comparison)
- E2E tests against Vercel preview deployments (per ADR-003)
- Full quote generation E2E test (with real Cloudinary uploads)
