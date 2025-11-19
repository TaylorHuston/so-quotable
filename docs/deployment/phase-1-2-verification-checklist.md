# Phase 1.2 Verification Checklist: Vercel Build Configuration

**Task**: TASK-006 Phase 1.2 - Configure build settings for Next.js
**Last Updated**: 2025-11-19
**Status**: Ready for Manual Verification

## Overview

This checklist verifies that Vercel has correctly auto-detected the Next.js framework and configured optimal build settings. Most configuration should be automatic, but manual verification ensures everything is correct.

## Automated Verification ✅

Run the automated verification script first:

```bash
./scripts/verify-vercel-build-config.sh
```

**Expected Result**: All 12 tests should pass with 0 failures and 0 warnings.

**Automated Tests Cover**:
- ✅ Next.js framework installed (v16.0.1+)
- ✅ Node.js version configured (.nvmrc and package.json engines)
- ✅ Build command configured (`npm run build`)
- ✅ Output directory is default (.next)
- ✅ Lockfile present for dependency caching (package-lock.json)
- ✅ Vercel project linked
- ✅ Environment variables configured locally
- ✅ Incremental builds enabled
- ✅ .gitignore properly configured

## Manual Verification Required

### Step 1: Access Vercel Dashboard

1. Open browser and navigate to: https://vercel.com/
2. Navigate to: Projects → **so-quoteable**
3. Click on **Settings** tab

### Step 2: Verify Build & Development Settings

**Navigation**: Settings → Build & Development Settings

Verify the following configuration:

#### Framework Preset
- [ ] **Framework Preset**: Automatically detected as **Next.js**
  - Location: Settings → Build & Development Settings → Framework Preset
  - Expected: "Next.js" shown with auto-detect badge
  - Screenshot location: Should show Next.js logo and version

#### Build Command
- [ ] **Build Command**: Empty or not overridden
  - Expected: Field should be empty (uses `next build` from package.json)
  - If populated: Should be `npm run build` or `next build --webpack`
  - Note: Our package.json has `"build": "next build --webpack"`

#### Output Directory
- [ ] **Output Directory**: Empty or not overridden
  - Expected: Field should be empty (uses default `.next` directory)
  - If populated: Should be `.next`
  - Note: Next.js always outputs to .next unless explicitly configured otherwise

#### Install Command
- [ ] **Install Command**: Empty or not overridden
  - Expected: Field should be empty (uses `npm ci` or `npm install`)
  - If populated: Should be `npm ci` or `npm install`

#### Development Command
- [ ] **Development Command**: Empty or not overridden
  - Expected: Field should be empty (uses `npm run dev`)
  - If populated: Should be `npm run dev` or `next dev`

### Step 3: Verify Node.js Version

**Navigation**: Settings → Build & Development Settings → Node.js Version

- [ ] **Node.js Version**: Automatically detected or manually set to **20.x**
  - Expected: "20.x" selected (matches package.json engines: >=20.9.0)
  - Source: Vercel reads from package.json `engines.node` field and `.nvmrc`
  - Minimum: 20.9.0 (as specified in package.json)
  - Note: Vercel will use the latest Node.js 20.x LTS version

**Verification**:
```json
// package.json engines field
"engines": {
  "node": ">=20.9.0",
  "npm": ">=10.0.0"
}
```

```
// .nvmrc file
20.9.0
```

### Step 4: Verify Build Optimization Settings

**Navigation**: Settings → Build & Development Settings

#### Build Performance
- [ ] **Automatically enable Incremental Builds**: Should be ON (default for Next.js)
  - Expected: Toggle should be enabled
  - Benefit: Faster builds by caching unchanged pages
  - Note: Vercel automatically enables this for Next.js projects

#### Caching
- [ ] **Caching**: Enabled by default
  - Expected: Vercel caches `node_modules`, `.next` directory, and build artifacts
  - Verification: First build after fresh git push is slow, subsequent builds are fast
  - Note: No manual configuration needed

### Step 5: Verify Root Directory

**Navigation**: Settings → Build & Development Settings → Root Directory

- [ ] **Root Directory**: Empty (uses repository root)
  - Expected: Field should be empty or set to `.` or `/`
  - Note: Our Next.js app is at the repository root, not in a subdirectory

### Step 6: Verify Build Output Settings

**Navigation**: Settings → Build & Development Settings

- [ ] **Include Source Maps**: Optional (can be enabled for production debugging)
  - Default: Typically disabled for production (smaller bundles)
  - Recommendation: Leave default unless you need production debugging

- [ ] **Automatically expose System Environment Variables**: Should be OFF
  - Security: Prevents accidental exposure of system vars to client-side code
  - Note: We explicitly configure only required environment variables

### Step 7: Test Build Deployment

Run a test deployment to verify build settings work correctly:

#### Option A: Test via Git Push
```bash
# Make a trivial change
git checkout feature/TASK-006-deployment-pipeline
echo "# Build test" >> README.md
git add README.md
git commit -m "test: verify build configuration"
git push origin feature/TASK-006-deployment-pipeline
```

#### Option B: Test via Vercel CLI
```bash
# Deploy to preview environment
vercel
```

