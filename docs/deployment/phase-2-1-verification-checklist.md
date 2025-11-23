# Phase 2.1 Verification Checklist: Production Environment Variables

**Task**: TASK-006 Phase 2.1 - Set production environment variables in Vercel
**Status**: Ready for execution
**Date**: 2025-11-19

---

## Prerequisites Verification

Before starting, verify these prerequisites are complete:

- [ ] **Vercel project access**: Can access https://vercel.com/taylor-hustons-projects/so-quoteable
- [ ] **Convex account access**: Can access https://dashboard.convex.dev
- [ ] **Cloudinary dashboard access**: Can access https://cloudinary.com/console
- [ ] **Google Cloud Console access**: Can access https://console.cloud.google.com/apis/credentials
- [ ] **Resend dashboard access**: Can access https://resend.com/api-keys
- [ ] **Terminal access**: Can run commands from `/home/taylor/src/quotable`

---

## Phase 2.1 Execution Checklist

### Step 1: Deploy Production Convex Backend

**CRITICAL: Must be done FIRST**

- [ ] **1.1**: Open terminal in `/home/taylor/src/quotable`
- [ ] **1.2**: Run: `npx convex deploy`
- [ ] **1.3**: Confirm deployment when prompted (type `y`)
- [ ] **1.4**: Copy production deployment URL from output
- [ ] **1.5**: Verify URL format: `https://[name].convex.cloud`
- [ ] **1.6**: Confirm URL is DIFFERENT from dev: `https://cheery-cow-298.convex.cloud`
- [ ] **1.7**: Save production URL for later (record below)

**Production Convex URL**: _______________________________________________

### Step 2: Generate Production AUTH_SECRET

**IMPORTANT: Must be NEW secret (not dev value)**

- [ ] **2.1**: Run: `openssl rand -base64 32`
- [ ] **2.2**: Copy the generated secret
- [ ] **2.3**: Verify it's different from dev AUTH_SECRET
- [ ] **2.4**: Save for later (record below)

**Production AUTH_SECRET**: _______________________________________________

### Step 3: Gather Service Credentials

**Cloudinary Credentials:**
- [ ] **3.1**: Log in to https://cloudinary.com/console
- [ ] **3.2**: Navigate to Dashboard
- [ ] **3.3**: Record Cloud Name (should be: `dggww7kzb`)
- [ ] **3.4**: Record API Key (numeric, 15 digits)
- [ ] **3.5**: Click "Show" and record API Secret

**Google OAuth Credentials:**
- [ ] **3.6**: Log in to https://console.cloud.google.com/apis/credentials
- [ ] **3.7**: Select OAuth 2.0 Client ID
- [ ] **3.8**: Record Client ID (ends with .apps.googleusercontent.com)
- [ ] **3.9**: Click "Show" and record Client Secret (starts with GOCSPX-)

**Resend API Key:**
- [ ] **3.10**: Log in to https://resend.com/api-keys
- [ ] **3.11**: Record API Key (starts with re_)

### Step 4: Configure Vercel Environment Variables

**Access Settings:**
- [ ] **4.1**: Navigate to https://vercel.com/taylor-hustons-projects/so-quoteable
- [ ] **4.2**: Click "Settings" tab
- [ ] **4.3**: Click "Environment Variables" in left sidebar

**Add Variables (one at a time):**

For each variable below, click "Add" and fill in:
- Variable Name (exact, case-sensitive)
- Value (from steps above)
- Environment: Check ONLY "Production"
- Click "Save"

- [ ] **4.4**: Add NEXT_PUBLIC_CONVEX_URL
  - Value: Production URL from Step 1.7
  - Environment: ☑ Production, ☐ Preview, ☐ Development

- [ ] **4.5**: Add AUTH_SECRET
  - Value: Generated secret from Step 2.4
  - Environment: ☑ Production, ☐ Preview, ☐ Development

- [ ] **4.6**: Add CLOUDINARY_API_KEY
  - Value: API Key from Step 3.4
  - Environment: ☑ Production, ☐ Preview, ☐ Development

