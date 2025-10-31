# EPIC-001 - Action Items for Specification Fixes

**Date**: 2025-10-30
**Status**: Ready for implementation
**Estimated Time to Fix**: 2 hours

---

## Critical Fixes (Must Do Before Implementation)

### 1. TASK-002: Update Database Schema Specifications

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-002-convex-backend/TASK.md`

**Replace this acceptance criteria**:
```yaml
- [ ] Images table with fields: personId, cloudinaryId, url, isPrimary, caption
```

**With**:
```yaml
- [ ] Images table with fields: personId, cloudinaryId, category, description, isPrimary, usageCount, width, height, source, license, createdAt
```

**Replace this**:
```yaml
- [ ] GeneratedImages table with fields: quoteId, imageId, cloudinaryId, url, createdAt, expiresAt
```

**With**:
```yaml
- [ ] GeneratedImages table with fields: quoteId, imageId, cloudinaryId, userId, viewCount, createdAt, expiresAt, isPermanent
```

**Add new acceptance criteria**:
```yaml
- [ ] Indexes explicitly defined:
  - people: by_name (on name)
  - quotes: by_person (on personId), search_text (search index on text)
  - images: by_person (on personId), by_person_primary (on personId + isPrimary)
  - generatedImages: by_quote (on quoteId), by_expiration (on expiresAt)
- [ ] Cron job implemented in convex/crons.ts for daily image cleanup
- [ ] Cleanup job queries generatedImages where expiresAt < Date.now()
- [ ] Expired images deleted from Cloudinary via API
- [ ] Expired image records removed from database
- [ ] Cron job scheduled daily at 2 AM UTC
```

**Modify seed data criteria**:
```yaml
- [ ] Development database seeded with: 3 people, 5 quotes, 2 images per person
```

**Estimated Time**: 30 minutes

---

### 2. TASK-002: Add Cron Job Technical Notes

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-002-convex-backend/TASK.md`

**Add to Technical Notes section**:
```markdown
- Create convex/crons.ts for scheduled cleanup:
  - Daily job at 2 AM UTC
  - Query expired generated images
  - Delete from Cloudinary using cloudinary.uploader.destroy()
  - Remove database records via ctx.db.delete()
  - Log cleanup statistics
```

**Estimated Time**: 10 minutes

---

### 3. TASK-004: Add ConvexAuthProvider Setup

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-004-convex-auth/TASK.md`

**Add to Acceptance Criteria**:
```yaml
- [ ] ConvexAuthProvider wraps Next.js app in app/layout.tsx
- [ ] Auth state accessible via useAuthActions() hook
- [ ] useAuth() hook provides current user session
- [ ] Document email service configuration (Convex built-in vs external SMTP)
```

**Add to Technical Notes**:
```markdown
- Wrap application in app/layout.tsx:
  ```typescript
  import { ConvexAuthProvider } from "@convex-dev/auth/react";

  export default function RootLayout({ children }) {
    return (
      <html>
        <body>
          <ConvexAuthProvider>{children}</ConvexAuthProvider>
        </body>
      </html>
    );
  }
  ```
- Use auth hooks in components:
  - useAuthActions() for signIn/signOut/signUp
  - useAuth() for current user state
```

**Add to Dependencies**:
```markdown
- Research Convex Auth email capabilities (may have built-in email sending)
- If external SMTP needed, document provider decision
```

**Estimated Time**: 20 minutes

---

### 4. TASK-004: Document Google OAuth Setup

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-004-convex-auth/TASK.md`

**Add to Technical Notes**:
```markdown
- Google OAuth setup steps:
  1. Go to Google Cloud Console (console.cloud.google.com)
  2. Create new project or select existing
  3. Enable Google+ API (APIs & Services → Library)
  4. Configure OAuth consent screen (APIs & Services → OAuth consent screen)
     - Set application name: "So Quotable"
     - Add authorized domains
  5. Create OAuth 2.0 credentials (APIs & Services → Credentials → Create Credentials)
  6. Add authorized redirect URIs:
     - Development: http://localhost:3000/api/auth/callback/google
     - Production: https://[your-domain]/api/auth/callback/google
  7. Copy Client ID and Client Secret to environment variables
  8. Test OAuth flow on localhost first
```

