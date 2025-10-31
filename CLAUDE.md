# So Quotable - AI Assistant Context

This file provides context for AI assistants working on this project.

## Project Context

- **Project Name**: So Quotable
- **Description**: Allows users to generate quotes on top of images of the source of the quote. Quotes should have a verified, attributed source.
- **Tech Stack**: Next.js + Convex + Cloudinary (see [ADR-001](./docs/project/adrs/ADR-001-initial-tech-stack.md))
  - Frontend: Next.js (App Router) with TypeScript on Vercel
  - Backend: Convex (serverless functions + reactive database)
  - Images: Cloudinary (storage + transformations)
  - Auth: Convex Auth (email/password + OAuth)
  - Testing: Vitest + convex-test + Playwright (see [ADR-002](./docs/project/adrs/ADR-002-testing-framework.md))
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

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (Next.js)
npm run dev

# Run Convex backend (in separate terminal)
npx convex dev

# Run tests (Vitest watch mode)
npm test

# Run tests with UI
npm run test:ui

# Run test coverage
npm run test:coverage

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Build for production
npm run build

# Lint code
npm run lint
```

## Workflow

See [GETTING-STARTED.md](./GETTING-STARTED.md) for the complete AI-assisted development workflow.

## Current Focus

**Phase**: Initial Setup & Architecture (2025-10-30)

**Completed**:
- ✅ Project structure initialized with ai-toolkit
- ✅ Tech stack decided and documented (ADR-001)
- ✅ Testing framework decided and documented (ADR-002)
- ✅ Architecture overview updated
- ✅ Documentation synchronized

**Next Steps**:
1. Initialize Next.js project with TypeScript
2. Set up Convex backend and deploy to dev environment
3. Configure Cloudinary account and integration
4. Implement database schema in Convex
5. Set up testing infrastructure (Vitest, Playwright, convex-test)
6. Create first epic for core quote browsing functionality

**Current Priorities**:
- Backend-first development approach
- TDD/BDD workflow with comprehensive test coverage
- Type-safe end-to-end development with TypeScript

---

*This file helps AI assistants understand your project. Keep it updated as your project evolves.*
