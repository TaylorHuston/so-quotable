---
issue_id: TASK-007
title: Fix Post-Authentication Redirect Flow
epic: EPIC-001
type: task
created: 2025-11-03
status: planned
priority: medium
complexity_score: 3
estimated_story_points: 2-3
discovered_by: TASK-005 Phase 3.1 E2E testing
---

# TASK-006: Fix Post-Authentication Redirect Flow

## Problem Statement

After successful email/password authentication (signup or login), users are not automatically redirected to the dashboard. The redirect code exists (`router.push("/dashboard")`) but fails due to a race condition where the redirect executes before the `convex-token` cookie is set by Convex Auth.

**Impact:**
- 12/22 E2E auth tests failing (signup timeout waiting for redirect)
- Poor user experience (users may need to manually navigate after auth)
- Inconsistent behavior between manual testing (works) and automated testing (fails)

## Current Behavior

1. User submits signup/login form
2. `signIn("password", formData)` called
3. `router.push("/dashboard")` called immediately
4. Middleware checks for `convex-token` cookie (may not be set yet)
5. User stays on /login or /register page (race condition)

## Expected Behavior

1. User submits signup/login form
2. `signIn("password", formData)` called
3. **Wait for `convex-token` cookie to be set**
4. `router.push("/dashboard")` called
5. User redirected to dashboard successfully

## Root Cause

Race condition between `signIn()` promise resolution and cookie storage. The `signIn()` function returns before the authentication cookie is persisted to the browser.

## Discovery Context

This issue was discovered during TASK-005 Phase 3.1 E2E testing. The E2E tests correctly assumed that users should be automatically redirected after successful authentication, but TASK-004 acceptance criteria did not explicitly require this behavior. This is a scoping gap, not a bug in the original implementation.

## Acceptance Criteria

- [ ] Successful signup redirects to `/dashboard` (or redirect parameter)
- [ ] Successful login redirects to `/dashboard` (or redirect parameter)
- [ ] Redirect only occurs after `convex-token` cookie is confirmed present
- [ ] All 22 E2E auth tests pass (currently 12/22 failing due to this issue)
- [ ] Manual browser testing confirms seamless redirect UX
- [ ] No regression in existing auth functionality (217 backend tests still pass)

## Related Work

- **EPIC-001**: Authentication & User Management (parent epic)
- **TASK-004**: Convex Auth implementation (auth infrastructure this builds on)
- **TASK-005**: Testing infrastructure (discovered this issue in Phase 3.1 E2E testing)

## Technical Notes

See PLAN.md for detailed implementation approach and solution options.
