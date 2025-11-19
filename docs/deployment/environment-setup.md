# Environment Variables Setup Guide

This guide provides step-by-step instructions for configuring all required environment variables in Vercel for production deployment of So Quotable.

**Document Status**: Phase 2.1 Complete
**Last Updated**: 2025-11-19
**Related**: TASK-006 Phase 2.1 - Production Environment Variables

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Required Environment Variables](#required-environment-variables)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)
6. [Security Best Practices](#security-best-practices)

---

## Prerequisites

Before configuring Vercel environment variables, ensure you have:

1. **Vercel Account Access**: Admin access to the So Quotable Vercel project
   - Project: https://vercel.com/taylor-hustons-projects/so-quoteable
   - Project ID: `prj_ih8kLlVZHGlBfbIqQMdmHyYrPJ6n`

2. **Production Convex Deployment**: Production Convex backend must be deployed
   - **REQUIRED FIRST STEP**: Run `npx convex deploy` from project root
   - This creates the production deployment and generates the production URL
   - Development deployment: `https://cheery-cow-298.convex.cloud` (DO NOT use for production)

3. **Service Credentials**: Access to all third-party service dashboards
   - Cloudinary dashboard: https://cloudinary.com/console
   - Google Cloud Console: https://console.cloud.google.com/apis/credentials
   - Resend dashboard: https://resend.com/api-keys

---

## Required Environment Variables

### Summary Table

| Variable | Source | Required For | Scope |
|----------|--------|--------------|-------|
| NEXT_PUBLIC_CONVEX_URL | Convex deploy | Backend connection | Production |
| CLOUDINARY_API_KEY | Cloudinary dashboard | Image uploads | Production |
| CLOUDINARY_API_SECRET | Cloudinary dashboard | Image uploads | Production |
| NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | Cloudinary dashboard | Image delivery | Production |
| AUTH_SECRET | Generate new | Session security | Production |
| GOOGLE_CLIENT_ID | Google Cloud Console | OAuth login | Production |
| GOOGLE_CLIENT_SECRET | Google Cloud Console | OAuth login | Production |
| RESEND_API_KEY | Resend dashboard | Email verification | Production |

### Variable Details

#### 1. NEXT_PUBLIC_CONVEX_URL
- **Description**: Production Convex backend URL
- **Format**: `https://[deployment-name].convex.cloud`
- **How to Obtain**:
  1. Run `npx convex deploy` from project root
  2. Copy the production deployment URL from output
  3. Should be DIFFERENT from dev URL (`https://cheery-cow-298.convex.cloud`)
- **Example**: `https://proud-swan-123.convex.cloud`
- **Security**: Public (client-side), but should be production-specific
- **Environment**: Production only

#### 2. CLOUDINARY_API_KEY
- **Description**: Cloudinary API key for image uploads
- **Format**: Numeric string (15 digits)
- **How to Obtain**:
  1. Log in to Cloudinary: https://cloudinary.com/console
  2. Navigate to Dashboard
  3. Copy "API Key" value
- **Example**: `583535855152941`
- **Security**: Semi-sensitive (server-side only)
- **Environment**: Production (can reuse same credentials as dev)

#### 3. CLOUDINARY_API_SECRET
- **Description**: Cloudinary API secret for signed uploads
- **Format**: Alphanumeric string with hyphens
- **How to Obtain**:
  1. Log in to Cloudinary: https://cloudinary.com/console
  2. Navigate to Dashboard
  3. Copy "API Secret" value (click "Show" if hidden)
- **Example**: `YkBCE9-upUIkWzFvcNg0ZBNs7wg`
- **Security**: SENSITIVE - Never commit to Git
- **Environment**: Production (can reuse same credentials as dev)

#### 4. NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- **Description**: Cloudinary cloud name for CDN URLs
- **Format**: Lowercase alphanumeric
- **How to Obtain**:
  1. Log in to Cloudinary: https://cloudinary.com/console
  2. Navigate to Dashboard
  3. Copy "Cloud Name" value
- **Example**: `dggww7kzb`
- **Security**: Public (used in client-side URLs)
- **Environment**: Production (same as dev)

#### 5. AUTH_SECRET
- **Description**: Secret key for Convex Auth session encryption
- **Format**: Base64-encoded random string (32+ characters)
- **How to Obtain**:
  ```bash
  # Generate a new random secret (DO NOT reuse dev secret)
  openssl rand -base64 32
  ```
- **Example**: `4d6Cwvti+8fCQJRpAD6y6fo00/4Qq3rv4p7zDKBcSoo=`
- **Security**: CRITICAL - Must be different from dev, never expose
- **Environment**: Production only (generate new for prod)

#### 6. GOOGLE_CLIENT_ID
- **Description**: Google OAuth 2.0 client ID
- **Format**: `[numeric-id].apps.googleusercontent.com`
- **How to Obtain**:
  1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials
  2. Select your project or create new
  3. Navigate to "Credentials" → "OAuth 2.0 Client IDs"
  4. Create or select existing Web application client
  5. Add authorized redirect URI: `https://so-quoteable.vercel.app/api/auth/callback/google`
  6. Copy "Client ID"
- **Example**: `313875351705-lsha0uapketm732428abrmo0kfq5i6o4.apps.googleusercontent.com`
- **Security**: Public (client-side)
- **Environment**: Production (can reuse same as dev if redirect URI configured)

#### 7. GOOGLE_CLIENT_SECRET
- **Description**: Google OAuth 2.0 client secret
- **Format**: `GOCSPX-[alphanumeric-string]`
- **How to Obtain**:
  1. In Google Cloud Console: https://console.cloud.google.com/apis/credentials
  2. Select your OAuth 2.0 Client ID
  3. Copy "Client Secret" (click "Show" if hidden)
- **Example**: `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`
- **Security**: SENSITIVE - Never commit to Git
- **Environment**: Production (can reuse same as dev)

#### 8. RESEND_API_KEY
- **Description**: Resend API key for transactional emails
- **Format**: `re_[alphanumeric-string]`
- **How to Obtain**:
  1. Log in to Resend: https://resend.com/api-keys
  2. Create new API key or use existing
  3. Copy API key value
- **Example**: `re_LXAiy6Wi_CawR4i9GqiWiZw5e6rn4vCHZ`
- **Security**: SENSITIVE - Never commit to Git
- **Environment**: Production (can reuse same as dev)

---

## Step-by-Step Setup

### Step 1: Deploy Production Convex Backend

**CRITICAL: This must be done FIRST before setting Vercel variables**

1. Open terminal in project root (`/home/taylor/src/quotable`)
2. Ensure you're authenticated with Convex:
   ```bash
   npx convex dev --once
   ```
3. Deploy to production:
   ```bash
   npx convex deploy
   ```
4. Confirm deployment when prompted (type `y`)
5. Copy the production URL from output (e.g., `https://proud-swan-123.convex.cloud`)
6. **Save this URL** - you'll need it for NEXT_PUBLIC_CONVEX_URL

**Expected Output:**
```
✔ Deployed functions to production deployment proud-swan-123
  View your functions: https://dashboard.convex.dev/...
  Deployment URL: https://proud-swan-123.convex.cloud
```

### Step 2: Generate New Production AUTH_SECRET

**IMPORTANT: Do NOT reuse development AUTH_SECRET**

1. Generate a new secret:
   ```bash
   openssl rand -base64 32
   ```
2. Copy the output (e.g., `xK9pL3mN8qR2tV5wY7zB4cD6fG8hJ1kM3nP5qS7tU9vW=`)
3. **Save this value** - you'll need it for AUTH_SECRET variable

### Step 3: Access Vercel Environment Variables Settings

1. Navigate to Vercel project: https://vercel.com/taylor-hustons-projects/so-quoteable
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in left sidebar
4. You should see the environment variables configuration page

### Step 4: Add Each Environment Variable

For each variable in the table below, follow these steps:

1. Click **"Add"** button
2. Enter **Variable Name** exactly as shown (case-sensitive)
3. Enter **Value** from the source specified
4. Select **Environment**: Check ONLY "Production" (uncheck Preview and Development)
5. Click **"Save"**

**Variables to Add (in this order):**

| Order | Variable Name | Value Source | Notes |
|-------|---------------|--------------|-------|
| 1 | NEXT_PUBLIC_CONVEX_URL | From Step 1 Convex deploy output | Must be production URL |
| 2 | AUTH_SECRET | From Step 2 openssl command | New secret, not dev value |
| 3 | CLOUDINARY_API_KEY | Cloudinary dashboard | See Variable Details section |
| 4 | CLOUDINARY_API_SECRET | Cloudinary dashboard | Click "Show" to reveal |
| 5 | NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME | Cloudinary dashboard | Cloud name value |
| 6 | GOOGLE_CLIENT_ID | Google Cloud Console | OAuth client ID |
| 7 | GOOGLE_CLIENT_SECRET | Google Cloud Console | OAuth client secret |
| 8 | RESEND_API_KEY | Resend dashboard | API key value |

**Environment Scope Checkboxes:**
- ☑ Production (checked)
- ☐ Preview (unchecked - Phase 2.2 will configure separately)
- ☐ Development (unchecked - use .env.local for local dev)

### Step 5: Configure Convex Backend Environment Variables

Convex actions (like email sending and image uploads) need environment variables set in the Convex dashboard:

1. Navigate to Convex dashboard: https://dashboard.convex.dev
2. Select your **PRODUCTION** deployment (not dev)
3. Click **"Settings"** → **"Environment Variables"**
4. Add the following variables:

| Variable Name | Value Source | Notes |
|---------------|--------------|-------|
| AUTH_SECRET | Same as Vercel AUTH_SECRET (from Step 2) | Must match exactly |
| CLOUDINARY_CLOUD_NAME | Same as Vercel | For upload actions |
| CLOUDINARY_API_KEY | Same as Vercel | For upload actions |
| CLOUDINARY_API_SECRET | Same as Vercel | For upload actions |
| RESEND_API_KEY | Same as Vercel | For email actions |

**Why Duplicate?**
- Convex actions run in isolated Node.js environment
- Cannot access Next.js environment variables
- Must be configured separately in Convex dashboard

### Step 6: Update Google OAuth Redirect URIs

Ensure production redirect URIs are configured:

1. Go to Google Cloud Console: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add:
   ```
   https://so-quoteable.vercel.app/api/auth/callback/google
   ```
4. Keep existing localhost URI for development:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Click **"Save"**

---

## Verification

### Automated Verification Checklist

Run this checklist after configuring all variables:

**Vercel Dashboard Checks:**
1. Navigate to Settings → Environment Variables
2. Verify **8 variables** are listed for Production environment
3. Verify each variable name matches exactly (case-sensitive):
   - NEXT_PUBLIC_CONVEX_URL
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   - AUTH_SECRET
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - RESEND_API_KEY
4. Verify "Production" is checked for all variables
5. Verify "Preview" and "Development" are unchecked

**Convex Dashboard Checks:**
1. Navigate to production deployment Settings → Environment Variables
2. Verify **5 variables** are listed:
   - AUTH_SECRET
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
   - RESEND_API_KEY
3. Verify values match Vercel (use "Show" to compare)

**Google OAuth Checks:**
1. Navigate to Google Cloud Console → Credentials
2. Select OAuth 2.0 Client ID
3. Verify production redirect URI is listed:
   - `https://so-quoteable.vercel.app/api/auth/callback/google`

### Test Deployment

Trigger a production deployment to verify configuration:

1. **Option A - Direct Deploy** (if on main branch):
   ```bash
   git push origin main
   ```

2. **Option B - Test Deploy** (if on feature branch):
   ```bash
   # Manually deploy via Vercel dashboard
   # Settings → Git → Redeploy from latest main commit
   ```

3. **Watch Deployment**:
   - Go to Vercel dashboard → Deployments
   - Click on running deployment
   - Check "Build Logs" for environment variable issues

4. **Expected Success**:
   - Build completes without "Missing environment variable" errors
   - Deployment status shows "Ready"
   - Production URL is accessible: https://so-quoteable.vercel.app

### Functional Testing

After successful deployment, test each integration:

**Convex Backend:**
1. Visit: https://so-quoteable.vercel.app
2. Open browser DevTools → Network tab
3. Verify requests to `https://[production-convex-url].convex.cloud` succeed
4. Check response status codes are 200 OK

**Cloudinary Integration:**
1. Test image upload functionality
2. Verify images appear in Cloudinary dashboard under `so-quotable/` folder
3. Check image URLs use production Cloudinary CDN

**Google OAuth:**
1. Click "Sign in with Google" button
2. Complete OAuth flow
3. Verify successful login and redirect back to app
4. Check no CORS or redirect errors in console

**Email Sending:**
1. Register new user with email/password
2. Check Resend dashboard for verification email sent
3. Verify email delivered to inbox
4. Test password reset flow

---

## Troubleshooting

### Build Fails with "Missing environment variable"

**Error**: `Error: Missing required environment variable: NEXT_PUBLIC_CONVEX_URL`

**Solutions**:
1. Verify variable is added in Vercel Settings → Environment Variables
2. Verify "Production" environment is checked
3. Redeploy to pick up new variables (Settings → Git → Redeploy)
4. Check variable name spelling (case-sensitive)

### Convex Backend Connection Fails

**Error**: `ConvexError: Failed to fetch from Convex backend`

**Solutions**:
1. Verify NEXT_PUBLIC_CONVEX_URL is production URL (not dev)
2. Check production Convex deployment is active (https://dashboard.convex.dev)
3. Verify no typos in URL (must end with .convex.cloud)
4. Test URL directly in browser (should return Convex API response)

### Cloudinary Upload Fails

**Error**: `Invalid signature` or `Unauthorized`

**Solutions**:
1. Verify CLOUDINARY_API_SECRET is set in BOTH Vercel AND Convex dashboard
2. Check API credentials are for correct cloud (cloud name: dggww7kzb)
3. Verify credentials are active in Cloudinary dashboard
4. Test with Cloudinary API explorer: https://cloudinary.com/console/api_explorer

### Google OAuth Fails

**Error**: `redirect_uri_mismatch`

**Solutions**:
1. Verify redirect URI includes production URL:
   - `https://so-quoteable.vercel.app/api/auth/callback/google`
2. Check URI is EXACT match (trailing slash matters)
3. Verify OAuth consent screen is configured
4. Wait 5 minutes after updating URIs (Google Cloud propagation delay)

### Email Sending Fails

**Error**: `Resend API error: Unauthorized`

**Solutions**:
1. Verify RESEND_API_KEY is set in Convex dashboard (not just Vercel)
2. Check API key is active in Resend dashboard
3. Verify sending domain is verified in Resend
4. Check daily sending limit not exceeded (Resend free tier: 100/day)

### Variables Not Updating After Change

**Symptoms**: Old values still being used after updating variables

**Solutions**:
1. Redeploy to production (Settings → Git → Redeploy)
2. Wait 60 seconds for deployment to complete
3. Hard refresh browser (Ctrl+Shift+R)
4. Check correct environment (Production vs Preview)
5. Verify no caching middleware overriding values

---

## Security Best Practices

### Variable Classification

**Public Variables** (safe to expose in client-side code):
- NEXT_PUBLIC_CONVEX_URL
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- GOOGLE_CLIENT_ID

**Private Variables** (server-side only):
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- AUTH_SECRET
- GOOGLE_CLIENT_SECRET
- RESEND_API_KEY

### Security Rules

1. **Never commit secrets to Git**
   - .env.local is in .gitignore (verified)
   - Double-check before committing any config files
   - Use .env.local.example as template (no real values)

2. **Generate new AUTH_SECRET for production**
   - Do NOT reuse development secret
   - Use `openssl rand -base64 32` for cryptographic randomness
   - Rotate quarterly or after any security incident

3. **Separate environments strictly**
   - Production variables ONLY checked for "Production" in Vercel
   - Preview variables set separately in Phase 2.2
   - Development uses .env.local (never Vercel)

4. **Principle of least privilege**
   - Use separate Resend API keys for prod/dev if possible
   - Consider separate Cloudinary cloud for production
   - Use Google OAuth separate projects for prod/dev

5. **Regular secret rotation**
   - AUTH_SECRET: Rotate every 90 days
   - API keys: Rotate every 180 days or after team changes
   - OAuth secrets: Rotate after any security incident

6. **Access control**
   - Limit Vercel project access to essential team members
   - Use Vercel teams for role-based access control
   - Audit environment variable access logs quarterly

### Secret Rotation Procedure

When rotating secrets (e.g., AUTH_SECRET):

1. Generate new secret
2. Add NEW secret to Vercel with temporary name (e.g., AUTH_SECRET_NEW)
3. Deploy with both old and new secrets
4. Verify new secret works
5. Update Convex dashboard with new secret
6. Remove old secret from Vercel
7. Redeploy to production
8. Update documentation with rotation date

### Incident Response

If secrets are compromised:

1. **Immediate** (within 1 hour):
   - Rotate compromised secret immediately
   - Deploy new secret to production
   - Revoke old API keys in service dashboards

2. **Short-term** (within 24 hours):
   - Audit access logs for unauthorized usage
   - Review all environment variable access
   - Update incident log

3. **Long-term** (within 1 week):
   - Conduct security review
   - Update security procedures
   - Train team on prevention

---

## Additional Resources

- **Vercel Environment Variables**: https://vercel.com/docs/projects/environment-variables
- **Convex Environment Variables**: https://docs.convex.dev/production/environment-variables
- **Cloudinary API Credentials**: https://cloudinary.com/documentation/how_to_integrate_cloudinary
- **Google OAuth Setup**: https://support.google.com/cloud/answer/6158849
- **Resend API Keys**: https://resend.com/docs/api-reference/api-keys

---

**Phase 2.1 Status**: Documentation complete, ready for user execution
**Next Phase**: Phase 2.2 - Set preview environment variables in Vercel