**Expected Deployment Behavior**:
1. ✅ Vercel detects Next.js framework automatically
2. ✅ Build command runs: `npm run build` (which executes `next build --webpack`)
3. ✅ Dependencies installed with npm ci (or npm install)
4. ✅ Node.js 20.x used for build
5. ✅ Build completes successfully
6. ✅ Build artifacts cached for next deployment
7. ✅ Preview URL accessible

**Verification Steps**:
- [ ] **Check deployment logs**: Settings → Deployments → [Latest Deployment] → View Function Logs
  - Should show: "Detected Next.js" or similar framework detection message
  - Should show: "Running build command: npm run build" or default command
  - Should show: Node.js version (should be 20.x)
  - Should show: Successful build completion

- [ ] **Check build time**:
  - First build: 2-5 minutes (installing deps + building)
  - Subsequent builds: 30 seconds - 2 minutes (cached deps + incremental builds)

- [ ] **Check preview URL**:
  - Preview deployment should be accessible at generated URL
  - Application should load correctly
  - Next.js should be serving the application

### Step 8: Verify Build Cache Effectiveness

**Test Incremental Builds**:

1. Make a small code change (e.g., update a component)
2. Push to same branch
3. Observe second build time

**Expected**:
- [ ] **Second build significantly faster** (50-80% faster than first build)
- [ ] **Deployment logs show**: "Build cache restored" or similar message
- [ ] **node_modules not reinstalled** (unless package.json changed)

### Step 9: Document Actual Configuration

After verification, document what you found:

**Framework Detection**:
- Framework: Next.js v______
- Auto-detected: Yes / No
- Build command: _______________
- Output directory: _______________

**Node.js Version**:
- Version selected: _______________
- Source: package.json / .nvmrc / manual

**Build Performance**:
- First build time: _______ seconds
- Second build time: _______ seconds
- Cache effectiveness: _______% faster

**Issues Encountered** (if any):
- Issue: _______________
- Resolution: _______________

## Troubleshooting

### Issue: Framework not auto-detected

**Symptoms**: Vercel doesn't recognize project as Next.js

**Solutions**:
1. Verify `next` is in package.json dependencies
2. Verify `package.json` has `"build": "next build"` script
3. Manually select "Next.js" in Framework Preset dropdown
4. Re-deploy and verify logs show Next.js detection

### Issue: Wrong Node.js version used

**Symptoms**: Build fails with Node.js version errors

**Solutions**:
1. Verify package.json `engines.node` field: `">=20.9.0"`
2. Verify .nvmrc contains: `20.9.0`
3. Manually select "20.x" in Node.js Version dropdown
4. Re-deploy and check build logs for Node.js version

### Issue: Build command not found

**Symptoms**: "build script not found" error

**Solutions**:
1. Verify package.json has `"build": "next build --webpack"` in scripts
2. Check Build Command field is empty (uses package.json)
3. If manually set, ensure it's `npm run build` or `next build`

### Issue: Slow builds every time

**Symptoms**: Every build takes 3-5 minutes, no caching

**Solutions**:
1. Verify `.next` is in .gitignore (shouldn't be committed)
2. Verify `node_modules` is in .gitignore
3. Check Incremental Builds toggle is enabled
4. Verify package-lock.json is committed (enables dependency caching)
5. Check deployment logs for cache restoration messages

### Issue: Build succeeds but app doesn't work

**Symptoms**: Build completes but deployed app has errors

**Solutions**:
1. Check environment variables are configured (Phase 2.1)
2. Verify `NEXT_PUBLIC_CONVEX_URL` is set
3. Check browser console for specific errors
4. Review build logs for warnings
5. Test locally with `npm run build && npm start`

## Acceptance Criteria

Phase 1.2 is complete when:

- ✅ Automated verification script passes (12/12 tests)
- ✅ Vercel dashboard shows Next.js framework auto-detected
- ✅ Node.js version configured to 20.x (from package.json engines)
- ✅ Build command auto-detected (`npm run build`)
- ✅ Output directory auto-detected (`.next`)
- ✅ Incremental builds enabled and working
- ✅ Test deployment succeeds with expected build behavior
- ✅ Second deployment is significantly faster (cache working)

## Next Steps

After completing this checklist:

1. Document results in `pm/issues/TASK-006-deployment-pipeline/WORKLOG.md`
2. Update `pm/issues/TASK-006-deployment-pipeline/PLAN.md` (check off Phase 1.2)
3. Update `docs/deployment/vercel-setup.md` with build configuration details
4. Proceed to **Phase 1.3**: Enable Vercel Analytics for MVP monitoring

## Related Documentation

- [TASK-006 PLAN.md](/home/taylor/src/quotable/pm/issues/TASK-006-deployment-pipeline/PLAN.md)
- [Vercel Setup Documentation](/home/taylor/src/quotable/docs/deployment/vercel-setup.md)
- [ADR-003: Environment and Deployment Strategy](/home/taylor/src/quotable/docs/project/adrs/ADR-003-environment-and-deployment-strategy.md)
- [Vercel Build Configuration Documentation](https://vercel.com/docs/build-output-api/v3/configuration)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
