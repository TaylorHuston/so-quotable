# Architecture Overview

## Project: So Quotable

**Last Updated**: 2025-11-05

---

## Executive Summary

So Quotable is a web application that allows users to generate quotes on top of images of the source of the quote, with verified, attributed sources.

This document provides a high-level overview of the system architecture, key components, and design decisions.

---

## System Context

### Purpose

Enable users to:

- Create visually appealing quote images
- Ensure quotes have verified, attributed sources
- Share quote images on social media and other platforms

### Key Stakeholders

- **End Users**: People who create and share quote images
- **Content Moderators**: (If applicable) Verify quote sources
- **Development Team**: Build and maintain the application

---

## Architecture Principles

See [architectural-principles.md](../development/guidelines/architectural-principles.md) for detailed principles.

Key principles:

1. **Separation of Concerns**: Clear boundaries between layers
2. **Security First**: Validate sources, protect user data
3. **Scalability**: Design for growth in users and quotes
4. **Maintainability**: Clean, testable code

---

## High-Level Architecture

### Architectural Style

**Serverless** - Function-based architecture with managed backend services

The application uses a serverless architecture combining:

- Next.js frontend on Vercel (edge functions, server components)
- Convex backend (reactive database + serverless functions)
- Cloudinary for image storage and processing

This approach provides low infrastructure overhead while maintaining scalability.

### Technology Stack

**Decided** (see [ADR-001](./adrs/ADR-001-initial-tech-stack.md) for details):

- **Frontend**: Next.js (App Router) with TypeScript
- **Backend**: Convex (reactive TypeScript database + serverless functions)
- **Database**: Convex (document database with relational capabilities)
- **Image Storage**: Cloudinary (base images + generated quote images)
- **Image Processing**: Cloudinary transformations (text overlay generation)
- **Deployment**: Vercel (frontend) + Convex Cloud (backend)
- **Authentication**: Convex Auth (email/password + OAuth)

See [ADRs](./adrs/README.md) for detailed decision records.

---

## System Components

### 1. Frontend (Presentation Layer)

**Responsibilities**:

- User interface for quote creation
- Image upload and preview
- Quote text input and formatting
- Source attribution input
- Quote rendering on images
- Export/share functionality

**Key Features**:

- Quote editor with live preview
- Image overlay controls (position, size, opacity)
- Typography controls (font, size, color)
- Source verification UI

### 2. Backend (Convex Functions)

**Architecture**: Serverless functions (queries, mutations, actions)

**Responsibilities**:

- Quote CRUD operations (mutations)
- Real-time data subscriptions (queries)
- Image metadata management
- User authentication and authorization
- Quote validation
- Background jobs (cleanup expired images)

**Key Function Types**:

- **Queries**: Read-only, reactive data fetching (quotes, people, images)
- **Mutations**: Data modifications (create quote, update person, save image)
- **Actions**: External API calls (Cloudinary upload, image generation)
- **Cron Jobs**: Scheduled tasks (auto-delete expired images)

### 3. Database (Convex Document Database)

**Technology**: Convex reactive database (document-based with TypeScript schema)

**Responsibilities**:

- Persistent storage of quotes
- User account information
- Image metadata (references to Cloudinary)
- Generated image tracking
- Real-time data synchronization

**Key Collections** (TypeScript schema):

- **people**: name, bio, dates, defaultImageId (multiple images per person)
- **quotes**: personId, text, source, sourceUrl, verified
- **images**: personId, cloudinaryId, category, isPrimary (base person photos)
- **generatedImages**: quoteId, cloudinaryId, createdAt, expiresAt (user-created quote overlays)
- **users**: email, name, auth metadata (managed by Convex Auth)

### 4. External Services

**Cloudinary** (Image Storage & Processing):

- Store curated person photos (base images)
- Store user-generated quote images (30-day expiration)
- Text overlay generation via URL transformations
- Automatic image optimization (WebP, compression)
- Global CDN delivery
- Free tier: 25GB storage, 25GB bandwidth/month

**Convex Auth** (Authentication):

