# Deployment Troubleshooting Guide

This document covers common deployment issues and their solutions.

## Vercel Preview Deployments Return 401 Unauthorized

### Symptoms

- Preview deployments show "Error" status in GitHub PRs
- E2E workflow hangs waiting for deployment
- `curl` to preview URL returns HTTP 401
- Vercel logs show "Deployment successful" but URL requires authentication

### Root Cause

Vercel's **Deployment Protection** feature is enabled, which requires authentication to access preview deployments. This prevents:
- GitHub Actions workflows from running E2E tests
- The `wait-for-vercel-preview` action from verifying deployment success
- Playwright tests from accessing the preview URL

### Solution

Disable Deployment Protection for preview deployments:

1. Go to Vercel dashboard: https://vercel.com
2. Navigate to your project: **so-quoteable**
3. Click **Settings** in the top navigation
4. Click **Deployment Protection** in the left sidebar
5. Under "Preview Deployments", select:
   - **Standard Protection** (recommended for MVP) - No authentication required
   - OR **Only preview deployments from your Git repository**
6. Click **Save**

### Alternative Solution (If Protection Required)

If you must keep Deployment Protection enabled:

1. Generate a Protection Bypass secret in Vercel dashboard
2. Add the secret to GitHub Secrets as `VERCEL_AUTOMATION_BYPASS_SECRET`
3. Update `.github/workflows/e2e-preview.yml` to pass the secret:

```yaml
- name: Wait for Vercel Preview Deployment
  uses: patrickedqvist/wait-for-vercel-preview@v1.3.2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    max_timeout: 300
    vercel_automation_bypass_secret: ${{ secrets.VERCEL_AUTOMATION_BYPASS_SECRET }}
```

### Verification

After disabling Deployment Protection:

1. Trigger a new deployment by pushing to your PR branch
2. Wait for the Vercel deployment to complete
3. Verify the preview URL is accessible without authentication:
   ```bash
   curl -I https://your-preview-url.vercel.app
   # Should return HTTP 200, not 401
   ```
4. Verify the E2E workflow completes successfully

## E2E Workflow Times Out Waiting for Deployment

### Symptoms

- E2E workflow shows "pending" status for >5 minutes
- Workflow logs show "Waiting for Vercel deployment..."
- Vercel deployment succeeded but workflow doesn't detect it

### Possible Causes

1. **Deployment Protection** (see above) - Most common cause
2. **GitHub Deployments API not updated** - Vercel didn't create GitHub deployment
3. **Workflow timeout too short** - Deployment takes longer than 5 minutes

### Solutions

**For Deployment Protection:**
See "Vercel Preview Deployments Return 401 Unauthorized" above

**For GitHub Deployments API issues:**
1. Verify Vercel GitHub integration is properly connected
2. Check that "GitHub Deployments" is enabled in Vercel project settings
3. Manually trigger a redeploy to refresh the connection

**For timeout issues:**
Increase `max_timeout` in `.github/workflows/e2e-preview.yml`:
```yaml
- name: Wait for Vercel Preview Deployment
  uses: patrickedqvist/wait-for-vercel-preview@v1.3.2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    max_timeout: 600  # Increase to 10 minutes
```

## Vercel Build Fails with Environment Variable Errors

### Symptoms

- Vercel deployment shows "Error" status
- Build logs show "Error: process.env.NEXT_PUBLIC_CONVEX_URL is undefined"
- Local build succeeds but Vercel build fails

### Solution

1. Verify environment variables are set for the correct environment:
   ```bash
   vercel env ls preview
   vercel env ls production
   ```

2. Check for embedded newlines in environment variables (known issue):
   ```bash
   vercel env pull .env.vercel.preview --environment=preview
   cat .env.vercel.preview | od -c | grep '\\n'
   ```

3. If newlines found, fix using `scripts/fix-vercel-env-newlines.sh`

4. Verify `NEXT_PUBLIC_*` variables are set for both preview and production

## Health Check Endpoint Returns 500 in Production

### Symptoms

- `/api/health` returns HTTP 500
- Convex database queries work fine
- Error: "Cannot find module '@edge-runtime/cookies'"

### Root Cause

Known issue with Next.js Edge Runtime and Convex integration (documented in TASK-006 Phase 3.3).

### Status

**Deferred to post-MVP** - Non-blocking issue. Production deployment is functional, only health check endpoint is affected.

### Workaround

Use Convex dashboard to monitor backend health instead of `/api/health` endpoint.

## Branch Protection Blocking Valid Merges

### Symptoms

- PR shows "Merge blocked" even though all checks passed
- Status shows "Waiting for status to be reported"
- Required checks are green but merge button disabled

### Possible Causes

1. **Branch not up to date** - Base branch has new commits
2. **Required check name mismatch** - Check name changed or different than configured
3. **Missing approval** - PR requires review approval

### Solutions

**For out-of-date branch:**
```bash
git checkout your-branch
git pull origin main  # or rebase: git rebase main
git push
```

**For check name mismatch:**
1. Go to GitHub Settings → Branches → Branch protection rules
2. Edit the rule for `main`
3. Under "Require status checks to pass before merging", verify:
   - `e2e-preview` (from `.github/workflows/e2e-preview.yml`)
   - `test` (from `.github/workflows/test.yml`)
4. If check names don't match workflow job names, update branch protection settings

**For missing approval:**
Request a review from a teammate or admin.

## References

- [Vercel Deployment Protection Documentation](https://vercel.com/docs/security/deployment-protection)
- [GitHub Deployments API](https://docs.github.com/en/rest/deployments)
- [Wait for Vercel Preview Action](https://github.com/patrickedqvist/wait-for-vercel-preview)
