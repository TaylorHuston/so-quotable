# So Quotable - AI Assistant Context

This file provides context for AI assistants working on this project.

## AI Toolkit Configuration

This project uses the AI Toolkit plugin for structured development workflows.

**Toolkit Version Information:**

- **Plugin Version**: 0.36.0
- **Last Updated**: 2025-11-23
- **Template Customizations**:
  - **conventions** (all 7 files): Fully customized with project-specific decisions (api-guidelines, architectural-principles, coding-standards, security-guidelines, testing-standards, ui-design-guidelines, versioning-and-releases)
  - **workflows** (6 files): Updated to latest templates with v0.35.0 planning improvements and v0.36.0 WORKLOG enhancements (agent-coordination, development-loop, git-workflow, pm-file-formats, pm-workflows, worklog-format)
  - **templates**: Migrated to `-template.md` naming convention, added spike-template.md and spike-workflow.md
- **Migration Notes**:
  - v0.30.0 → v0.32.0 (2025-11-19): Major restructuring: `docs/development/guidelines/` split into `conventions/`, `workflows/`, `misc/`; `pm/templates/` moved to `docs/development/templates/`. Backup: `.toolkit-backup-20251118-233538/`
  - v0.32.0 → v0.36.0 (2025-11-23): Updated workflows and READMEs, migrated template naming convention, added spike workflow. All conventions kept (project-specific). 

## Critical Rules

1. Never commit without explicit instruction to do so
2. Always review all project documentation and guidelines before starting a batch of work
3. Always have the code reviewer review any changes

## Tools
Never forget that you have access to the following, utilize them as necessary

1. Convex MCP
2. Convex CLI
3. Vercel MCP
4. Vercel CLI
5. GitHub CLI

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
# Note: Preview deployments require Convex Pro tier (free tier uses local testing)
```

## Resources

The first places to check when you get stuck or need documentation:
- https://deepwiki.com/get-convex/convex-backend
- https://deepwiki.com/get-convex/convex-auth/
- https://labs.convex.dev/auth
