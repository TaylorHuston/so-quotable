---
id: EPIC-001
title: MVP Infrastructure Setup
status: in_progress
created: 2025-10-30
updated: 2025-11-02
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
- [ ] Convex Auth configured with email/password and Google OAuth (TASK-004)
- [x] Testing infrastructure operational (Vitest, Playwright, convex-test) (TASK-002, TASK-003: 146 tests, 92% coverage)
- [x] Development environment fully functional with hot reload (TASK-001, TASK-002)
- [ ] Production deployment pipeline configured (Vercel + Convex Cloud) (TASK-006)
- [x] Environment variables properly configured for all services (TASK-001, TASK-002, TASK-003)
- [x] Basic smoke tests passing for all infrastructure components (146 tests passing)

## Tasks

- [x] TASK-001: Initialize Next.js project with TypeScript (completed 2025-10-30, merged to develop)
- [x] TASK-002: Set up Convex backend and database schema (completed 2025-11-01, merged to develop)
- [x] TASK-003: Configure Cloudinary integration (completed 2025-11-02, merged to develop)
- [ ] TASK-004: Implement Convex Auth with email and Google OAuth
- [ ] TASK-005: Set up testing infrastructure
- [ ] TASK-006: Configure deployment pipeline

**Progress**: 3/6 tasks complete (50%)

## Dependencies

- ADR-001: Initial Tech Stack Selection
- ADR-002: Testing Framework and Strategy
- External: Vercel account
- External: Convex account
- External: Cloudinary account
- External: Google OAuth credentials

## Notes

This epic establishes the technical foundation for all future development. Priority should be given to:

1. Getting a working development environment first
2. Establishing proper TypeScript types throughout
3. Ensuring the testing infrastructure works before adding features
4. Documenting the setup process for future reference

The infrastructure should follow the serverless, function-based API pattern decided in ADR-001, avoiding traditional REST endpoints in favor of Convex's type-safe queries, mutations, and actions.
