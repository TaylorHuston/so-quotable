---
issue_number: TASK-006
type: task
spec: SPEC-001
status: done
created: 2025-10-30
jira_issue_key: null
---

# TASK-006: Configure deployment pipeline

**Epic**: EPIC-001 - MVP Infrastructure Setup
**Status**: todo

## Description

Set up the complete deployment pipeline for both frontend (Vercel) and backend (Convex Cloud) following ADR-003 deployment strategy. Configure automatic deployments from Git, environment variables management, preview environments, and MVP-critical monitoring. Uses native Node.js (no Docker) with Vercel preview deployments as staging.

## Acceptance Criteria

### Deployment Configuration (ADR-003)

- [ ] Vercel project connected to Git repository
- [ ] Automatic deployments configured for main branch → production
- [ ] Preview deployments working for pull requests (staging)
- [ ] Convex production deployment configured
- [ ] Environment variables properly set in Vercel (production + preview)
- [ ] GitHub Secrets configured for CI/CD
- [ ] Build optimization configured (caching, incremental builds)

### MVP Monitoring (ADR-003)

- [ ] Vercel Analytics enabled (1-click in dashboard)
- [ ] Health check endpoint tested in production (/api/health)
- [ ] Rollback procedures documented and tested
- [ ] Sentry account created (optional, recommended post-launch)

### E2E Testing Integration (ADR-003)

- [ ] GitHub Actions webhook for Vercel deployments configured
- [ ] E2E tests run against Vercel preview URLs
- [ ] E2E test results block PR merge if failing

### Documentation

- [ ] Deployment procedures documented in README
- [ ] Environment variable setup guide created
- [ ] Rollback procedures documented
- [ ] Monitoring dashboard access documented

## Technical Notes

### Vercel Configuration (ADR-003)

- Connect GitHub repository (main branch → production)
- Configure build settings:
  - Framework: Next.js
  - Build command: `npm run build` (auto-detected)
  - Output directory: `.next` (auto-detected)
  - Node.js version: Read from package.json engines field
- Set up environment variables (production + preview):

  ```bash
  # Production
  NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
  CLOUDINARY_API_KEY=xxx
  CLOUDINARY_API_SECRET=xxx
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
  AUTH_SECRET=xxx
  GOOGLE_CLIENT_ID=xxx
  GOOGLE_CLIENT_SECRET=xxx

  # Preview (use dev Convex deployment)
  NEXT_PUBLIC_CONVEX_URL=https://your-project-dev.convex.cloud
  ```

- Enable Vercel Analytics (Settings → Analytics → Enable)
- Configure preview deployments:
  - Auto-deploy on PR creation
  - Unique URL per PR
  - Comment on PR with preview URL

### Convex Deployment Strategy (ADR-003)

- Production deployment: `npx convex deploy`
- Use CONVEX_DEPLOY_KEY in GitHub Actions for automated deploys
- Verify Convex backup policy (check Convex dashboard)
- Document manual deployment procedure:
  ```bash
  # Deploy production backend
  CONVEX_DEPLOY_KEY=xxx npx convex deploy
  ```

### E2E Testing Integration (ADR-003)

- Configure Vercel webhook for deployment success
- Create .github/workflows/e2e.yml:

  ```yaml
  name: E2E Tests
  on:
    repository_dispatch:
      types: ["vercel.deployment.success"]

  jobs:
    e2e:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version-file: ".nvmrc"
        - run: npm ci
        - run: npx playwright install --with-deps
        - name: Run E2E Tests
          env:
            BASE_URL: ${{ github.event.client_payload.url }}
          run: npx playwright test
  ```

### MVP Monitoring Setup (ADR-003)

- Vercel Analytics: Enable in dashboard (no code required)
- Health check: Already created in TASK-001 (/api/health)
- Sentry (optional):
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- Document rollback procedure:
  1. Go to Vercel Dashboard → Deployments
  2. Find last working deployment
  3. Click "..." → "Promote to Production"
  4. Instant rollback (DNS switch)

### NOT Needed for MVP (from DevOps review)

- ❌ Docker configuration
- ❌ Dedicated staging environment (using preview deployments)
- ❌ Advanced monitoring (Datadog, New Relic)
- ❌ Automated backups (Convex handles this)
- ❌ Pre-commit hooks (can add post-MVP)
- ❌ UptimeRobot (manual monitoring acceptable initially)

## Dependencies

- TASK-001: Next.js project must exist
- TASK-002: Convex backend configured
- TASK-005: Tests must pass before deployment
- GitHub repository
- Vercel account
- Convex account with production access

## Testing

- Push to main branch triggers automatic Vercel deployment
- Create PR and verify preview deployment with unique URL
- Verify preview deployment uses dev Convex backend
- Confirm environment variables work in production
- Test /api/health endpoint returns 200 in production
- Test rollback procedure (promote previous deployment)
- Verify Vercel Analytics shows data
- Confirm E2E tests run automatically on preview deployments
- Test GitHub Actions workflow triggers on deployment success