**Estimated Time**: 15 minutes

---

### 5. TASK-005: Fix Test Directory Structure

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-005-testing-infrastructure/TASK.md`

**Replace this acceptance criteria**:
```yaml
- [ ] Test directory structure created (tests/unit, tests/e2e, tests/fixtures)
```

**With**:
```yaml
- [ ] Test directory structure created:
  - tests/e2e/ for Playwright E2E tests (*.spec.ts)
  - tests/fixtures/ for shared test data
  - tests/helpers/ for test utilities
  - Unit/integration tests co-located with source (*.test.ts)
```

**Add to Acceptance Criteria**:
```yaml
- [ ] Sample tests created matching ADR-002 patterns:
  - convex/quotes.test.ts (Convex function test with convex-test)
  - src/components/QuoteCard/QuoteCard.test.tsx (React component test)
  - tests/e2e/quoteGeneration.spec.ts (E2E test with Playwright)
- [ ] All sample tests use Given-When-Then commenting style
```

**Modify Technical Notes**:
```markdown
- Configure vitest.config.ts:
  - Single unified config (not separate for frontend/backend)
  - Path aliases matching tsconfig
  - Coverage thresholds: 80% backend, 70% frontend
```

**Add to Technical Notes**:
```markdown
- Follow ADR-002 test patterns exactly:
  - Use describe/it structure
  - Add Given-When-Then comments for BDD style
  - Reference ADR-002 lines 317-403 for sample implementations
```

**Estimated Time**: 20 minutes

---

### 6. TASK-006: Specify Monitoring Strategy

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-006-deployment-pipeline/TASK.md`

**Replace vague monitoring criteria**:
```yaml
- [ ] Monitoring and error tracking set up
```

**With specific MVP monitoring**:
```yaml
- [ ] Monitoring configured (MVP free-tier tools only):
  - Vercel Analytics enabled in dashboard
  - Convex Dashboard metrics accessible
  - Next.js error boundaries in app/layout.tsx and key pages
  - Console.error() logs searchable in Vercel logs
- [ ] Document how to access logs and metrics
- [ ] No Sentry or paid monitoring tools for MVP
```

**Add to Acceptance Criteria**:
```yaml
- [ ] Post-deployment smoke tests defined and documented:
  - Homepage loads successfully (200 status)
  - Convex query returns data (backend connection)
  - Cloudinary image loads (CDN accessible)
  - Auth login page renders
```

**Modify Technical Notes**:
```markdown
- Monitoring:
  - Enable Vercel Analytics in project settings
  - Access Convex metrics at convex.dev dashboard
  - Implement error boundaries:
    ```typescript
    // app/error.tsx
    'use client';
    export default function Error({ error, reset }) {
      console.error('Application error:', error);
      return <div>Something went wrong</div>;
    }
    ```
  - Defer Sentry to post-MVP (adds complexity and cost)
```

**Add to Testing section**:
```markdown
- Run post-deployment smoke tests:
  ```bash
  curl https://[your-app].vercel.app/  # Should return 200
  # Check Convex Dashboard for function metrics
  # Visit app and verify images load from Cloudinary
  # Test login page renders
  ```
```

**Estimated Time**: 20 minutes

---

### 7. TASK-006: Mark Custom Domain Optional

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-006-deployment-pipeline/TASK.md`

**Modify acceptance criteria**:
```yaml
- [ ] Custom domain configured (if available)
```

**To**:
```yaml
- [ ] OPTIONAL: Custom domain configured (can use vercel.app subdomain for MVP)
```

**Estimated Time**: 2 minutes

---

### 8. TASK-003: Make Webhook Optional

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-003-cloudinary-integration/TASK.md`

**Modify acceptance criteria**:
```yaml
- [ ] Cloudinary webhook configured for tracking image deletions
```

**To**:
```yaml
- [ ] OPTIONAL (Future Enhancement): Document Cloudinary webhook setup for deletion audit trail
```

**Modify acceptance criteria**:
```yaml
- [ ] Sample images uploaded and transformation tested
```

**To**:
```yaml
- [ ] Test image uploaded to verify upload/transformation pipeline (1 generic placeholder)
```

