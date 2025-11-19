---
task_id: TASK-006
task_title: Configure deployment pipeline
spec_id: SPEC-001
complexity_score: 8
estimated_hours: 12-16
created: 2025-11-18
updated: 2025-11-18
---

# Implementation Plan: TASK-006 Configure Deployment Pipeline

## Overview

Configure complete CI/CD pipeline for So Quotable MVP following ADR-003 deployment strategy. Establishes automated deployments via Vercel (frontend) and Convex Cloud (backend) with preview environments, E2E test integration, and MVP-critical monitoring. Strategic approach focuses on minimal operational overhead while ensuring production reliability and automated quality gates.

**Key Architecture Decisions** (from ADR-003):
- **No Docker**: Native Node.js deployment on Vercel
- **No dedicated staging**: Vercel preview deployments serve as staging
- **Environment promotion**: develop → preview deployments → main → production
- **Test-first deployment**: E2E tests block merges when failing

## Phases

### Phase 1: Vercel Project Configuration

**Objective**: Connect GitHub repository to Vercel with automatic deployments and proper build settings.

- [x] 1.1 Connect GitHub repository to Vercel account
  - Main branch → production deployments
  - All branches → preview deployments
  - PR comments with preview URLs enabled

- [x] 1.2 Configure build settings for Next.js
  - Verify auto-detected framework settings (Next.js)
  - Confirm Node.js version from package.json engines field
  - Configure build command and output directory (auto-detected)
  - Enable incremental builds and caching for performance

- [x] 1.3 Enable Vercel Analytics for MVP monitoring
  - One-click enable in Vercel dashboard Settings → Analytics
  - No code changes required (built into Next.js 13+)
  - Provides page views, performance metrics, Web Vitals

**Acceptance**: Pushing to any branch triggers Vercel deployment with correct build settings.

### Phase 2: Environment Variables Management

**Objective**: Configure environment variables for production and preview environments with proper separation.

- [ ] 2.1 Set production environment variables in Vercel
  - NEXT_PUBLIC_CONVEX_URL (production Convex deployment)
  - CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - AUTH_SECRET (for Convex Auth)
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  - RESEND_API_KEY (for email verification)

- [ ] 2.2 Set preview environment variables in Vercel
  - NEXT_PUBLIC_CONVEX_URL (dev Convex deployment URL)
  - Same Cloudinary credentials (shared for dev/staging)
  - Same OAuth credentials (redirect URLs configured for both)
  - AUTH_SECRET (can be same as production for MVP)

- [ ] 2.3 Configure GitHub Secrets for CI/CD
  - CONVEX_DEPLOY_KEY (for automated backend deployments)
  - VERCEL_TOKEN (if needed for custom workflows)

- [ ] 2.4 Document environment variable setup procedure
  - Create docs/deployment/environment-setup.md
  - List all required variables with descriptions
  - Document how to rotate secrets
  - Include troubleshooting guide

**Acceptance**: Production deployment uses prod Convex, preview uses dev Convex, all services connect successfully.

### Phase 3: Convex Production Deployment

**Objective**: Deploy Convex backend to production environment with automated deployment capability.

- [ ] 3.1 Create production Convex deployment
  - Run `npx convex deploy --prod` from local environment
  - Verify production URL matches NEXT_PUBLIC_CONVEX_URL
  - Confirm database schema migrated to production
  - Test production backend with Convex dashboard

- [ ] 3.2 Configure automated Convex deployments
  - Generate CONVEX_DEPLOY_KEY from Convex dashboard
  - Add to GitHub Secrets
  - Document manual deployment procedure for emergencies
  - Test deployment key works from CI environment

- [ ] 3.3 Verify Convex production backend functionality
  - Test queries, mutations, actions from production frontend
  - Confirm authentication flows work end-to-end
  - Verify email sending works (Resend integration)
  - Check Convex dashboard shows production metrics

**Acceptance**: Production Convex backend is live, functional, and deployable via CI/CD.

### Phase 4: E2E Test Automation Integration

**Objective**: Integrate E2E tests with deployment pipeline to block merges when tests fail.

