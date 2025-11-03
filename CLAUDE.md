# So Quotable - AI Assistant Context

This file provides context for AI assistants working on this project.

## Critical Rules

1. Never commit without explicit instruction to do so
2. Always review all project documentation and guidelines before starting a batch of work
3. Always have the code reviewer review any changes

## Project Context

- **Project Name**: So Quotable
- **Description**: Allows users to generate quotes on top of images of the source of the quote. Quotes should have a verified, attributed source.
- **Tech Stack**: Next.js + Convex + Cloudinary (see [ADR-001](./docs/project/adrs/ADR-001-initial-tech-stack.md))
  - Frontend: Next.js (App Router) with TypeScript on Vercel
  - Backend: Convex (serverless functions + reactive database)
  - Images: Cloudinary (storage + transformations)
  - Auth: Convex Auth (email/password + OAuth)
  - Testing: Vitest + convex-test + Playwright (see [ADR-002](./docs/project/adrs/ADR-002-testing-framework.md))
  - Deployment: Native Node.js (no Docker), Vercel preview deployments (see [ADR-003](./docs/project/adrs/ADR-003-environment-and-deployment-strategy.md))
- **External Links**:
  - Project Management: See `pm/` directory for epics and tasks
  - Documentation: See `docs/` directory for architecture and guidelines

## Project Structure

```
quoteable/
├── pm/                    # Project management (epics, tasks, bugs)
├── docs/                  # Documentation (brief, architecture, ADRs, guidelines)
├── convex/                # Convex backend (functions, schema) - to be created
│   ├── schema.ts         # Database schema (TypeScript)
│   ├── quotes.ts         # Quote functions (queries, mutations)
│   ├── people.ts         # Person functions
│   └── images.ts         # Image metadata functions
├── src/                   # Next.js frontend - to be created
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   └── lib/              # Utilities and helpers
└── tests/                 # Test files
    ├── e2e/              # Playwright E2E tests
    ├── fixtures/         # Test data
    └── helpers/          # Test utilities
```

## Development Environment Setup

**Prerequisites**:

- Node.js 18.18.0 (use nvm/fnm for version management)
- npm 9.0.0+

**Initial Setup**:

```bash
# Use correct Node.js version
nvm use  # Reads from .nvmrc

# Install dependencies
npm install

# Start development (requires 2 terminals)
# Terminal 1: Next.js frontend
npm run dev

# Terminal 2: Convex backend
npx convex dev
```

## Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server (localhost:3000)
npx convex dev          # Start Convex backend (separate terminal)

# Testing
npm test                # Run tests in watch mode (Vitest)
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run with coverage report
npm run test:e2e        # Run E2E tests (Playwright)
npm run test:e2e:ui     # Run E2E tests with UI

# Code Quality
npm run lint            # Lint code (ESLint)
npm run type-check      # TypeScript type checking

# Build
npm run build           # Build for production

# Deployment
git push origin main    # Auto-deploys to Vercel production
# Preview deployments created automatically for PRs
```

## Workflow

See [GETTING-STARTED.md](./GETTING-STARTED.md) for the complete AI-assisted development workflow.

## Current Focus

**Phase**: MVP Infrastructure Setup (2025-10-30 to present)

**Completed and Merged to Develop**:

- ✅ Project structure initialized with ai-toolkit
- ✅ Tech stack decided and documented (ADR-001)
- ✅ Testing framework decided and documented (ADR-002)
- ✅ Deployment strategy decided and documented (ADR-003)
- ✅ DevOps review completed (monitoring, CI/CD, disaster recovery)
- ✅ Architecture overview updated with deployment details
- ✅ Documentation synchronized across all ADRs
- ✅ Branch structure created (main, develop, feature branches)
- ✅ TASK-001: Next.js project initialized with TypeScript (merged 2025-10-30)
- ✅ TASK-002: Convex backend setup with comprehensive testing (merged 2025-11-01, 97.36% coverage)
- ✅ TASK-003: Cloudinary integration complete (merged 2025-11-02, 92% coverage, 146 tests)
  - Code Review: 94/100 (Production Ready)
  - Security Audit: 85/100 (Secure for development)

**Current Branch**: develop

**Next Task**: TASK-004 - Convex Auth implementation (EPIC-001: 50% complete)

**Next Steps**:

1. ✅ ~~Initialize Next.js project with TypeScript (.nvmrc, package.json engines)~~
2. ✅ ~~Set up Convex backend and deploy to dev environment~~
3. ✅ ~~Configure Cloudinary account and integration~~
4. ✅ ~~Implement database schema in Convex (people, quotes, images, generatedImages)~~
5. ✅ ~~Set up testing infrastructure (Vitest, Playwright, convex-test)~~
6. Implement Convex Auth with email/password and OAuth
7. Set up MVP monitoring (health check, Vercel Analytics)
8. Configure deployment pipeline

**Current Priorities**:

- Backend-first development approach (TASK-002 ✅, TASK-003 ✅)
- TDD/BDD workflow with comprehensive test coverage (97.36% → 92% with Cloudinary)
- Type-safe end-to-end development with TypeScript
- MVP-critical infrastructure (Node version management, CI/CD basics, health checks)
- Native Node.js development (no Docker for MVP)

## Cloudinary Integration (TASK-003 Complete)

**Account**: Cloud name `dggww7kzb`, Free tier (25GB storage/bandwidth)

**Upload Presets**:
- `base-images`: Permanent person photos (folder: so-quotable/people)
- `generated-images`: Temporary quote images with 30-day auto-deletion (folder: so-quotable/generated)

**Key Files**:
- `convex/cloudinary.ts`: Server-side upload action (uses "use node" directive)
- `convex/generatedImages.ts`: Database CRUD for generated quote images
- `src/lib/cloudinary-transformations.ts`: URL transformation helpers (pure functions)
- `scripts/verify-cloudinary-integration.ts`: Comprehensive verification script

**Features Implemented**:
1. **Server-Side Upload**: Convex action for signed Cloudinary uploads
2. **Database Integration**: Automatic metadata storage (images, generatedImages tables)
3. **URL Transformations**: Text overlays, image optimization, resize, background overlays
4. **Auto-Deletion**: Generated images automatically deleted after 30 days
5. **CDN Delivery**: Automatic format/quality optimization (WebP for Chrome, JPEG for Safari)

**Environment Variables** (set in Convex dashboard for actions):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (for client-side URL building)

**Testing**: 146 tests passing, 92% coverage
- convex/generatedImages.ts: 100% coverage (18 tests)
- src/lib/cloudinary-transformations.ts: 100% coverage (60 tests)
- convex/cloudinary.ts: 62.5% coverage (10 validation tests, upload requires real API)

**Gotchas**:
- Must use "use node" directive in convex/cloudinary.ts for Cloudinary SDK
- Environment variables for actions must be set in Convex dashboard (not .env.local)
- Transformation order matters: resize → background → text → optimize
- Commas must be URL-encoded in text overlays (they separate transformation parameters)

**Post-MVP Enhancements**:
- Cleanup job via Convex cron to sync generatedImages table with Cloudinary deletions
- Cloudinary webhooks for real-time deletion tracking
- Custom fonts for text overlays
- Advanced transformations (facial recognition, smart cropping)

---

_This file helps AI assistants understand your project. Keep it updated as your project evolves._
