---
id: TASK-006
title: Configure deployment pipeline
epic: EPIC-001
status: todo
created: 2025-10-30
updated: 2025-10-30
---

# TASK-006: Configure deployment pipeline

**Epic**: EPIC-001 - MVP Infrastructure Setup
**Status**: todo

## Description
Set up the complete deployment pipeline for both frontend (Vercel) and backend (Convex Cloud). Configure automatic deployments from Git, environment variables management, preview environments, and monitoring. Ensure seamless CI/CD with proper staging and production environments.

## Acceptance Criteria
- [ ] Vercel project connected to Git repository
- [ ] Automatic deployments configured for main branch
- [ ] Preview deployments working for pull requests
- [ ] Convex production deployment configured
- [ ] Environment variables properly set in Vercel
- [ ] Convex environment variables synchronized
- [ ] Build optimization configured (caching, incremental builds)
- [ ] Custom domain configured (if available)
- [ ] Monitoring and error tracking set up
- [ ] Deployment notifications configured
- [ ] Rollback procedures documented

## Technical Notes
- Vercel Configuration:
  - Connect GitHub repository
  - Configure build settings for Next.js
  - Set up environment variables:
    - NEXT_PUBLIC_CONVEX_URL (production)
    - CLOUDINARY_API_KEY
    - CLOUDINARY_API_SECRET
    - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - Configure preview deployments for PRs
  - Set up custom domain (if available)
  - Enable Web Analytics
- Convex Configuration:
  - Deploy to production with `npx convex deploy`
  - Configure production environment variables
  - Set up deployment from GitHub Actions (optional)
  - Configure database backup strategy
- CI/CD Pipeline:
  - Pre-deployment tests (lint, type-check, test)
  - Build optimization
  - Post-deployment smoke tests
  - Deployment status checks
- Monitoring:
  - Vercel Analytics for frontend
  - Convex dashboard for backend metrics
  - Error tracking (consider Sentry integration)

## Dependencies
- TASK-001: Next.js project must exist
- TASK-002: Convex backend configured
- TASK-005: Tests must pass before deployment
- GitHub repository
- Vercel account
- Convex account with production access

## Testing
- Push to main branch triggers automatic deployment
- Create PR and verify preview deployment
- Confirm environment variables work in production
- Test rollback procedure
- Verify monitoring dashboards show data
- Confirm deployment notifications received
- Run smoke tests on production deployment