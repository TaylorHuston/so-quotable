# So Quotable

> Generate beautiful, shareable quote images with verified sources and proper attribution.

So Quotable allows users to create visually appealing quote graphics overlaid on images of the quote's source (author, speaker, or subject). Every quote requires a verified, attributed source to ensure authenticity and credibility.

## ✨ Features

- **Quote Generation** - Create custom quote graphics with text overlays on source images
- **Verified Sources** - All quotes require verified attribution and source documentation
- **Image Management** - Cloudinary-powered image storage, transformations, and CDN delivery
- **User Authentication** - Secure authentication with multiple features:
  - Email/password with NIST-compliant validation (12+ chars, mixed case, numbers, symbols)
  - Google OAuth single sign-on
  - Protected routes with Next.js middleware
  - Session management (24hr default, 7d with remember-me)
  - Real-time password strength indicator
  - Duplicate email detection with debounced validation
  - Rate limiting (5 failed attempts → 15min lockout)
  - Email verification (MVP: console logging, production: email service integration ready)
- **Real-time Database** - Reactive data layer with Convex for instant updates
- **Type-Safe** - End-to-end TypeScript for frontend and backend
- **Comprehensive Testing** - 95%+ test coverage (580 tests) with Vitest, convex-test, and Playwright

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

- Node.js 20.x (use [nvm](https://github.com/nvm-sh/nvm) for version management)
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

# Convex Auth (REQUIRED)
AUTH_SECRET=your-random-secret  # Generate with: openssl rand -base64 32
SITE_URL=http://localhost:3000  # Use production URL in production

# Google OAuth (REQUIRED for "Sign in with Google")
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-your-google-client-secret

# Email Verification (future)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For verification links
```

**Google OAuth Setup** (detailed guide in [docs/deployment/auth-setup.md](./docs/deployment/auth-setup.md)):
1. Create project in [Google Cloud Console](https://console.cloud.google.com/)
2. Configure OAuth consent screen
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Secret to environment variables above

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

- **[Project Brief](./docs/project-brief.md)** - Product vision and objectives
- **[Architecture Overview](./docs/project/architecture-overview.md)** - System architecture and design
- **[Architecture Decision Records](./docs/project/adrs/)** - Technical decision documentation
- **[Development Conventions](./docs/development/conventions/)** - Coding standards, testing, security
- **[Development Workflows](./docs/development/workflows/)** - Development loop, git workflow

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

Current coverage: **95%+** (580 tests total, 553 passing, 25 with known issues, 2 skipped)

**Test Breakdown by Domain**:
- **Backend Functions**: 97%+ coverage (230+ tests)
  - Convex Auth: 100% (auth.ts, users.ts, emailVerification.ts, passwordReset.ts)
  - Cloudinary: 92% (generatedImages.ts, cloudinary.ts)
  - Database: 100% (quotes.ts, people.ts, images.ts)
  - Health: 100% (health.ts - 5 tests)
- **Frontend Components**: 100% coverage (100+ tests)
  - LoginForm: Email/password + Google OAuth flows
  - RegisterForm: Registration + duplicate detection + password strength
  - ForgotPassword/ResetPassword: Password reset flows
  - UserProfile: Auth state rendering + sign out
  - Middleware: Protected routes (24 tests, 100% coverage)
- **API Routes**: 100% coverage (24+ tests)
  - Health endpoint: Unit + integration tests (29 tests)
- **Utilities**: 100% coverage (70+ tests)
  - Email normalization, slug generation, password validation
  - Debounce utility (performance optimization)
  - Cloudinary transformations (60 tests)
- **E2E Tests**: 22 Playwright tests (authentication flows)
  - Email/password registration and login
  - Google OAuth sign-in
  - Protected route redirection
  - Session persistence

See [Testing Standards](./docs/development/conventions/testing-standards.md) for testing approach.

## 🌐 Deployment

### Deployment Environments

| Environment | URL | Backend | Purpose |
|-------------|-----|---------|---------|
| **Production** | [https://so-quoteable.vercel.app](https://so-quoteable.vercel.app) | [steady-anaconda-957](https://dashboard.convex.dev/deployment/steady-anaconda-957) | Live application for users |
| **Development** | http://localhost:3000 | [cheery-cow-298](https://dashboard.convex.dev/deployment/cheery-cow-298) | Local development and testing |

### Quick Start - Deploy to Production

```bash
# 1. Run tests locally
npm run test:run        # Unit and integration tests
npm run test:e2e        # End-to-end tests
npm run type-check      # TypeScript validation

# 2. Push to main → Automatic deployment
git push origin main    # Triggers Vercel + Convex deployment
```

**Deployment Time**: ~2-3 minutes
**Rollback Time**: <1 minute (tested: 39 seconds)

### CI/CD Pipeline Overview

**Automated Workflow**:
1. Push to `main` branch
2. Vercel build triggered automatically
3. Convex backend deployed during build
4. Production URL updated: https://so-quoteable.vercel.app

**Build Process**:
- Next.js build with webpack bundling
- Convex functions deployed to production
- Environment variables injected from Vercel
- Build time: ~2-3 minutes

**Manual Deployment** (if needed):
```bash
# Deploy frontend
vercel --prod

# Deploy backend
npx convex deploy
```

### Environment Variables

**Required for Production** (8 variables):

| Variable | Purpose | Where to Set |
|----------|---------|--------------|
| `NEXT_PUBLIC_CONVEX_URL` | Backend API endpoint | Vercel + .env.local |
| `AUTH_SECRET` | Session encryption | Vercel + Convex Dashboard |
| `CLOUDINARY_API_KEY` | Image upload credentials | Vercel + Convex Dashboard |
| `CLOUDINARY_API_SECRET` | Image upload signing | Vercel + Convex Dashboard |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Image CDN delivery | Vercel + .env.local |
| `GOOGLE_CLIENT_ID` | OAuth authentication | Vercel + Convex Dashboard |
| `GOOGLE_CLIENT_SECRET` | OAuth credentials | Vercel + Convex Dashboard |
| `RESEND_API_KEY` | Email service | Convex Dashboard |

**Setup Documentation**:
- [Complete Environment Setup Guide](./docs/deployment/environment-setup.md) - Detailed variable configuration
- [GitHub Secrets Setup](./docs/deployment/github-secrets-setup.md) - CI/CD secrets configuration

### Monitoring and Health Checks

**Health Endpoint**:
```bash
# Check production health
curl https://so-quoteable.vercel.app/api/health

# Expected response (200 OK)
{
  "status": "healthy",
  "timestamp": "2025-11-24T04:15:13.965Z",
  "service": "quotable-api",
  "convex": {
    "status": "ok",
    "database": { "connected": true },
    "environment": { "deployment": "cloud" }
  }
}
```

**Monitoring Dashboards**:
- **Vercel Analytics**: [Project Dashboard](https://vercel.com/taylor-hustons-projects/so-quoteable/analytics) - Page views, performance, Web Vitals
- **Convex Dashboard**: [Production Deployment](https://dashboard.convex.dev/deployment/steady-anaconda-957) - Function logs, database queries
- **Health Check**: `/api/health` - System status and Convex connectivity

### Rollback Procedures

**Emergency Rollback** (if deployment breaks production):

```bash
# Method 1: Vercel CLI (fastest - 39 seconds tested)
vercel alias set <previous-deployment-url> so-quoteable.vercel.app

# Method 2: Vercel Dashboard (instant)
# 1. Go to: https://vercel.com/taylor-hustons-projects/so-quoteable/deployments
# 2. Find previous working deployment
# 3. Click "..." menu → "Promote to Production"
```

**Detailed Rollback Guide**: [docs/deployment/rollback.md](./docs/deployment/rollback.md)
- Decision criteria (when to rollback vs. fix forward)
- Step-by-step procedures for Vercel and Convex
- Recovery time objectives (RTO) by severity
- Post-rollback verification checklist

### Free Tier Constraints

**Convex Free Tier**:
- ⚠️ **No preview deployments** (requires Pro tier for preview deploy keys)
- ✅ **Local E2E testing** recommended before production push
- ✅ **Production deployment** fully supported and automated

**Development Workflow** (adapted for free tier):
1. Local development with `npx convex dev` + `npm run dev`
2. Run E2E tests locally: `npm run test:e2e`
3. Push to `main` → Automatic production deployment
4. Verify via health endpoint and manual testing

**Upgrade Path**: When upgrading to Convex Pro tier:
- Enable preview deployments for pull requests
- Automate E2E tests in GitHub Actions
- Add PR preview URLs for stakeholder review

See [ADR-003: Deployment Strategy](./docs/project/adrs/ADR-003-environment-and-deployment-strategy.md) for architecture decisions and free tier rationale.

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

## 🔧 Troubleshooting

### Common Authentication Issues

#### "Invalid email or password" after correct credentials

**Possible causes**:
- Email case sensitivity (check email is lowercase)
- Password typo (verify caps lock is off)
- Account doesn't exist (try registering instead)

**Solution**: Verify email and password, or use "Forgot password" (future feature)

#### "Too many sign-in attempts. Please try again in a few minutes."

**Cause**: Rate limiting triggered (5 failed attempts per hour)

**Solution**:
- Wait 12-15 minutes before retrying
- Verify credentials are correct
- Check caps lock and keyboard layout

**Technical details**: After 5 failed attempts, the system requires 12 minutes between attempts to prevent brute force attacks.

#### Google OAuth shows "Error 400: redirect_uri_mismatch"

**Cause**: OAuth redirect URI in Google Cloud Console doesn't match actual callback URL

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Credentials
3. Edit your OAuth 2.0 Client ID
4. Verify authorized redirect URIs include:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
5. Save and retry

**Note**: No trailing slashes, must match exactly.

#### Google OAuth shows "This app isn't verified"

**Cause**: OAuth app is in testing mode

**Solutions**:
- **For testing**: Add yourself as a test user in Google Cloud Console → OAuth consent screen → Test users
- **For production**: Publish the app in OAuth consent screen (requires privacy policy)
- **Quick fix**: Click "Advanced" → "Go to [app name] (unsafe)" (only for apps you trust)

#### Session not persisting / Logged out after closing browser

**Possible causes**:
- Session timeout (24 hours default)
- "Remember me" not enabled
- Browser blocking cookies
- Cookies cleared by browser/extension

**Solutions**:
- Enable "Remember me" during login (7-day session)
- Check cookie settings: Allow cookies from Convex and your domain
- Disable cookie-blocking extensions (Privacy Badger, etc.)
- Check if in private/incognito mode (sessions don't persist)

#### "An account with this email already exists" during registration

**Cause**: Email already registered (case-insensitive check)

**Solution**:
- Use the login page instead of registration
- Try "Forgot password" if you don't remember credentials (future feature)
- Use a different email address

**Note**: The system checks for duplicate emails before submission to provide this helpful error.

#### Password strength indicator stuck on "Weak"

**Cause**: Password doesn't meet all NIST requirements

**NIST Requirements** (all must be met):
- Minimum 12 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*()_+-=[]{};\':\"\\|,.<>/?)

**Solution**: Ensure password meets all requirements. Example strong password: `MySecure Pass123!`

#### Protected routes redirect to login even when logged in

**Possible causes**:
- Auth state not propagated yet (race condition)
- Session expired
- Cookies blocked

**Solutions**:
- Refresh the page (auth state should load)
- Log out and log back in
- Check browser console for errors
- Verify cookies are enabled

**Technical details**: There's a known 100ms delay after sign-in to allow auth state to propagate. If issues persist, check Convex logs.

### Development Issues

#### CORS errors in development

**Cause**: Next.js dev server and Convex backend on different origins

**Solution**: Ensure `NEXT_PUBLIC_CONVEX_URL` is set correctly in `.env.local`

#### CSP violations blocking Convex or Cloudinary

**Cause**: Content Security Policy blocking external resources

**Solution**: Verify `middleware.ts` includes Convex and Cloudinary domains in CSP headers

**Check CSP configuration**:
```typescript
// middleware.ts should include:
connect-src 'self' https://*.convex.cloud https://res.cloudinary.com
```

#### Email verification link not working

**Current behavior (MVP)**: Verification links are logged to Convex console, not sent via email

**How to test**:
1. Register a new account
2. Check Convex function logs (Dashboard → Logs or `npx convex logs`)
3. Find verification link in console output
4. Copy link and visit in browser

**Production**: Integrate email service (Resend, SendGrid, AWS SES). See [docs/deployment/auth-setup.md](./docs/deployment/auth-setup.md)

### Getting More Help

If you encounter issues not covered here:

1. Check [Convex Auth Documentation](https://labs.convex.dev/auth)
2. Search [Convex Discord](https://discord.gg/convex) for similar issues
3. Review project WORKLOG: `pm/issues/004-convex-auth/WORKLOG.md`
4. Check browser console and Convex logs for error messages
5. Verify environment variables are set correctly

## 🤝 Contributing

This project uses [AI Toolkit](https://github.com/cktang88/ai-toolkit) for structured, AI-assisted development.

### Development Workflow

1. Review [Development Loop](./docs/development/workflows/development-loop.md) for TDD/BDD workflow
2. Check [Git Workflow](./docs/development/workflows/git-workflow.md) for branching strategy
3. Follow [Coding Standards](./docs/development/conventions/coding-standards.md) for code style

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

**Project Status**: MVP Development (Phase: Infrastructure Complete)

**Current Focus**: Core quote generation features (EPIC-002)

**Latest**:
- ✅ 006: Deployment pipeline configured (2025-11-22)
  - Production deployments via Vercel + Convex Cloud
  - Simplified workflow for Convex free tier
  - Local E2E testing before production push
  - Production deployment verified and operational
- ✅ 005: E2E testing infrastructure (Playwright)
- ✅ 004: Convex Auth (email/password + Google OAuth, 94% coverage)
- ✅ 003: Cloudinary integration (92% coverage, 146 tests)
- ✅ 002: Convex backend setup (97.36% coverage)
- ✅ 001: Next.js project initialized

**Infrastructure**: Complete and production-ready
**Next**: Quote generation UI and image transformation features (EPIC-002)


