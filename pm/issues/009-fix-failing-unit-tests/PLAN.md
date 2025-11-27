# 009: Fix Failing Unit Tests

## Description

Fix 25 failing unit tests in the test suite that were introduced during 004 (Convex Auth implementation). These tests have incomplete mocks and environment configuration issues that need to be resolved to achieve a green test suite.

**Test Failure Summary:**
- 22 failures in `reset-password/__tests__/page.test.tsx` - Missing `useAction` mock
- 2 failures in `forgot-password/__tests__/page.test.tsx` - autoFocus property detection
- 1 failure in `emailVerification.test.ts` - Missing RESEND_API_KEY for sendVerificationEmail action

**Root Cause Analysis:**
1. **Reset Password Tests**: The `convex/react` mock only exports `useMutation` and `useConvex`, but the component uses `useAction` which isn't mocked
2. **Forgot Password Tests**: The autoFocus check `element.hasAttribute("autofocus") || element.autoFocus` fails in happy-dom because React's autoFocus prop doesn't translate to either form
3. **Email Verification Test**: The `sendVerificationEmail` action requires `RESEND_API_KEY` environment variable which isn't set in the test environment

## Acceptance Criteria

- [ ] All 22 reset-password page tests pass
- [ ] All forgot-password page tests pass (2 autoFocus tests)
- [ ] emailVerification.test.ts sendVerificationEmail test passes
- [ ] Total test count: 621 tests with 0 failures (currently 594 pass, 25 fail, 2 skip)
- [ ] No regression in existing passing tests
- [ ] Test mocks follow best practices (partial mocking with importOriginal)

## Technical Notes

**Phase 1: Fix reset-password tests (22 failures)**
- Add `useAction` to the `convex/react` mock
- Use partial mocking pattern: `importOriginal` to preserve other exports
- Mock `useAction` to return a controllable function

**Phase 2: Fix forgot-password tests (2 failures)**
- Update autoFocus test assertions to use document.activeElement check instead
- Or check the React element directly during render setup

**Phase 3: Fix emailVerification test (1 failure)**
- Mock the Resend API call in the test setup OR
- Skip the sendVerificationEmail test when RESEND_API_KEY is not set
- Consider adding test environment variable in vitest setup

**Dependencies:**
- 004: These tests were written as part of Convex Auth implementation
- 005: Testing infrastructure setup

**Files to Modify:**
- `src/app/reset-password/__tests__/page.test.tsx`
- `src/app/forgot-password/__tests__/page.test.tsx`
- `convex/emailVerification.test.ts`

---

**Implementation**: Run `/implement 009 --next` to start Phase 1.
