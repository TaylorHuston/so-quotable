# GitHub Secrets Setup Guide

**TASK-006 Phase 2.3**: Configure GitHub Secrets for CI/CD automation

## Overview

GitHub Secrets store sensitive credentials needed for automated deployments via GitHub Actions. This guide covers setting up secrets for Convex backend deployments.

## Required Secrets

### 1. CONVEX_DEPLOY_KEY (Required)

**Purpose**: Enables automated Convex backend deployments from GitHub Actions

**How to obtain**:

1. **Go to Convex Dashboard**:
   - Production deployment: https://dashboard.convex.dev/deployment/steady-anaconda-957/settings

2. **Navigate to Settings → Deploy Keys**:
   - Look for "Deploy Keys" or "CI/CD" section in left sidebar

3. **Generate Deploy Key**:
   - Click "Create Deploy Key" or "Generate New Key"
   - Give it a name: `GitHub Actions CI/CD`
   - Copy the generated key immediately (shown only once)

4. **Save the key securely** (you'll add it to GitHub Secrets next)

**Alternative method** (if UI method doesn't work):
```bash
# From Convex dashboard, go to Settings and look for "Deploy Keys" section
# The key format will be: prod:<long-alphanumeric-string>
```

### 2. VERCEL_TOKEN (Optional)

**Purpose**: Enables custom GitHub Actions workflows for Vercel deployments

**When needed**:
- Only if you plan to create custom deployment workflows
- NOT needed for automatic Vercel Git deployments (already configured)

**Current status**: **NOT REQUIRED** for MVP
- Vercel's automatic Git integration handles deployments
- We're using native Vercel → GitHub integration from Phase 1

**How to obtain** (if needed later):
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: `GitHub Actions CI/CD`
4. Scope: Select `so-quoteable` project
5. Copy token (shown only once)

---

## Setting GitHub Secrets

### Step 1: Access GitHub Secrets

1. Go to your GitHub repository: https://github.com/TaylorHuston/so-quoteable
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click: **New repository secret**

### Step 2: Add CONVEX_DEPLOY_KEY

**Name**: `CONVEX_DEPLOY_KEY`

**Value**: Paste the deploy key from Convex dashboard

**Scope**: Repository (not environment-specific)

Click **Add secret**

### Step 3: Verify Secrets

After adding secrets, you should see:

```
Repository secrets
├── CONVEX_DEPLOY_KEY (Created X minutes ago)
```

---

## Usage in GitHub Actions

Once configured, the secret can be used in `.github/workflows/*.yml` files:

```yaml
name: Deploy Convex Backend

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Convex
        run: npx convex deploy --cmd 'npm run build'
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
```

**Note**: GitHub Actions workflows will be created in Phase 4.

---

## Verification

### Test CONVEX_DEPLOY_KEY Locally

You can test the deploy key works before creating GitHub Actions:

```bash
# Set the deploy key temporarily
export CONVEX_DEPLOY_KEY="<paste-your-key>"

# Try deploying
npx convex deploy

# If successful, you'll see:
# ✓ Deployed function changes
# ✓ Backend deployed successfully
```

**IMPORTANT**: Never commit deploy keys to Git. Always use environment variables or GitHub Secrets.

---

## Security Best Practices

### Secret Rotation

**CONVEX_DEPLOY_KEY**:
- Rotate every 180 days
- Rotate immediately if compromised
- Rotate when team members with access leave

**How to rotate**:
1. Generate new deploy key in Convex dashboard
2. Update GitHub Secret with new value
3. Delete old deploy key from Convex

### Access Control

- **GitHub Secrets**: Only accessible to repository collaborators with write access
- **Convex Deploy Keys**: Can only deploy, cannot read data or modify database
- **Least Privilege**: Deploy keys have minimal permissions (deploy only)

### Audit

- **GitHub**: View secret usage in Actions logs (values are masked)
- **Convex**: Monitor deployments in dashboard (who deployed, when)

---

## Troubleshooting

### Issue: Cannot find Deploy Keys section in Convex Dashboard

**Solution**:
1. Ensure you're viewing the production deployment (steady-anaconda-957)
2. Check Settings → look for "Deploy Keys", "CI/CD", or "API Keys"
3. If still not visible, deploy keys may be under "Team Settings" or "Project Settings"
4. Alternative: Contact Convex support or check documentation

### Issue: Deploy key doesn't work in GitHub Actions

**Symptoms**:
- Error: "Unauthorized" or "Invalid deploy key"

**Solution**:
1. Verify secret name is exactly `CONVEX_DEPLOY_KEY` (case-sensitive)
2. Verify deploy key format: `prod:<alphanumeric>`
3. Check deploy key hasn't expired in Convex dashboard
4. Regenerate deploy key and update GitHub Secret

### Issue: "Repository secret not found"

**Solution**:
1. Verify secret was added to **Repository secrets**, not Environment secrets
2. Check spelling of secret name in workflow file
3. Ensure GitHub Actions has permission to access secrets (Settings → Actions → General)

---

## Phase 2.3 Acceptance Criteria

- [x] CONVEX_DEPLOY_KEY generated from Convex dashboard
- [x] CONVEX_DEPLOY_KEY added to GitHub Secrets
- [x] Deploy key verified working (optional: test locally)
- [ ] VERCEL_TOKEN added (optional, not required for MVP)

---

## Next Steps

After completing Phase 2.3:

1. **Phase 3**: Convex Production Deployment verification
2. **Phase 4**: Create GitHub Actions workflow for E2E tests
3. **Phase 5**: Health checks and rollback procedures

---

## Additional Resources

- Convex Deploy Keys: https://docs.convex.dev/production/hosting
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- GitHub Actions: https://docs.github.com/en/actions
