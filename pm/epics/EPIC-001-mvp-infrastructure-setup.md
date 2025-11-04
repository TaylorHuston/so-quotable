---
id: EPIC-001
title: MVP Infrastructure Setup
status: in_progress
created: 2025-10-30
updated: 2025-11-03
---

# EPIC-001: MVP Infrastructure Setup

## Overview

Set up the foundational infrastructure for So Quotable based on the tech stack decisions made in ADR-001. This includes initializing Next.js with TypeScript, setting up the Convex backend, integrating Cloudinary for image processing, and establishing the testing infrastructure.

## Goals

- Initialize Next.js project with TypeScript and App Router
- Set up Convex backend with database schema and serverless functions
- Configure Cloudinary for image storage and processing
- Establish authentication with Convex Auth
- Set up comprehensive testing infrastructure (Vitest, Playwright, convex-test)
- Create development and production environments

## User Stories

- As a developer, I want a fully configured development environment so that I can start building features immediately
- As a developer, I want type-safe backend functions so that I can catch errors at compile time
- As a developer, I want automated testing infrastructure so that I can maintain code quality
- As a user, I want secure authentication so that I can safely access my account

## Acceptance Criteria

- [x] Next.js project initialized with TypeScript and App Router (TASK-001)
- [x] Convex backend deployed to development environment (TASK-002)
- [x] Convex database schema implemented (people, quotes, images, generatedImages) (TASK-002, TASK-003)
- [x] Cloudinary account configured with API integration (TASK-003)
- [x] Convex Auth configured with email/password and Google OAuth (TASK-004) - ⚠️ Post-auth redirect gap discovered (TASK-007)
- [x] Testing infrastructure operational (Vitest, Playwright, convex-test) (TASK-002, TASK-003, TASK-005: 217 backend tests + 22 E2E tests)
- [x] Development environment fully functional with hot reload (TASK-001, TASK-002)
- [ ] Production deployment pipeline configured (Vercel + Convex Cloud) (TASK-006)
- [x] Environment variables properly configured for all services (TASK-001, TASK-002, TASK-003, TASK-004)
- [x] Basic smoke tests passing for all infrastructure components (217 backend tests passing, 10/22 E2E tests passing)

## Tasks

- [x] TASK-001: Initialize Next.js project with TypeScript (completed 2025-10-30, merged to develop)
- [x] TASK-002: Set up Convex backend and database schema (completed 2025-11-01, merged to develop, 97% coverage)
- [x] TASK-003: Configure Cloudinary integration (completed 2025-11-02, merged to develop, 92% coverage)
- [x] TASK-004: Implement Convex Auth with email and Google OAuth (completed 2025-11-03, merged to develop, 100% backend tests passing)
- [~] TASK-005: Set up testing infrastructure (in progress - Phase 3.1 complete: E2E auth tests written, 10/22 passing)
- [ ] TASK-006: Configure deployment pipeline (planned)
- [ ] TASK-007: Fix post-authentication redirect flow (planned - discovered during TASK-005 E2E testing)

**Progress**: 4/7 tasks complete (57%), 1 in progress (14%), 2 planned (29%)

## Dependencies

- ADR-001: Initial Tech Stack Selection
- ADR-002: Testing Framework and Strategy
- External: Vercel account
- External: Convex account
- External: Cloudinary account
- External: Google OAuth credentials

## Recent Updates (2025-11-03)

**TASK-004 Completed**: Convex Auth implementation complete with email/password and Google OAuth. Manual testing successful. Backend auth tests: 217 passing (100%).

**TASK-005 In Progress**:
- Phase 3.1 complete: 22 comprehensive E2E authentication tests written
- Code review: 92/100 (production-ready test code)
- Test results: 10/22 passing (45%)
- Failing tests reveal auth redirect race condition (signup doesn't redirect to dashboard)

**TASK-007 Created**:
- Fix post-authentication redirect flow
- Issue: `router.push("/dashboard")` executes before `convex-token` cookie is set
- Solution: Poll for cookie presence before redirecting
- Estimated: 2-3 story points
- Status: Planned (will be implemented after TASK-005 completion)

**Key Lesson Learned**: E2E testing revealed scoping gap in TASK-004 - acceptance criteria didn't explicitly require automatic post-auth redirects. This is valuable test-first development: tests document expected behavior and reveal implementation gaps.

## Notes

This epic establishes the technical foundation for all future development. Priority should be given to:

1. ✅ Getting a working development environment first (TASK-001, TASK-002)
2. ✅ Establishing proper TypeScript types throughout (all tasks use TypeScript)
3. 🔄 Ensuring the testing infrastructure works before adding features (TASK-005 in progress)
4. ✅ Documenting the setup process for future reference (WORKLOG entries, ADRs)

The infrastructure follows the serverless, function-based API pattern decided in ADR-001, avoiding traditional REST endpoints in favor of Convex's type-safe queries, mutations, and actions.

**Testing Status**: 217 backend tests passing (Vitest + convex-test), 22 E2E tests written (Playwright), 10/22 E2E tests passing. E2E test failures are expected and documented - they reveal auth redirect implementation gap being addressed by TASK-007.
