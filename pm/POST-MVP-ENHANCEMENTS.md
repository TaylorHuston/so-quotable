# TASK-004: Post-MVP Enhancements

This document contains all improvements and features that were identified but deferred from the MVP implementation of Convex Auth.

**Created**: 2025-11-06
**Context**: During TASK-004 implementation and quality assessment, many valuable improvements were identified but deferred to keep the MVP focused and production-ready. These enhancements can be prioritized post-MVP based on user feedback and business priorities.

---

## Deferred Phases Summary

| Phase | Title | Estimated Time | Priority | Reason Deferred |
|-------|-------|----------------|----------|-----------------|
| Phase 6 | OAuth Redirect to Dashboard | 30-45 min | 🟡 MEDIUM | UX improvement, not MVP-blocking (auth works, just redirects to wrong page) |
| Phase 7 | Manual Testing | 60-90 min | 🟢 LOW | Automated E2E tests provide comprehensive coverage (22/22 passing) |
| Phase 8.2 | Code Quality Improvements | 4 hours | 🟠 HIGH | Maintainability improvements, not MVP-blocking |
| Phase 8.3 | Advanced Security | 8 hours | 🟠 HIGH | Email verification, password reset (requires email service decision) |
| Phase 8.4 | Component Unit Tests | 12 hours | 🟡 MEDIUM | E2E tests provide good coverage, unit tests for faster feedback |
| Phase 8.5 | Performance Optimizations | 2 hours | 🟢 LOW | Current performance acceptable for MVP |
| Phase 8.6 | Documentation | 3 hours | 🟢 LOW | Core documentation complete, JSDoc can be added incrementally |

**Total Deferred Work**: ~29-31 hours

---

## Phase 6: Fix Google OAuth Redirect to Dashboard

**Objective**: After successful Google OAuth, redirect user to dashboard (not homepage).

**Current Behavior**:
- OAuth completes successfully and user is authenticated
- User lands on `/` (homepage) instead of `/dashboard`
- Manual navigation required to reach dashboard

**Expected Behavior**:
- After Google OAuth sign-in/sign-up, user automatically redirected to `/dashboard`
- Consistent with email/password auth behavior

### Implementation Options

**Option A: Add explicit redirect after OAuth completes** (Recommended):
```typescript
// src/components/LoginForm.tsx - Update handleGoogleSignIn (lines 41-52)
const handleGoogleSignIn = async () => {
  try {
    await signIn("google");
    // Add explicit redirect after OAuth completes
    await new Promise(resolve => setTimeout(resolve, 100));
    router.push("/dashboard");
  } catch (err) {
    console.error("Google sign-in failed:", err);
  }
};

// src/components/RegisterForm.tsx - Update handleGoogleSignUp (lines 78-93)
const handleGoogleSignUp = async () => {
  try {
    await signIn("google");
    await new Promise(resolve => setTimeout(resolve, 100));
    router.push("/dashboard");
  } catch (err) {
    console.error("Google sign-up failed:", err);
  }
};
```

