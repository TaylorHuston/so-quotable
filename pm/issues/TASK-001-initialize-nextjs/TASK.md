---
id: TASK-001
title: Initialize Next.js project with TypeScript
epic: EPIC-001
status: todo
created: 2025-10-30
updated: 2025-10-30
---

# TASK-001: Initialize Next.js project with TypeScript

**Epic**: EPIC-001 - MVP Infrastructure Setup
**Status**: todo

## Description

Initialize a new Next.js project with TypeScript support, using the App Router pattern. Configure the project structure, set up ESLint and Prettier, and ensure TypeScript strict mode is enabled for maximum type safety.

## Acceptance Criteria

### MVP-Critical (from ADR-003)

- [ ] .nvmrc file created with Node.js 18.18.0
- [ ] package.json engines field configured (node + npm versions)
- [ ] .env.local.example created with ALL required variables documented
- [ ] /api/health/route.ts endpoint (checks Convex connectivity)
- [ ] GitHub Actions workflow (.github/workflows/test.yml)
- [ ] GitHub branch protection on main (require tests to pass)
- [ ] All secrets documented in .env.local.example

### Next.js Setup

- [ ] Next.js project created with TypeScript and App Router
- [ ] TypeScript configured with strict mode enabled
- [ ] ESLint configured with TypeScript rules
- [ ] Prettier configured for consistent code formatting
- [ ] Project structure follows Next.js App Router conventions
- [ ] Basic layout and home page created
- [ ] .gitignore configured (Next.js, Convex \_generated/, .env files, node_modules)
- [ ] Styling framework configured (Tailwind CSS recommended)
- [ ] Basic error boundary in root layout
- [ ] README updated with setup instructions
- [ ] Development server runs successfully with hot reload

## Technical Notes

### Environment Consistency (ADR-003)

- Create .nvmrc with exact version: `18.18.0`
- Configure package.json engines:
  ```json
  {
    "engines": {
      "node": ">=18.18.0 <19.0.0",
      "npm": ">=9.0.0"
    }
  }
  ```
- Create comprehensive .env.local.example with all required variables:

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

### Health Check Endpoint

- Create app/api/health/route.ts:

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

### GitHub Actions (MVP CI/CD)

- Create .github/workflows/test.yml:

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

### Next.js Setup

- Use `create-next-app` with TypeScript template
- Enable all strict TypeScript compiler options in tsconfig.json
- Configure path aliases (@/components, @/lib, etc.)
- Set up src/ directory structure
- Configure next.config.js for Convex and Cloudinary integration readiness
- Add necessary VS Code settings for consistent development experience
- Install and configure Tailwind CSS with Next.js integration
- Create error.tsx in app/ directory for error boundary
- Ensure .gitignore includes: .env\*, .next/, node_modules/, convex/\_generated/

## Dependencies

- Node.js 18.18.0 (use nvm/fnm for version management)
- npm 9.0.0+ package manager
- GitHub account (for Actions and branch protection)

## Testing

- Verify `npm run dev` starts the development server
- Confirm TypeScript compilation succeeds with no errors
- Ensure hot reload works for both components and styles
- Verify ESLint passes with `npm run lint`
