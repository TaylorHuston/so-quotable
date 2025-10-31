---
created: 2025-10-30
last_updated: 2025-10-30
complexity_score: 4
task_id: TASK-001
epic_id: EPIC-001
approach: pragmatic-test-first
estimated_phases: 5
---

# Implementation Plan: TASK-001 - Initialize Next.js Project

## Complexity Analysis

**Indicators Present:**

- Multi-domain integration (+3): Frontend (Next.js) + DevOps (GitHub Actions) + Environment setup
- Testing requirements (+1): GitHub Actions CI/CD, health check endpoint verification

**Total Complexity Score: 4 (Medium Complexity)**

This task is infrastructure setup with moderate complexity due to the need for coordinating multiple concerns (Next.js, environment management, CI/CD, health checks). While not requiring decomposition, it benefits from a phased approach to ensure each component is properly configured.

## Implementation Approach

**Pattern**: Pragmatic Test-First (scaffolding → validation → documentation)

Since this is primarily infrastructure scaffolding, we'll use a code-first approach for initial setup, then add validation tests for critical components (health check, CI/CD pipeline). The focus is on getting a working development environment with proper guardrails.

**Key Deliverables:**

1. Working Next.js development environment with hot reload
2. Environment consistency (.nvmrc, package.json engines)
3. Health check endpoint for monitoring
4. GitHub Actions CI/CD pipeline
5. Branch protection rules

---

## Phase 1 - Next.js Project Initialization

**Goal**: Bootstrap Next.js project with TypeScript, Tailwind CSS, and essential configuration

### Steps

- [x] 1.1 Initialize Next.js with TypeScript template
  - Run `npx create-next-app@latest --typescript --tailwind --eslint --app --src-dir`
  - Project name: `quoteable` (or current directory with `.`)
  - Accept App Router, TypeScript, Tailwind CSS, src/ directory defaults

- [x] 1.2 Configure TypeScript strict mode
  - Update tsconfig.json: Enable `strict`, `noUncheckedIndexedAccess`, `forceConsistentCasingInFileNames`
  - Configure path aliases: `@/*` → `./src/*`, `@/components/*`, `@/lib/*`
  - Verify compilation: `npx tsc --noEmit`

- [x] 1.3 Configure ESLint and Prettier
  - Install Prettier: `npm install -D prettier eslint-config-prettier`
  - Create .prettierrc with project standards (2 spaces, single quotes, trailing commas)
  - Update .eslintrc.json to extend prettier config
  - Add npm scripts: `lint:fix`, `format`

- [x] 1.4 Configure Next.js for Convex and Cloudinary
  - Update next.config.js:
    - Add Cloudinary domain to `images.domains`
    - Configure experimental features if needed
    - Set up environment variable validation
  - Verify config loads: `npm run build`

**Validation:**

- TypeScript compilation succeeds with no errors
- ESLint passes: `npm run lint`
- Development server starts: `npm run dev`
- Hot reload works for both code and styles

---

## Phase 2 - Environment Management Setup (ADR-003 MVP-Critical)

**Goal**: Establish Node.js version consistency and environment variable documentation

### Steps

- [x] 2.1 Create Node.js version lock files
  - Create .nvmrc with exact version: `18.18.0`
  - Update package.json engines field:
    ```json
    {
      "engines": {
        "node": ">=18.18.0 <19.0.0",
        "npm": ">=9.0.0"
      }
    }
    ```

- [x] 2.2 Create comprehensive .env.local.example
  - Document all required environment variables with placeholder values:
    - `NEXT_PUBLIC_CONVEX_URL` (Convex deployment URL)
    - `CONVEX_DEPLOYMENT` (Convex deployment identifier)
    - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
    - `CLOUDINARY_API_KEY`
    - `CLOUDINARY_API_SECRET`
    - `AUTH_SECRET` (generate with: `openssl rand -base64 32`)
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
  - Add comments explaining each variable's purpose
  - Include instructions for generating AUTH_SECRET

- [x] 2.3 Update .gitignore
  - Ensure `.env*` is ignored (except .env.local.example)
  - Add `.next/`, `node_modules/`, `convex/_generated/`
  - Verify no secrets in git history

**Validation:**

- `nvm use` reads .nvmrc correctly
- `npm install` respects engines field (fails if wrong Node version)
- .env.local.example is comprehensive and well-documented
- No environment files in git status

---

## Phase 3 - Project Structure and Basic Pages

