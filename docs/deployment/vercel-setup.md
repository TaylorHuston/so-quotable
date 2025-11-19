# Vercel Setup Documentation

**Task**: TASK-006 Phase 1.1 - Connect GitHub repository to Vercel account
**Last Updated**: 2025-11-19
**Status**: ✅ Connected and Verified

## Overview

The So Quotable repository is connected to Vercel for automatic deployments following the strategy defined in ADR-003.

## Project Details

- **Vercel Project Name**: so-quoteable
- **Project ID**: `prj_ih8kLlVZHGlBfbIqQMdmHyYrPJ6n`
- **Organization**: taylor-hustons-projects
- **Production URL**: https://so-quoteable.vercel.app
- **GitHub Repository**: https://github.com/TaylorHuston/soquoteable.git

## Deployment Configuration

### Branch Strategy

**Production Deployments**:
- **Branch**: `main`
- **Automatic**: Yes (deploys on every push to main)
- **URL**: https://so-quoteable.vercel.app

**Preview Deployments**:
- **Branches**: All branches (including feature branches)
- **Automatic**: Yes (deploys on every push)
- **URL Pattern**: `https://so-quoteable-{branch-slug}.vercel.app`
- **PR Comments**: Enabled (Vercel bot comments with preview URL)

### Build Configuration

