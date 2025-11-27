# Authentication Setup Guide

Complete guide for deploying So Quotable's authentication system to production. This covers environment configuration, OAuth setup, and deployment verification.

## Overview

So Quotable uses **Convex Auth** for authentication with two providers:
- **Email/Password**: NIST-compliant password requirements
- **Google OAuth**: Single sign-on with Google accounts

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Google OAuth Setup](#google-oauth-setup)
4. [Convex Backend Deployment](#convex-backend-deployment)
5. [Next.js Frontend Deployment](#nextjs-frontend-deployment)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)
8. [Security Best Practices](#security-best-practices)

---

## Prerequisites

Before deploying authentication, ensure you have:

- [x] Convex account ([sign up free](https://www.convex.dev/))
- [x] Google Cloud Console account ([create project](https://console.cloud.google.com/))
- [x] Vercel account for frontend deployment ([sign up](https://vercel.com/))
- [x] Access to your production domain (or use Vercel preview URL)

## Environment Variables

### Required Environment Variables

Authentication requires several environment variables across different environments.

### 1. Local Development (`.env.local`)

```bash
# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-dev-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-project

# Authentication
AUTH_SECRET=your-generated-secret  # See generation below
SITE_URL=http://localhost:3000

# Google OAuth (optional for local dev)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-google-client-secret

# Cloudinary (for profile images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### 2. Convex Dashboard (Environment Variables for Actions)

In your Convex Dashboard → Settings → Environment Variables:

```bash
# Authentication (REQUIRED)
AUTH_SECRET=your-generated-secret
SITE_URL=https://your-domain.com  # Production URL

# Google OAuth (REQUIRED for Google sign-in)
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-your-google-client-secret

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Verification (future)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Vercel Deployment (Environment Variables)

In Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### Generating `AUTH_SECRET`

The `AUTH_SECRET` is a random secret used to sign JWTs and secure sessions.

**Generate a secure secret:**

```bash
openssl rand -base64 32
```

**Output example:**
```
Xq3r7vW9zA2bC5dE8fG1hJ4kL6mN9pQ0rT3uV5wX8yZ1
```

**Important**:
- Use a different secret for development and production
- Never commit secrets to version control
- Rotate secrets periodically (every 90 days recommended)
- Store production secrets in Convex Dashboard and Vercel, not `.env.local`

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name: `so-quotable` (or your preference)
4. Click **Create**

### Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type (unless you have Google Workspace)
3. Click **Create**

**Fill in required fields:**
- **App name**: So Quotable
- **User support email**: your-email@example.com
- **Developer contact information**: your-email@example.com

**Scopes** (click "Add or Remove Scopes"):
- `openid`
- `profile`
- `email`

4. Click **Save and Continue**
5. Add test users (for testing mode):
   - Add your email address
   - Add any other test accounts

6. Click **Save and Continue** → **Back to Dashboard**

### Step 3: Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Application type**: Web application
4. **Name**: So Quotable Production (or Development)

**Authorized JavaScript origins:**
```
http://localhost:3000          # Development
https://your-domain.com         # Production
https://preview.vercel.app      # Vercel previews (optional)
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google           # Development
https://your-domain.com/api/auth/callback/google         # Production
https://preview-xyz.vercel.app/api/auth/callback/google  # Vercel previews
```

5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

### Step 4: Configure Environment Variables

**For Development** (`.env.local`):
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
```

**For Production** (Convex Dashboard):
```bash
AUTH_GOOGLE_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
```

### Step 5: Publish OAuth App (Production)

For production use, publish your OAuth app:

1. In **OAuth consent screen**, click **Publish App**
2. Click **Confirm** (Google review required for verified status)
3. While in "Testing" mode, only test users can sign in
4. After publishing, all users with Google accounts can sign in

**Note**: Unverified apps show a warning screen. To remove this:
1. Submit for Google verification (requires privacy policy, terms of service)
2. See [Google verification guidelines](https://support.google.com/cloud/answer/9110914)

---

## Convex Backend Deployment

### Step 1: Deploy to Production

Deploy your Convex backend to production:

```bash
# Deploy backend to Convex Cloud
npx convex deploy --prod
```

**Output:**
```
✔ Deployed!

  Production deployment URL:
  https://your-prod-deployment.convex.cloud
```

### Step 2: Configure Production Environment Variables

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add/update the following variables:

```bash
AUTH_SECRET=<your-production-secret>
SITE_URL=https://your-domain.com
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

5. Click **Save** for each variable

### Step 3: Verify Deployment

```bash
# Check deployment status
npx convex deploy --prod --dry-run

# View production logs
npx convex logs --prod
```

---

## Next.js Frontend Deployment

### Step 1: Configure Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or import from GitHub)
3. Navigate to **Settings** → **Environment Variables**

Add the following variables for **Production**:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

### Step 2: Deploy to Production

**Option A: Automatic Deployment (Recommended)**

1. Push to `main` branch:
   ```bash
   git push origin main
   ```

2. Vercel will automatically:
   - Detect the push
   - Build the Next.js app
   - Deploy to production
   - Assign your custom domain (if configured)

**Option B: Manual Deployment**

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

### Step 3: Configure Custom Domain (Optional)

1. In Vercel Dashboard, navigate to **Settings** → **Domains**
2. Add your custom domain: `your-domain.com`
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (usually 5-10 minutes)

### Step 4: Update OAuth Redirect URIs

After deploying, update Google OAuth redirect URIs:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add production redirect URI:
   ```
   https://your-domain.com/api/auth/callback/google
   ```
5. Click **Save**

---

## Verification & Testing

### 1. Test Email/Password Authentication

**Registration Flow:**
1. Visit `https://your-domain.com/register`
2. Enter test email and password (12+ chars, mixed case, numbers, symbols)
3. Verify password strength indicator shows "Strong"
4. Click "Sign Up"
5. Should redirect to `/dashboard`
6. Check Convex logs for successful user creation

**Login Flow:**
1. Visit `https://your-domain.com/login`
2. Enter registered email and password
3. Click "Sign In"
4. Should redirect to `/dashboard`
5. Verify user profile displays correctly

**Test Rate Limiting:**
1. Attempt 5 failed logins in a row
2. Should see: "Too many sign-in attempts. Please try again in a few minutes."
3. Wait 12 minutes, then retry (should succeed)

### 2. Test Google OAuth

1. Visit `https://your-domain.com/login`
2. Click "Sign in with Google"
3. Select Google account (or sign in)
4. Grant permissions (first time only)
5. Should redirect back to `/dashboard`
6. Verify profile shows Google avatar and name

**Troubleshooting OAuth:**
- If you see "Error 400: redirect_uri_mismatch", verify redirect URIs match exactly
- If you see "This app isn't verified", add yourself as a test user or publish the app
- Check browser console for CSP errors (should be resolved in 004)

### 3. Test Protected Routes

1. **While logged out**, try to access `/dashboard`
2. Should redirect to `/login`
3. Login, then access `/dashboard`
4. Should display user profile

### 4. Test Session Persistence

1. Login with "Remember me" (if implemented)
2. Close browser completely
3. Reopen browser and visit site
4. Should still be logged in (7-day session)

### 5. Verify Security Headers

```bash
# Check security headers
curl -I https://your-domain.com/dashboard
```

**Expected headers:**
- `Content-Security-Policy`: Should include Convex and Cloudinary domains
- `X-Frame-Options`: DENY or SAMEORIGIN
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: strict-origin-when-cross-origin

---

## Troubleshooting

### Common Issues

#### 1. "Invalid credentials" after deployment

**Cause**: `AUTH_SECRET` mismatch between environments

**Solution**:
1. Verify `AUTH_SECRET` is set in Convex Dashboard (not `.env.local`)
2. Ensure it matches the secret used during development
3. Redeploy Convex backend: `npx convex deploy --prod`

#### 2. OAuth redirect URI mismatch

**Error**: `Error 400: redirect_uri_mismatch`

**Solution**:
1. Verify redirect URI in Google Cloud Console matches exactly:
   ```
   https://your-domain.com/api/auth/callback/google
   ```
2. No trailing slashes
3. Must use HTTPS in production (HTTP only for localhost)
4. Update and save in Google Cloud Console

#### 3. "Session not found" or "Not authenticated"

**Cause**: Cookies not being set or SITE_URL mismatch

**Solution**:
1. Check `SITE_URL` in Convex Dashboard matches your actual domain
2. Ensure cookies are enabled in browser
3. Verify no cookie blocking extensions (Privacy Badger, etc.)
4. Check browser console for cookie errors

#### 4. Rate limiting too aggressive

**Cause**: Default rate limit (5 attempts/hour) triggered

**Solution**:
1. Wait 12 minutes between failed attempts
2. To adjust: Edit `convex/auth.ts` → `maxFailedAttempsPerHour`
3. Redeploy: `npx convex deploy --prod`

**Recommended limits**:
- Development: 10 attempts/hour (default)
- Production: 5 attempts/hour (current)

#### 5. Email verification not working

**Cause**: MVP email verification logs to console only

**Solution**:
1. For MVP: Check Convex function logs for verification link
2. For production: Implement email service (Resend, SendGrid, AWS SES)
3. See `convex/emailVerification.ts` for integration points

#### 6. CSP blocking Convex or OAuth

**Error**: "Refused to connect to... because it violates the following Content Security Policy directive"

**Solution**:
1. Verify `middleware.ts` includes CSP headers
2. Ensure Convex URL in `connect-src` directive
3. Ensure Google OAuth URLs in `frame-src` directive
4. Check `next.config.ts` for CSP configuration

---

## Security Best Practices

### 1. Secret Management

**DO**:
- Use different secrets for dev, staging, and production
- Rotate `AUTH_SECRET` every 90 days
- Store secrets in Convex Dashboard and Vercel (never in code)
- Use strong, random secrets (32+ characters)

**DON'T**:
- Commit `.env.local` to version control
- Share secrets via email or Slack
- Reuse secrets across projects
- Use weak or predictable secrets

### 2. OAuth Configuration

**DO**:
- Use specific redirect URIs (no wildcards)
- Implement PKCE flow (handled by Convex Auth)
- Verify OAuth state parameter (handled by Convex Auth)
- Regularly review OAuth scopes (use minimum required)

**DON'T**:
- Use `*` in redirect URIs
- Allow HTTP in production (HTTPS only)
- Request unnecessary OAuth scopes
- Hardcode OAuth secrets in frontend code

### 3. Password Security

**DO**:
- Enforce NIST-compliant password requirements
- Use bcrypt/scrypt for password hashing (handled by Convex Auth)
- Implement rate limiting (5 attempts/hour)
- Show password strength indicator

**DON'T**:
- Store passwords in plaintext
- Send passwords in URLs or query parameters
- Log passwords (even hashed)
- Allow common passwords (implement blocklist in future)

### 4. Session Management

**DO**:
- Use httpOnly, secure, sameSite cookies (handled by Convex Auth)
- Implement session timeout (24 hours default)
- Provide "Remember me" option (7 days)
- Invalidate sessions on password change

**DON'T**:
- Store session tokens in localStorage (XSS risk)
- Use indefinite sessions
- Allow concurrent sessions without limit (future: implement session management)

### 5. Monitoring & Logging

**DO**:
- Monitor failed login attempts
- Log authentication events (login, logout, password change)
- Set up alerts for unusual activity (future: implement with Sentry)
- Review logs regularly

**DON'T**:
- Log sensitive data (passwords, tokens)
- Ignore failed login patterns
- Store logs indefinitely without rotation

---

## Future Enhancements

The following features are deferred to post-MVP:

### Email Verification

**Current**: Console logging only (MVP)

**Production Requirements**:
1. Integrate email service (Resend recommended)
2. Create email templates (verify, password reset)
3. Implement email delivery in `convex/emailVerification.ts`
4. Add retry logic for failed emails
5. Monitor email delivery rates

**Recommended Provider**: [Resend](https://resend.com/)
- Modern API
- React email templates
- Generous free tier (3,000 emails/month)
- Easy integration

**Integration Example**:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@quotable.app',
  to: user.email,
  subject: 'Verify your email address',
  html: `<a href="${verificationLink}">Verify Email</a>`
});
```

### Password Reset

**Not Implemented**: Password reset flow

**Future Requirements**:
1. "Forgot password" link on login page
2. Generate password reset tokens (similar to email verification)
3. Email password reset link
4. Secure token validation
5. Password update mutation

### Multi-Factor Authentication (MFA)

**Not Implemented**: Two-factor authentication

**Future Requirements**:
1. TOTP (Time-based One-Time Password) support
2. Backup codes
3. SMS authentication (optional)
4. Recovery options

### Social Login Providers

**Currently Supported**: Google only

**Future Providers**:
- GitHub (popular with developers)
- Facebook
- Apple Sign-In
- Microsoft/Azure AD

---

## Support & Resources

### Documentation

- [Convex Auth Documentation](https://labs.convex.dev/auth)
- [Convex Auth GitHub](https://github.com/get-convex/convex-auth)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

### Monitoring

**Convex Dashboard**:
- View function logs: [Dashboard → Logs](https://dashboard.convex.dev/)
- Monitor usage: [Dashboard → Usage](https://dashboard.convex.dev/)

**Vercel Dashboard**:
- View deployment logs: [Vercel → Deployments](https://vercel.com/dashboard)
- Monitor analytics: [Vercel → Analytics](https://vercel.com/dashboard)

### Getting Help

1. Check [Convex Discord](https://discord.gg/convex) for community support
2. Search [Convex GitHub Discussions](https://github.com/get-convex/convex-backend/discussions)
3. Review project WORKLOG in `pm/issues/004-convex-auth/WORKLOG.md`
4. Check [Google OAuth troubleshooting](https://developers.google.com/identity/protocols/oauth2/troubleshooting)

---

## Deployment Checklist

Before deploying authentication to production, verify:

- [ ] `AUTH_SECRET` generated and configured in Convex Dashboard
- [ ] `SITE_URL` set to production domain in Convex Dashboard
- [ ] Google OAuth credentials created and configured
- [ ] OAuth redirect URIs include production domain
- [ ] Environment variables set in Vercel
- [ ] Convex backend deployed: `npx convex deploy --prod`
- [ ] Frontend deployed to Vercel (automatic or manual)
- [ ] Email/password registration tested
- [ ] Email/password login tested
- [ ] Google OAuth tested
- [ ] Protected routes verified (redirect to login when unauthenticated)
- [ ] Rate limiting tested (5 failed attempts)
- [ ] Session persistence verified
- [ ] Security headers checked
- [ ] Monitoring and logging configured

