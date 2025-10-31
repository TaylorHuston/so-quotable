# Post-Initialization Setup

This document lists manual configuration steps that must be completed after the initial Next.js setup.

## GitHub Repository Configuration

### Branch Protection Rules

Configure branch protection for the `main` branch in GitHub repository settings:

1. Go to: `Settings` → `Branches` → `Branch protection rules`
2. Click "Add rule" for branch name pattern: `main`
3. Enable the following settings:
   - ✅ **Require a pull request before merging**
     - ✅ Require approvals: 1
     - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - ✅ Require branches to be up to date before merging
     - Add required status checks:
       - `test` (from .github/workflows/test.yml)
   - ✅ **Require conversation resolution before merging**
   - ✅ **Do not allow bypassing the above settings**
4. Save changes

### Actions Permissions

Ensure GitHub Actions is enabled:

1. Go to: `Settings` → `Actions` → `General`
2. Under "Actions permissions":
   - ✅ Allow all actions and reusable workflows
3. Under "Workflow permissions":
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests

## Environment Setup

### Local Development

1. **Copy environment template**:

   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in environment variables** (see `.env.local.example` for instructions):
   - Convex backend URL (after completing TASK-002)
   - Cloudinary credentials (after completing TASK-003)
   - Auth secrets (generate with `openssl rand -base64 32`)
   - OAuth credentials (optional for MVP)

### Vercel Deployment (After TASK-006)

1. **Connect repository to Vercel**:
   - Import project at https://vercel.com/new
   - Select the GitHub repository
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. **Configure environment variables in Vercel**:
   - Go to: Project Settings → Environment Variables
   - Add all variables from `.env.local.example`
   - Set appropriate values for Production, Preview, and Development

3. **Configure production branch**:
   - Git Branch: `main`

## Convex Setup (TASK-002)

After initializing Convex:

1. Run `npx convex dev` to create a new project
2. Copy the deployment URL to `.env.local` as `NEXT_PUBLIC_CONVEX_URL`
3. Update the health check endpoint to test Convex connectivity

## Cloudinary Setup (TASK-003)

1. Create account at https://cloudinary.com
2. Get credentials from Dashboard
3. Add to `.env.local`:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## Verification

After completing manual setup:

```bash
# Verify branch protection
# Try to push directly to main (should fail)
git checkout main
git commit --allow-empty -m "test"
git push origin main  # Should be rejected

# Verify Actions workflow
# Push to feature branch and create PR
git checkout -b test-actions
git commit --allow-empty -m "test workflow"
git push origin test-actions
# Check Actions tab for workflow run

# Verify local environment
npm run dev
npm run test:run
npm run build
curl http://localhost:3000/api/health
```

## Checklist

- [ ] GitHub branch protection configured for `main`
- [ ] GitHub Actions permissions enabled
- [ ] `.env.local` created and populated
- [ ] Convex backend connected (after TASK-002)
- [ ] Cloudinary credentials added (after TASK-003)
- [ ] Vercel project connected (after TASK-006)
- [ ] Branch protection verified (push to main fails)
- [ ] GitHub Actions workflow verified (runs on PR)
