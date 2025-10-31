---
# === Metadata ===
template_type: "adr"
version: "1.0.0"
created: "2025-10-30"
last_updated: "2025-10-30"
status: "Accepted"
target_audience: ["AI Assistants", "DevOps Engineers", "Development Team"]
description: "Development environment and deployment strategy for So Quotable MVP"

# === ADR Metadata ===
adr_number: "003"
title: "Development Environment and Deployment Strategy"
date: "2025-10-30"
deciders: ["Taylor (Project Owner)", "DevOps Engineer (Review)"]
tags: ["infrastructure", "deployment", "development-environment", "CI/CD", "DevOps"]
---

# ADR-003: Development Environment and Deployment Strategy

**Date**: 2025-10-30

**Status**: Accepted

**Deciders**: Taylor (Project Owner), DevOps Engineer (Review)

**Tags**: infrastructure, deployment, development-environment, CI/CD, DevOps

---

## Context

So Quotable requires a development and deployment strategy that aligns with the chosen tech stack (ADR-001) and supports our TDD/BDD practices (ADR-002). As a solo developer project with potential for growth, we need to balance simplicity with production readiness.

### Key Requirements

1. **Development Environment**: Consistent development experience across machines
2. **Deployment Target**: Vercel for Next.js frontend (decided)
3. **Backend Deployment**: Convex Cloud (serverless BaaS)
4. **Testing**: Support for local development and CI/CD testing
5. **Scalability**: Support solo developer now, small team later
6. **Production Readiness**: Monitoring, rollback, and disaster recovery capabilities

### Initial Consideration: Docker

The initial inclination was to enforce Docker-first development for:

- Dependency isolation
- Environment consistency
- Team onboarding simplicity

However, after thorough analysis of the Vercel + Convex stack, this assumption needed reevaluation.

### Critical Insights

1. **Vercel Deployment Model**:
   - Vercel deploys Next.js **natively** in their Node.js runtime
   - Does NOT use Docker containers in production
   - Reads Node.js version from `package.json` engines field
   - Provides built-in preview deployments for every git push

2. **Convex Requirements**:
   - Convex CLI (`npx convex dev`) maintains WebSocket connections to cloud
   - Requires authentication and session management
   - Official recommendation: Run CLI on host machine, not in container
   - Each deployment connects to Convex Cloud (no local database)

3. **Production Parity Implications**:
   - Docker in dev ≠ Vercel in production (mismatch)
   - Native Node.js in dev = Vercel in production (match)
   - Convex has no local instance (always cloud-connected)

---

## Decision

We will use **native Node.js development without Docker** as our primary development approach, with comprehensive environment management and deployment automation.

### Development Environment

**Node.js Version Management**:

```bash
# .nvmrc file for automatic version detection
18.18.0

# package.json engines field (Vercel respects this)
{
  "engines": {
    "node": ">=18.18.0 <19.0.0",
    "npm": ">=9.0.0"
  }
}
```

**Local Development Workflow**:

```bash
# One-time setup
nvm install 18.18.0
nvm use

# Development (two terminals)
npm run dev              # Next.js on localhost:3000
npx convex dev          # Convex backend (connects to cloud)
```

### Deployment Strategy

**Frontend (Vercel)**:

- Automatic deployments on push to `main` branch
- Preview deployments for every PR
- Environment-specific configuration via Vercel dashboard
- Rollback via Vercel dashboard (instant)

**Backend (Convex)**:

- Development: `npx convex dev` (auto-sync with cloud)
- Production: `npx convex deploy` (CI/CD or manual)
- Separate deployments per environment (dev/staging/prod)
- Schema migrations handled by Convex (backward-compatible changes)

### CI/CD Pipeline

**GitHub Actions Configuration**:

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.18.0] # Match .nvmrc exactly
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run test:coverage
```

**Quality Gates** (MVP-Critical):

- ✅ Lint passes (ESLint)
- ✅ Type check passes (TypeScript)
- ✅ Unit tests pass (Vitest)
- ✅ Coverage thresholds met (80% backend, 70% frontend)
- ✅ Build succeeds (`npm run build`)

### Staging Strategy

**Preview Deployments (MVP Phase)**:

- Every PR gets unique Vercel preview URL
- Automatic E2E tests run against preview URL
- Ephemeral environments (destroyed after merge)
- Sufficient for MVP and early growth

**Future Dedicated Staging** (Post-MVP):

- Separate Vercel project for staging
- Separate Convex deployment
- Auto-deploy from `develop` branch
- Stable URL for stakeholder review

### E2E Testing Strategy

**Vercel Preview Integration**:

```yaml
# GitHub Actions webhook from Vercel
on:
  repository_dispatch:
    types: ["vercel.deployment.success"]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Playwright Tests
        env:
          BASE_URL: ${{ github.event.client_payload.url }}
        run: npx playwright test