**Estimated Time**: 5 minutes

---

### 9. TASK-006: Document Database Backup Strategy

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-006-deployment-pipeline/TASK.md`

**Add to Technical Notes**:
```markdown
- Database backup strategy:
  - Research Convex automatic backup capabilities
  - Document export functionality (likely built-in)
  - If automatic: Document how to access/restore backups
  - If manual: Defer to post-MVP (low priority for hobby project)
```

**Add to Acceptance Criteria**:
```yaml
- [ ] Database backup approach documented (Convex automatic vs. manual)
```

**Estimated Time**: 10 minutes

---

## Secondary Recommendations (Should Do)

### 10. TASK-001: Add Path Alias Specifications

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-001-initialize-nextjs/TASK.md`

**Add to Technical Notes**:
```markdown
- Configure path aliases in tsconfig.json:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/components/*": ["./src/components/*"],
        "@/lib/*": ["./src/lib/*"],
        "@/app/*": ["./src/app/*"],
        "@/convex/*": ["./convex/*"]
      }
    }
  }
  ```
```

**Estimated Time**: 5 minutes

---

### 11. TASK-001: Add Smoke Test

**File**: `/home/taylor/src/quoteable/pm/issues/TASK-001-initialize-nextjs/TASK.md`

**Add to Testing section**:
```yaml
- Verify homepage renders at http://localhost:3000
- Confirm no TypeScript errors in terminal output
```

**Estimated Time**: 3 minutes

---

### 12. Create Environment Variable Template

**File**: Create `/home/taylor/src/quoteable/.env.local.example`

```bash
# Convex
CONVEX_DEPLOYMENT=dev:[your-deployment]  # From `npx convex dev`
NEXT_PUBLIC_CONVEX_URL=https://[project].convex.cloud

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret  # Secret - never commit
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name

# Authentication
AUTH_SECRET=your-random-secret  # Generate with: openssl rand -base64 32
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret  # Secret - never commit

# Email (if external SMTP needed)
# EMAIL_SERVER=smtp://user:pass@smtp.example.com:587

# Optional - Monitoring (defer to post-MVP)
# SENTRY_DSN=https://...
```

**Add to TASK-001 Acceptance Criteria**:
```yaml
- [ ] .env.local.example created with all required environment variables
- [ ] .env.local added to .gitignore
```

**Estimated Time**: 10 minutes

---

## Summary of Changes

| Task | Changes | Time |
|------|---------|------|
| TASK-002 | Schema fields + cron job + indexes | 40 min |
| TASK-004 | ConvexAuthProvider + Google OAuth steps | 35 min |
| TASK-005 | Test structure + sample references | 20 min |
| TASK-006 | Monitoring + smoke tests + backups | 30 min |
| TASK-003 | Optional webhook + test image | 5 min |
| TASK-001 | Path aliases + smoke test + .env.example | 18 min |
| **Total** | | **≈2 hours** |

---

## Verification Checklist

After making changes, verify:

- [ ] All acceptance criteria in TASK-002 match architecture document schema (lines 318-383)
- [ ] TASK-002 includes cron job for 30-day image cleanup
- [ ] TASK-004 specifies ConvexAuthProvider setup in layout.tsx
- [ ] TASK-005 uses co-located tests (not tests/unit/)
- [ ] TASK-005 references ADR-002 sample test patterns
- [ ] TASK-006 has concrete monitoring strategy (Vercel + Convex only)
- [ ] TASK-006 defines 4 smoke tests
- [ ] TASK-003 marks webhook as optional
- [ ] TASK-001 includes .env.local.example
- [ ] All 6 tasks reviewed for consistency

---

## Next Steps After Fixes

1. **Review updated tasks** (30 minutes)
2. **Update EPIC-001** with revised time estimate (37-48 hours)
3. **Begin implementation** with TASK-001
4. **Follow backend-first approach**: TASK-001 → TASK-002 (critical) → TASK-003 + TASK-004 (parallel) → TASK-005 → TASK-006

---

**Status**: Ready to implement after specification updates
**Confidence**: 95% (post-fixes)
**Risk Level**: Low

