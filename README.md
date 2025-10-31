# So Quotable

Allows users to generate quotes on top of images of the source of the quote.

Quotes should have a verified, attributed source.

This project uses the AI Toolkit plugin for structured, AI-assisted development.

## Quick Start

### Prerequisites

1. **Claude Code with AI Toolkit Plugin**: Already configured for this project

2. **Review Project Context**:
   - See `CLAUDE.md` for tech stack and project details
   - See `GETTING-STARTED.md` for complete AI Toolkit workflow guide

### Start Developing

```bash
# 1. Complete your project brief
/project-brief

# 2. Create your first epic
/epic

# 3. Plan and implement tasks
/plan TASK-001
/implement TASK-001 1.1

# 4. Check status
/status
```

## Project Structure

```
quoteable/
├── CLAUDE.md              # AI assistant context
├── GETTING-STARTED.md     # AI Toolkit workflow guide
├── pm/                    # Project management
│   ├── epics/            # Feature epics (EPIC-###.md)
│   ├── issues/           # Tasks and bugs (TASK-###.md, BUG-###.md)
│   └── templates/        # Templates for new items
├── docs/                 # Documentation
│   ├── project-brief.md # Product vision
│   ├── project/         # Technical docs, ADRs
│   └── development/     # Dev guidelines
└── src/                  # Your application code (to be created)
```

## AI Toolkit Commands

### Planning & Design

- `/project-brief` - Complete project brief through conversation
- `/epic` - Create or refine feature epics
- `/plan TASK-###` - Add implementation plan to task

### Development

- `/implement TASK-### PHASE` - Execute implementation phase
- `/test-fix` - Automatically detect and fix test failures
- `/commit` - Create quality-checked git commit

### Quality & Documentation

- `/quality` - Comprehensive quality assessment
- `/security-audit` - Security vulnerability scan
- `/docs` - Generate, validate, or sync documentation

### Project Management

- `/status` - View project status and progress
- `/comment "text"` - Log manual changes

See `GETTING-STARTED.md` for complete workflow guide.

## Tech Stack

See [ADR-001](./docs/project/adrs/ADR-001-initial-tech-stack.md) for detailed rationale.

- **Frontend**: Next.js (App Router) + TypeScript
- **Backend**: Convex (serverless functions + reactive database)
- **Database**: Convex (document database with TypeScript schema)
- **Images**: Cloudinary (storage + transformations)
- **Auth**: Convex Auth (email/password + OAuth)
- **Hosting**: Vercel (frontend) + Convex Cloud (backend)

**Testing** (see [ADR-002](./docs/project/adrs/ADR-002-testing-framework.md)):

- **Unit/Integration**: Vitest + convex-test
- **E2E**: Playwright
- **Coverage**: 80%+ backend, 70%+ frontend

## Development

### Prerequisites

- Node.js 18.18.0 (managed via `.nvmrc` - use `nvm use`)
- npm 9.0.0+

### Setup

```bash
# Use correct Node.js version
nvm use

# Install dependencies
npm install

# Copy environment template (fill in actual values)
cp .env.local.example .env.local
```

### Development Commands

```bash
# Start Next.js dev server (Terminal 1)
npm run dev

# Start Convex backend (Terminal 2 - when Convex is set up)
npx convex dev

# Run tests
npm test                # Watch mode
npm run test:run        # Single run
npm run test:coverage   # With coverage

# Code quality
npm run lint            # Check linting
npm run lint:fix        # Fix linting issues
npm run type-check      # TypeScript check
npm run format          # Format code
npm run format:check    # Check formatting

# Build
npm run build           # Production build
```

### Health Check

```bash
curl http://localhost:3000/api/health
# Expected: {"status":"healthy","timestamp":"...","service":"quoteable-api"}
```

## License

TBD
