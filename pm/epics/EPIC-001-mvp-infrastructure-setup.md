---
id: EPIC-001
title: MVP Infrastructure Setup
status: planning
created: 2025-10-30
updated: 2025-10-30
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

- [ ] Next.js project initialized with TypeScript and App Router
- [ ] Convex backend deployed to development environment
- [ ] Convex database schema implemented (people, quotes, images, generatedImages)
- [ ] Cloudinary account configured with API integration
- [ ] Convex Auth configured with email/password and Google OAuth
- [ ] Testing infrastructure operational (Vitest, Playwright, convex-test)
- [ ] Development environment fully functional with hot reload
- [ ] Production deployment pipeline configured (Vercel + Convex Cloud)
- [ ] Environment variables properly configured for all services
- [ ] Basic smoke tests passing for all infrastructure components

## Tasks

- [ ] TASK-001: Initialize Next.js project with TypeScript
- [ ] TASK-002: Set up Convex backend and database schema
- [ ] TASK-003: Configure Cloudinary integration
- [ ] TASK-004: Implement Convex Auth with email and Google OAuth
- [ ] TASK-005: Set up testing infrastructure
- [ ] TASK-006: Configure deployment pipeline

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