- **Framework**: Next.js (auto-detected)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm ci` (auto-detected)
- **Node.js Version**: Detected from `package.json` engines field (>=20.9.0)
- **Root Directory**: `/` (repository root)

### Performance Settings

- **Incremental Builds**: Enabled (default for Next.js)
- **Build Caching**: Enabled (default)
- **Edge Network**: Enabled (Vercel CDN)

## Verification Status

### Automated Tests ✅

**Phase 1.1 - GitHub Connection** (see `scripts/verify-vercel-connection.sh`):
- ✅ Vercel project configuration exists (`.vercel/project.json`)
- ✅ Project is linked to Vercel (Project ID verified)
- ✅ GitHub remote is configured
- ✅ Vercel CLI is installed (version 48.8.2)
- ✅ Vercel authentication successful
- ✅ Node.js version configured (`.nvmrc` and `package.json` engines)

**Phase 1.2 - Build Configuration** (see `scripts/verify-vercel-build-config.sh`):
- ✅ Next.js framework installed (v16.0.1+)
- ✅ Next.js configuration file exists (next.config.ts)
- ✅ TypeScript configuration present (tsconfig.json)
- ✅ Node.js version properly configured (.nvmrc + package.json engines)
- ✅ Build command configured (`next build --webpack`)
- ✅ Output directory is default (.next)
- ✅ Package manager lockfile present (package-lock.json)
- ✅ Vercel project linked
- ✅ Environment variables configured locally (.env.local)
- ✅ Incremental builds support enabled
- ✅ .gitignore properly configured for caching
- ✅ Build performance optimizations enabled

### Manual Verification Required

The following settings must be verified in the Vercel dashboard.

#### Phase 1.1 - Deployment Settings Checklist

Access: [Vercel Dashboard](https://vercel.com/) → Projects → so-quoteable → Settings → Git

- [ ] **1. Production Branch**
  - Navigate to: Settings → Git → Production Branch
  - Verify: Production branch is set to `main`
  - Expected: "main" should be selected in dropdown

- [ ] **2. Preview Deployments**
  - Navigate to: Settings → Git → Preview Deployments
  - Verify: "All Branches" is selected
  - Expected: Every branch push creates a preview deployment

- [ ] **3. Pull Request Comments**
  - Navigate to: Settings → Git → GitHub App Settings
  - Verify: "Comment on Pull Requests" is enabled
  - Expected: Vercel bot comments on PRs with preview URLs

- [ ] **4. Deployment Protection**
  - Navigate to: Settings → Git → Deployment Protection
  - Verify: No additional protection needed for MVP
  - Note: Can add password protection later if needed

- [ ] **5. Build & Development Settings**
  - Navigate to: Settings → Build & Development Settings
  - Verify Framework Preset: "Next.js"
  - Verify Build Command: Empty (uses `npm run build` from package.json)
  - Verify Output Directory: Empty (uses `.next` default)
  - Verify Install Command: Empty (uses `npm ci` default)
  - Verify Node.js Version: Matches package.json engines (20.x)

- [ ] **6. Deployment Triggers**
  - Navigate to: Settings → Git
  - Verify: "Automatically deploy on push" is enabled
  - Expected: Both production and preview deployments trigger automatically

#### Test Deployment Workflow

Complete these tests to verify the deployment pipeline works end-to-end:

- [ ] **Test 1: Production Deployment**
  ```bash
  # Make a trivial change on main branch
  git checkout main
  echo "# Deployment test" >> README.md
  git add README.md
  git commit -m "test: verify production deployment"
  git push origin main
  ```
  - Expected: Vercel deployment triggers within 30 seconds
  - Expected: Production URL updates within 3-5 minutes
  - Verify at: https://so-quoteable.vercel.app

- [ ] **Test 2: Preview Deployment**
  ```bash
  # Create a test branch
  git checkout -b test-preview-deployment
  echo "# Preview test" >> README.md
  git add README.md
  git commit -m "test: verify preview deployment"
  git push origin test-preview-deployment
  ```
  - Expected: Vercel preview deployment triggers
  - Expected: Unique preview URL created
  - Verify in: Vercel dashboard → Deployments

- [ ] **Test 3: Pull Request Comments**
  - Create a PR from `test-preview-deployment` to `main` on GitHub
  - Expected: Vercel bot comments on PR with preview URL
  - Expected: Comment updates on subsequent pushes
  - Cleanup: Close PR after verification (don't merge)

#### Phase 1.2 - Build Configuration Checklist

Access: [Vercel Dashboard](https://vercel.com/) → Projects → so-quoteable → Settings → Build & Development Settings

**Detailed Checklist**: See [Phase 1.2 Verification Checklist](./phase-1-2-verification-checklist.md) for comprehensive verification steps.

**Quick Verification** (Essential checks):

- [ ] **1. Framework Preset**
  - Navigate to: Settings → Build & Development Settings → Framework Preset
  - Verify: "Next.js" is auto-detected
  - Expected: Framework shows "Next.js" with auto-detect indicator

- [ ] **2. Node.js Version**
  - Navigate to: Settings → Build & Development Settings → Node.js Version
  - Verify: "20.x" is selected
  - Expected: Matches package.json engines.node (>=20.9.0)

- [ ] **3. Build Command**
  - Navigate to: Settings → Build & Development Settings → Build Command
  - Verify: Field is empty (uses package.json script)
  - Expected: Vercel will run `npm run build` which executes `next build --webpack`

- [ ] **4. Output Directory**
  - Navigate to: Settings → Build & Development Settings → Output Directory
  - Verify: Field is empty (uses Next.js default)
  - Expected: Vercel will use `.next` directory

- [ ] **5. Install Command**
  - Navigate to: Settings → Build & Development Settings → Install Command
  - Verify: Field is empty (uses npm default)
  - Expected: Vercel will run `npm ci` or `npm install`

- [ ] **6. Incremental Builds**
  - Navigate to: Settings → Build & Development Settings
  - Verify: "Automatically enable Incremental Builds" is ON
  - Expected: Toggle should be enabled (default for Next.js)

**Test Build Deployment**:

- [ ] **Test 4: Trigger Build and Verify**
  ```bash
  # Make a trivial change and push
  git checkout feature/TASK-006-deployment-pipeline
  echo "# Build config test" >> README.md
  git add README.md
  git commit -m "test: verify build configuration"
  git push origin feature/TASK-006-deployment-pipeline
  ```

  **Verify in deployment logs**:
  - ✅ Framework detection: "Detected Next.js"
  - ✅ Node.js version: "Node.js 20.x"
  - ✅ Build command: Shows `npm run build` or default
  - ✅ Build success: Deployment completes without errors
  - ✅ Build time: First build 2-5 min, subsequent builds <2 min

- [ ] **Test 5: Verify Build Caching**
  ```bash
  # Make another small change
  echo "# Cache test" >> README.md
  git add README.md
  git commit -m "test: verify build caching"
  git push origin feature/TASK-006-deployment-pipeline
  ```

  **Verify caching effectiveness**:
  - ✅ Second build is 50-80% faster
  - ✅ Logs show "Build cache restored"
  - ✅ Dependencies not reinstalled (unless package.json changed)

## Rollback Configuration

Vercel provides instant rollback via the dashboard:

1. Navigate to: [Vercel Dashboard](https://vercel.com/) → Projects → so-quoteable → Deployments
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"
4. Rollback completes instantly (DNS switch, <5 minutes)

**Recovery Time Objective (RTO)**: <5 minutes
**Recovery Point Objective (RPO)**: Every deployment is preserved (can rollback to any previous deployment)

## GitHub Integration Details

### Permissions

Vercel GitHub App has been granted the following permissions:
- Read repository content
- Read/write deployments
- Read/write pull request comments
- Read commit statuses

### Webhook Events

Vercel listens for the following GitHub webhook events:
- Push events (triggers deployments)
- Pull request events (triggers preview deployments)
- Branch/tag creation (triggers preview deployments)

## Next Steps (Phase 1.2)

After completing manual verification checklist:
1. Document any deviations from expected configuration
2. Update WORKLOG.md with verification results
3. Proceed to Phase 1.2: Configure build settings for Next.js
4. Update PLAN.md to check off Phase 1.1

## Troubleshooting

### Issue: Deployment not triggering on push

**Symptoms**: Push to GitHub doesn't trigger Vercel deployment

**Solutions**:
1. Check GitHub webhook status: Settings → Webhooks → Recent Deliveries
2. Verify Vercel GitHub App is installed: GitHub → Settings → Applications → Vercel
3. Re-authenticate Vercel: `vercel login` then `vercel link`
4. Check Vercel dashboard: Deployments tab for error messages

### Issue: Preview deployment not creating unique URL

**Symptoms**: All preview deployments use same URL

**Solutions**:
1. Verify "All Branches" is selected in Git settings
2. Check branch naming (must be valid URL slug)
3. Ensure branch is pushed to GitHub (not just local)

### Issue: PR comments not appearing

**Symptoms**: Vercel bot not commenting on pull requests

**Solutions**:
1. Verify "Comment on Pull Requests" is enabled in Git settings
2. Check GitHub App permissions (needs PR write access)
3. Ensure PR is from same repository (forks may not trigger comments)

## Related Documentation

- [ADR-003: Environment and Deployment Strategy](/home/taylor/src/quotable/docs/project/adrs/ADR-003-environment-and-deployment-strategy.md)
- [TASK-006 PLAN.md](/home/taylor/src/quotable/pm/issues/TASK-006-deployment-pipeline/PLAN.md)
- [Vercel Documentation](https://vercel.com/docs)