- [ ] **4.7**: Add CLOUDINARY_API_SECRET
  - Value: API Secret from Step 3.5
  - Environment: ☑ Production, ☐ Preview, ☐ Development

- [ ] **4.8**: Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - Value: Cloud Name from Step 3.3 (dggww7kzb)
  - Environment: ☑ Production, ☐ Preview, ☐ Development

- [ ] **4.9**: Add GOOGLE_CLIENT_ID
  - Value: Client ID from Step 3.8
  - Environment: ☑ Production, ☐ Preview, ☐ Development

- [ ] **4.10**: Add GOOGLE_CLIENT_SECRET
  - Value: Client Secret from Step 3.9
  - Environment: ☑ Production, ☐ Preview, ☐ Development

- [ ] **4.11**: Add RESEND_API_KEY
  - Value: API Key from Step 3.11
  - Environment: ☑ Production, ☐ Preview, ☐ Development

**Verify All Variables:**
- [ ] **4.12**: Count variables in list: Should be exactly 8
- [ ] **4.13**: Verify all show "Production" environment
- [ ] **4.14**: Verify none show "Preview" or "Development"

### Step 5: Configure Convex Dashboard Environment Variables

**Access Production Deployment:**
- [ ] **5.1**: Navigate to https://dashboard.convex.dev
- [ ] **5.2**: Select PRODUCTION deployment (NOT dev: cheery-cow-298)
- [ ] **5.3**: Click "Settings" → "Environment Variables"

**Add Variables (must match Vercel values EXACTLY):**

- [ ] **5.4**: Add AUTH_SECRET
  - Value: Same as Vercel (from Step 2.4)

- [ ] **5.5**: Add CLOUDINARY_CLOUD_NAME
  - Value: Same as Vercel (from Step 3.3)

- [ ] **5.6**: Add CLOUDINARY_API_KEY
  - Value: Same as Vercel (from Step 3.4)

- [ ] **5.7**: Add CLOUDINARY_API_SECRET
  - Value: Same as Vercel (from Step 3.5)

- [ ] **5.8**: Add RESEND_API_KEY
  - Value: Same as Vercel (from Step 3.11)

**Verify All Variables:**
- [ ] **5.9**: Count variables in Convex: Should be exactly 5
- [ ] **5.10**: Click "Show" and verify values match Vercel

### Step 6: Update Google OAuth Redirect URIs

**Configure Production Redirect:**
- [ ] **6.1**: Navigate to https://console.cloud.google.com/apis/credentials
- [ ] **6.2**: Select your OAuth 2.0 Client ID
- [ ] **6.3**: Under "Authorized redirect URIs", click "Add URI"
- [ ] **6.4**: Enter: `https://so-quoteable.vercel.app/api/auth/callback/google`
- [ ] **6.5**: Verify localhost URI still exists: `http://localhost:3000/api/auth/callback/google`
- [ ] **6.6**: Click "Save"
- [ ] **6.7**: Wait 5 minutes for Google propagation

---

## Verification Tests

### Test 1: Vercel Configuration Review

**Manual Review:**
- [ ] **V1.1**: In Vercel Settings → Environment Variables
- [ ] **V1.2**: See exactly 8 variables listed
- [ ] **V1.3**: All variables show "Production" badge
- [ ] **V1.4**: Variable names match exactly (case-sensitive):
  - NEXT_PUBLIC_CONVEX_URL
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - AUTH_SECRET
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - RESEND_API_KEY

### Test 2: Convex Configuration Review

**Manual Review:**
- [ ] **V2.1**: In Convex production deployment Settings → Environment Variables
- [ ] **V2.2**: See exactly 5 variables listed
- [ ] **V2.3**: Variable names match exactly:
  - AUTH_SECRET
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
  - RESEND_API_KEY
- [ ] **V2.4**: Click "Show" to verify values match Vercel

### Test 3: Google OAuth Configuration Review

**Manual Review:**
- [ ] **V3.1**: In Google Cloud Console → Credentials → OAuth 2.0 Client ID
- [ ] **V3.2**: See production redirect URI listed:
  - `https://so-quoteable.vercel.app/api/auth/callback/google`
