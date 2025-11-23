# Convex Auth Setup Guide

This guide explains how to configure Convex Auth for the So Quotable application.

## Phase 1: Foundation (Complete)

### Environment Variables

The following environment variables must be set in the **Convex Dashboard** (not just in .env.local) because they are used by Convex actions:

1. Go to https://dashboard.convex.dev
2. Select your project (so-quotable)
3. Navigate to Settings → Environment Variables
4. Add the following variables:

```
# Generate a secure random secret for JWT signing
AUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Cloudinary configuration (get from Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

**Generate AUTH_SECRET**:
```bash
openssl rand -base64 32
```

**Important**: Never commit production secrets to the repository. Each developer and environment should have unique secrets.

### Schema Changes

The following auth-related tables are now in the schema:

- `users`: Extended from Convex Auth with additional fields (slug, role, createdAt, updatedAt)
- `authSessions`: Session management
- `authAccounts`: Provider accounts (password, OAuth)
- `authRefreshTokens`: Refresh token management
- `authRateLimits`: Rate limiting for auth attempts
- `authVerificationCodes`: Email verification and password reset codes
- `authVerifiers`: PKCE verifiers for OAuth

### Auth Configuration

Located in `convex/auth.ts`:

**Providers**:
- Password: Email/password authentication with validation
  - Minimum 12 characters (NIST recommendation)
  - Must contain at least one uppercase letter
  - Must contain at least one lowercase letter
  - Must contain at least one number
  - Must contain at least one special character

**Security Settings**:
- Session Duration: 24 hours (configurable to 7 days with "remember me")
- JWT Token: 1 hour validity
- Rate Limiting: 5 failed attempts per hour (12-minute lockout between attempts)
- Cookies: httpOnly, secure, sameSite=strict (handled by Convex Auth)

**User Profile**:
- Email is normalized (lowercase, trimmed)
- Slug is auto-generated from email
- Default role is "user"
- Timestamps (createdAt, updatedAt) are automatically set

### Testing

All auth-related functionality is tested:

- Schema validation tests: `convex/users.test.ts` (8 tests)
- Auth table tests: `convex/auth.test.ts` (8 tests)
- Overall coverage: 92% (162 tests passing)

## Phase 3: OAuth (Future)

The Google OAuth provider is already configured in `convex/auth.ts` but commented out. To activate:

1. Create OAuth credentials at https://console.cloud.google.com/apis/credentials
2. Add environment variables to Convex Dashboard:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
3. Uncomment the Google provider in `convex/auth.ts`
4. Redeploy Convex functions: `npx convex dev`

## Troubleshooting

### AUTH_SECRET not found
- Make sure AUTH_SECRET is set in both `.env.local` AND the Convex dashboard
- Actions require environment variables to be set in the dashboard

### Schema validation errors
- Run `npx convex dev --once --typecheck=disable` to regenerate types
- Check that all auth tables are properly defined in schema.ts

### Rate limiting too aggressive
- Adjust `maxFailedAttempsPerHour` in `convex/auth.ts`
- Current setting: 5 attempts/hour = 12 minutes between attempts after lockout

## References

- Convex Auth Documentation: https://labs.convex.dev/auth
- Auth.js Providers: https://authjs.dev/reference/core/providers
- Convex Dashboard: https://dashboard.convex.dev