**Option B: Configure OAuth redirect parameter** (If Option A doesn't work):
```typescript
// convex/auth.ts - Add redirect parameter to Google provider config
Google({
  // ... existing config
  redirect: "/dashboard", // Set default redirect
})
```

**Option C: Fix middleware OAuth callback handling**:
```typescript
// src/middleware.ts - Detect OAuth callback and redirect
export function middleware(request: NextRequest) {
  // ... existing logic

  // Detect OAuth callback route
  if (request.nextUrl.pathname === "/api/auth/callback/google") {
    // Redirect to /dashboard after successful auth verification
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
```

### Testing

**Manual Testing**:
1. Clear browser cookies and local storage
2. Navigate to http://localhost:3000/login
3. Click "Sign in with Google"
4. Complete OAuth consent screen
5. **Expected**: Redirect to http://localhost:3000/dashboard
6. **Actual (before fix)**: Lands on http://localhost:3000

**Automated Testing**:
- E2E tests already verify OAuth authentication works
- After fix, update E2E tests to verify redirect destination

### Acceptance Criteria

- [ ] Google OAuth sign-in redirects to `/dashboard`
- [ ] Google OAuth sign-up redirects to `/dashboard`
- [ ] User sees authenticated state immediately after OAuth
- [ ] No manual navigation required
- [ ] Behavior consistent with email/password auth
- [ ] E2E tests verify redirect destination

**Estimated Time**: 30-45 minutes

---

## Phase 7: Comprehensive Manual Testing and Validation

**Objective**: Validate all auth flows work correctly through manual browser testing.

**Rationale for Deferring**:
- Automated E2E tests provide comprehensive coverage (22/22 passing)
- All auth flows verified through automation:
  - Email/password registration with validation
  - Login with credentials
  - Logout and session clearing
  - Google OAuth sign-in/sign-up
  - Protected route enforcement
  - Middleware redirect logic
- Manual testing would be redundant for MVP
- Can be performed during post-MVP QA/polish phase

### Manual Testing Checklist

If manual testing is desired post-MVP, follow this checklist:

#### Email/Password Auth Flows

**Register Flow** (http://localhost:3000/register):
- [ ] Test invalid passwords (each requirement violation):
  - [ ] No uppercase → Client-side error shown
  - [ ] No lowercase → Client-side error shown
  - [ ] No number → Client-side error shown
  - [ ] No special char → Client-side error shown
  - [ ] < 12 chars → Client-side error shown
- [ ] Test valid password (e.g., "TestPass123!@#"):
  - [ ] Form submits successfully
  - [ ] Redirect to `/dashboard` occurs
  - [ ] User profile displays correctly
- [ ] Test password mismatch:
  - [ ] Error: "Passwords do not match"
- [ ] Test existing email:
  - [ ] Error: "Account with this email already exists"

**Login Flow** (http://localhost:3000/login):
- [ ] Test valid credentials → Redirect to `/dashboard`
- [ ] Test invalid email → Error shown
- [ ] Test incorrect password → Error shown
- [ ] Test account that doesn't exist → Error shown

**Logout Flow**:
- [ ] From dashboard, click logout → Redirect to `/login`
- [ ] Verify session cleared (cannot access `/dashboard` without reauth)

#### Google OAuth Flows

**Google Sign-In** (http://localhost:3000/login):
- [ ] Click "Sign in with Google"
- [ ] Complete OAuth consent
- [ ] Verify redirect to `/dashboard` (after Phase 6 fix)
- [ ] Verify user profile displays
- [ ] Logout and verify session cleared

**Google Sign-Up** (http://localhost:3000/register):
- [ ] Click "Sign up with Google"
- [ ] Complete OAuth consent (new Google account)
- [ ] Verify redirect to `/dashboard` (after Phase 6 fix)
- [ ] Verify user profile created

#### Protected Routes

- [ ] Access `/dashboard` without authentication
  - [ ] Redirect to `/login` with redirect parameter
- [ ] After login, verify original route restored
  - [ ] Navigate to `/dashboard` → redirected to `/login`
  - [ ] Login successfully → redirected back to `/dashboard`

#### Cross-Browser Testing

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (macOS/iOS)
- [ ] Edge

**Estimated Time**: 60-90 minutes

---

## Phase 8.2: Code Quality Improvements

**Priority**: 🟠 HIGH (before production deployment recommended)
**Estimated Time**: 4 hours

### 8.2.1: Extract Duplicate Code (1 hour)

**Impact**: Maintainability, DRY principle

**Duplications Found**:
1. Email normalization (2x in `convex/auth.ts`)
2. Slug generation (2x in `convex/auth.ts`)

**Implementation**:

Create helper file:
```typescript
// convex/helpers/auth.ts

/**
 * Normalize email address for consistent storage
 * Converts to lowercase and trims whitespace
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Generate URL-friendly slug from email address
 *
 * Examples:
 *   john.doe@example.com -> john-doe
 *   test_user@gmail.com -> test-user
 */
export function generateSlugFromEmail(email: string): string {
  const emailPrefix = email.split("@")[0];
  return (emailPrefix && emailPrefix.length > 0 ? emailPrefix : "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
}
```

Update `convex/auth.ts` to use helpers:
```typescript
import { normalizeEmail, generateSlugFromEmail } from "./helpers/auth";

// Password provider (line 67)
email: normalizeEmail(email),
slug: generateSlugFromEmail(email),

// Google provider (line 92)
email: normalizeEmail(profile.email!),
slug: generateSlugFromEmail(profile.email!),
```

Add unit tests:
```typescript
// convex/helpers/auth.test.ts
describe('normalizeEmail', () => {
  it('should lowercase email', () => {
    expect(normalizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    expect(normalizeEmail('  test@example.com  ')).toBe('test@example.com');
  });
});

describe('generateSlugFromEmail', () => {
  it('should extract username and slugify', () => {
    expect(generateSlugFromEmail('john.doe@example.com')).toBe('john-doe');
  });

  it('should handle special characters', () => {
    expect(generateSlugFromEmail('test_user@gmail.com')).toBe('test-user');
  });

  it('should default to "user" for empty prefix', () => {
    expect(generateSlugFromEmail('@example.com')).toBe('user');
  });
});
```

**Acceptance Criteria**:
- [ ] Helper file created with JSDoc
- [ ] Both providers use shared helpers
- [ ] Unit tests added for helpers (10 tests)
- [ ] All E2E tests pass
- [ ] No duplicate logic in auth.ts

---

### 8.2.2: Fix Error Handling (30 min)

**Impact**: User experience on errors

**Issue**: LoginForm doesn't reset loading state on success

**File**: `src/components/LoginForm.tsx` lines 27-37

**Fix**:
```typescript
// BEFORE
try {
  await signIn("password", formData);
  await new Promise(resolve => setTimeout(resolve, 100));
  router.push("/dashboard");
} catch (err) {
  setError(err instanceof Error ? err.message : "Sign in failed");
  setLoading(false);
}

// AFTER
try {
  await signIn("password", formData);
  await new Promise(resolve => setTimeout(resolve, 100));
  router.push("/dashboard");
} catch (err) {
  setError(err instanceof Error ? err.message : "Sign in failed");
} finally {
  setLoading(false); // Always reset loading state
}
```

**Acceptance Criteria**:
- [ ] finally block added to LoginForm
- [ ] finally block added to RegisterForm (consistency)
- [ ] Loading state resets on both success and error
- [ ] E2E tests verify loading state behavior

---

### 8.2.3: Add Input Validation (30 min)

**Impact**: Data integrity, error prevention

**Issue**: Weak HTML5 email validation allows invalid emails

**Implementation**:

Create validation helper:
```typescript
// src/lib/validation.ts

/**
 * Validate email address format
 * More strict than HTML5 validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize email for safe usage
 * Prevents homograph attacks (Unicode lookalikes)
 */
export function sanitizeEmail(email: string): string {
  return email
    .trim()
    .toLowerCase()
    .normalize('NFKC'); // Canonical normalization
}
```

Update RegisterForm:
```typescript
import { isValidEmail, sanitizeEmail } from '@/lib/validation';

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  // Validate email format
  if (!isValidEmail(email)) {
    setError("Please enter a valid email address");
    setLoading(false);
    return;
  }

  // Sanitize email
  const sanitizedEmail = sanitizeEmail(email);

  try {
    // Check for existing user with sanitized email
    const existingUser = await convex.query(api.users.getUserByEmail, {
      email: sanitizedEmail,
    });
    // ... rest of logic
  }
};
```

**Acceptance Criteria**:
- [ ] Validation helper created with tests
- [ ] RegisterForm validates email before submission
- [ ] LoginForm validates email before submission
- [ ] E2E tests verify validation errors shown
- [ ] Invalid emails rejected with clear error message

---

### 8.2.4: Narrow Middleware Matcher (30 min)

**Impact**: Performance, avoiding auth conflicts

**Issue**: Middleware runs on ALL routes including API routes

**Fix**:
```typescript
// src/middleware.ts

// BEFORE
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

// AFTER
export const config = {
  matcher: [
    // Auth pages (allow unrestricted access)
    "/",
    "/login",
    "/register",

    // Protected routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/create-quote/:path*",
  ],
};
```

**Acceptance Criteria**:
- [ ] Middleware only runs on listed routes
- [ ] Auth pages accessible (no loops)
- [ ] Protected routes still redirect unauthenticated users
- [ ] API routes bypass middleware
- [ ] E2E tests verify route protection

---

## Phase 8.3: Advanced Security Features

**Priority**: 🟠 HIGH (recommended before scaling)
**Estimated Time**: 8 hours

### 8.3.1: Email Verification (4 hours)

**Impact**: Security control against spam accounts, email ownership validation

**Current State**:
- Schema supports email verification (emailVerified, emailVerificationToken fields exist)
- All new accounts have `emailVerified: false`
- No verification flow implemented

**Implementation Steps**:

1. **Email Service Decision** (30 min research):
   - **Option A**: Convex Email (if/when available)
   - **Option B**: SendGrid (popular, free tier)
   - **Option C**: AWS SES (if using AWS)
   - **Option D**: Resend (developer-friendly)
   - **For MVP Testing**: Console.log with verification link

2. **Generate Verification Token** (1 hour):
```typescript
// convex/emailVerification.ts
import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Generate secure random token
 */
function generateSecureToken(): string {
  // Use crypto.randomBytes(32) for production
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Send verification email to user
 */
export const sendVerificationEmail = action({
  args: { userId: v.id("users"), email: v.string() },
  handler: async (ctx, { userId, email }) => {
    const token = generateSecureToken();
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Save token to database
    await ctx.runMutation(internal.users.setVerificationToken, {
      userId,
      token,
      expires,
    });

    // TODO: Send email via chosen service
    // For MVP testing:
    console.log(`Verification link: ${process.env.SITE_URL}/verify-email?token=${token}`);

    // For production, use email service:
    // await emailService.send({
    //   to: email,
    //   subject: "Verify your email",
    //   html: `Click here to verify: ${process.env.SITE_URL}/verify-email?token=${token}`,
    // });
  },
});
```

3. **Verification Endpoint** (1 hour):
```typescript
// convex/emailVerification.ts (continued)

/**
 * Verify email with token
 */
export const verifyEmail = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const user = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("emailVerificationToken"), token))
      .first();

    if (!user) {
      throw new Error("Invalid verification token");
    }

    if (user.emailVerificationExpires! < Date.now()) {
      throw new Error("Verification token expired");
    }

    // Mark email as verified
    await ctx.db.patch(user._id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    return { success: true };
  },
});
```

4. **UI Component** (1.5 hours):
```typescript
// src/app/verify-email/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const verifyEmail = useMutation(api.emailVerification.verifyEmail);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail({ token })
      .then(() => {
        setStatus("success");
        setMessage("Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Verification failed");
      });
  }, [searchParams, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

        {status === "loading" && (
          <p className="text-gray-600">Verifying your email...</p>
        )}

        {status === "success" && (
          <div className="text-green-600">
            <p className="font-semibold">{message}</p>
            <a href="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
              Go to Dashboard
            </a>
          </div>
        )}

        {status === "error" && (
          <div className="text-red-600">
            <p className="font-semibold">{message}</p>
            <a href="/register" className="mt-4 inline-block text-blue-600 hover:underline">
              Try Again
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
```

5. **Trigger on Registration** (30 min):
```typescript
// convex/auth.ts - After user creation
// In password provider and Google provider callbacks:

if (newUser) {
  // Trigger verification email
  await ctx.scheduler.runAfter(0, internal.emailVerification.sendVerificationEmail, {
    userId: newUser._id,
    email: newUser.email,
  });
}
```

**Acceptance Criteria**:
- [ ] Verification email sent on signup
- [ ] Token stored securely (consider hashing)
- [ ] Verification endpoint validates token
- [ ] Expired tokens rejected (24-hour window)
- [ ] Email verified status stored in database
- [ ] E2E tests verify flow
- [ ] UI shows verification status
- [ ] Resend verification option available

---

### 8.3.2: Password Reset (2 hours)

**Impact**: User experience, account recovery

**Implementation** (similar pattern to email verification):

1. **Password Reset Request**:
```typescript
// convex/passwordReset.ts
export const requestPasswordReset = action({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.runQuery(internal.users.getUserByEmail, { email });

    // Don't reveal if email exists (prevent enumeration)
    if (!user) {
      return { success: true };
    }

    const token = generateSecureToken();
    const expires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

    await ctx.runMutation(internal.users.setPasswordResetToken, {
      userId: user._id,
      token,
      expires,
    });

    // Send reset email
    console.log(`Reset link: ${process.env.SITE_URL}/reset-password?token=${token}`);
  },
});
```

2. **Password Reset Form**:
```typescript
// src/app/reset-password/page.tsx
// Form with token validation and new password input
```

3. **Update Password Mutation**:
```typescript
// Use Convex Auth's built-in password update after verifying reset token
```

**Acceptance Criteria**:
- [ ] Reset request doesn't reveal email existence
- [ ] Token expires after 1 hour
- [ ] Old token invalidated when new one generated
- [ ] Password updated successfully
- [ ] E2E tests verify flow
- [ ] Clear UX for expired tokens
- [ ] Rate limiting on reset requests

---

### 8.3.3: Rate Limiting (2 hours)

**Impact**: Brute force protection, API abuse prevention

**Implementation**:
```typescript
// convex/rateLimiting.ts
// Implement rate limiting for:
// - Login attempts (5 per 15 minutes per IP/email)
// - Password reset requests (3 per hour per email)
// - Registration (10 per hour per IP)
```

---

## Phase 8.4: Component Unit Tests

**Priority**: 🟡 MEDIUM (fast feedback loop)
**Estimated Time**: 12 hours

**Current Status**:
- 0 component unit tests
- 407 lines of component code untested at unit level
- E2E tests provide comprehensive coverage but slower feedback

**Target**: Add 30-40 component unit tests

### Setup (1 hour)
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Configure Vitest for React components.

### Test Files to Create

**LoginForm.test.tsx** (10-12 tests, 3 hours):
- Renders form correctly
- Validates email input
- Handles password visibility toggle
- Displays error messages
- Disables form during loading
- Calls signIn on submit
- Redirects on success
- Google OAuth button works
- Form reset after error
- ...

**RegisterForm.test.tsx** (15-18 tests, 5 hours):
- Renders form correctly
- Password strength calculation logic
- Password requirements validation
- Password confirmation matching
- Duplicate email detection
- Loading state behavior
- Error message display
- Google OAuth integration
- Form validation before submit
- ...

**UserProfile.test.tsx** (8-10 tests, 3 hours):
- Loading state rendering
- Authenticated state display
- Unauthenticated state display
- Sign out button functionality
- Email verification badge
- Admin badge display
- Profile image handling
- Date formatting
- ...

**Acceptance Criteria**:
- [ ] 30+ component unit tests added
- [ ] All tests pass: `npm test`
- [ ] Coverage >70% for components
- [ ] Tests run in <2 seconds
- [ ] Mock Convex queries properly
- [ ] No flaky tests

---

## Phase 8.5: Performance Optimizations

**Priority**: 🟢 LOW (current performance acceptable)
**Estimated Time**: 2 hours

### 8.5.1: Password Validation Debouncing (30 min)

**Impact**: 5x reduction in re-renders

**Issue**: Password validation runs on every keystroke (15+ re-renders)

**Implementation**:
```typescript
import { useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';

// Inside component
const debouncedValidation = useMemo(
  () => debounce((pwd: string) => {
    const result = validatePasswordRequirements(pwd);
    setPasswordValidation(result);
  }, 300), // 300ms delay
  []
);

const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const newPassword = e.target.value;
  setPassword(newPassword);
  debouncedValidation(newPassword);
}, [debouncedValidation]);
```

**Acceptance Criteria**:
- [ ] Validation debounced by 300ms
- [ ] Re-renders reduced by ~80%
- [ ] User experience unchanged
- [ ] E2E tests still pass

---

### 8.5.2: Server-Side Duplicate Email Check (30 min)

**Impact**: 50-150ms faster registration

**Issue**: Client-side duplicate check adds extra round-trip

**Current**: RegisterForm calls `getUserByEmail` before `signIn`
**Better**: Backend validates duplicates during registration

**Implementation**:
```typescript
// convex/auth.ts - in Password provider authorize callback
const existingUser = await ctx.db
  .query("users")
  .withIndex("email", q => q.eq("email", email))
  .first();

if (existingUser) {
  throw new Error("An account with this email already exists");
}

// Remove duplicate check from RegisterForm
```

**Acceptance Criteria**:
- [ ] Backend validates duplicates atomically
- [ ] Client-side check removed
- [ ] Error message still user-friendly
- [ ] E2E tests verify error displayed

---

## Phase 8.6: Documentation

**Priority**: 🟢 LOW (core docs complete)
**Estimated Time**: 3 hours

### Tasks

1. **Add JSDoc to all exported functions** (1.5 hours):
   - `convex/users.ts` - Document queries
   - `src/components/*.tsx` - Component documentation
   - `src/lib/*.ts` - Helper functions

2. **Update architecture documentation** (1 hour):
   - Document auth implementation in `architecture-overview.md`
   - Add security measures to `security-guidelines.md`
   - Update `CLAUDE.md` with auth context

3. **Create deployment guide** (30 min):
   - Document environment variable setup
   - Secret rotation procedures
   - Production checklist

**Acceptance Criteria**:
- [ ] All exported functions have JSDoc
- [ ] Architecture docs updated
- [ ] Deployment guide created
- [ ] Security procedures documented

---

## Prioritization Recommendation

For post-MVP work, prioritize in this order:

1. **🔴 HIGH - Phase 8.2**: Code quality improvements (4 hours)
   - Extract duplicates, fix error handling, add input validation
   - Improves maintainability for future development

2. **🟠 MEDIUM - Phase 8.3**: Advanced security features (8 hours)
   - Email verification and password reset
   - Wait for user feedback to prioritize these
   - Requires email service decision

3. **🟡 MEDIUM - Phase 6**: OAuth redirect fix (30-45 min)
   - Quick UX improvement
   - Do when time allows

4. **🟢 LOW - Phase 8.4**: Component unit tests (12 hours)
   - Do if fast feedback loop becomes important
   - Current E2E coverage is solid

5. **🟢 LOW - Phase 8.5**: Performance optimizations (2 hours)
   - Do if performance becomes a concern
   - Current performance acceptable

6. **🟢 LOW - Phase 8.6**: Documentation (3 hours)
   - Incremental addition as needed
   - Core docs already complete

7. **🟢 LOW - Phase 7**: Manual testing (60-90 min)
   - Only if cross-browser issues suspected
   - Automated tests cover functionality

---

## Notes

- **Backup**: Original detailed PLAN.md saved as `PLAN.md.backup` (1853 lines)
- **MVP Focus**: All deferred items are valuable but not MVP-blocking
- **User Feedback**: Prioritize based on actual user needs and pain points
- **Email Service**: Decision needed before implementing Phase 8.3 features
- **Testing**: Consider adding component unit tests if development speed requires faster feedback than E2E tests provide

---

**Last Updated**: 2025-11-06
**Related**: PLAN.md (condensed), WORKLOG.md (implementation history)
