# Phase 2.3 Checklist: GitHub Secrets Configuration

**Task**: TASK-006 Phase 2.3 - Configure GitHub Secrets for CI/CD
**Estimated Time**: 10-15 minutes

---

## Prerequisites

- [ ] Access to Convex dashboard (https://dashboard.convex.dev/)
- [ ] Access to GitHub repository settings (requires write access)
- [ ] Production Convex deployment exists (steady-anaconda-957)

---

## Step 1: Generate Convex Deploy Key

### 1.1 Access Convex Dashboard

- [ ] Open: https://dashboard.convex.dev/deployment/steady-anaconda-957/settings
- [ ] Sign in if prompted
- [ ] Verify you're viewing the **production** deployment (steady-anaconda-957)

### 1.2 Navigate to Deploy Keys

- [ ] Look for "Deploy Keys" in left sidebar under Settings
- [ ] Alternative locations to check:
  - Settings → CI/CD
  - Settings → API Keys
  - Settings → Integrations
  - Team Settings → Deploy Keys

### 1.3 Generate New Deploy Key

- [ ] Click "Create Deploy Key" or "Generate New Key"
- [ ] Name: `GitHub Actions CI/CD`
- [ ] Description: `Automated deployments from GitHub Actions`
- [ ] Click "Create" or "Generate"

### 1.4 Copy Deploy Key

- [ ] **IMPORTANT**: Copy the deploy key immediately (shown only once)
- [ ] Save temporarily in a secure location (you'll paste it into GitHub Secrets next)
- [ ] Key format should be: `prod:<long-alphanumeric-string>`

**If you cannot find Deploy Keys section**:
- Check Convex documentation for your specific dashboard version
- Look for "API Keys" or "Access Tokens" as alternatives
- Contact Convex support if needed

---

## Step 2: Add Secret to GitHub

### 2.1 Access GitHub Repository Settings

- [ ] Open: https://github.com/TaylorHuston/so-quoteable/settings
- [ ] Navigate to: **Secrets and variables** → **Actions**
- [ ] You should see "Actions secrets" page

### 2.2 Create New Secret

- [ ] Click: **New repository secret**
- [ ] Name: `CONVEX_DEPLOY_KEY` (exact spelling, case-sensitive)
- [ ] Value: Paste the deploy key from Step 1.4
- [ ] Click: **Add secret**

### 2.3 Verify Secret Added

- [ ] Secret appears in list: `CONVEX_DEPLOY_KEY`
- [ ] Shows: "Updated X seconds ago"
- [ ] **Do not** share or expose this secret

---

## Step 3: Verify Configuration (Optional but Recommended)

### 3.1 Test Deploy Key Locally

```bash
# Export the deploy key (paste your actual key)
export CONVEX_DEPLOY_KEY="prod:<your-key>"

# Test deployment
npx convex deploy

# Expected output:
# ✓ Functions deployed successfully
# ✓ Backend is live
```

- [ ] Deployment succeeded
- [ ] No authorization errors

**If deployment fails**:
- Verify deploy key format is correct
- Check deploy key hasn't been revoked in Convex dashboard
- Regenerate deploy key and try again

### 3.2 Clean Up Test

```bash
# Unset the environment variable
unset CONVEX_DEPLOY_KEY
```

- [ ] Environment variable cleared

---

## Step 4: Document Configuration

### 4.1 Record Deploy Key Details

**Deploy Key Created**: _________________ (date/time)

**Deploy Key Name**: GitHub Actions CI/CD

**Convex Deployment**: steady-anaconda-957 (production)

**GitHub Secret Name**: CONVEX_DEPLOY_KEY

**Rotation Schedule**: Every 180 days (next rotation: _________)

### 4.2 Update WORKLOG.md

- [ ] Add Phase 2.3 completion entry
- [ ] Document deploy key generation
- [ ] Note GitHub Secret configuration

---

## Optional: VERCEL_TOKEN (Not Required for MVP)

**Status**: SKIP for now

**Why**: Vercel's automatic Git integration already handles deployments. Only needed for custom deployment workflows.

**If you need it later**:
1. Go to: https://vercel.com/account/tokens
2. Create token: `GitHub Actions CI/CD`
3. Scope to `so-quoteable` project
4. Add as GitHub Secret: `VERCEL_TOKEN`

---

## Acceptance Criteria

Phase 2.3 is complete when:

- [x] CONVEX_DEPLOY_KEY generated from Convex dashboard
- [x] CONVEX_DEPLOY_KEY added to GitHub Secrets
- [x] Deploy key name: `CONVEX_DEPLOY_KEY` (exact)
- [x] Deploy key verified working (optional test)
- [ ] VERCEL_TOKEN added (optional, skip for MVP)
- [x] Configuration documented in WORKLOG.md

---

## Troubleshooting

### Cannot Find Deploy Keys in Convex Dashboard

1. Try these alternate locations:
   - Project Settings → CI/CD
   - Team Settings → API Keys
   - Settings → Access & Security
2. Search dashboard for "deploy" or "CI/CD"
3. Check Convex docs: https://docs.convex.dev/
4. If still not found, use personal access token instead (less secure, but works)

### GitHub Secret Not Saving

1. Verify you have admin/write access to repository
2. Check secret name has no spaces or special characters
3. Try refreshing page and adding again
4. Verify repository settings → Actions → General allows secrets

### Deploy Key Test Fails

**Error: "Unauthorized"**
- Deploy key may be for wrong deployment (check prod vs dev)
- Deploy key may have been revoked
- Regenerate and try again

**Error: "Command not found: convex"**
- Install Convex CLI: `npm install convex`
- Or use npx: `npx convex deploy`

---

## Next Steps

After completing Phase 2.3:

1. Mark Phase 2.3 complete in PLAN.md
2. Update WORKLOG.md with completion notes
3. Commit documentation changes
4. Proceed to Phase 3: Convex Production Deployment verification

---

## Reference

- Full guide: `docs/deployment/github-secrets-setup.md`
- Convex docs: https://docs.convex.dev/production/hosting
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
