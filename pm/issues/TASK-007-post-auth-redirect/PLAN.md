---
task_id: TASK-007
title: Fix Post-Authentication Redirect Flow
epic: EPIC-001
created: 2025-11-03
status: planned
complexity_score: 3
complexity_level: low
test_first_approach: pragmatic
estimated_story_points: 2-3
---

# TASK-007 Implementation Plan: Post-Auth Redirect Fix

## Complexity Analysis

**Score: 3 points (Low Complexity)**

Breakdown:
- Single domain (frontend): 1 point
- Minor logic change (polling/waiting): 1 point
- Test validation required: 1 point

**Recommendation**: Simple implementation with clear test validation.

## Problem Summary

Race condition between `signIn()` completion and cookie storage causes redirect to fail. The code calls `router.push("/dashboard")` before the `convex-token` cookie is set, causing middleware to block the redirect.

## Solution Options

### Option 1: Poll for Cookie Presence (Recommended)

**Approach**: Wait for `convex-token` cookie to exist before redirecting.

**Implementation**:
```typescript
// src/components/RegisterForm.tsx & LoginForm.tsx
await signIn("password", formData);

// Wait for authentication cookie to be set
let attempts = 0;
while (attempts < 20) { // Max 2 seconds
  const cookies = document.cookie;
  if (cookies.includes('convex-token')) {
    break;
  }
  await new Promise(resolve => setTimeout(resolve, 100));
  attempts++;
}

// Now safe to redirect
router.push("/dashboard");
```

**Pros**:
- Simple and explicit
- Guaranteed to wait for cookie
- Easy to test and debug

**Cons**:
- Adds small delay (usually <200ms)
- Polling is not elegant (but works)

### Option 2: Use Convex Auth Hook

**Approach**: Use Convex Auth's `useQuery` to check authentication state.

**Implementation**:
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const user = useQuery(api.users.getCurrentUser);

useEffect(() => {
  if (authCompleted && user) {
    router.push("/dashboard");
  }
}, [authCompleted, user]);
```

**Pros**:
- React-idiomatic (use hooks + state)
- Convex Auth integration

**Cons**:
- More complex (requires state management)
- Async query adds latency

### Option 3: Extract to Helper Function

**Approach**: Create `waitForAuthentication()` helper in e2eAuth.ts and reuse in components.

**Implementation**:
```typescript
// tests/helpers/e2eAuth.ts
export async function waitForAuthCookie(maxAttempts = 20): Promise<boolean> {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const cookies = document.cookie;
    if (cookies.includes('convex-token')) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  return false;
}

// src/components/RegisterForm.tsx
await signIn("password", formData);
await waitForAuthCookie();
router.push("/dashboard");
```

**Pros**:
- Reusable across components
- Centralized logic
- DRY principle

**Cons**:
- Requires moving test helper to shared location
- Adds dependency between components and helpers

## Recommended Approach: Option 1 (Inline Polling)

**Why**: Simple, explicit, works reliably, easy to test.

We can refactor to Option 3 later if we see the pattern repeated in multiple places.

## Implementation Plan

### Phase 1: Fix RegisterForm Component

**Agent**: frontend-specialist

**Tasks**:
1. Update `src/components/RegisterForm.tsx`
2. Add cookie polling logic after `signIn()` completes
3. Add error handling if cookie not set after timeout
4. Test manually in browser

**Files Modified**:
- `src/components/RegisterForm.tsx` (lines 68-71)

### Phase 2: Fix LoginForm Component

**Agent**: frontend-specialist

**Tasks**:
1. Update `src/components/LoginForm.tsx`
2. Add same cookie polling logic
3. Ensure consistency with RegisterForm implementation
4. Test manually in browser

**Files Modified**:
- `src/components/LoginForm.tsx` (lines 27-30)

### Phase 3: Validate with E2E Tests

**Agent**: test-engineer (or run tests manually)

**Tasks**:
1. Run E2E tests: `npm run test:e2e`
2. Verify all 22 tests pass (currently 12/22 failing)
3. Document test results in WORKLOG
4. Check for any new failures or regressions

**Expected Outcome**: 22/22 E2E tests passing

### Phase 4: Code Review & Merge

**Agent**: code-reviewer

**Tasks**:
1. Code review of changes
2. Verify no security issues (cookie polling is client-side only)
3. Check for code duplication (RegisterForm vs LoginForm)
4. Approve if score ≥90

**Quality Gate**: Code review score ≥90

## Testing Strategy

### Manual Testing
1. Open browser, go to `/register`
2. Fill form with valid credentials
3. Submit
4. **Verify**: Redirected to `/dashboard` within 500ms
5. Repeat for `/login`

### E2E Testing
1. Run `npm run test:e2e`
2. **Expected**: 22/22 passing (all auth tests pass)
3. Focus on:
   - "should successfully register a new user" (currently failing)
   - All tests with beforeEach that call `signup()`

### Regression Testing
1. Run backend tests: `npm test`
2. **Expected**: 217 tests still passing (no regressions)

## Acceptance Criteria

- [ ] RegisterForm redirects after successful signup
- [ ] LoginForm redirects after successful login
- [ ] Cookie polling timeout handled gracefully (show error if timeout)
- [ ] E2E tests: 22/22 passing (currently 12/22)
- [ ] Manual testing: Seamless redirect UX confirmed
- [ ] Code review: Score ≥90
- [ ] No regression in backend tests (217 passing)

## Rollback Plan

If critical issues discovered:
1. Revert changes to RegisterForm.tsx and LoginForm.tsx
2. E2E tests will return to 10/22 passing state
3. Document issue and try alternative approach (Option 2 or 3)

## Success Criteria

TASK-007 is complete when:
- ✅ All acceptance criteria met
- ✅ E2E tests passing (22/22)
- ✅ Code review approved (score ≥90)
- ✅ Manual testing validates UX
- ✅ No regressions in existing functionality
