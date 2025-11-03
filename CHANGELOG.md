# Changelog

All notable changes to this project will be documented in this file. This should be for public facing changes that would be of interest to users, not internal decisions or changes that have no outward visibility.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- User authentication with email/password and Google OAuth
- User registration with password strength validation (12+ character requirement)
- Protected routes with server-side authentication middleware
- User profile display with Google profile pictures
- Login and registration forms with error handling
- Dashboard page for authenticated users

### Security

- Secure session management with httpOnly cookies
- Open redirect vulnerability protection in authentication flow
- Password hashing with bcrypt (12 rounds)
- Email verification system (console-based for MVP)

## [0.4.0] - 2025-11-03

### Added

- **Authentication System** (Convex Auth)
  - Email/password authentication with 12+ character passwords
  - Google OAuth integration
  - Email verification workflow (console-based for MVP)
  - User management with role-based access (user, admin)
  - Protected routes via Next.js middleware
  - Auto-generated authentication mutations

### Changed

- Updated ConvexProvider to ConvexAuthProvider for authentication support
- Enhanced user schema with authentication fields (emailVerified, role, image)

## [0.3.0] - 2025-11-02

### Added

- **Image Management** (Cloudinary Integration)
  - Server-side image uploads via Convex actions
  - Cloudinary upload presets for permanent and temporary images
  - URL transformation helpers (resize, text overlays, optimization)
  - Generated quote images with automatic 30-day deletion
  - CDN delivery with automatic format optimization (WebP/JPEG)
  - Comprehensive verification script for testing integration

### Changed

- Database schema expanded with `images` and `generatedImages` tables
- Added environment variables for Cloudinary API credentials

### Performance

- Automatic image optimization (format, quality)
- CDN-powered image delivery
- Client-side URL transformation (no server roundtrips)

## [0.2.0] - 2025-11-01

### Added

- **Backend Infrastructure** (Convex)
  - Database schema for people, quotes, and images
  - CRUD operations for all entities
  - Real-time reactive queries and mutations
  - Comprehensive test suite (97.36% coverage)
  - Health check endpoints for monitoring

### Testing

- Vitest configuration for unit and integration tests
- convex-test for Convex function testing
- Playwright setup for E2E testing
- 146+ tests with 90%+ coverage

## [0.1.0] - 2025-10-30

### Added

- **Project Foundation**
  - Next.js 15 project with TypeScript and App Router
  - Node.js 18.18.0 version management (.nvmrc, package.json engines)
  - Development environment setup (ESLint, Prettier, Tailwind CSS)
  - GitHub Actions CI/CD pipeline
  - Health check API endpoint (`/api/health`)
  - Comprehensive project documentation
  - AI Toolkit structure for structured development

### Documentation

- Architecture Decision Records (ADR-001, ADR-002, ADR-003)
- Development guidelines (coding, testing, security, git workflow)
- Project brief and architecture overview
