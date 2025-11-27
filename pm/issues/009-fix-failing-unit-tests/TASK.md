---
id: "009"
name: "fix-failing-unit-tests"
status: "completed"
created: "2025-11-26"
completed: "2025-11-26"
parent_spec: "SPEC-001"
---

# 009: Fix Failing Unit Tests

## Description

Fix 25 failing unit tests in the test suite that were introduced during 004 (Convex Auth implementation). These tests have incomplete mocks and environment configuration issues that need to be resolved to achieve a green test suite (621 tests, 0 failures).

**Test Failure Summary:**
- 22 failures in `reset-password/__tests__/page.test.tsx` - Missing `useAction` mock
- 2 failures in `forgot-password/__tests__/page.test.tsx` - autoFocus property detection
- 1 failure in `emailVerification.test.ts` - Missing RESEND_API_KEY for sendVerificationEmail action

**Root Causes:**
1. **Reset Password Tests**: The `convex/react` mock only exports `useMutation` and `useConvex`, but the component uses `useAction` which isn't mocked
2. **Forgot Password Tests**: The autoFocus check `element.hasAttribute("autofocus") || element.autoFocus` fails in happy-dom because React's autoFocus prop doesn't translate to either form
3. **Email Verification Test**: The `sendVerificationEmail` action requires `RESEND_API_KEY` environment variable which isn't set in the test environment

## Acceptance Criteria

- [ ] All 22 reset-password page tests pass
- [ ] All 2 forgot-password autoFocus tests pass
- [ ] emailVerification.test.ts sendVerificationEmail test passes
- [ ] Total test count: 621 tests with 0 failures
- [ ] No regression in existing passing tests (currently 594 pass)
- [ ] Test mocks follow best practices (partial mocking with importOriginal)

## Technical Notes

**Files to Modify:**
- `src/app/reset-password/__tests__/page.test.tsx` - Add `useAction` to mock
- `src/app/forgot-password/__tests__/page.test.tsx` - Fix autoFocus detection
- `convex/emailVerification.test.ts` - Mock Resend or skip when API key missing

**Dependencies:**
- 004: These tests were written as part of Convex Auth implementation
- 005: Testing infrastructure setup

**Approach:**
- Use partial mocking pattern with `importOriginal` to preserve other exports
- Follow React Testing Library best practices for autoFocus detection
- Consider test environment setup for optional external API dependencies

---

**Implementation**: Run `/plan 009` to create PLAN.md with phase-based breakdown.
