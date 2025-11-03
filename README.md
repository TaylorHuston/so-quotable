# So Quotable

> Generate beautiful, shareable quote images with verified sources and proper attribution.

So Quotable allows users to create visually appealing quote graphics overlaid on images of the quote's source (author, speaker, or subject). Every quote requires a verified, attributed source to ensure authenticity and credibility.

## ✨ Features

- **Quote Generation** - Create custom quote graphics with text overlays on source images
- **Verified Sources** - All quotes require verified attribution and source documentation
- **Image Management** - Cloudinary-powered image storage, transformations, and CDN delivery
- **User Authentication** - Email/password and Google OAuth authentication via Convex Auth
- **Real-time Database** - Reactive data layer with Convex for instant updates
- **Type-Safe** - End-to-end TypeScript for frontend and backend
- **Comprehensive Testing** - 95%+ test coverage with Vitest, convex-test, and Playwright

## 🛠 Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router) + [TypeScript](https://www.typescriptlang.org/)
- **Backend**: [Convex](https://www.convex.dev/) (serverless functions + reactive database)
- **Images**: [Cloudinary](https://cloudinary.com/) (storage, transformations, CDN)
- **Auth**: [Convex Auth](https://labs.convex.dev/auth) (email/password + OAuth)
- **Testing**: [Vitest](https://vitest.dev/) + [convex-test](https://www.npmjs.com/package/convex-test) + [Playwright](https://playwright.dev/)
- **Deployment**: [Vercel](https://vercel.com/) (frontend) + [Convex Cloud](https://www.convex.dev/) (backend)

**Architecture Decisions**: See [ADR-001: Tech Stack](./docs/project/adrs/ADR-001-initial-tech-stack.md), [ADR-002: Testing](./docs/project/adrs/ADR-002-testing-framework.md), [ADR-003: Deployment](./docs/project/adrs/ADR-003-environment-and-deployment-strategy.md)

## 🚀 Quick Start

### Prerequisites

- Node.js 18.18.0 (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- npm 9.0.0+
- Convex account ([sign up free](https://www.convex.dev/))
- Cloudinary account ([sign up free](https://cloudinary.com/))

### Installation

```bash
# Use correct Node.js version
nvm use

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Fill in environment variables (see Configuration below)
# Then start development servers
```

### Configuration

Required environment variables in `.env.local`:

```bash
# Next.js (Convex)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

Required environment variables in **Convex Dashboard** (for actions):

```bash
# Cloudinary (server-side)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Convex Auth
AUTH_SECRET=your-random-secret  # Generate with: openssl rand -base64 32
SITE_URL=http://localhost:3000

# Google OAuth (optional)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### Development

Start both servers in separate terminals:

```bash
# Terminal 1: Next.js frontend (port 3000)
npm run dev

# Terminal 2: Convex backend
npx convex dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
quotable/
├── convex/                 # Convex backend (serverless functions + schema)
│   ├── schema.ts          # Database schema (people, quotes, images, users)
│   ├── quotes.ts          # Quote functions (queries, mutations)
│   ├── people.ts          # Person management
│   ├── images.ts          # Image metadata
│   ├── auth.ts            # Authentication logic
│   └── cloudinary.ts      # Cloudinary integration
├── src/                   # Next.js frontend
│   ├── app/              # Next.js App Router pages
│   │   ├── api/         # API routes (health check)
│   │   ├── login/       # Login page
│   │   ├── register/    # Registration page
│   │   └── dashboard/   # Protected dashboard
│   ├── components/       # React components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── UserProfile.tsx
│   │   └── GoogleIcon.tsx
│   ├── lib/             # Utilities and helpers
│   │   └── cloudinary-transformations.ts  # Image URL builders
│   └── middleware.ts    # Route protection middleware
├── tests/                # Test files (co-located with source)
├── docs/                 # Documentation
│   ├── project/         # Architecture, ADRs, design
│   └── development/     # Development guidelines
├── pm/                   # Project management (epics, tasks)
└── scripts/              # Utility scripts
```

## 📚 Documentation

- **[Getting Started Guide](./GETTING-STARTED.md)** - Detailed development workflow and AI-assisted development
- **[Project Brief](./docs/project-brief.md)** - Product vision and objectives
- **[Architecture Overview](./docs/project/architecture-overview.md)** - System architecture and design
- **[Architecture Decision Records](./docs/project/adrs/)** - Technical decision documentation
- **[Development Guidelines](./docs/development/guidelines/)** - Coding standards, testing, security

## 🧪 Testing

### Running Tests

```bash
# Unit & integration tests (watch mode)
npm test

# Single run
npm run test:run

# With coverage report (95%+ target)
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

### Test Coverage

Current coverage: **92%+** (217 tests passing)

- Backend functions: 95%+ coverage
- Frontend components: E2E coverage via Playwright
- Cloudinary integration: 100% coverage (transformations)

See [Testing Standards](./docs/development/guidelines/testing-standards.md) for testing approach.

## 🌐 Deployment

### Environments

- **Production**: Automatic deployment from `main` branch to Vercel
- **Development**: `develop` branch for integration testing
- **Preview**: Automatic preview deployments for all pull requests

### Deployment Commands

```bash
# Convex deployment (backend)
npx convex deploy --prod

# Vercel deployment (frontend - auto-deploys via git push)
git push origin main
```

See [ADR-003: Deployment Strategy](./docs/project/adrs/ADR-003-environment-and-deployment-strategy.md) for details.

## 🔍 Code Quality

### Linting & Formatting

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code (Prettier)
npm run format

# Check formatting
npm run format:check

# TypeScript type checking
npm run type-check
```

### Pre-commit Checks

All commits must pass:
- ✅ ESLint validation
- ✅ TypeScript compilation
- ✅ Prettier formatting
- ✅ Test suite (all tests passing)

## 🤝 Contributing

This project uses [AI Toolkit](https://github.com/cktang88/ai-toolkit) for structured, AI-assisted development.

### Development Workflow

1. Review [Development Loop](./docs/development/guidelines/development-loop.md) for TDD/BDD workflow
2. Check [Git Workflow](./docs/development/guidelines/git-workflow.md) for branching strategy
3. Follow [Coding Standards](./docs/development/guidelines/coding-standards.md) for code style

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/TASK-###-description` - Feature branches

All merges to `develop` require:
- ✅ All tests passing
- ✅ Code review approval (90/100+ score)
- ✅ Security audit (for security-relevant changes)

## 📄 License

TBD

---

**Project Status**: MVP Development (Phase: Infrastructure Setup)

**Current Focus**: Authentication (TASK-004 complete), preparing for core quote generation features

**Latest**: Convex Auth implementation complete with email/password and Google OAuth (merged 2025-11-03)
