# Rollback Procedures

**Document Status**: Phase 5.2 Complete
**Last Updated**: 2025-11-23
**Related**: 006 Phase 5.2 - Document rollback procedures

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Reference](#quick-reference)
4. [Decision Criteria](#decision-criteria)
5. [Detailed Procedures](#detailed-procedures)
6. [Rollback Scenarios](#rollback-scenarios)
7. [Post-Rollback Verification](#post-rollback-verification)
8. [Recovery Time Objectives](#recovery-time-objectives)
9. [Rollback Testing](#rollback-testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What is a Rollback?

A rollback is the process of reverting production deployments to a previous known-good state. For So Quotable, this involves rolling back one or both of these components:

- **Frontend**: Vercel deployment (Next.js application)
- **Backend**: Convex deployment (serverless functions and database schema)

### When to Use This Guide

Use rollback procedures when:
- Critical production bugs are discovered post-deployment
- Security vulnerabilities are introduced
- Performance degradation impacts user experience
- Data corruption or loss occurs
- System instability requires immediate action

### Rollback vs. Fix Forward

**Rollback** (revert to previous version):
- Fast recovery (5-15 minutes)
- Temporary solution
- Use for critical production issues

**Fix Forward** (deploy a fix):
- Permanent solution
- Takes longer (30+ minutes)
- Use for non-critical issues

See [Decision Criteria](#decision-criteria) section for detailed guidance.

---

## Prerequisites

Before performing a rollback, ensure you have:

### Access Requirements

- **Vercel Dashboard**: Admin access to https://vercel.com/taylor-hustons-projects/so-quoteable
- **Convex Dashboard**: Admin access to https://dashboard.convex.dev
- **GitHub Repository**: Write access to https://github.com/TaylorHuston/soquoteable
- **Terminal Access**: Command-line access to project repository

### Required Tools

- **Git**: Version control (for backend rollbacks)
- **Convex CLI**: `npx convex` (for backend deployments)
- **Browser**: For Vercel dashboard access

### Knowledge Requirements

- Understanding of which component (frontend/backend) is affected
- Ability to identify the last known-good deployment
- Familiarity with health endpoint verification

---

## Quick Reference

### Emergency Rollback Commands

**Frontend Rollback** (via Vercel Dashboard or CLI):
```
Dashboard Method:
1. Go to: https://vercel.com/taylor-hustons-projects/so-quoteable/deployments
2. Find last known-good deployment
3. Click "..." menu → "Promote to Production"
4. Confirm promotion
⏱️ Expected time: <5 minutes

CLI Method (faster):
vercel alias set <previous-deployment-url> so-quoteable.vercel.app
⏱️ Expected time: <1 minute
```

**Backend Rollback** (via Git + Convex deploy):
```bash
# Option 1: Redeploy from previous git commit
git checkout <previous-commit-hash>
npx convex deploy
git checkout main

# Option 2: Revert commit and push
git revert <bad-commit-hash>
git push origin main

⏱️ Expected time: 5-10 minutes
```

**Health Check Verification**:
```bash
# Quick health check
curl https://so-quoteable.vercel.app/api/health

# Expected response (200 OK):
# {"status":"healthy","timestamp":"...","service":"quotable-api","convex":{...}}
```

---

## Decision Criteria

### When to Rollback

Perform an immediate rollback when:

| Severity | Condition | RTO Target | Example |
|----------|-----------|------------|---------|
| **P0 - Critical** | All users affected, core functionality broken | 5 minutes | Cannot load homepage, authentication completely broken |
| **P0 - Security** | Security vulnerability discovered | 5 minutes | Authentication bypass, data exposure |
| **P0 - Data** | Data corruption or loss | 5 minutes | Database writes failing, user data corrupted |
| **P1 - High** | >50% users affected OR critical feature broken | 15 minutes | Image uploads failing for all users, login broken for 50%+ |
| **P1 - Performance** | Performance degradation >80% | 15 minutes | Page load time 10s+ (previously <2s) |

### When to Fix Forward

Deploy a fix instead of rolling back when:

| Scenario | Rationale | Example |
|----------|-----------|---------|
| **Minor bugs** | <10% of users affected | Typo in UI text, minor styling issue |
| **Non-critical features** | Core functionality works | Optional feature has bug, non-critical API endpoint fails |
| **Quick fixes** | Fix can be deployed in <30 minutes | Simple code change, configuration update |
| **Schema changes** | Database schema has changed | New tables added, backward-incompatible changes |
| **Workaround exists** | Users can work around the issue | Feature accessible via alternative path |

### Decision Flowchart

```
Is production completely broken?
├─ YES → Immediate rollback (P0)
└─ NO
    └─ Are >50% of users affected?
        ├─ YES → Rollback (P1)
        └─ NO
            └─ Can fix be deployed in <30 minutes?
                ├─ YES → Fix forward
                └─ NO → Rollback (P1)
```

---

## Detailed Procedures

### Frontend Rollback (Vercel)

Vercel provides instant rollback via dashboard. This is the fastest rollback method.

#### Step-by-Step Procedure

**Step 1: Access Vercel Deployments**
1. Navigate to: https://vercel.com/taylor-hustons-projects/so-quoteable
2. Click **"Deployments"** tab in top navigation
3. You will see list of all deployments sorted by date (newest first)

**Step 2: Identify Last Known-Good Deployment**
1. Look for deployments with "Production" badge
2. Identify the deployment BEFORE the problematic one
3. Verify deployment details:
   - **Status**: Ready (green checkmark)
   - **Branch**: main
   - **Commit Message**: Review to confirm it's the correct version
   - **Deployed Time**: Timestamp before issue started

**Step 3: Promote Previous Deployment to Production**
1. Click **"..."** (three dots) menu on the right side of deployment row
2. Select **"Promote to Production"**
3. Confirmation modal appears with deployment details
4. Review:
   - Commit hash
   - Deployment time
   - Preview URL (you can click to verify before promoting)
5. Click **"Promote"** button to confirm

**Step 4: Wait for Promotion**
1. Vercel switches DNS to previous deployment (instant)
2. Wait 30-60 seconds for CDN cache invalidation
3. Monitor deployment status (changes to "Production")

**Step 5: Verify Rollback**
1. Visit: https://so-quoteable.vercel.app
2. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Verify issue is resolved
4. Check health endpoint: `curl https://so-quoteable.vercel.app/api/health`
5. Test critical user flows (see [Post-Rollback Verification](#post-rollback-verification))

#### Expected Time: <5 minutes (Dashboard), <1 minute (CLI)

**Breakdown (Dashboard Method)**:
- Step 1-2 (Find deployment): 1 minute
- Step 3 (Promote): 30 seconds
- Step 4 (DNS propagation): 1-2 minutes
- Step 5 (Verification): 2 minutes

**Breakdown (CLI Method)**:
- Find deployment URL: 30 seconds
- Execute alias command: 1-5 seconds
- DNS propagation: 30-60 seconds
- Verification: 30 seconds
- **Total: ~2 minutes**

#### Alternative: Vercel CLI Rollback (Faster)

For fastest rollback (tested at 39 seconds):

```bash
# 1. List recent production deployments
vercel ls --prod | head -5

# 2. Identify previous deployment URL (second in list)
# Example: https://so-quoteable-2bpn5tpnu-taylor-hustons-projects.vercel.app

# 3. Set production alias to previous deployment
vercel alias set so-quoteable-2bpn5tpnu-taylor-hustons-projects.vercel.app so-quoteable.vercel.app

# 4. Verify rollback
curl https://so-quoteable.vercel.app/api/health
```

**Advantages of CLI Method**:
- Faster execution (1-2 minutes vs 3-5 minutes)
- No browser/dashboard access needed
- Can be scripted for automation
- Direct command-line feedback

**When to Use CLI Method**:
- Emergency incidents requiring fastest possible rollback
- Dashboard is slow or unresponsive
- Scripted rollback procedures
- Remote access without browser available

#### Rollback Impact

- **Zero Downtime**: DNS switch is instant, no service interruption
- **CDN Cache**: May take 1-2 minutes to fully propagate
- **User Sessions**: Not affected (session data in database, not frontend)
- **Database**: Not affected (database state unchanged)

---

### Backend Rollback (Convex)

Convex deployments are immutable and cannot be rolled back directly via dashboard. Rollback requires redeploying previous code version.

#### Important Considerations

**Schema Changes**:
- If database schema changed between deployments, rollback may fail
- Backward-incompatible schema changes require data migration
- Always check commit history for schema changes before rolling back

**Data Persistence**:
- Data in Convex database persists across deployments
- Rollback does NOT restore database state
- If data corruption occurred, may need separate data recovery

#### Method 1: Redeploy from Previous Git Commit (Recommended)

**Use when**: You know the exact commit to roll back to

**Step 1: Identify Last Known-Good Commit**
```bash
# Navigate to project directory
cd /home/taylor/src/quotable

# View recent production deployments
git log --oneline -10

# Example output:
# abc123d Fix: Update quote display
# def456e Feature: Add new quote source  ← Current (broken)
# ghi789f Fix: Improve image loading      ← Last known-good
```

**Step 2: Checkout Previous Commit**
```bash
# Checkout the last known-good commit
git checkout <previous-commit-hash>

# Example:
# git checkout ghi789f
```

**Step 3: Deploy to Production**
```bash
# Deploy to Convex production
npx convex deploy

# Confirm deployment when prompted
# Type 'y' and press Enter
```

**Step 4: Return to Main Branch**
```bash
# Return to main branch
git checkout main

# DO NOT PUSH - this keeps main branch intact for fixing
```

**Step 5: Verify Backend Rollback**
```bash
# Test Convex backend via health endpoint
curl https://so-quoteable.vercel.app/api/health

# Expected: 200 OK with healthy status

# Verify in Convex dashboard
# 1. Go to: https://dashboard.convex.dev
# 2. Select production deployment: steady-anaconda-957
# 3. Check "Functions" tab - should show previous version
# 4. Check "Data" tab - verify database tables intact
```

#### Expected Time: 5-10 minutes

**Breakdown**:
- Step 1 (Identify commit): 2 minutes
- Step 2 (Checkout): 10 seconds
- Step 3 (Deploy): 2-3 minutes
- Step 4 (Return to main): 10 seconds
- Step 5 (Verification): 2-3 minutes

---

#### Method 2: Revert Commit and Push (Permanent Rollback)

**Use when**: You want to permanently remove the problematic commit

**Step 1: Identify Bad Commit**
```bash
# Navigate to project directory
cd /home/taylor/src/quotable

# Find the commit that introduced the issue
git log --oneline -10

# Note the commit hash to revert
```

**Step 2: Revert the Commit**
```bash
# Revert the bad commit (creates new commit that undoes changes)
git revert <bad-commit-hash>

# Git will open editor for commit message
# Default message: "Revert '<original commit message>'"
# Save and close editor
```

**Step 3: Push to Trigger Deployment**
```bash
# Push revert commit to main branch
git push origin main

# This triggers automatic Vercel deployment
# Convex backend will deploy via Vercel build hook
```

**Step 4: Monitor Deployment**
```bash
# Watch Vercel deployment progress
# Go to: https://vercel.com/taylor-hustons-projects/so-quoteable/deployments

# Wait for "Ready" status (green checkmark)
```

**Step 5: Verify Rollback**
```bash
# Test health endpoint
curl https://so-quoteable.vercel.app/api/health

# Verify in browser
# Visit: https://so-quoteable.vercel.app
```

#### Expected Time: 5-10 minutes

**Breakdown**:
- Step 1 (Identify commit): 2 minutes
- Step 2 (Revert): 1 minute
- Step 3 (Push): 30 seconds
- Step 4 (Wait for deployment): 2-3 minutes
- Step 5 (Verification): 2-3 minutes

---

#### Method 3: Emergency Manual Deployment (Last Resort)

**Use when**: Git history is unclear or complex

**Step 1: Find Working Code**
```bash
# Check out the branch/commit that was working
git checkout <known-good-commit>

# OR restore from local backup if available
```

**Step 2: Deploy Directly**
```bash
# Deploy current working directory to production
npx convex deploy

# Confirm deployment
```

**Step 3: Document Action**
```bash
# Record what was deployed for future reference
git log -1 > /tmp/emergency-rollback-$(date +%Y%m%d-%H%M%S).log

# Save this log file for incident review
```

**Step 4: Return to Main**
```bash
git checkout main
```

#### Expected Time: 10-15 minutes

---

### Full-Stack Rollback

When both frontend and backend need to be rolled back.

#### Scenario: Coordinated Release Rollback

**Use when**: A feature release affected both frontend and backend

**Procedure**:

1. **Rollback Frontend First** (fastest, stops user-facing issues)
   - Follow [Frontend Rollback](#frontend-rollback-vercel) procedure
   - Expected time: <5 minutes

2. **Then Rollback Backend** (resolves backend errors)
   - Follow [Backend Rollback](#backend-rollback-convex) procedure
   - Expected time: 5-10 minutes

3. **Verify Both Components**
   - Test health endpoint
   - Verify critical user flows
   - Monitor error rates

#### Total Expected Time: 10-15 minutes

---

## Rollback Scenarios

### Scenario 1: Frontend-Only Issue

**Example**: UI bug causing layout issues, JavaScript error breaking page functionality

**Symptoms**:
- Users report UI problems
- Console errors in browser DevTools
- Backend API calls succeed (health endpoint returns 200 OK)

**Rollback Procedure**:
1. Follow [Frontend Rollback (Vercel)](#frontend-rollback-vercel) procedure
2. Verify health endpoint: `curl https://so-quoteable.vercel.app/api/health`
3. Test affected UI in browser
4. Monitor Vercel Analytics for error rate decrease

**No Backend Rollback Needed**: Backend remains stable

**Recovery Time**: <5 minutes

---

### Scenario 2: Backend-Only Issue

**Example**: Convex function error, database query performance issue, action failing

**Symptoms**:
- Frontend loads but API calls fail
- Health endpoint returns 503 Service Unavailable
- Convex dashboard shows function errors
- Frontend may display "Could not connect to server" messages

**Rollback Procedure**:
1. Follow [Backend Rollback (Convex)](#backend-rollback-convex) procedure
2. Verify health endpoint returns 200 OK
3. Test affected functionality (e.g., quote creation, image upload)
4. Monitor Convex dashboard for error rate

**No Frontend Rollback Needed**: Frontend code remains stable

**Recovery Time**: 5-10 minutes

---

### Scenario 3: Full-Stack Feature Rollback

**Example**: New feature affecting both frontend and backend (e.g., new quote editor UI + backend quote processing)

**Symptoms**:
- New feature broken across UI and backend
- Multiple components failing
- Feature introduced in same deployment affecting both layers

**Rollback Procedure**:
1. **Frontend Rollback** (immediate user impact reduction)
   - Follow [Frontend Rollback (Vercel)](#frontend-rollback-vercel)
   - Expected time: <5 minutes

2. **Backend Rollback** (complete feature removal)
   - Follow [Backend Rollback (Convex)](#backend-rollback-convex)
   - Expected time: 5-10 minutes

3. **Verification**:
   - Test entire user flow end-to-end
   - Verify feature is completely disabled
   - Check health endpoint
   - Monitor both Vercel and Convex dashboards

**Recovery Time**: 10-15 minutes

---

### Scenario 4: Database Schema Change Issue

**Example**: New database table or column causing issues, schema migration failure

**Symptoms**:
- Convex functions failing with schema errors
- Database queries returning unexpected results
- Convex dashboard shows schema validation errors

**Special Considerations**:
- **Backward Compatibility**: Check if old code works with new schema
- **Data Migration**: May need to undo data migrations
- **Deployment Order**: May need to rollback frontend first to prevent errors

**Rollback Procedure**:

**Option A: Schema is Backward Compatible**
1. Rollback backend code only (schema remains)
2. Verify old functions work with new schema
3. Fix forward with proper migration

**Option B: Schema is NOT Backward Compatible**
1. **DO NOT ROLLBACK** - will break database
2. Fix forward with emergency patch
3. Or perform manual schema rollback via Convex dashboard:
   - Remove new tables/fields
   - Restore previous schema snapshot (if available)
   - Then rollback backend code

**Recommended Approach**: Fix forward with schema compatibility fix

**Recovery Time**: 30-60 minutes (requires careful data handling)

**Prevention**: Always use backward-compatible schema changes (add fields as optional, never remove/rename without migration plan)

---

## Post-Rollback Verification

After completing any rollback, verify production is healthy using these checks.

### 1. Health Endpoint Check

**Purpose**: Verify backend connectivity and database access

```bash
# Test health endpoint
curl -i https://so-quoteable.vercel.app/api/health

# Expected response:
# HTTP/2 200
# content-type: application/json
#
# {"status":"healthy","timestamp":"2025-11-23T...","service":"quotable-api","convex":{...}}
```

**Success Criteria**:
- ✅ HTTP 200 status code
- ✅ `"status": "healthy"`
- ✅ `"convex": {"status": "ok"}`
- ✅ Response time <2 seconds

**If Failed**: Rollback did not complete successfully, investigate further

---

### 2. Smoke Tests (Critical User Flows)

**Test Basic Functionality**:

#### Test 1: Homepage Load
```
1. Visit: https://so-quoteable.vercel.app
2. Verify: Page loads without errors
3. Verify: Quote display renders correctly
4. Check: Browser console for errors (should be none)
```

#### Test 2: Authentication Flow (if auth is implemented)
```
1. Visit: https://so-quoteable.vercel.app/login
2. Verify: Login page loads
3. Test: Login with test account
4. Verify: Successful authentication
5. Verify: Redirect to dashboard/home
```

#### Test 3: Quote Display (Core Feature)
```
1. Navigate to quote list or homepage
2. Verify: Quotes load from backend
3. Verify: Images display correctly
4. Check: Network tab shows successful API calls to Convex
```

#### Test 4: Image Upload (if implemented)
```
1. Navigate to upload interface
2. Test: Upload test image
3. Verify: Upload succeeds
4. Verify: Image appears in Cloudinary dashboard
```

---

### 3. Monitoring Checks

**Vercel Analytics**:
1. Navigate to: https://vercel.com/taylor-hustons-projects/so-quoteable/analytics
2. Check: Error rate (should be <1%)
3. Check: Page load performance (should be <2s average)
4. Monitor: Real-time visitor activity

**Convex Dashboard**:
1. Navigate to: https://dashboard.convex.dev
2. Select production deployment: steady-anaconda-957
3. Check: Function logs for errors (should see normal activity)
4. Check: Database queries executing successfully
5. Monitor: Real-time function invocations

**Key Metrics**:
- Error rate should return to pre-deployment baseline
- Response times should be normal (<2s)
- No spike in 500/503 errors

---

### 4. User Communication

After rollback verification:

1. **Notify Team**:
   - Post in team chat/Slack
   - Include: What was rolled back, why, current status
   - Example: "Rolled back v1.2.3 deployment due to login issue. Production now stable on v1.2.2."

2. **Update Status Page** (if exists):
   - Mark incident as resolved
   - Post brief explanation
   - Provide timeline for fix

3. **Document Incident**:
   - Create post-mortem document
   - Record what went wrong
   - Document rollback procedure used
   - Plan prevention for future

---

### Verification Checklist

Use this checklist after every rollback:

- [ ] Health endpoint returns 200 OK
- [ ] Homepage loads without errors
- [ ] Authentication works (if applicable)
- [ ] Core features functional (quote display, image upload)
- [ ] No JavaScript errors in browser console
- [ ] Vercel Analytics shows normal error rates
- [ ] Convex dashboard shows healthy function execution
- [ ] Response times under 2 seconds
- [ ] Team notified of rollback completion
- [ ] Incident documented in WORKLOG or post-mortem

---

## Recovery Time Objectives

Recovery Time Objective (RTO) is the maximum acceptable time to restore service after an incident.

### RTO Targets by Severity

| Severity | RTO Target | Rollback Method | Components |
|----------|------------|-----------------|------------|
| **P0 - Critical** | **5 minutes** | Vercel instant rollback | Frontend only |
| **P1 - High** | **15 minutes** | Vercel + Convex rollback | Frontend + Backend |
| **P2 - Medium** | **30 minutes** | Full rollback + verification | Full stack + testing |
| **P3 - Low** | **1 hour** | Fix forward preferred | With post-mortem |

### Component-Specific RTO

| Component | Method | RTO | Notes |
|-----------|--------|-----|-------|
| **Vercel Frontend** | Dashboard rollback | <5 minutes | Instant DNS switch |
| **Convex Backend** | Git + redeploy | 5-10 minutes | Requires deployment |
| **Full Stack** | Sequential rollback | 10-15 minutes | Frontend first, then backend |
| **Schema Change** | Fix forward | 30-60 minutes | Rollback not recommended |

### RTO Achievement Factors

**Factors Enabling Fast Recovery**:
- ✅ Vercel immutable deployments (instant rollback)
- ✅ Git version history (easy code recovery)
- ✅ Automated health checks (quick verification)
- ✅ Clear rollback documentation (this guide)

**Factors Slowing Recovery**:
- ⚠️ Database schema changes (requires data migration)
- ⚠️ Complex multi-component failures
- ⚠️ Unclear deployment history (hard to identify good version)
- ⚠️ Lack of monitoring (hard to verify success)

---

## Rollback Testing

Practice rollback procedures to ensure smooth execution during actual incidents.

### Recommended Rollback Drill Schedule

**Quarterly Drills** (every 3 months):
- Test frontend rollback via Vercel
- Test backend rollback via Convex
- Verify health checks work
- Update documentation with learnings

**After Major Releases**:
- Verify rollback procedure works with new changes
- Confirm no breaking schema changes
- Test emergency rollback on staging (if exists)

---

### Test Rollback Procedure (Non-Production)

**Goal**: Practice rollback without affecting production users

**Safe Testing Approach**:

#### Test 1: Vercel Frontend Rollback (Preview Environment)

1. **Create Test Deployment**:
   ```bash
   # Create test branch
   git checkout -b test-rollback-drill

   # Make trivial change
   echo "# Rollback test" >> README.md

   # Commit and push
   git add README.md
   git commit -m "test: rollback drill"
   git push origin test-rollback-drill
   ```

2. **Wait for Preview Deployment**:
   - Check Vercel dashboard for preview URL
   - Note deployment ID

3. **Practice Rollback Steps** (on preview, not production):
   - Go to Vercel dashboard → Deployments
   - Find preview deployment
   - Practice finding previous deployment
   - **DO NOT promote to production**
   - Just verify you know the process

4. **Cleanup**:
   ```bash
   git checkout main
   git branch -D test-rollback-drill
   git push origin --delete test-rollback-drill
   ```

---

#### Test 2: Convex Backend Rollback (Development Environment)

**IMPORTANT**: Test on development deployment, NOT production

1. **Verify Development Deployment**:
   ```bash
   # Make sure you're using dev deployment
   cat .env.local | grep CONVEX_URL
   # Should see: NEXT_PUBLIC_CONVEX_URL=https://cheery-cow-298.convex.cloud
   ```

2. **Test Rollback Steps**:
   ```bash
   # Find a previous commit
   git log --oneline -5

   # Practice checkout (don't deploy to prod!)
   git checkout HEAD~1

   # View current state
   npx convex dev --once

   # Return to latest
   git checkout main
   ```

3. **Practice Deployment** (dev only):
   ```bash
   # Deploy to DEV (not production)
   npx convex dev

   # Verify dev deployment updated
   # Check dev Convex dashboard
   ```

**DO NOT run `npx convex deploy` during drills** - this deploys to production!

---

### Rollback Drill Verification Checklist

After each drill, verify:

- [ ] Team members know how to access Vercel dashboard
- [ ] Team members know how to access Convex dashboard
- [ ] Everyone understands difference between dev and prod deployments
- [ ] Health endpoint verification process is clear
- [ ] Communication channels are established
- [ ] Documentation is up-to-date
- [ ] RTO targets are achievable
- [ ] Any drill issues documented and resolved

---

### What to Verify During Drills

**Documentation Accuracy**:
- [ ] URLs are correct (Vercel project, Convex dashboard)
- [ ] Commands work as documented
- [ ] Screenshots match current UI (if any)
- [ ] RTO targets are realistic

**Process Effectiveness**:
- [ ] Rollback can be completed within RTO
- [ ] Health checks successfully verify rollback
- [ ] Team communication is clear
- [ ] Incident escalation path is understood

**Tooling Readiness**:
- [ ] Vercel dashboard access works
- [ ] Convex CLI is installed and authenticated
- [ ] Git repository is accessible
- [ ] Monitoring dashboards are accessible

---

## Troubleshooting

### Issue: Vercel Rollback Doesn't Fix Problem

**Symptoms**: Promoted previous deployment, but issue persists

**Possible Causes**:
1. **Backend Issue**: Problem is in Convex backend, not frontend
2. **CDN Caching**: Old version still cached in CDN
3. **Browser Caching**: User's browser cached broken version

**Solutions**:

1. **Verify Backend Health**:
   ```bash
   curl https://so-quoteable.vercel.app/api/health
   ```
   If returns 503, backend is the issue → rollback Convex

2. **Clear CDN Cache**:
   - Go to Vercel dashboard → Project Settings
   - Find "Purge Cache" or wait 2-3 minutes for automatic invalidation

3. **Test with Cache Bypass**:
   ```bash
   # Add cache-busting query parameter
   curl "https://so-quoteable.vercel.app/?nocache=$(date +%s)"
   ```

4. **Clear Browser Cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or open in incognito/private window

---

### Issue: Convex Deployment Fails During Rollback

**Symptoms**: `npx convex deploy` fails with error

**Possible Causes**:
1. **Schema Validation Error**: Old code incompatible with current schema
2. **Authentication Issue**: CONVEX_DEPLOY_KEY invalid or expired
3. **Network Issue**: Cannot reach Convex Cloud

**Solutions**:

1. **Check Schema Compatibility**:
   ```bash
   # Review schema changes between versions
   git diff <current-commit> <rollback-commit> -- convex/schema.ts

   # If schema changed significantly, fix forward instead of rollback
   ```

2. **Verify Authentication**:
   ```bash
   # Check if authenticated
   npx convex dev --once

   # If fails, re-authenticate
   npx convex login
   ```

3. **Check Network Connectivity**:
   ```bash
   # Test connection to Convex Cloud
   curl -I https://steady-anaconda-957.convex.cloud

   # Should return 200 OK or 301/302
   ```

4. **Review Deployment Logs**:
   - Check Convex dashboard → Production Deployment → Logs
   - Look for specific error messages
   - Search Convex documentation for error code

**Last Resort**: Use emergency manual deployment (Method 3)

---

### Issue: Health Endpoint Returns 503 After Rollback

**Symptoms**: Rollback completed, but `/api/health` returns 503 Service Unavailable

**Possible Causes**:
1. **Convex Backend Not Rolled Back**: Frontend rolled back but backend still broken
2. **Environment Variables**: Missing or incorrect NEXT_PUBLIC_CONVEX_URL
3. **Convex Deployment Down**: Convex service issue

**Solutions**:

1. **Verify Convex Backend**:
   ```bash
   # Test Convex directly
   curl -I https://steady-anaconda-957.convex.cloud

   # Should return 200 OK
   ```

2. **Check Environment Variables**:
   - Go to Vercel dashboard → Settings → Environment Variables
   - Verify NEXT_PUBLIC_CONVEX_URL = `https://steady-anaconda-957.convex.cloud`
   - If changed, redeploy frontend

3. **Check Convex Dashboard**:
   - Go to https://dashboard.convex.dev
   - Verify production deployment status
   - Check function logs for errors

4. **Rollback Convex Backend**:
   - Follow [Backend Rollback](#backend-rollback-convex) procedure
   - Deploy previous working version

---

### Issue: Can't Find Last Known-Good Deployment

**Symptoms**: Unsure which deployment was working

**Solutions**:

1. **Check Deployment History**:
   ```bash
   # View recent commits with details
   git log --oneline --decorate -10

   # Check deployment times
   git log --pretty=format:"%h - %an, %ar : %s" -10
   ```

2. **Review Vercel Deployment List**:
   - Go to Vercel dashboard → Deployments
   - Look for "Production" badge
   - Check deployment times against incident start time
   - Last production deployment BEFORE incident = likely good

3. **Check Git Tags** (if used):
   ```bash
   # List recent tags
   git tag -l --sort=-version:refname | head -10

   # Tags often mark releases
   ```

4. **Ask Team**:
   - Check team chat for deployment notifications
   - Review recent PRs merged to main
   - Check WORKLOG.md for deployment records

5. **Test Multiple Versions**:
   - If unsure, checkout multiple previous commits
   - Test each in development environment
   - Deploy the verified working version

---

### Issue: Rollback Takes Longer Than RTO

**Symptoms**: Rollback exceeding target recovery time

**Immediate Actions**:

1. **Prioritize Frontend Rollback**:
   - Rollback Vercel first (<5 min)
   - Fixes user-facing issues immediately
   - Backend rollback can follow

2. **Skip Verification Steps**:
   - Do minimal verification during rollback
   - Deep verification can happen after service restored
   - Quick smoke test only: health endpoint + homepage

3. **Get Help**:
   - Escalate to senior team member
   - Parallel work: One person rollback, another investigate root cause
   - Document what's taking time for future improvement

**Post-Incident**:
- Review what caused delay
- Update documentation with faster procedures
- Consider automation for slow steps
- Adjust RTO if targets were unrealistic

---

### Issue: Database Data Needs Rollback

**Symptoms**: Rollback successful, but data is corrupted or incorrect

**Important**: Convex does NOT support database snapshots/rollback in free tier

**Solutions**:

1. **Check Convex Backup Policy**:
   - Convex may have automatic backups (verify in dashboard)
   - Contact Convex support for data recovery options

2. **Manual Data Repair**:
   ```bash
   # Export affected data
   npx convex data export people --prod

   # Review and manually fix data
   # Re-import corrected data
   npx convex data import people.json --prod
   ```

3. **Restore from Application Backups** (if implemented):
   - Check if application has data export/backup
   - Restore from last known-good backup

4. **Fix Forward with Data Migration**:
   - Write Convex mutation to fix corrupted data
   - Deploy fix
   - Run migration

**Prevention**: Implement regular data exports for critical tables

---

### Issue: Rollback Causes New Issues

**Symptoms**: Rolled back successfully, but introduced different problems

**Possible Causes**:
1. **Rolled Back Too Far**: Went to version older than needed
2. **Partial Rollback**: Only rolled back one component, not both
3. **External Dependencies Changed**: Third-party services (Cloudinary, etc.) changed

**Solutions**:

1. **Identify What Broke**:
   - Check health endpoint
   - Review browser console errors
   - Check Convex function logs

2. **Roll Forward to Middle Version**:
   ```bash
   # If rolled back too far, deploy a middle version
   git log --oneline -20
   # Find version between rollback and broken version
   git checkout <middle-commit>
   npx convex deploy
   ```

3. **Fix Forward with Patch**:
   - Identify specific issue
   - Create minimal fix
   - Deploy patch on top of rollback

4. **Complete Rollback**:
   - If only rolled back one component, rollback the other
   - Ensure frontend and backend versions are compatible

---

## Related Documentation

- [Vercel Setup Documentation](./vercel-setup.md) - Deployment configuration
- [Environment Variables Setup](./environment-setup.md) - Environment configuration
- [ADR-003: Deployment Strategy](../project/adrs/ADR-003-environment-and-deployment-strategy.md) - Architecture decisions
- [GitHub Secrets Setup](./github-secrets-setup.md) - CI/CD configuration
- [006 PLAN.md](../../pm/issues/006-deployment-pipeline/PLAN.md) - Deployment pipeline setup
- [006 WORKLOG.md](../../pm/issues/006-deployment-pipeline/WORKLOG.md) - Deployment history and lessons learned

---

## Document Maintenance

**Update This Document When**:
- RTO targets change based on actual incident data
- New rollback methods are discovered
- Deployment infrastructure changes (Vercel, Convex upgrades)
- Post-incident reviews identify documentation gaps
- Rollback drills reveal process improvements

**Review Schedule**: Quarterly (after each rollback drill)

**Document Owner**: DevOps Engineer / Platform Team

---

**Last Updated**: 2025-11-23
**Version**: 1.0.0
**Status**: Phase 5.2 Complete
