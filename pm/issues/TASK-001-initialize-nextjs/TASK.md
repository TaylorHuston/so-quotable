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
- [ ] Next.js project created with TypeScript and App Router
- [ ] TypeScript configured with strict mode enabled
- [ ] ESLint configured with TypeScript rules
- [ ] Prettier configured for consistent code formatting
- [ ] Project structure follows Next.js App Router conventions
- [ ] Basic layout and home page created
- [ ] .gitignore configured (Next.js, Convex _generated/, .env files, node_modules)
- [ ] .env.local.example created with placeholders for all services (Convex, Cloudinary, Auth)
- [ ] Styling framework configured (Tailwind CSS recommended)
- [ ] Basic error boundary in root layout
- [ ] README updated with setup instructions
- [ ] Development server runs successfully with hot reload

## Technical Notes
- Use `create-next-app` with TypeScript template
- Enable all strict TypeScript compiler options in tsconfig.json
- Configure path aliases (@/components, @/lib, etc.)
- Set up src/ directory structure
- Configure next.config.js for Convex and Cloudinary integration readiness
- Add necessary VS Code settings for consistent development experience
- Install and configure Tailwind CSS with Next.js integration
- Create error.tsx in app/ directory for error boundary
- Ensure .gitignore includes: .env*, .next/, node_modules/, convex/_generated/
- Create comprehensive .env.local.example with all required variables:
  - CONVEX_DEPLOYMENT
  - NEXT_PUBLIC_CONVEX_URL
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  - AUTH_SECRET
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET

## Dependencies
- Node.js v18+ installed
- npm or yarn package manager

## Testing
- Verify `npm run dev` starts the development server
- Confirm TypeScript compilation succeeds with no errors
- Ensure hot reload works for both components and styles
- Verify ESLint passes with `npm run lint`