- Email/password authentication with password requirements enforcement
- OAuth providers (Google OAuth configured, GitHub available)
- Built on Auth.js with Convex integration
- JWT-based token authentication with public/private key pairs
- See [Authentication Architecture](#authentication-architecture) section for detailed configuration

---

## Data Flow

### Quote Image Generation Flow

```
User → Frontend → Convex Query (get quote + person + image)
                      ↓
        Convex returns: quote text, person data, Cloudinary image URL
                      ↓
        Frontend → Cloudinary URL transformation (text overlay)
                      ↓
        Cloudinary → Generated image with quote overlay
                      ↓
        User downloads or Frontend → Cloudinary (save for sharing)
                      ↓
        Convex Mutation → Save generatedImage metadata
```

**Steps**:

1. User selects person and quote in frontend
2. Frontend calls Convex query to fetch data
3. Convex returns quote, person, and Cloudinary image reference
4. Frontend builds Cloudinary URL with text overlay transformations
5. User previews image (Canvas API for editing)
6. User generates final image via Cloudinary transformation URL
7. Optional: Save to Cloudinary for sharing (unique URL)
8. Convex mutation saves generated image metadata (for auto-deletion)

### Quote Search Flow

```
User → Frontend → Convex Query (search)
                      ↓
        Convex full-text search → matching quotes
                      ↓
        Real-time reactive updates → Frontend
```

**Features**:

- Real-time reactivity (automatic UI updates)
- Built-in full-text search (no external service needed)
- Type-safe queries (TypeScript end-to-end)

---

## Security Architecture

See [security-guidelines.md](../development/guidelines/security-guidelines.md) for detailed guidelines.

**Key Security Measures**:

1. **Authentication**: Secure user login and session management
2. **Authorization**: Role-based access control
3. **Input Validation**: All user inputs validated and sanitized
4. **Source Verification**: Ensure quote authenticity
5. **Data Encryption**: HTTPS, encrypted storage of sensitive data
6. **Rate Limiting**: Prevent abuse and DDoS
7. **File Upload Security**: Validate and scan uploaded images

---

## Authentication Architecture

### Overview

Authentication is implemented using **Convex Auth** (@convex-dev/auth v0.0.90), which provides:

- Email/password authentication with custom password requirements
- OAuth integration (Google configured, other providers available)
- JWT-based token authentication
- Server-side session management
- Built on Auth.js with Convex-specific integration

### Critical Setup Requirements

**IMPORTANT**: Convex Auth requires three environment variables to function correctly:

1. **`JWT_PRIVATE_KEY`** - RSA private key (PKCS#8 format) for signing JWT tokens
2. **`JWKS`** - JSON Web Key Set containing the public key for verifying JWT signatures
3. **`SITE_URL`** - Application URL for OAuth callbacks (e.g., `http://localhost:3000`)

**Setup Method**: Use the official CLI to generate properly paired keys:

```bash
npx @convex-dev/auth
```

The CLI automatically:
- Generates matched JWT_PRIVATE_KEY and JWKS (critical for token verification)
- Sets SITE_URL
- Creates `convex/auth.config.ts` configuration file
- Configures tsconfig.json for Auth.js compatibility

**WARNING**: Do NOT manually generate JWT keys - the CLI ensures proper key pairing. Manual generation often results in signature verification failures.

### Password Requirements

Enforced via `validatePasswordRequirements` in `convex/auth.ts`:

- Minimum 12 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character: `!@#$%^&*()_+-=[]{};\':\"\\|,.<>/?`

Frontend validation (in `src/lib/password-validation.ts`) mirrors backend requirements exactly to provide immediate user feedback.

### Session Configuration

Configured in `convex/auth.ts`:

```typescript
session: {
  totalDurationMs: 24 * 60 * 60 * 1000,     // 24 hours default
  inactiveDurationMs: 24 * 60 * 60 * 1000,  // 24 hours inactivity timeout
}

jwt: {
  durationMs: 60 * 60 * 1000,  // 1 hour token validity
}
```

### Rate Limiting

Configured to prevent brute force attacks:

```typescript
signIn: {
  maxFailedAttempsPerHour: 5,  // 5 attempts = ~12 min lockout
}
```

After 5 failed attempts, users can retry once every 12 minutes (60 min / 5 attempts).

### Authentication Flow

**Client-Side (Next.js App Router)**:

1. **Server Provider**: `ConvexAuthNextjsServerProvider` wraps root layout (enables SSR auth)
2. **Client Provider**: `ConvexAuthNextjsProvider` provides auth context to components
3. **Middleware**: `convexAuthNextjsMiddleware` handles route protection and redirects

**Backend (Convex Functions)**:

```typescript
import { getAuthUserId } from "@convex-dev/auth/server";

export const myQuery = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    // Query logic with authenticated user
  }
});
```

**Key API**: Always use `getAuthUserId()` from `@convex-dev/auth/server`, NOT `ctx.auth.getUserIdentity()` (generic Convex API).

### Token Management

- **Storage**: JWT tokens stored in browser LocalStorage (keys: `__convexAuthJWT_*`, `__convexAuthRefreshToken_*`)
- **Transmission**: Tokens sent via HTTP headers with each Convex query/mutation
- **Verification**: Server verifies signatures using JWKS public key
- **Refresh**: Automatic token refresh handled by Convex Auth middleware

### OAuth Configuration

**Google OAuth Setup**:

Environment variables in Convex Dashboard:
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret

Google Cloud Console configuration:
- Authorized redirect URI: `https://{deployment}.convex.site/api/auth/callback/google`

**Provider Configuration** (`convex/auth.ts`):

```typescript
import Google from "@auth/core/providers/google";

providers: [
  Google  // Uses default profile mapping
]
```

### Files Structure

**Backend**:
- `convex/auth.ts` - Main auth configuration (providers, session, JWT, rate limiting)
- `convex/auth.config.ts` - Domain configuration (auto-generated by CLI)
- `convex/http.ts` - HTTP routes for auth endpoints
- `convex/users.ts` - User profile queries using `getAuthUserId()`

**Frontend**:
- `src/app/layout.tsx` - Server provider wrapper
- `src/app/providers/ConvexClientProvider.tsx` - Client provider
- `src/middleware.ts` - Next.js middleware for route protection
- `src/components/LoginForm.tsx` - Sign-in UI
- `src/components/RegisterForm.tsx` - Registration UI with password validation
- `src/components/UserProfile.tsx` - Authenticated user display
- `src/lib/password-validation.ts` - Password validation helper (mirrors backend)

### Common Issues and Solutions

**Issue**: "Missing environment variable JWKS"
- **Cause**: JWKS not set in Convex Dashboard
- **Solution**: Run `npx @convex-dev/auth` to generate paired keys

**Issue**: User appears "Not signed in" despite valid tokens
- **Cause**: JWT signature verification fails due to mismatched keys
- **Solution**: Regenerate both JWT_PRIVATE_KEY and JWKS using CLI

**Issue**: `getAuthUserId()` returns null on valid requests
- **Cause**: Using `ctx.auth.getUserIdentity()` instead of `getAuthUserId()`
- **Solution**: Import and use `getAuthUserId()` from `@convex-dev/auth/server`

**Issue**: Component shows unauthenticated state briefly after login
- **Cause**: Query runs before Convex client finishes authenticating
- **Solution**: Use `useConvexAuth()` and skip queries while `isLoading === true`

### Security Features

- **CSRF Protection**: Enabled via Convex Auth middleware
- **HTTP-only Cookies**: Managed automatically by middleware (tokens never exposed to client JS)
- **Secure Cookies**: `httpOnly`, `secure`, `sameSite=strict` flags set automatically
- **Token Expiration**: 1-hour JWT tokens with automatic refresh
- **Rate Limiting**: 5 failed attempts per hour per account
- **Password Hashing**: Handled automatically by Convex Auth (bcrypt)

### References

- Convex Auth Docs: https://labs.convex.dev/auth
- Next.js Integration: https://labs.convex.dev/auth/setup
- Implementation: See TASK-004 in `pm/issues/TASK-004-convex-auth/`

---

## Scalability Considerations

### Horizontal Scaling

- Stateless backend design
- Load balancing across multiple instances
- Database connection pooling

### Caching Strategy

- **Client-side**: Browser caching for static assets
- **CDN**: Image delivery via CDN
- **Application**: Cache frequently accessed quotes
- **Database**: Query result caching

### Performance Optimization

- Image optimization (compression, lazy loading)
- Database indexing on frequently queried fields
- Pagination for large result sets
- Background processing for heavy tasks (image generation)

---

## Deployment Architecture

See [ADR-003: Development Environment and Deployment Strategy](./adrs/ADR-003-environment-and-deployment-strategy.md) for detailed deployment decisions.

### Environment Strategy

1. **Development**: Native Node.js (no Docker) with nvm for version management
   - Node.js 18.18.0 (enforced via .nvmrc and package.json engines)
   - Two terminals: `npm run dev` + `npx convex dev`
   - Hot reload with native file system performance

2. **Preview**: Vercel preview deployments (per PR)
   - Automatic deployments for every pull request
   - Ephemeral environments with unique URLs
   - E2E tests run against preview URLs

3. **Production**: Live user-facing application
   - Vercel (frontend) + Convex Cloud (backend)
   - Automatic deployment on merge to `main`
   - Instant rollback capability via Vercel dashboard

### CI/CD Pipeline

**GitHub Actions Workflow**:

```
Push/PR → Lint → Type Check → Unit Tests → Build → E2E Tests (on Vercel preview)
```

**Deployment Flow**:

```
Merge to main → Vercel auto-deploy → Convex deploy → Health check → Live
```

### Infrastructure

**Frontend Hosting**: Vercel

- Edge functions for server-side rendering
- Automatic preview deployments
- Built-in analytics (free tier)
- Global CDN distribution

**Backend Hosting**: Convex Cloud

- Serverless functions (queries, mutations, actions)
- Reactive database with real-time subscriptions
- Automatic scaling and management
- Built-in authentication

**Image Storage**: Cloudinary

- CDN delivery for images
- On-the-fly transformations
- 25GB free tier

**Monitoring** (MVP):

- **Application Performance**: Vercel Analytics (built-in)
- **Error Tracking**: Sentry (optional for MVP)
- **Uptime Monitoring**: Health check endpoint (`/api/health`)
- **Future**: UptimeRobot for external monitoring

**Logging**:

- **Frontend**: Vercel Functions logs (1-day retention free tier)
- **Backend**: Convex dashboard logs
- **Future**: Structured logging with correlation IDs

---

## API Architecture

See [api-guidelines.md](../development/guidelines/api-guidelines.md) for detailed guidelines.

### API Style

**Function-based API** (Convex)

Instead of REST endpoints, the API consists of TypeScript functions:

- **Queries**: Read-only operations (automatically cached, reactive)
- **Mutations**: Write operations (transactional)
- **Actions**: External API calls (non-transactional)

### Key Functions (TypeScript)

```typescript
// Queries (convex/quotes.ts)
export const list = query(...)           // List quotes
export const get = query(...)            // Get single quote
export const search = query(...)         // Full-text search

// Mutations (convex/quotes.ts)
export const create = mutation(...)      // Create quote
export const update = mutation(...)      // Update quote
export const remove = mutation(...)      // Delete quote

// Queries (convex/people.ts)
export const get = query(...)            // Get person
export const getImages = query(...)      // Get person's images

// Mutations (convex/images.ts)
export const save = mutation(...)        // Save image metadata
export const saveGenerated = mutation(...) // Save generated image

// Actions (convex/images.ts)
export const generateQuoteImage = action(...) // Generate via Cloudinary

// Authentication (via Convex Auth)
// Built-in: signIn, signUp, signOut, getUser
```

**Frontend Usage**:

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const quotes = useQuery(api.quotes.list);
const createQuote = useMutation(api.quotes.create);
```

---

## Database Schema (Convex TypeScript)

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  people: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly: "albert-einstein"
    bio: v.optional(v.string()),
    birthDate: v.optional(v.string()), // ISO 8601: "YYYY-MM-DD" or "YYYY"
    deathDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_name", ["name"])
    .index("by_slug", ["slug"]),

  quotes: defineTable({
    personId: v.id("people"),
    text: v.string(),
    source: v.string(),
    sourceUrl: v.optional(v.string()),
    verified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_person", ["personId"])
    .searchIndex("search_text", {
      searchField: "text",
      filterFields: ["verified", "personId"],
    }),

  images: defineTable({
    personId: v.id("people"),
    cloudinaryId: v.string(), // Cloudinary reference
    url: v.string(), // Cloudinary URL
    isPrimary: v.boolean(), // Primary image for this person
    width: v.number(),
    height: v.number(),
    source: v.string(), // "Wikimedia Commons", etc.
    license: v.union(
      // Type-safe license validation
      v.literal("Public Domain"),
      v.literal("CC0"),
      v.literal("CC BY 4.0"),
      v.literal("CC BY-SA 4.0"),
      v.literal("CC BY 3.0"),
      v.literal("CC BY-SA 3.0")
    ),
    createdAt: v.number(),
  })
    .index("by_person", ["personId"])
    .index("by_person_primary", ["personId", "isPrimary"]),

  generatedImages: defineTable({
    quoteId: v.id("quotes"),
    imageId: v.id("images"), // Base image used
    cloudinaryId: v.string(), // Generated image reference
    url: v.string(), // Generated image URL
    createdAt: v.number(),
    expiresAt: v.number(), // 30 days by default (Unix timestamp)
  })
    .index("by_quote", ["quoteId"])
    .index("by_expiration", ["expiresAt"]), // For cleanup cron

  users: defineTable({
    // Managed by Convex Auth
    email: v.string(),
    name: v.optional(v.string()),
    emailVerified: v.boolean(),
  }).index("by_email", ["email"]),
});
```

---

## Error Handling Strategy

See [api-guidelines.md](../development/guidelines/api-guidelines.md#error-handling) for details.

- Consistent error response format
- Appropriate HTTP status codes
- User-friendly error messages
- Detailed server-side logging
- Graceful degradation

---

## Testing Strategy

See [ADR-002: Testing Framework](./adrs/ADR-002-testing-framework.md) and [testing-standards.md](../development/guidelines/testing-standards.md) for detailed standards.

### Testing Framework

**Decided** (see [ADR-002](./adrs/ADR-002-testing-framework.md)):

- **Test Runner**: Vitest (v2.0+) - unified for all unit/integration tests
- **Backend Testing**: convex-test - Convex function testing with real database
- **Frontend Testing**: Testing Library - React component testing
- **E2E Testing**: Playwright - critical user flows
- **BDD Style**: Native describe/it with Given-When-Then comments (no Cucumber.js)

### Testing Pyramid (Backend-First)

```
     /\
    /E2E\          10%: Playwright (search → generate → share)
   /------\
  /Frontend\       30%: Vitest + Testing Library (key components)
 /----------\
/  Backend   \     60%: Vitest + convex-test (Convex functions)
--------------
```

**Coverage Goals**:

- Backend functions: 80%+ line coverage
- Frontend components: 70%+ line coverage
- E2E: Critical paths only

**Test Organization**:

- Co-located tests: `*.test.ts` next to source files
- E2E tests: `tests/e2e/*.spec.ts`
- Test fixtures: `tests/fixtures/`

---

## Future Considerations

### Phase 2 Features (Potential)

- Social features (like, comment, share)
- Collections and galleries
- Advanced image editing
- Batch quote generation
- API for third-party integrations
- Mobile apps

### Technical Improvements

- Microservices architecture (if scale demands)
- Real-time collaboration
- Advanced caching strategies
- Machine learning for source verification
- Internationalization (i18n)

---

## Architecture Decision Records

For detailed records of architectural decisions, see [ADRs](./adrs/README.md).

**Decisions Made**:

- [ADR-001: Initial Tech Stack Selection](./adrs/ADR-001-initial-tech-stack.md) - Next.js, Convex, Cloudinary
- [ADR-002: Testing Framework and Strategy](./adrs/ADR-002-testing-framework.md) - Vitest, Playwright, convex-test
- [ADR-003: Development Environment and Deployment Strategy](./adrs/ADR-003-environment-and-deployment-strategy.md) - Native Node.js, Vercel + Convex deployment

**Future Decisions**:

- Image cleanup cron job strategy
- Paid user tier implementation
- User-submitted quote approval workflow

---

## Diagrams

### System Context Diagram

[To be added]

### Component Diagram

[To be added]

### Data Flow Diagram

[To be added]

### Deployment Diagram

[To be added]

---

## References

- [Project Brief](../project-brief.md)
- [API Guidelines](../development/guidelines/api-guidelines.md)
- [Security Guidelines](../development/guidelines/security-guidelines.md)
- [Testing Standards](../development/guidelines/testing-standards.md)
- [ADRs](./adrs/README.md)

---

**Note**: This is a living document. Update as architectural decisions are made and the system evolves.

**Next Steps**:

1. Make key technology decisions (document in ADRs)
2. Create detailed component designs
3. Design database schema
4. Define API contracts
5. Create architecture diagrams
