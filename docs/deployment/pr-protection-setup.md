# Pull Request Protection Rules Setup

**⚠️ UPDATED 2025-11-22: Free Tier Adaptation**

This document was originally written for automated E2E testing against preview deployments. Since Convex free tier does not support preview deployment keys, we've simplified to **code review only** protection for the MVP phase.

For automated E2E checks, upgrade to Convex Pro tier.

---

This document guides you through configuring GitHub branch protection rules to require reviews (and optionally E2E tests with Pro tier) before merging PRs.

## Overview

Branch protection rules ensure code quality by requiring checks to pass and reviews to be completed before merging to protected branches.

## Required Setup for TASK-006 Phase 4.3

### 1. Navigate to Repository Settings

1. Go to your repository: https://github.com/TaylorHuston/so-quoteable
2. Click **Settings** (top navigation)
3. Click **Branches** in the left sidebar
4. Under "Branch protection rules", click **Add rule** (or edit existing rule)

### 2. Configure Protection Rule for `main` (Production Branch)

**Branch name pattern**: `main`

**Why protect main only?**
- `develop` → integration branch for fast feature merging (no protection needed)
- `main` → production branch requiring quality gates (protection required)

**Required Settings**:

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1`
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ⬜ Require review from Code Owners (optional for MVP)

- ⬜ **Require status checks to pass before merging** (optional for free tier)
  - ⬜ Require branches to be up to date before merging
  - **Required checks** (only if using Convex Pro tier with automated E2E):
    - `e2e-preview` (from `.github/workflows/e2e-preview.yml`) - **Pro tier only**
    - `test` (from `.github/workflows/test.yml`) - optional
  - **Free tier**: Skip this section, rely on code review + local testing instead

- ⬜ **Require conversation resolution before merging** (recommended)

- ⬜ **Require signed commits** (optional for MVP)

- ✅ **Require linear history** (recommended - prevents merge commits)

- ✅ **Include administrators** (recommended - rules apply to everyone)

**Click "Create"** or **"Save changes"**

### 3. Verification

After setting up the rules:

1. Create a test branch and make a trivial change
2. Open a pull request to `main` or `develop`
3. Verify that:
   - ✅ The E2E tests workflow runs automatically
   - ✅ The PR shows "Merging is blocked" until checks pass
   - ✅ The merge button is disabled until all checks are green
   - ✅ After checks pass, merge requires approval

## Expected Behavior

### When E2E Tests Fail

```
❌ Some checks were not successful
1 failing check
  e2e-preview — The E2E tests have failed

⚠️ Merging is blocked
Merging can be performed automatically with 1 approving review and required status checks passing.
```

### When E2E Tests Pass

```
✅ All checks have passed
2 successful checks
  e2e-preview — The E2E tests have passed
  test — All tests passed

✅ This branch has no conflicts with the base branch
Merging can be performed automatically.
```

## Troubleshooting

### Check not appearing in required status checks list

**Solution**: The check must run at least once before it appears in the list. To make it appear:

1. Create a test PR (can be draft)
2. Wait for the E2E workflow to run
3. Go back to branch protection settings
4. The check should now appear in the search dropdown

### Tests passing but merge still blocked

**Possible causes**:
- Branch is not up to date with base branch (rebase or merge base into your branch)
- Required approval not given (request review from teammate)
- Other required checks failing (check the PR status checks section)

### Tests not running automatically

**Possible causes**:
- Workflow file has syntax errors (check Actions tab for error messages)
- GitHub Actions disabled for repository (check Settings → Actions → General)
- PR from fork (forks require manual approval to run workflows for security)

## Security Considerations

### Fork Pull Requests

By default, workflows from forks require manual approval to run. This prevents malicious code from running in your CI environment.

**Configuration**: Settings → Actions → General → Fork pull request workflows from outside collaborators

**Recommended setting for MVP**: "Require approval for first-time contributors"

### Secrets Access

The E2E preview workflow only needs `GITHUB_TOKEN` which is automatically provided. No additional secrets required.

## Post-MVP Enhancements

Consider these additional protections after MVP:

- **Required reviews from specific teams** (e.g., @so-quoteable/reviewers)
- **CODEOWNERS file** for automatic review requests
- **Require deployments to succeed** (verify Vercel deployment succeeds)
- **Restrict who can push to protected branches** (admins only)
- **Require signed commits** (cryptographic verification)

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [GitHub Actions Security Best Practices](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