- [ ] 4.1 Create GitHub Actions workflow for E2E tests
  - File: .github/workflows/e2e-preview.yml
  - Trigger: Pull request creation/update
  - Wait for Vercel preview deployment to complete
  - Run Playwright E2E tests against preview URL
  - Report results as PR check status

- [ ] 4.2 Configure Vercel deployment webhooks
  - Set up webhook for deployment success events
  - Trigger E2E test workflow on preview deployment ready
  - Pass preview URL to test runner via environment variable

- [ ] 4.3 Set up PR protection rules
  - Require E2E test check to pass before merge
  - Require code review approval
  - Configure in GitHub repository settings

- [ ] 4.4 Test E2E workflow end-to-end
  - Create test PR with intentional test failure
  - Verify PR is blocked from merging
  - Fix test and verify PR becomes mergeable
  - Confirm preview URL is accessible in test runs

**Acceptance**: E2E tests run automatically on every PR and block merges when failing.

### Phase 5: Health Checks and Rollback Procedures

**Objective**: Implement production health monitoring and document rollback procedures for incident response.

- [ ] 5.1 Verify production health check endpoint
  - Test /api/health returns 200 OK in production
  - Confirm health check includes critical dependencies
  - Document expected health check response format

- [ ] 5.2 Document rollback procedures
  - Create docs/deployment/rollback.md
  - Document instant rollback via Vercel dashboard
  - Document Convex backend rollback procedure
  - Include rollback decision criteria
  - Add recovery time objectives (RTO)

- [ ] 5.3 Test rollback procedure
  - Deploy a test change to production
  - Practice rollback via Vercel dashboard ("Promote to Production")
  - Verify rollback completes in <5 minutes
  - Document any issues encountered

- [ ] 5.4 Configure optional Sentry (recommended but not blocking)
  - Create Sentry account and project
  - Install @sentry/nextjs if time permits
  - Run `npx @sentry/wizard -i nextjs`
  - Document Sentry setup for post-MVP enhancement

**Acceptance**: Health check works in production, rollback procedure is documented and tested.

### Phase 6: Deployment Documentation

**Objective**: Create comprehensive deployment documentation for team reference.

- [ ] 6.1 Update README.md with deployment section
  - Quick start for new developers
  - Link to detailed deployment docs
  - List deployment environments and URLs
  - Document CI/CD pipeline overview

- [ ] 6.2 Create deployment runbook
  - File: docs/deployment/runbook.md
  - Manual deployment procedures (emergency)
  - Environment promotion workflow
  - Common deployment issues and fixes
  - Monitoring dashboard access

- [ ] 6.3 Document monitoring and observability
  - Vercel Analytics dashboard access
  - Convex dashboard monitoring
  - Health check endpoint usage
  - Log aggregation (Vercel logs)

- [ ] 6.4 Create deployment checklist
  - Pre-deployment verification steps
  - Post-deployment validation steps
  - Rollback decision tree
  - Include in runbook

**Acceptance**: Team can deploy to production and troubleshoot issues using documentation alone.

---

## Scenario Coverage

This task supports **no specific acceptance scenarios** from SPEC-001, but enables the infrastructure for all scenarios to run in production:

- ✅ **Deployment Infrastructure**: All 6 SPEC-001 scenarios require working production deployment
- ✅ **E2E Test Automation**: Scenarios 1-6 validated automatically before production deployment
- ✅ **Monitoring**: Vercel Analytics + health check enable production validation of all scenarios

**Traceability**: While this task doesn't validate specific scenarios, it's a prerequisite for production validation of ALL SPEC-001 scenarios.

---

## Implementation Philosophy

**STRATEGIC, NOT TACTICAL:**
- Phases describe **WHAT** infrastructure to configure (Vercel connection, E2E automation, etc.)
- Specialist agents (devops-engineer, backend-specialist) decide **HOW** based on current environment
- Documentation-first approach: runbooks created alongside configuration
- Flexibility for service-specific requirements discovered during setup

**LIVING DOCUMENT:**
- Deployment URLs and credentials will be added during implementation
- Monitoring thresholds may be adjusted based on production behavior
- E2E test workflow may evolve based on Playwright test updates
- Document actual decisions in WORKLOG for future reference

---

