---
id: TASK-004
title: Implement Convex Auth with email and Google OAuth
epic: EPIC-001
status: complete
created: 2025-10-30
updated: 2025-11-03
completed: 2025-11-03
---

# TASK-004: Implement Convex Auth with email and Google OAuth

**Epic**: EPIC-001 - MVP Infrastructure Setup
**Status**: complete ✅

## Description

Set up Convex Auth to handle user authentication with email/password and Google OAuth. Implement user session management, protected routes, and authorization patterns for securing backend functions.

## Acceptance Criteria

- [x] Convex Auth configured and initialized ✅ (Phase 1)
- [x] Email/password authentication working ✅ (Phase 2 - signUp/signIn/signOut auto-generated)
- [x] Google OAuth integration configured and functional ✅ (Phase 3 backend + Phase 4 frontend - tested and working)
- [x] User registration flow implemented ✅ (Phase 2 backend + Phase 4 RegisterForm with password strength)
- [x] Login/logout functionality working ✅ (Phase 2 backend + Phase 4 LoginForm + sign out button)
- [ ] Password reset flow configured ⏭️ DEFERRED (post-MVP - see PLAN.md)
- [x] Protected routes implemented in Next.js ✅ (Phase 4 - middleware with open redirect protection)
- [x] Backend functions secured with authentication checks ✅ (Phase 2 - getCurrentUser, email verification)
- [x] User profile data stored and accessible ✅ (Phase 1 schema, Phase 2 getCurrentUser query, Phase 3 OAuth profile, Phase 4 UserProfile display)
- [x] Session persistence across page refreshes ✅ (Phase 1 config, Phase 2 tested, Phase 4 verified with httpOnly cookies)
- [x] Auth UI components created (login, register, profile) ✅ (Phase 4 - LoginForm, RegisterForm, UserProfile, GoogleIcon)

## Technical Notes

- Install `@convex-dev/auth` package
- Configure auth in convex/auth.config.ts
- Set up providers:
  - Password provider with email verification
  - Google OAuth provider
- Implement auth functions in convex/auth.ts:
  - signUp mutation
  - signIn mutation
  - signOut mutation
  - resetPassword action
- Create middleware for protected routes
- Use ctx.auth.getUserIdentity() in Convex functions for authorization
- Store user profile in users table with auth integration
- Implement React context for auth state management
- Create reusable auth components:
  - LoginForm
  - RegisterForm
  - AuthGuard wrapper
  - UserProfile component

## Dependencies

- TASK-002: Convex backend must be initialized
- Google Cloud Console project for OAuth credentials
- Email service configuration (for password resets)
- Environment variables:
  - AUTH_SECRET
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - EMAIL_SERVER (SMTP configuration)

## Testing

- Register new user with email/password
- Login with registered credentials
- Logout and verify session cleared
- Login with Google OAuth
- Test password reset email flow
- Verify protected routes redirect to login
- Confirm backend functions reject unauthorized requests
- Test session persistence after page reload
