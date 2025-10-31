---
id: TASK-004
title: Implement Convex Auth with email and Google OAuth
epic: EPIC-001
status: todo
created: 2025-10-30
updated: 2025-10-30
---

# TASK-004: Implement Convex Auth with email and Google OAuth

**Epic**: EPIC-001 - MVP Infrastructure Setup
**Status**: todo

## Description

Set up Convex Auth to handle user authentication with email/password and Google OAuth. Implement user session management, protected routes, and authorization patterns for securing backend functions.

## Acceptance Criteria

- [ ] Convex Auth configured and initialized
- [ ] Email/password authentication working
- [ ] Google OAuth integration configured and functional
- [ ] User registration flow implemented
- [ ] Login/logout functionality working
- [ ] Password reset flow configured (email-based)
- [ ] Protected routes implemented in Next.js
- [ ] Backend functions secured with authentication checks
- [ ] User profile data stored and accessible
- [ ] Session persistence across page refreshes
- [ ] Auth UI components created (login, register, profile)

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