```

Tests run against **real Vercel preview deployments**, not local Docker containers.

### Monitoring & Observability (MVP)

**Essential Monitoring**:

1. **Vercel Analytics**: Enable in dashboard (free tier)
2. **Health Check Endpoint**: `/api/health/route.ts`
3. **Error Tracking**: Sentry (optional for MVP, recommended post-launch)
4. **Uptime Monitoring**: UptimeRobot (post-MVP)

**Health Check Implementation**:

```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Verify Convex connectivity
    await fetchQuery(api.health.check);
    return Response.json({ status: "healthy" }, { status: 200 });
  } catch (error) {
    return Response.json({ status: "unhealthy", error }, { status: 503 });
  }
}
```

### Rollback Procedures

**Vercel (Frontend)**:

1. Go to Vercel Dashboard → Project → Deployments
2. Find previous working deployment
3. Click "..." menu → "Promote to Production"
4. Instant rollback (DNS switch)

**Convex (Backend)**:

1. Keep deployment history in git tags
2. Rollback via: `npx convex deploy --version <previous>`
3. Or restore from Convex dashboard (if available)
4. Test rollback procedure before production launch

### Disaster Recovery

**Backup Strategy**:

- **Code**: Git (GitHub) - inherently backed up
- **Convex Data**: Verify Convex's backup policy (likely automatic)
- **Cloudinary Images**: Cloud service with built-in redundancy
- **Secrets**: Store in password manager + GitHub Secrets

**Recovery Targets**:

- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 24 hours

---

## Consequences

### Positive Consequences

1. **Perfect Production Parity**
   - Development environment matches Vercel deployment exactly
   - No Docker abstraction layer causing discrepancies
   - Convex CLI works as designed (on host)

2. **Simplified Development Setup**
   - `nvm use && npm install && npm run dev` gets developers running
   - No Docker installation or configuration required
   - Lower barrier to entry for contributors

3. **Faster Development Velocity**
   - Native hot reload performance (no volume mount overhead)
   - No container rebuild delays
   - Direct file system access for tooling

4. **Optimal Platform Integration**
   - Vercel preview deployments work seamlessly
   - Convex real-time subscriptions perform optimally
   - No networking complexity between containers

5. **Cost-Effective Infrastructure**
   - Vercel + Convex free tiers sufficient for MVP
   - No container registry or orchestration costs
   - Minimal CI/CD minutes (no Docker builds)

6. **Clear Migration Path**
   - Can add optional Docker later if team grows
   - Infrastructure decisions are reversible
   - No heavy upfront investment in containerization

### Negative Consequences

1. **Dependency on Developer Discipline**
   - Must use nvm/fnm consistently
   - Global npm packages could cause conflicts
   - **Mitigation**: Clear documentation, npm scripts enforce versions

2. **Platform Lock-in**
   - Tied to Vercel's deployment model
   - Convex Cloud dependency (no self-hosting)
   - **Mitigation**: Keep business logic separate from platform code

3. **Limited Offline Development**
   - Convex requires internet connection
   - Can't fully test without cloud services
   - **Mitigation**: Mock external services for unit tests

4. **Environment Drift Risk**
   - Developers might use different Node.js versions
   - OS-specific issues harder to reproduce
   - **Mitigation**: CI catches issues, .nvmrc enforces versions

### Neutral Consequences

1. **Docker as Optional Path**
   - Can provide Docker Compose for contributors who prefer it
   - Not primary development path but available
   - Decision is reversible if needs change

2. **Team Growth Considerations**
   - Current approach optimal for 1-3 developers
   - May need Docker at 5+ developers
   - Re-evaluate as team grows

---

## Alternatives Considered

### Alternative 1: Docker-First Development

**Description**: Containerize everything - Next.js, Convex CLI, and development environment

**Pros**:

- Complete environment isolation
- Consistent across all operating systems
- Single `docker-compose up` to start everything
- Matches traditional deployment models

**Cons**:

- **No production parity** - Vercel doesn't use Docker
- **Convex CLI issues** - WebSocket connections problematic in containers
- **Performance overhead** - Slower hot reload with volume mounts
- **Added complexity** - Docker knowledge required
- **Maintenance burden** - Dockerfile updates, security patches

**Why not chosen**:
The production environment (Vercel + Convex) is inherently non-containerized. Using Docker in development creates a false sense of parity while actually introducing discrepancies. The overhead and complexity don't provide value for a serverless, managed-service architecture.

### Alternative 2: Hybrid Approach (Docker for Next.js, Native for Convex)

**Description**: Containerize Next.js but run Convex CLI on host

**Pros**:

- Partial isolation for frontend
- Convex CLI works optimally
- Some consistency benefits

**Cons**:

- Complex mental model (mixed approaches)
- Still no Vercel production parity
- Network complexity between container and host
- Inconsistent developer experience

**Why not chosen**:
The complexity of managing both containerized and native services outweighs benefits. Since Vercel deployment is native Node.js, containerizing locally provides no production parity advantage.

### Alternative 3: Full Local Stack (Mock Services)

**Description**: Run everything locally with service mocks/emulators

**Pros**:

- Complete offline development
- Fast test execution
- No cloud service costs during development

**Cons**:

- **No Convex local emulator exists**
- Massive effort to mock Convex's reactive system
- Divergence from production behavior
- Maintaining mocks becomes a project itself

**Why not chosen**:
Convex is designed as a cloud-first service with no local emulator. Building mocks would require reimplementing Convex's entire reactive system, which is impractical and would diverge from production behavior.

---

## Implementation Notes

### Required Files for MVP

1. **`.nvmrc`**:

```
18.18.0
```

2. **`package.json` engines**:

```json
{
  "engines": {
    "node": ">=18.18.0 <19.0.0",
    "npm": ">=9.0.0"
  }
}
```

3. **`.env.local.example`**:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=prod:your-project

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Auth
AUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

4. **GitHub Actions** (`.github/workflows/test.yml`):

```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: ".nvmrc"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build
```

5. **Health Check** (`app/api/health/route.ts`):

```typescript
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET() {
  try {
    await fetchQuery(api.health.ping);
    return Response.json({ status: "healthy" });
  } catch (error) {
    return Response.json({ status: "unhealthy" }, { status: 503 });
  }
}
```

### Migration Path to Docker (If Needed)

If the team grows beyond 5 developers, provide optional Docker:

```dockerfile
# Dockerfile.dev (optional, not for MVP)
FROM node:18.18.0-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

