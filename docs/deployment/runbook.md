# Deployment Runbook

**Document Status**: Phase 6.3 Complete
**Last Updated**: 2025-11-25
**Related**: TASK-006 Phase 6.3 - Document monitoring and observability

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Standard Deployment Workflow](#standard-deployment-workflow)
4. [Manual Deployment Procedures](#manual-deployment-procedures)
5. [Environment Promotion Workflow](#environment-promotion-workflow)
6. [Common Deployment Issues](#common-deployment-issues)
7. [Monitoring Dashboard Access](#monitoring-dashboard-access)
8. [Emergency Procedures](#emergency-procedures)
9. [Deployment Checklist](#deployment-checklist)
10. [Useful Commands Reference](#useful-commands-reference)

---

## Overview

### Purpose of This Runbook

This runbook provides step-by-step instructions for deploying So Quotable to production, handling common deployment scenarios, and responding to deployment incidents. It serves as the operational guide for all deployment activities.

### When to Use This Runbook

- **Day-to-day deployments**: Standard production release workflow
- **Emergency deployments**: Critical hotfixes or security patches
- **Incident response**: Production issues requiring rollback or emergency fixes
- **New team member onboarding**: Learning the deployment process
- **Troubleshooting**: Diagnosing and resolving deployment failures

### Quick Links to Key Resources

| Resource | URL | Purpose |
|----------|-----|---------|
| **Production Site** | https://so-quoteable.vercel.app | Live application |
| **Vercel Dashboard** | https://vercel.com/taylor-hustons-projects/so-quoteable | Deployment management |
| **Convex Dashboard** | https://dashboard.convex.dev/deployment/steady-anaconda-957 | Backend monitoring |
| **GitHub Repository** | https://github.com/TaylorHuston/soquoteable | Source code |
| **Health Endpoint** | https://so-quoteable.vercel.app/api/health | System status |
| **Rollback Guide** | [rollback.md](./rollback.md) | Emergency rollback procedures |
| **Environment Setup** | [environment-setup.md](./environment-setup.md) | Environment variables |

---

## Prerequisites

### Required Access

Before performing deployments, ensure you have:

1. **Vercel Dashboard Access**
   - Admin access to So Quotable project
   - URL: https://vercel.com/taylor-hustons-projects/so-quoteable
   - Team: taylor-hustons-projects
   - Project ID: `prj_ih8kLlVZHGlBfbIqQMdmHyYrPJ6n`

2. **Convex Dashboard Access**
   - Admin access to production deployment
   - URL: https://dashboard.convex.dev
   - Production deployment: steady-anaconda-957 (https://steady-anaconda-957.convex.cloud)
   - Development deployment: cheery-cow-298 (https://cheery-cow-298.convex.cloud)

3. **GitHub Repository Access**
   - Write access to https://github.com/TaylorHuston/soquoteable
   - Ability to push to `main` branch
   - Access to GitHub Secrets (for CI/CD configuration)

4. **Terminal Access**
   - Command-line access to project repository
   - SSH key configured for GitHub
   - Authenticated with Vercel and Convex CLIs

### Required CLI Tools

Ensure the following tools are installed and authenticated:

1. **Vercel CLI**
   ```bash
   # Install globally
   npm install -g vercel

   # Verify installation
   vercel --version

   # Authenticate
   vercel login

   # Link to project (in project directory)
   vercel link
   ```

2. **Convex CLI**
   ```bash
   # No installation needed (uses npx)
   # Verify access
   npx convex --version

   # Authenticate
   npx convex dev --once
   ```

3. **Git**
   ```bash
   # Verify installation
   git --version

   # Configure SSH key
   ssh -T git@github.com
   ```

4. **Node.js & npm**
   ```bash
   # Use correct Node.js version
   nvm use

   # Verify versions
   node --version  # Should be 20.9.0
   npm --version   # Should be 9.0.0+
   ```

### Authentication Setup

**First-time setup**:

```bash
# 1. Clone repository
git clone https://github.com/TaylorHuston/soquoteable.git
cd soquoteable

# 2. Use correct Node.js version
nvm use

# 3. Install dependencies
npm install

# 4. Authenticate with Vercel
vercel login
vercel link

# 5. Authenticate with Convex
npx convex dev --once
# (This will open browser for authentication)

# 6. Verify setup
npm run test:run        # Tests should pass
npm run type-check      # TypeScript should compile
```

---

## Standard Deployment Workflow

### Overview

The standard deployment workflow leverages automatic deployments triggered by pushing to the `main` branch. This is the **recommended approach for all normal deployments**.

### Step-by-Step Procedure

#### Step 1: Ensure Tests Pass Locally

Before pushing to production, verify all quality gates pass locally:

```bash
# Run unit and integration tests
npm run test:run

# Run E2E tests (CRITICAL for production deployments)
npm run test:e2e

# Run TypeScript type checking
npm run type-check

# Run linter
npm run lint
```

**Expected output**:
- All tests passing (501 tests, 94%+ coverage)
- No TypeScript errors
- No linting errors

**If any tests fail**:
- Fix issues before proceeding
- Do NOT push failing code to production
- Consider creating a hotfix branch if urgent

#### Step 2: Commit and Push to Main

```bash
# Ensure you're on the main branch
git checkout main

# Pull latest changes
git pull origin main

# Push your changes
git push origin main
```

**Trigger**: This push automatically triggers Vercel deployment.

**Expected timeline**:
- Vercel build starts: Within 30 seconds of push
- Build completes: 2-3 minutes
- Production URL updated: Immediately after build success

#### Step 3: Monitor Deployment Progress

**Via Vercel Dashboard**:
1. Navigate to: https://vercel.com/taylor-hustons-projects/so-quoteable/deployments
2. Find your deployment (top of list, marked "Building" or "Ready")
3. Click on deployment to view build logs
4. Monitor for errors or warnings

**Via Vercel CLI** (optional):
```bash
# View recent deployments
vercel ls --prod

# Follow logs in real-time
vercel logs --follow
```

**Build stages to watch**:
1. **Initializing** (10-30 seconds)
2. **Installing dependencies** (30-60 seconds)
3. **Building** (1-2 minutes)
   - Next.js compilation
   - Convex deployment (if configured)
4. **Deploying** (30 seconds)
5. **Ready** (deployment complete)

#### Step 4: Verify Deployment Success

**Health Endpoint Check** (essential):
```bash
# Test health endpoint
curl https://so-quoteable.vercel.app/api/health

# Expected response (200 OK):
{
  "status": "healthy",
  "timestamp": "2025-11-24T...",
  "service": "quoteable-api",
  "convex": {
    "status": "ok",
    "database": { "connected": true, "peopleCount": 0 },
    "environment": { "deployment": "cloud" }
  }
}
```

**Manual Smoke Tests** (recommended):
1. Visit production site: https://so-quoteable.vercel.app
2. Test critical user flows:
   - Homepage loads without errors
   - Login flow works (email/password and Google OAuth)
   - Protected routes redirect correctly
   - (Future) Quote generation works
3. Check browser console for errors (should be none)
4. Verify network requests succeed (check DevTools Network tab)

**Monitoring Dashboards** (post-deployment):
- **Vercel Analytics**: Check for error rate spike
- **Convex Dashboard**: Verify function execution succeeds
- **Health Endpoint**: Confirm returns 200 OK consistently

#### Step 5: Post-Deployment Validation

After deployment completes, verify production health:

```bash
# Run quick validation script
scripts/validate-production.sh  # (Future: create this script)

# Or manual checks:
# 1. Health endpoint returns 200 OK
curl -I https://so-quoteable.vercel.app/api/health

# 2. Homepage loads
curl -I https://so-quoteable.vercel.app

# 3. API routes work
curl https://so-quoteable.vercel.app/api/health | jq .
```

**Success criteria**:
- ✅ Health endpoint returns 200 OK
- ✅ No error spike in Vercel Analytics (< 1% error rate)
- ✅ Convex functions executing successfully
- ✅ No console errors on homepage
- ✅ Critical user flows working

**If validation fails**:
- Immediately follow [Emergency Rollback Procedures](#emergency-procedures)
- See [Rollback Guide](./rollback.md) for detailed instructions

### Deployment Timeline (Standard Workflow)

| Stage | Duration | Notes |
|-------|----------|-------|
| Push to GitHub | <10s | Triggers Vercel webhook |
| Vercel build start | 10-30s | Initialization and dependency caching |
| Build execution | 2-3 min | Next.js build + Convex deploy |
| Deployment | 30s | CDN cache invalidation |
| **Total** | **3-5 min** | From push to production live |

### Automatic vs Manual Deployment

**Automatic (Recommended)**:
- Triggered by: Push to `main` branch
- Requires: GitHub integration configured
- Advantages: Consistent, auditable, traceable
- Use for: All normal deployments

**Manual (Emergency only)**:
- Triggered by: Manual CLI commands
- Requires: CLI authentication
- Advantages: Bypasses GitHub, faster in emergencies
- Use for: Emergency hotfixes, CI/CD failures

See [Manual Deployment Procedures](#manual-deployment-procedures) below.

---

## Manual Deployment Procedures

### When to Use Manual Deployment

Manual deployment should be used **only in these scenarios**:

1. **Emergency Hotfixes**: Critical production bug requiring immediate fix (bypassing normal CI/CD)
2. **CI/CD Failure**: GitHub Actions or Vercel automation is broken
3. **Network Issues**: GitHub webhook delivery failing
4. **Testing Deployment Process**: Validating deployment mechanics (non-production)

**Warning**: Manual deployments bypass normal quality gates (tests, reviews). Use with caution.

### Emergency Manual Deployment (Full Stack)

**Use case**: Deploy both frontend and backend manually in emergency.

#### Step 1: Prepare Code

```bash
# Ensure you have the code to deploy
git checkout main
git pull origin main

# Or check out specific commit if needed
git checkout <commit-hash>

# Verify code builds locally
npm run build
```

#### Step 2: Deploy Backend (Convex)

```bash
# Deploy to Convex production
npx convex deploy

# Confirm deployment when prompted
# Type 'y' and press Enter

# Verify deployment succeeded
npx convex logs --tail 10
```

**Expected output**:
```
✔ Deployed functions to production deployment steady-anaconda-957
  View your functions: https://dashboard.convex.dev/...
  Deployment URL: https://steady-anaconda-957.convex.cloud
```

**Deployment time**: 2-3 minutes

#### Step 3: Deploy Frontend (Vercel)

```bash
# Deploy to Vercel production
vercel --prod

# Follow prompts (if any)
# Vercel will build and deploy
```

**Expected output**:
```
Vercel CLI 48.8.2
🔍  Inspect: https://vercel.com/...
✅  Production: https://so-quoteable.vercel.app [2m 34s]
```

**Deployment time**: 2-3 minutes

#### Step 4: Verify Deployment

```bash
# Test health endpoint
curl https://so-quoteable.vercel.app/api/health

# Check site loads
curl -I https://so-quoteable.vercel.app
```

**Total time**: 5-7 minutes

### Frontend-Only Manual Deployment

**Use case**: Frontend hotfix, backend is stable.

```bash
# Deploy only frontend to Vercel
vercel --prod

# Wait for build to complete
# Verify deployment
curl -I https://so-quoteable.vercel.app
```

**Deployment time**: 2-3 minutes

**Note**: This redeploys frontend only. Backend (Convex) remains unchanged.

### Backend-Only Manual Deployment

**Use case**: Backend hotfix, frontend is stable.

```bash
# Deploy only backend to Convex
npx convex deploy

# Verify in Convex dashboard
# https://dashboard.convex.dev/deployment/steady-anaconda-957

# Test health endpoint
curl https://so-quoteable.vercel.app/api/health
```

**Deployment time**: 2-3 minutes

**Note**: Frontend automatically picks up backend changes (via NEXT_PUBLIC_CONVEX_URL).

### Rollback via Manual Deployment

**Use case**: Automatic rollback failed, need manual intervention.

See [Rollback Guide](./rollback.md) for detailed rollback procedures. Quick reference:

**Frontend rollback** (fastest - CLI method):
```bash
# List recent production deployments
vercel ls --prod | head -5

# Set production alias to previous deployment
vercel alias set <previous-deployment-url> so-quoteable.vercel.app

# Verify rollback
curl https://so-quoteable.vercel.app/api/health
```

**Backend rollback**:
```bash
# Checkout previous known-good commit
git checkout <previous-commit-hash>

# Deploy to production
npx convex deploy

# Return to main branch
git checkout main
```

**Total time**: 2-5 minutes

---

## Environment Promotion Workflow

### Environment Overview

So Quotable uses a **simplified two-environment strategy** optimized for Convex free tier constraints:

| Environment | URL | Backend | Purpose | Deployment Method |
|-------------|-----|---------|---------|-------------------|
| **Development** | http://localhost:3000 | [cheery-cow-298](https://cheery-cow-298.convex.cloud) | Local development and testing | Manual (`npm run dev` + `npx convex dev`) |
| **Production** | https://so-quoteable.vercel.app | [steady-anaconda-957](https://steady-anaconda-957.convex.cloud) | Live application for users | Automatic (push to `main`) |

**Note**: There is no staging environment. This is a deliberate decision for MVP simplicity. See [ADR-003](../project/adrs/ADR-003-environment-and-deployment-strategy.md) for rationale.

### Code Flow Through Environments

```
Developer Machine (Local)
   ↓ (npx convex dev + npm run dev)
Development Environment (localhost:3000)
   ↓ (Local E2E tests: npm run test:e2e)
Quality Gates (Tests, Type Check, Lint)
   ↓ (git push origin main)
Production Environment (so-quoteable.vercel.app)
   ↓ (Post-deployment validation)
Live Users
```

### Promotion Workflow (Development → Production)

#### Step 1: Local Development and Testing

```bash
# Start local development servers
npx convex dev              # Terminal 1: Convex dev backend
npm run dev                 # Terminal 2: Next.js dev server

# Develop features
# Write tests (TDD approach)

# Run tests locally
npm run test:run            # Unit and integration tests
npm run test:e2e            # E2E tests (CRITICAL)
npm run type-check          # TypeScript validation
npm run lint                # Code quality
```

**Quality gate**: All tests must pass locally before proceeding.

#### Step 2: Code Review and Merge

```bash
# Create feature branch
git checkout -b feature/TASK-###-description

# Commit changes
git add .
git commit -m "feat: description"

# Push feature branch
git push origin feature/TASK-###-description

# Create pull request on GitHub
# Require code review approval (see GitHub branch protection)
```

**Quality gate**: Code review approval required before merge to `main`.

#### Step 3: Merge to Main (Triggers Production Deployment)

```bash
# After PR approval, merge to main
git checkout main
git merge feature/TASK-###-description
git push origin main
```

**Trigger**: This push automatically deploys to production via Vercel.

**Timeline**: 3-5 minutes from merge to production live.

#### Step 4: Post-Deployment Validation

```bash
# Verify deployment succeeded
curl https://so-quoteable.vercel.app/api/health

# Test critical user flows manually
# Monitor Vercel Analytics and Convex Dashboard
```

**Quality gate**: Health endpoint returns 200 OK, no error spike.

### Environment-Specific Configuration

**Development Environment Variables** (`.env.local`):
```bash
# Convex (Development deployment)
NEXT_PUBLIC_CONVEX_URL=https://cheery-cow-298.convex.cloud

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dggww7kzb

# Other local-only variables
```

**Production Environment Variables** (Vercel Dashboard):
```bash
# Convex (Production deployment)
NEXT_PUBLIC_CONVEX_URL=https://steady-anaconda-957.convex.cloud

# Auth secrets (different from dev!)
AUTH_SECRET=<production-secret>

# Cloudinary credentials
CLOUDINARY_API_KEY=<production-key>
CLOUDINARY_API_SECRET=<production-secret>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dggww7kzb

# Google OAuth
GOOGLE_CLIENT_ID=<production-id>
GOOGLE_CLIENT_SECRET=<production-secret>

# Email service
RESEND_API_KEY=<production-key>
```

**Critical**: Production environment variables are set in **two places**:
1. **Vercel Dashboard** (for Next.js environment)
2. **Convex Dashboard** (for Convex actions)

See [Environment Setup Guide](./environment-setup.md) for detailed configuration.

### Free Tier Constraints

**Convex Free Tier Limitations**:
- ⚠️ **No preview deployments**: Convex free tier does not support preview deploy keys
- ✅ **Local E2E testing**: Run E2E tests against `localhost:3000` before production push
- ✅ **Direct production deployment**: Push to `main` → automatic production deployment

**Adapted Workflow**:
1. Develop locally with `npx convex dev` + `npm run dev`
2. Run E2E tests locally: `npm run test:e2e`
3. Push to `main` → Automatic production deployment
4. Post-deployment validation

**Future Enhancement** (when upgrading to Convex Pro):
- Preview deployments for pull requests
- Automated E2E tests in GitHub Actions against preview URLs
- PR preview URL comments

---

## Common Deployment Issues

### Issue 1: Build Fails on Vercel

**Symptoms**:
- Vercel deployment shows "Build Failed" status
- Red X indicator in deployments list
- Error message in build logs

**Common Causes**:

1. **TypeScript Errors**
   ```
   Error: Type 'string | undefined' is not assignable to type 'string'
   ```

   **Solution**:
   ```bash
   # Run type check locally
   npm run type-check

   # Fix TypeScript errors
   # Push fixed code
   git add .
   git commit -m "fix: resolve TypeScript errors"
   git push origin main
   ```

2. **Missing Environment Variables**
   ```
   Error: Missing required environment variable: NEXT_PUBLIC_CONVEX_URL
   ```

   **Solution**:
   - Navigate to: https://vercel.com/taylor-hustons-projects/so-quoteable/settings/environment-variables
   - Add missing variable
   - Redeploy: Settings → Git → Redeploy
   - See [Environment Setup Guide](./environment-setup.md)

3. **Build Command Failure**
   ```
   Error: Command "npm run build" failed with exit code 1
   ```

   **Solution**:
   ```bash
   # Test build locally
   npm run build

   # Check for errors
   # Fix and retry
   ```

4. **Dependency Installation Failure**
   ```
   Error: ENOTFOUND registry.npmjs.org
   ```

   **Solution**:
   - Wait and retry (temporary npm registry issue)
   - Or redeploy manually via Vercel dashboard

**Debugging Steps**:
1. Click on failed deployment in Vercel dashboard
2. Read "Build Logs" tab carefully
3. Identify exact error message
4. Fix locally and push again
5. If persistent, check [Vercel Status](https://www.vercel-status.com/)

### Issue 2: Convex Deploy Fails

**Symptoms**:
- Convex deployment returns error during `npx convex deploy`
- GitHub secret CONVEX_DEPLOY_KEY not working
- Build logs show "No CONVEX_DEPLOY_KEY found"

**Common Causes**:

1. **Missing CONVEX_DEPLOY_KEY**

   **Solution**:
   - Navigate to: https://github.com/TaylorHuston/soquoteable/settings/secrets/actions
   - Verify `CONVEX_DEPLOY_KEY` secret exists
   - If missing, regenerate in Convex dashboard:
     - Go to: https://dashboard.convex.dev/deployment/steady-anaconda-957/settings
     - Navigate to: Settings → Deploy Keys
     - Create new deploy key
     - Copy and add to GitHub Secrets

2. **Schema Validation Error**
   ```
   Error: Schema validation failed: Invalid field type
   ```

   **Solution**:
   ```bash
   # Test schema locally
   npx convex dev --once

   # Fix schema errors in convex/schema.ts
   # Push fixed schema
   ```

3. **Convex Service Outage**

   **Solution**:
   - Check Convex status: https://status.convex.dev/
   - Wait for service restoration
   - Or deploy manually: `npx convex deploy`

### Issue 3: Health Endpoint Returns 503

**Symptoms**:
```bash
curl https://so-quoteable.vercel.app/api/health
# Returns: 503 Service Unavailable
```

**Common Causes**:

1. **Convex Backend Not Connected**

   **Solution**:
   - Verify NEXT_PUBLIC_CONVEX_URL is set correctly in Vercel
   - Check Convex deployment is active: https://dashboard.convex.dev/deployment/steady-anaconda-957
   - Test Convex directly:
     ```bash
     curl -I https://steady-anaconda-957.convex.cloud
     # Should return 200 OK
     ```

2. **Environment Variables Missing**

   **Solution**:
   - Verify all required env vars are set in Vercel dashboard
   - Redeploy to pick up environment changes
   - See [Environment Setup Guide](./environment-setup.md)

3. **Convex Function Error**

   **Solution**:
   - Check Convex function logs: https://dashboard.convex.dev/deployment/steady-anaconda-957/logs
   - Look for errors in health check query
   - Fix function code and redeploy

**Debugging Steps**:
```bash
# Test Convex backend directly
curl -I https://steady-anaconda-957.convex.cloud

# Check health endpoint with verbose output
curl -v https://so-quoteable.vercel.app/api/health

# View Vercel logs
vercel logs --follow

# View Convex logs
npx convex logs
```

### Issue 4: Environment Variables Not Updating

**Symptoms**:
- Changed environment variable in Vercel dashboard
- Deployment succeeds
- Old value still being used

**Solution**:
```bash
# After updating env vars in Vercel, redeploy
# Option 1: Via dashboard
# Navigate to: Settings → Git → Redeploy

# Option 2: Via CLI
vercel --prod --force

# Option 3: Push trivial change to trigger deploy
echo "# Env var update" >> README.md
git add README.md
git commit -m "chore: trigger redeployment for env var update"
git push origin main
```

**Note**: Environment variables are injected at build time. Must redeploy to pick up changes.

### Issue 5: TypeScript Errors in Production Build

**Symptoms**:
- Local `npm run type-check` passes
- Vercel build fails with TypeScript errors

**Common Causes**:
- Different TypeScript version (local vs Vercel)
- Missing type definitions in `node_modules`

**Solution**:
```bash
# Ensure package-lock.json is committed
git add package-lock.json
git commit -m "chore: update package-lock.json"
git push origin main

# Or force clean install
rm -rf node_modules package-lock.json
npm install
npm run type-check
```

### Issue 6: Convex Schema Mismatch

**Symptoms**:
- Convex functions fail with schema errors
- "Table not found" or "Field not found" errors

**Solution**:
```bash
# Sync schema with Convex deployment
npx convex dev --once

# Or redeploy to production
npx convex deploy

# Verify schema in Convex dashboard
# Navigate to: Data tab → Tables
```

**Prevention**:
- Always run `npx convex dev` before deploying
- Test schema changes locally first
- Use backward-compatible schema changes

### Issue 7: Google OAuth Redirect Error

**Symptoms**:
- OAuth flow fails with "redirect_uri_mismatch"

**Solution**:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select OAuth 2.0 Client ID
3. Verify authorized redirect URIs include:
   ```
   https://so-quoteable.vercel.app/api/auth/callback/google
   ```
4. Save and wait 5 minutes for propagation
5. Retry OAuth flow

### Quick Troubleshooting Checklist

When deployment fails, check:

- [ ] All local tests passing (`npm run test:run`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Environment variables set in Vercel dashboard
- [ ] CONVEX_DEPLOY_KEY exists in GitHub Secrets
- [ ] Convex backend is active (check dashboard)
- [ ] No Vercel or Convex service outages
- [ ] Build logs show specific error message
- [ ] Health endpoint accessible from local machine

---

## Monitoring Dashboard Access

### Vercel Analytics

**Purpose**: Monitor frontend performance, page views, and errors.

**Access**: https://vercel.com/taylor-hustons-projects/so-quoteable/analytics

**Key Metrics**:
- **Page Views**: Total traffic and unique visitors
- **Top Pages**: Most visited pages
- **Error Rate**: Frontend errors (target: <1%)
- **Web Vitals**: Core Web Vitals (LCP, FID, CLS)
  - LCP (Largest Contentful Paint): Target <2.5s
  - FID (First Input Delay): Target <100ms
  - CLS (Cumulative Layout Shift): Target <0.1
- **Real User Monitoring (RUM)**: Actual user experience metrics

**When to Check**:
- After every production deployment
- When users report performance issues
- Daily for overall health monitoring
- After major releases

**Interpreting Metrics**:
- **Error spike**: Indicates new bug introduced in recent deployment
- **Performance degradation**: Suggests optimization needed or CDN issue
- **Traffic drop**: Could indicate site unavailability or routing issue

### Convex Dashboard

**Purpose**: Monitor backend functions, database queries, and deployment status.

**Access**: https://dashboard.convex.dev/deployment/steady-anaconda-957

**Key Sections**:

1. **Functions Tab**
   - View all Convex functions (queries, mutations, actions)
   - Monitor function execution counts
   - Check function logs and errors
   - Analyze function performance

2. **Data Tab**
   - Browse database tables
   - View table contents
   - Run ad-hoc queries
   - Monitor database size

3. **Logs Tab**
   - Real-time function logs
   - Filter by function name or severity
   - Search for specific errors
   - Export logs for analysis

4. **Settings Tab**
   - Environment variables (Convex-side)
   - Deploy keys
   - Deployment configuration
   - Team access

**When to Check**:
- After backend deployments
- When API calls fail
- When investigating data issues
- During incident response

**Key Metrics to Monitor**:
- Function error rate (target: <1%)
- Function execution time (target: <500ms for queries)
- Database query performance
- Action success rate (image uploads, emails)

### Health Endpoint

**Purpose**: Quick production health check and automated monitoring.

**Access**: https://so-quoteable.vercel.app/api/health

**Usage**:
```bash
# Manual check
curl https://so-quoteable.vercel.app/api/health

# Expected response (200 OK):
{
  "status": "healthy",
  "timestamp": "2025-11-24T04:15:13.965Z",
  "service": "quoteable-api",
  "convex": {
    "status": "ok",
    "database": {
      "connected": true,
      "peopleCount": 0
    },
    "environment": {
      "deployment": "cloud"
    }
  }
}
```

**Response Codes**:
- **200 OK**: System is healthy
- **503 Service Unavailable**: Backend connection failed
- **500 Internal Server Error**: Health check code error

**What It Checks**:
- Next.js application is running
- Convex backend is reachable
- Database connection is active
- Environment variables are loaded

**When to Check**:
- After every deployment (essential)
- As part of automated monitoring (uptime checks)
- When debugging connection issues
- Before and after rollbacks

**Automated Monitoring** (future):
- Set up UptimeRobot or Pingdom to check `/api/health` every 5 minutes
- Alert on 503 or timeout
- Track uptime percentage

**Example Monitoring Workflows**:
```bash
# Quick health check script (save as scripts/check-health.sh)
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" https://so-quoteable.vercel.app/api/health)
if [ "$response" -eq 200 ]; then
  echo "✅ Production is healthy"
else
  echo "❌ Production unhealthy (HTTP $response)"
  exit 1
fi

# Continuous monitoring (every 60 seconds)
watch -n 60 'curl -s https://so-quoteable.vercel.app/api/health | jq .'
```

### Vercel Logs

**Purpose**: View application logs, build logs, and function execution logs.

**Access**: https://vercel.com/taylor-hustons-projects/so-quoteable/logs

**Accessing Logs**:

**Via Dashboard**:
1. Navigate to project: https://vercel.com/taylor-hustons-projects/so-quoteable
2. Click "Logs" in sidebar
3. Filter by:
   - Deployment (specific deployment or all)
   - Time range (last hour, 24h, 7d, custom)
   - Log level (info, warn, error)
   - Function name (API routes)

**Via CLI**:
```bash
# View recent logs
vercel logs

# Follow logs in real-time
vercel logs --follow

# View logs from specific deployment
vercel logs <deployment-url>

# Filter by time range
vercel logs --since 1h
vercel logs --since 24h
vercel logs --until 2h

# View only production logs
vercel logs --prod
```

**Log Types**:
- **Build Logs**: Compilation, dependency installation, build errors
- **Function Logs**: API route execution, console.log output
- **Edge Function Logs**: Middleware execution
- **Static Logs**: Static asset requests (limited)

**What to Look For**:
- **Errors**: Unhandled exceptions, API failures
- **Performance**: Slow function execution times (>1s warning)
- **Rate Limiting**: 429 errors from external services
- **Authentication**: Failed login attempts, token errors

**Log Retention**:
- **Free Tier**: Last 1,000 log entries
- **Pro Tier**: 30 days retention with full search
- **Recommendation**: Export critical errors immediately for future reference

**Example Log Analysis**:
```bash
# Find errors in last hour
vercel logs --since 1h | grep -i error

# Monitor specific API route
vercel logs --follow | grep "/api/health"

# Check function cold start times
vercel logs | grep "Init Duration"
```

### GitHub Actions (CI/CD Logs)

**Purpose**: View automated test results and deployment logs.

**Access**: https://github.com/TaylorHuston/soquoteable/actions

**Key Workflows**:
- **Test Workflow**: Runs on every push (linting, type check, tests)
- **Deploy Workflow**: (Future) Automated deployment steps

**When to Check**:
- After pushing to GitHub (verify tests passed)
- When investigating deployment failures
- To view historical test results

### Cloudinary Dashboard (Image Management)

**Purpose**: Monitor image uploads, storage, and CDN delivery.

**Access**: https://cloudinary.com/console

**Key Sections**:
- **Media Library**: View uploaded images
- **Usage**: Check storage limits and bandwidth
- **Transformations**: Monitor image transformations usage
- **Analytics**: Image delivery performance

**When to Check**:
- When image uploads fail
- To verify image delivery
- To monitor storage quotas
- During image-related debugging

### Monitoring Best Practices

**Daily Monitoring Routine** (5 minutes):
1. **Quick Health Check**:
   ```bash
   curl https://so-quoteable.vercel.app/api/health
   # Expect: HTTP 200, status: "healthy", peopleCount >= 0
   ```

2. **Vercel Analytics Review**:
   - Navigate to: https://vercel.com/taylor-hustons-projects/so-quoteable/analytics
   - Check error rate: Should be <1%
   - Review page views: Should show consistent traffic pattern
   - Check Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

3. **Convex Dashboard Check**:
   - Navigate to: https://dashboard.convex.dev/deployment/steady-anaconda-957
   - Functions tab: Verify no error spikes
   - Logs tab: Scan for warnings or errors
   - Data tab: Verify database tables have expected data

**Post-Deployment Monitoring** (15 minutes):

**Immediate (0-5 minutes)**:
1. **Health Endpoint Verification**:
   ```bash
   # Test health endpoint 3 times
   for i in {1..3}; do
     curl -s https://so-quoteable.vercel.app/api/health | jq '.status'
     sleep 2
   done
   # All should return "healthy"
   ```

2. **Deployment Status Check**:
   - Vercel dashboard: Deployment shows "Ready" status
   - Build logs: No errors or warnings
   - Function cold starts: <1s for API routes

3. **Critical Path Smoke Tests**:
   ```bash
   # Homepage loads
   curl -I https://so-quoteable.vercel.app
   # Expect: HTTP 200

   # Login page loads
   curl -I https://so-quoteable.vercel.app/login
   # Expect: HTTP 200
   ```

**Ongoing (5-15 minutes)**:
4. **Vercel Analytics Monitoring**:
   - Monitor error rate every 5 minutes
   - Alert threshold: >1% errors for 10 minutes
   - Check for:
     - Sudden traffic drops (possible routing issue)
     - Error spikes (new bug introduced)
     - Performance degradation (Web Vitals increase)

5. **Convex Function Monitoring**:
   - Navigate to Convex Logs tab
   - Filter by last 15 minutes
   - Look for:
     - Function errors (red indicators)
     - Slow queries (>500ms execution time)
     - Action failures (email, image uploads)

6. **Manual User Flow Testing**:
   - Visit production site: https://so-quoteable.vercel.app
   - Test login flow (email/password)
   - Verify protected route redirects work
   - Check browser console for errors (should be none)

**Success Criteria for Deployment**:
- ✅ Health endpoint returns 200 OK (3/3 attempts)
- ✅ Error rate <1% in Vercel Analytics
- ✅ No function errors in Convex logs
- ✅ All smoke tests passing
- ✅ No browser console errors
- ✅ User flows functional

**If Any Check Fails**: Immediately assess for rollback (see [Rollback Guide](./rollback.md))

**Incident Response Monitoring** (continuous during incident):

**Every 1 Minute**:
```bash
# Automated monitoring script during incidents
while true; do
  timestamp=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
  response=$(curl -s -w "\nHTTP: %{http_code}\nTime: %{time_total}s" \
    https://so-quoteable.vercel.app/api/health)
  echo "[$timestamp] $response"
  echo "---"
  sleep 60
done
```

**Dashboard Monitoring**:
1. Vercel Analytics: Real-time view (refresh every 30 seconds)
2. Convex Logs: Live stream mode (auto-refresh)
3. Health endpoint: Automated checks every 60 seconds

**Alert Escalation**:
- **2 consecutive health check failures**: Investigate immediately
- **Error rate >5% for 5 minutes**: Consider rollback
- **Zero traffic for 5 minutes**: Check routing/DNS
- **Health endpoint 503 for 2 minutes**: Verify backend connectivity

**Common Monitoring Patterns to Watch**:

**Normal Pattern**:
- Health endpoint: 200 OK, response time <500ms
- Error rate: 0-0.5%
- Function execution: <200ms for queries, <2s for actions
- Traffic: Consistent with historical patterns

**Warning Pattern** (investigate but don't panic):
- Health endpoint: Occasional 503 (1-2x per hour)
- Error rate: 0.5-1%
- Function execution: 200-500ms queries, 2-5s actions
- Traffic: 20-30% deviation from normal

**Critical Pattern** (consider rollback):
- Health endpoint: Consistent 503 (>3 consecutive)
- Error rate: >5%
- Function execution: >1s for queries, >10s for actions
- Traffic: >50% drop or complete outage

**Log Aggregation Workflow**:

**Convex Logs**:
1. Navigate to: https://dashboard.convex.dev/deployment/steady-anaconda-957/logs
2. Use filters:
   - **Time range**: Last 1h, 24h, 7d
   - **Function**: Select specific function (e.g., api.quotes.list)
   - **Severity**: Error, Warn, Info, Debug
3. Search for specific patterns:
   - Error messages: `error`, `exception`, `failed`
   - Performance issues: `timeout`, `slow`
   - User issues: User IDs, email addresses

**Vercel Logs**:
1. Navigate to: https://vercel.com/taylor-hustons-projects/so-quoteable/logs
2. Use filters:
   - **Deployment**: Production only
   - **Time range**: Last hour (for recent issues)
   - **Log level**: Error (for critical issues)
3. CLI alternative:
   ```bash
   # Stream production logs
   vercel logs --prod --follow

   # Search for errors
   vercel logs --prod | grep -i error

   # View specific API route logs
   vercel logs --prod | grep "/api/health"
   ```

**Log Retention**:
- **Convex**: 30 days retention (free tier)
- **Vercel**: Last 1,000 entries (free tier)
- **Recommendation**: Export critical errors to external logging service for long-term retention

**Alerting Strategy** (Post-MVP):
1. **UptimeRobot** (free tier):
   - Monitor `/api/health` every 5 minutes
   - Alert on 503 or timeout (>30s)
   - Notification channels: Email, Slack

2. **Vercel Monitoring** (built-in):
   - Error rate threshold: >1% for 10 minutes
   - Notification via Vercel dashboard

3. **Manual Checks** (MVP approach):
   - Daily health check: 9am local time
   - Post-deployment: Immediate and 15-minute follow-up
   - On-call: Check before bed and after waking

---

## Emergency Procedures

### When to Declare an Emergency

Declare an emergency deployment scenario when:

| Severity | Condition | Response Time |
|----------|-----------|---------------|
| **P0 - Critical** | Production completely down or critical security vulnerability | Immediate (RTO: 5 min) |
| **P1 - High** | Major feature broken, >50% users affected | Urgent (RTO: 15 min) |
| **P2 - Medium** | Minor feature broken, <50% users affected | Standard (RTO: 1 hour) |

### Emergency Rollback Procedure

**Quick Reference**: See [Rollback Guide](./rollback.md) for comprehensive procedures.

**Fastest Rollback Method** (CLI - tested at 39 seconds):

```bash
# 1. List recent production deployments
vercel ls --prod | head -5

# 2. Identify previous working deployment URL
# Example: https://so-quoteable-2bpn5tpnu-taylor-hustons-projects.vercel.app

# 3. Set production alias to previous deployment
vercel alias set <previous-deployment-url> so-quoteable.vercel.app

# 4. Verify rollback
curl https://so-quoteable.vercel.app/api/health
```

**Alternative: Vercel Dashboard Method** (<5 minutes):
1. Go to: https://vercel.com/taylor-hustons-projects/so-quoteable/deployments
2. Find previous working deployment (marked "Production")
3. Click "..." menu → "Promote to Production"
4. Confirm promotion

**Backend Rollback** (if needed):
```bash
# 1. Identify last known-good commit
git log --oneline -10

# 2. Checkout previous commit
git checkout <previous-commit-hash>

# 3. Deploy to production
npx convex deploy

# 4. Return to main branch
git checkout main
```

### Emergency Contact and Escalation

**During Emergency**:
1. Notify team via primary communication channel (Slack/Discord)
2. Post incident status update
3. Assign incident commander
4. Begin incident timeline documentation

**Post-Emergency**:
1. Create incident post-mortem
2. Document lessons learned
3. Update runbook with new procedures
4. Plan prevention measures

### Incident Response Checklist

When production issue occurs:

- [ ] **Assess severity** (P0/P1/P2) - 1 minute
- [ ] **Notify team** - Immediately
- [ ] **Check health endpoint** - Verify issue
- [ ] **Review recent deployments** - Find probable cause
- [ ] **Decide: Rollback or Fix Forward** (see decision criteria below)
- [ ] **Execute rollback** - If decided
- [ ] **Verify resolution** - Health check + smoke test
- [ ] **Monitor for 15 minutes** - Ensure stability
- [ ] **Document incident** - Update WORKLOG
- [ ] **Create post-mortem** - Within 24 hours

### Rollback Decision Criteria

**When to Rollback** (see [Rollback Guide](./rollback.md) for full criteria):

| Scenario | Rollback? | Rationale |
|----------|-----------|-----------|
| All users affected, core functionality broken | ✅ Yes | P0 - Immediate rollback required |
| Security vulnerability discovered | ✅ Yes | P0 - Rollback immediately |
| >50% users affected | ✅ Yes | P1 - Rollback within 15 min |
| Minor bug, <10% users | ❌ No | Fix forward faster than rollback |
| Database schema changed | ⚠️ Maybe | Rollback may break database |

**Fix Forward vs Rollback**:
- **Rollback**: Fast (5 min), temporary solution, use for critical issues
- **Fix Forward**: Slower (30+ min), permanent solution, use for non-critical issues

### Post-Emergency Actions

After emergency is resolved:

1. **Update Team**
   - Post resolution notification
   - Include what was rolled back and why
   - Provide timeline for permanent fix

2. **Document Incident**
   - Create incident report in `pm/incidents/` directory
   - Include timeline, root cause, resolution
   - Document lessons learned

3. **Create Fix**
   - Create hotfix branch: `hotfix/TASK-###-description`
   - Implement permanent fix
   - Add regression test
   - Deploy via normal process

4. **Update Monitoring**
   - Add alerts for similar issues
   - Improve health checks
   - Update runbook with new procedures

---

## Deployment Checklist

### Pre-Deployment Checklist

Before deploying to production, verify:

**Code Quality**:
- [ ] All local tests passing (`npm run test:run`)
- [ ] E2E tests passing (`npm run test:e2e`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] No console.log statements in production code

**Configuration**:
- [ ] Environment variables verified (see [Environment Setup](./environment-setup.md))
- [ ] CONVEX_DEPLOY_KEY is set in GitHub Secrets
- [ ] Feature flags configured (if applicable)

**Documentation**:
- [ ] CHANGELOG.md updated with changes
- [ ] API documentation updated (if API changed)
- [ ] WORKLOG.md updated with task progress

**Review and Approval**:
- [ ] Code review completed (PR approved)
- [ ] Security review (if security-relevant changes)
- [ ] Manual testing completed in local environment
- [ ] Stakeholder approval (if user-facing changes)

### Post-Deployment Checklist

After deployment completes, verify:

**Health Checks**:
- [ ] Health endpoint returns 200 OK
  ```bash
  curl https://so-quoteable.vercel.app/api/health
  ```
- [ ] No errors in health check response
- [ ] Response time <2 seconds

**Smoke Tests**:
- [ ] Homepage loads without errors
- [ ] Login flow works (email/password)
- [ ] Google OAuth sign-in works
- [ ] Protected routes redirect correctly
- [ ] Critical user flows functional

**Monitoring**:
- [ ] Vercel Analytics shows no error spike
- [ ] Error rate <1% (check after 5 minutes)
- [ ] Convex Dashboard shows successful function execution
- [ ] No function errors in Convex logs
- [ ] Response times normal (<2s for queries)

**Communication**:
- [ ] Deployment notification sent to team
- [ ] WORKLOG.md updated with deployment status
- [ ] Known issues documented (if any)
- [ ] Stakeholders notified (if significant release)

### Rollback Checklist

If deployment needs to be rolled back:

**Immediate Actions**:
- [ ] Execute rollback procedure (see [Rollback Guide](./rollback.md))
- [ ] Notify team of rollback
- [ ] Document reason for rollback

**Verification**:
- [ ] Health endpoint returns 200 OK after rollback
- [ ] Previous functionality restored
- [ ] No new errors introduced
- [ ] Monitoring dashboards show healthy state

**Follow-up**:
- [ ] Create incident report
- [ ] Plan fix for rolled-back issue
- [ ] Update tests to catch issue in future
- [ ] Schedule post-mortem meeting

---

## Useful Commands Reference

### Quick Command Cheatsheet

**Local Development**:
```bash
# Start development servers
npm run dev              # Next.js frontend (localhost:3000)
npx convex dev          # Convex backend (WebSocket connection)

# Run tests
npm run test:run        # Unit and integration tests
npm run test:e2e        # End-to-end tests (Playwright)
npm run test:coverage   # Coverage report
npm run type-check      # TypeScript validation
npm run lint            # ESLint check

# Build
npm run build           # Production build
```

**Deployment**:
```bash
# Automatic deployment (recommended)
git push origin main    # Triggers Vercel auto-deploy

# Manual deployment (emergency)
vercel --prod          # Deploy frontend only
npx convex deploy      # Deploy backend only

# View deployments
vercel ls              # List all deployments
vercel ls --prod       # List production deployments only
```

**Monitoring and Debugging**:
```bash
# Health checks
curl https://so-quoteable.vercel.app/api/health  # Production health
curl http://localhost:3000/api/health            # Local health

# Logs
vercel logs            # View recent Vercel logs
vercel logs --follow   # Stream logs in real-time
npx convex logs        # View Convex function logs
npx convex logs --tail 50  # View last 50 log entries

# Environment info
vercel env ls          # List environment variables
vercel whoami          # Show current authenticated user
```

**Rollback**:
```bash
# Frontend rollback (fastest)
vercel ls --prod | head -5                        # List recent deployments
vercel alias set <previous-url> so-quoteable.vercel.app  # Rollback

# Backend rollback
git log --oneline -10                             # List recent commits
git checkout <previous-commit>                    # Checkout previous version
npx convex deploy                                 # Deploy
git checkout main                                 # Return to main
```

**Vercel CLI**:
```bash
# Authentication
vercel login           # Log in to Vercel
vercel logout          # Log out
vercel whoami          # Show current user

# Project management
vercel link            # Link local directory to Vercel project
vercel ls              # List deployments
vercel inspect <url>   # Get deployment details
vercel rm <url>        # Remove deployment

# Deployment
vercel                 # Deploy to preview
vercel --prod          # Deploy to production
vercel --force         # Force new deployment (bypass cache)

# Aliases
vercel alias           # List aliases
vercel alias set <deployment-url> <alias>  # Set alias
vercel alias rm <alias>  # Remove alias

# Environment variables
vercel env ls          # List all environment variables
vercel env add         # Add environment variable
vercel env rm          # Remove environment variable
vercel env pull        # Pull environment variables to .env.local

# Logs
vercel logs <url>      # View logs for specific deployment
vercel logs --follow   # Stream logs in real-time
vercel logs --since 1h # Logs from last hour
```

**Convex CLI**:
```bash
# Development
npx convex dev         # Start development backend
npx convex dev --once  # One-time schema push (no watch)

# Deployment
npx convex deploy      # Deploy to production
npx convex deploy --typecheck=disable  # Deploy without type check

# Logs
npx convex logs        # View function logs
npx convex logs --tail 50  # Last 50 log entries
npx convex logs --follow   # Stream logs in real-time

# Data management
npx convex data export <table> --prod  # Export table data
npx convex data import <file> --prod   # Import table data

# Authentication
npx convex login       # Log in to Convex
npx convex logout      # Log out

# Project info
npx convex dashboard   # Open Convex dashboard in browser
```

**Git Commands**:
```bash
# Deployment workflow
git status             # Check working tree status
git add .              # Stage all changes
git commit -m "message"  # Commit with message
git push origin main   # Push to main (triggers deploy)

# Rollback workflow
git log --oneline -10  # View recent commits
git checkout <commit>  # Checkout specific commit
git revert <commit>    # Revert commit (creates new commit)

# Branch management
git checkout -b feature/TASK-###-description  # Create feature branch
git merge main         # Merge main into current branch
git push origin <branch>  # Push branch to remote
```

**Health and Debugging**:
```bash
# Production health check
curl -i https://so-quoteable.vercel.app/api/health
# -i flag shows headers (status code)

# Test Convex backend directly
curl -I https://steady-anaconda-957.convex.cloud

# JSON formatting
curl https://so-quoteable.vercel.app/api/health | jq .

# Timing test
time curl https://so-quoteable.vercel.app/api/health

# Load test (simple)
for i in {1..10}; do curl https://so-quoteable.vercel.app/api/health; done
```

### Environment-Specific URLs

**Production**:
- Frontend: https://so-quoteable.vercel.app
- Backend: https://steady-anaconda-957.convex.cloud
- Health: https://so-quoteable.vercel.app/api/health
- Vercel Dashboard: https://vercel.com/taylor-hustons-projects/so-quoteable
- Convex Dashboard: https://dashboard.convex.dev/deployment/steady-anaconda-957

**Development**:
- Frontend: http://localhost:3000
- Backend: https://cheery-cow-298.convex.cloud (cloud-connected)
- Health: http://localhost:3000/api/health
- Convex Dashboard: https://dashboard.convex.dev/deployment/cheery-cow-298

**Repository and CI/CD**:
- GitHub: https://github.com/TaylorHuston/soquoteable
- GitHub Actions: https://github.com/TaylorHuston/soquoteable/actions

---

## Related Documentation

- [Rollback Procedures](./rollback.md) - Comprehensive rollback guide (decision criteria, procedures, troubleshooting)
- [Environment Setup](./environment-setup.md) - Environment variables configuration
- [Vercel Setup](./vercel-setup.md) - Vercel project configuration and verification
- [ADR-003: Deployment Strategy](../project/adrs/ADR-003-environment-and-deployment-strategy.md) - Architecture decisions and rationale
- [GitHub Secrets Setup](./github-secrets-setup.md) - CI/CD secrets configuration
- [TASK-006 PLAN.md](../../pm/issues/TASK-006-deployment-pipeline/PLAN.md) - Deployment pipeline task plan
- [TASK-006 WORKLOG.md](../../pm/issues/TASK-006-deployment-pipeline/WORKLOG.md) - Deployment history and lessons learned

---

## Document Maintenance

**Update This Document When**:
- Deployment procedures change
- New tools or commands are introduced
- Common issues are discovered and resolved
- Monitoring dashboards or URLs change
- Emergency procedures are updated

**Review Schedule**: After each major deployment or quarterly

**Document Owner**: DevOps Engineer / Platform Team

---

**Last Updated**: 2025-11-25
**Version**: 1.1.0
**Status**: Phase 6.3 Complete - Enhanced monitoring and observability section