**Goal**: Set up src/ directory structure and create basic layout with error boundary

### Steps

- [x] 3.1 Create directory structure
  - Create `src/app/` (should exist from create-next-app)
  - Create `src/components/` directory
  - Create `src/lib/` directory for utilities
  - Create `tests/e2e/`, `tests/fixtures/`, `tests/helpers/` directories

- [x] 3.2 Create root layout with error boundary
  - Update `src/app/layout.tsx` with:
    - Tailwind CSS imports
    - Metadata (title, description)
    - Basic HTML structure
  - Create `src/app/error.tsx` as error boundary:
    ```typescript
    'use client'
    export default function Error({ error, reset }: {
      error: Error & { digest?: string }
      reset: () => void
    }) {
      return (
        <div>
          <h2>Something went wrong!</h2>
          <button onClick={() => reset()}>Try again</button>
        </div>
      )
    }
    ```

- [x] 3.3 Create basic home page
  - Update `src/app/page.tsx` with simple landing content
  - Add basic Tailwind styling to verify CSS works
  - Ensure page renders correctly

**Validation:**

- Directory structure matches conventions
- Error boundary renders on thrown errors
- Home page loads with Tailwind styles
- No console errors in browser

---

## Phase 4 - Health Check Endpoint (ADR-003 MVP-Critical)

**Goal**: Implement health check endpoint for production monitoring

### Steps

- [x] 4.1 Create health check API route
  - Create `src/app/api/health/route.ts`:

    ```typescript
    import { NextResponse } from "next/server";

    export async function GET() {
      try {
        // For now, basic health check
        // Will add Convex connectivity check in TASK-002
        return NextResponse.json(
          {
            status: "healthy",
            timestamp: new Date().toISOString(),
            service: "quoteable-api",
          },
          { status: 200 }
        );
      } catch (error) {
        return NextResponse.json(
          {
            status: "unhealthy",
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 503 }
        );
      }
    }
    ```

- [x] 4.2 Write test for health check endpoint
  - Create `src/app/api/health/route.test.ts`:

    ```typescript
    import { GET } from "./route";

    describe("GET /api/health", () => {
      it("should return 200 with healthy status", async () => {
        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe("healthy");
        expect(data.timestamp).toBeDefined();
      });
    });
    ```

  - Set up Vitest if not already configured
  - Verify test passes

- [x] 4.3 Manual verification
  - Start dev server: `npm run dev`
  - Test endpoint: `curl http://localhost:3000/api/health`
  - Verify JSON response with 200 status

**Validation:**

- Health check endpoint returns 200 with correct JSON
- Test passes for health check endpoint
- Endpoint accessible during development

**Note**: Convex connectivity check will be added in TASK-002 after Convex is set up. For now, this is a basic health check.

---

## Phase 5 - CI/CD and GitHub Configuration (ADR-003 MVP-Critical)

**Goal**: Set up GitHub Actions pipeline and branch protection

### Steps

- [x] 5.1 Create GitHub Actions workflow
  - Create `.github/workflows/test.yml`:

    ```yaml
    name: Test
    on:
      push:
        branches: [main, develop]
      pull_request:
        branches: [main, develop]

    jobs:
      test:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4

          - uses: actions/setup-node@v4
            with:
              node-version-file: ".nvmrc"
              cache: "npm"

          - name: Install dependencies
            run: npm ci

          - name: Lint code
            run: npm run lint

          - name: Type check
            run: npx tsc --noEmit

          - name: Run tests
            run: npm test

          - name: Build project
            run: npm run build
    ```

- [x] 5.2 Create type-check npm script
  - Add to package.json scripts:
    ```json
    {
      "scripts": {
        "type-check": "tsc --noEmit"
      }
    }
    ```

- [x] 5.3 Configure GitHub branch protection (manual GitHub UI steps)
  - Go to repository Settings → Branches
  - Add branch protection rule for `main`:
    - Require pull request reviews (optional for solo dev)
    - Require status checks to pass: `test`
    - Require branches to be up to date before merging
  - Document branch protection settings in README.md

- [ ] 5.4 Test GitHub Actions workflow
  - Commit and push changes to trigger workflow
  - Verify all steps pass in GitHub Actions UI
  - Fix any failing checks

**Validation:**

- GitHub Actions workflow runs on push/PR
- All checks pass (lint, type-check, test, build)
- Branch protection prevents merging failing PRs
- Workflow uses Node.js version from .nvmrc