Keep as secondary option, not primary development path.

---

## Links

- [ADR-001: Initial Tech Stack Selection](./ADR-001-initial-tech-stack.md) - Defines Vercel + Convex architecture
- [ADR-002: Testing Framework and Strategy](./ADR-002-testing-framework.md) - Testing approach that aligns with this deployment strategy
- [Vercel Documentation](https://vercel.com/docs) - Deployment platform documentation
- [Convex Documentation](https://docs.convex.dev) - Backend platform documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions) - CI/CD platform

---

## Notes

### When to Reconsider This Decision

**Triggers for Re-evaluation**:

1. Team grows to 5+ developers
2. Need for complex local services (Redis, Elasticsearch)
3. Shift away from serverless architecture
4. Change in deployment platforms (away from Vercel/Convex)

### Cost Implications

**Current (MVP)**:

- Vercel: Free tier (hobby)
- Convex: Free tier
- GitHub Actions: Free tier (2000 minutes/month)
- Total: $0/month

**Growth Phase**:

- Vercel Pro: $20/month
- Convex: $25/month
- GitHub Actions: Within free tier
- Total: ~$45/month

### Security Considerations

**Secret Management**:

- Never commit `.env.local` (in .gitignore)
- Use GitHub Secrets for CI/CD
- Rotate secrets quarterly
- Document all required secrets in `.env.local.example`

**Dependency Security**:

- Enable Dependabot (GitHub)
- Run `npm audit` in CI
- Update dependencies monthly
- Use exact versions in package.json for critical packages

---

## Revision History

| Date       | Author | Description                                          |
| ---------- | ------ | ---------------------------------------------------- |
| 2025-10-30 | Taylor | Initial version - native Node.js deployment strategy |