- [ ] **V3.3**: See development redirect URI listed:
  - `http://localhost:3000/api/auth/callback/google`

### Test 4: Test Deployment

**Trigger Deployment:**
- [ ] **V4.1**: Go to Vercel dashboard → Deployments
- [ ] **V4.2**: Click "..." menu on latest deployment → "Redeploy"
- [ ] **V4.3**: Select "Use existing Build Cache"
- [ ] **V4.4**: Click "Redeploy"

**Watch Deployment:**
- [ ] **V4.5**: Click on running deployment
- [ ] **V4.6**: Click "Building" → View logs
- [ ] **V4.7**: Verify NO "Missing environment variable" errors
- [ ] **V4.8**: Wait for "Building" → "Deploying" → "Ready"
- [ ] **V4.9**: Deployment shows "Ready" status with green checkmark

**Test Production URL:**
- [ ] **V4.10**: Click "Visit" button or go to https://so-quoteable.vercel.app
- [ ] **V4.11**: Page loads without errors
- [ ] **V4.12**: Open browser DevTools → Console
- [ ] **V4.13**: No environment variable errors in console
- [ ] **V4.14**: Open DevTools → Network tab
- [ ] **V4.15**: Refresh page
- [ ] **V4.16**: See requests to production Convex URL (from Step 1.7)
- [ ] **V4.17**: Convex requests return 200 OK status

### Test 5: Functional Integration Tests (Optional)

**Test Convex Backend:**
- [ ] **V5.1**: Visit https://so-quoteable.vercel.app
- [ ] **V5.2**: Open DevTools → Network → Filter by "convex.cloud"
- [ ] **V5.3**: See successful API calls (200 status)

**Test Google OAuth (if login UI exists):**
- [ ] **V5.4**: Click "Sign in with Google" button
- [ ] **V5.5**: Complete OAuth flow
- [ ] **V5.6**: Successfully logged in
- [ ] **V5.7**: No redirect_uri_mismatch errors

**Test Cloudinary (if upload UI exists):**
- [ ] **V5.8**: Test image upload functionality
- [ ] **V5.9**: Image appears in Cloudinary dashboard
- [ ] **V5.10**: Image URL uses production CDN

**Test Email (if registration UI exists):**
- [ ] **V5.11**: Register new user with email
- [ ] **V5.12**: Check Resend dashboard for sent email
- [ ] **V5.13**: Email delivered to inbox

---

## Acceptance Criteria

Phase 2.1 is COMPLETE when:

- ✅ All 8 environment variables set in Vercel for Production
- ✅ All 5 environment variables set in Convex production deployment
- ✅ Google OAuth production redirect URI configured
- ✅ Production deployment builds successfully without env var errors
- ✅ Production site loads and makes successful Convex API calls
- ✅ No console errors related to missing environment variables

---

## Troubleshooting Reference

If any verification step fails, refer to:
- **docs/deployment/environment-setup.md** - Detailed troubleshooting guide
- **TASK-006 WORKLOG.md** - Known issues and solutions

**Common Issues:**

1. **"Missing environment variable" during build**
   - Solution: Verify variable added with "Production" checked
   - Solution: Redeploy to pick up new variables

2. **Convex backend connection fails**
   - Solution: Verify NEXT_PUBLIC_CONVEX_URL is production URL (not dev)
   - Solution: Check production Convex deployment is active

3. **Google OAuth redirect_uri_mismatch**
   - Solution: Verify exact URL: `https://so-quoteable.vercel.app/api/auth/callback/google`
   - Solution: Wait 5 minutes for Google Cloud propagation

---

**Phase 2.1 Status**: Ready for user execution
**Estimated Time**: 30-45 minutes
**Next Phase**: Phase 2.2 - Set preview environment variables in Vercel

---

## Completion Checklist

After all tests pass, update project documentation:

- [ ] Mark Phase 2.1 complete in PLAN.md
- [ ] Document completion in WORKLOG.md with:
  - Production Convex URL
  - Any issues encountered
  - Time taken
  - Lessons learned
- [ ] Commit documentation updates
- [ ] Notify team of production environment readiness

---

**Document Status**: Complete
**Last Updated**: 2025-11-19