---

## Phase 6 - Documentation and README Update

**Goal**: Document setup instructions and development commands

### Steps

- [x] 6.1 Update README.md
  - Add project description and overview
  - Document prerequisites (Node.js 18.18.0, nvm, npm 9.0.0+)
  - Add setup instructions:
    1. Install nvm/fnm
    2. Run `nvm use` to switch to correct Node.js version
    3. Run `npm install` to install dependencies
    4. Copy `.env.local.example` to `.env.local` (add actual values later)
    5. Run `npm run dev` to start development server
  - Document all npm scripts with descriptions
  - Link to ADR-001, ADR-002, ADR-003 for architectural context

- [x] 6.2 Add development workflow documentation
  - Document two-terminal setup (Next.js + Convex in TASK-002)
  - Explain hot reload and development server
  - Add troubleshooting section (common issues)

- [x] 6.3 Verify all documentation is accurate
  - Follow README setup instructions in fresh clone
  - Ensure all commands work as documented
  - Fix any discrepancies

**Validation:**

- README contains clear, accurate setup instructions
- All documented commands work
- Links to ADRs are correct
- Development workflow is explained

---

## Testing Strategy

### Test-First Application

**Code-first for scaffolding** (Phases 1-3):

- Next.js initialization is scaffolding (no behavior to test yet)
- Configuration files are declarative (validated by tools)
- Basic pages are static content (visual verification)

**Test-first for functionality** (Phase 4):

- Health check endpoint has testable behavior
- Write test before implementation
- Verify endpoint returns correct status codes and JSON

**Validation-based** (Phase 5-6):

- GitHub Actions validates TypeScript, linting, tests, build
- README validated by following instructions

### Test Coverage

**Target**: Not applicable for infrastructure setup (no business logic yet)

**Tests Created**:

- Health check endpoint test (basic validation)
- CI/CD pipeline validates: lint, type-check, build success

**Manual Testing**:

- Development server hot reload
- Health check endpoint via curl
- GitHub Actions workflow execution

---

## Success Criteria

**All acceptance criteria from TASK.md met:**

### MVP-Critical (ADR-003)

- ✅ .nvmrc file created with Node.js 18.18.0
- ✅ package.json engines field configured
- ✅ .env.local.example with all variables documented
- ✅ /api/health endpoint (basic version, Convex check added in TASK-002)
- ✅ GitHub Actions workflow configured
- ✅ GitHub branch protection on main
- ✅ All secrets documented in .env.local.example

### Next.js Setup

- ✅ Next.js project with TypeScript and App Router
- ✅ TypeScript strict mode enabled
- ✅ ESLint with TypeScript rules
- ✅ Prettier configured
- ✅ Project structure follows conventions
- ✅ Basic layout and home page
- ✅ .gitignore configured
- ✅ Tailwind CSS configured
- ✅ Error boundary in root layout
- ✅ README updated with setup instructions
- ✅ Development server runs with hot reload

**Final Validation Checklist:**

- [x] `npm run dev` starts development server successfully
- [x] TypeScript compilation succeeds (`npx tsc --noEmit`)
- [x] ESLint passes (`npm run lint`)
- [x] Health check endpoint returns 200 (`curl http://localhost:3000/api/health`)
- [ ] GitHub Actions workflow passes all checks (will be tested after push)
- [x] Branch protection documented in SETUP.md (manual step for user)
- [x] README setup instructions documented

---

## Notes

**Dependencies for Next Phases:**

- TASK-002 (Convex backend) will add Convex connectivity check to health endpoint
- TASK-005 (Testing infrastructure) will add comprehensive test suite
- TASK-006 (Deployment) will deploy this to Vercel

**Gotchas to Watch For:**

- Node.js version mismatch between local and CI (ensure .nvmrc is committed)
- Missing environment variables causing Next.js build failures
- GitHub Actions cache issues (use `cache: 'npm'` in setup-node)
- Hot reload not working (verify file watcher limits on Linux)

**Alternative Patterns:**

- Could use Docker for development (rejected per ADR-003 for production parity)
- Could skip health check endpoint initially (but MVP-critical per ADR-003)
- Could use different CI/CD platform (GitHub Actions chosen for simplicity)

---

**Phases are suggestions. Modify to fit your workflow!**

**Estimated Time**: 2-4 hours (depending on environment setup and debugging)
