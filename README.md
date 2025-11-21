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
- **Comprehensive Testing** - 94%+ test coverage (501 tests) with Vitest, convex-test, and Playwright

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

Current coverage: **94.18%** (501 tests passing)

**Test Breakdown by Domain**:
- **Backend Functions**: 97.36% coverage (217 tests)
  - Convex Auth: 100% (auth.ts, users.ts, emailVerification.ts)
  - Cloudinary: 92% (generatedImages.ts, cloudinary.ts)
  - Database: 100% (quotes.ts, people.ts, images.ts)
- **Frontend Components**: 100% E2E coverage (22 tests)
  - LoginForm: Email/password + Google OAuth flows
  - RegisterForm: Registration + duplicate detection + password strength
  - UserProfile: Auth state rendering + sign out
  - Middleware: Protected routes (24 tests, 100% coverage)
- **Utilities**: 100% coverage (70+ tests)
  - Email normalization, slug generation, password validation
  - Debounce utility (performance optimization)
  - Cloudinary transformations (60 tests)
- **E2E Tests**: 22 Playwright tests (authentication flows)
  - Email/password registration and login
  - Google OAuth sign-in
  - Protected route redirection
  - Session persistence

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

### Authentication Deployment

**Complete setup guide**: [docs/deployment/auth-setup.md](./docs/deployment/auth-setup.md)

**Quick checklist**:
1. Generate `AUTH_SECRET`: `openssl rand -base64 32`
2. Configure Google OAuth credentials (Client ID + Secret)
3. Set environment variables in Convex Dashboard
4. Deploy backend: `npx convex deploy --prod`
5. Set environment variables in Vercel
6. Deploy frontend: `git push origin main`
7. Update Google OAuth redirect URIs with production domain

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
3. Review project WORKLOG: `pm/issues/TASK-004-convex-auth/WORKLOG.md`
4. Check browser console and Convex logs for error messages
5. Verify environment variables are set correctly

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

**Project Status**: MVP Development (Phase: Infrastructure Setup Complete)

**Current Focus**: Core quote generation features (EPIC-002)

**Latest**:
- ✅ TASK-004: Convex Auth implementation complete with comprehensive documentation (2025-11-17)
  - Email/password authentication with NIST-compliant validation
  - Google OAuth integration
  - Protected routes and session management
  - 501 tests passing (94.18% coverage)
  - Production deployment guide complete
- ✅ TASK-003: Cloudinary integration (92% coverage, 146 tests)
- ✅ TASK-002: Convex backend setup (97.36% coverage)
- ✅ TASK-001: Next.js project initialized

**Next**: Quote generation UI and image transformation features