## Mandatory Phase Execution

Each phase MUST follow the mandatory test-first loop (see [pm-guide.md](../../../docs/development/guidelines/pm-guide.md)):

**For Configuration Tasks:**
1. **Write Verification Tests** (Red) - Manual test procedure or automated validation script
2. **Configure Service** (Green) - Apply configuration, verify with tests
3. **Document Configuration** (Review) - Update runbook, capture decisions
4. **Commit** - Commit configuration files (workflows, docs)
5. **WORKLOG** - Document what was configured and lessons learned
6. **Next Phase** - Proceed after verification passes

**Example - Phase 1.1:**
1. Write test: "Push to main → verify Vercel deploys → check preview URL returned"
2. Configure: Connect GitHub in Vercel dashboard
3. Document: Add Vercel setup steps to runbook.md
4. Commit: Update docs with Vercel project details
5. WORKLOG: "Connected GitHub to Vercel, main branch auto-deploys, preview URLs working"
6. Next: Phase 1.2

---

## Complexity Analysis

**Score**: 8/13 points (Medium-High Complexity)

**Indicators**:
- ⚠️ **External Services** (+3): Integrating Vercel, Convex Cloud, GitHub Actions
- ⚠️ **Environment Management** (+2): Prod vs preview environment separation
- ✅ **Configuration > Code** (+1): Minimal code, mostly service configuration
- ⚠️ **Testing Integration** (+2): E2E test automation requires webhook coordination
- ✅ **Well-Defined Scope** (+0): Clear requirements in ADR-003

**Decomposition Recommendation**: Task is appropriately scoped for 1-2 days of focused work (6 phases). Each phase is testable independently.

**Risk Areas**:
- Vercel webhook reliability (may need polling fallback)
- Environment variable propagation timing
- Convex production deployment authentication
- E2E test flakiness in CI environment

**Mitigation**:
- Test each integration point independently before combining
- Document troubleshooting steps as issues are encountered
- Use Vercel CLI for local testing before dashboard configuration
- Add retry logic to E2E workflow for transient failures

---

## Dependencies

**Completed Tasks** (prerequisites):
- ✅ TASK-001: Next.js project initialized
- ✅ TASK-002: Convex backend configured
- ✅ TASK-003: Cloudinary integration
- ✅ TASK-004: Convex Auth implemented
- 🔄 TASK-005: E2E tests written (currently 10/22 passing, TASK-007 to fix)

**External Accounts Required**:
- Vercel account (free tier sufficient for MVP)
- Convex account with production deployment access
- GitHub repository with Actions enabled
- Existing: Cloudinary, Google OAuth, Resend accounts

**Service Status**:
- Vercel: Ready (account exists, repo connected to develop branch)
- Convex: Development deployment active, production deployment needed
- GitHub Actions: Available (no workflows exist yet)

---

## Notes

**ADR-003 Compliance:**
This plan fully implements the deployment strategy defined in ADR-003:
- ✅ Native Node.js (no Docker)
- ✅ Vercel preview deployments as staging
- ✅ Automated deployments from Git
- ✅ MVP monitoring (Vercel Analytics + health check)
- ✅ E2E test integration with deployment pipeline

**Intentionally Excluded** (per ADR-003 DevOps review):
- ❌ Docker configuration (native Node.js deployment)
- ❌ Dedicated staging environment (preview deployments suffice)
- ❌ Advanced monitoring (Datadog, New Relic) - Vercel Analytics + Sentry sufficient for MVP
- ❌ Automated database backups (Convex handles internally)
- ❌ Pre-commit hooks (can add post-MVP)

**Post-MVP Enhancements** (documented for later):
- Enhanced monitoring with Sentry error tracking
- Performance monitoring with Web Vitals tracking
- Automated Lighthouse CI for performance budgets
- Database backup verification procedures
- Multi-region deployment (Convex supports this)
- Blue-green deployment strategy for zero-downtime

**Success Criteria:**
- Pushing to main deploys to production within 5 minutes
- Preview deployments available within 3 minutes of PR creation
- E2E tests run automatically and block broken PRs
- Rollback possible in <5 minutes via Vercel dashboard
- Team can deploy confidently using documentation alone
