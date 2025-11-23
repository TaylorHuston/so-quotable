# Changelog

All notable changes to this project will be documented in this file. This should be for public facing changes that would be of interest to users, not internal decisions or changes that have no outward visibility.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- User authentication with email/password and Google OAuth
- User registration with password strength validation (NIST-compliant: 12+ chars, uppercase, lowercase, number, special)
- Protected routes with server-side authentication middleware
- User profile display with Google profile pictures
- Login and registration forms with error handling
- Dashboard page for authenticated users

- **Email Verification System** (Resend Integration)
  - Professional branded verification emails with purple gradient design
  - Secure 64-character tokens with 24-hour expiration
  - `/verify-email` page with loading/success/error states and auto-redirect
  - Fast email delivery (seconds) via Resend API
  - 3-second countdown before dashboard redirect

- **Password Reset Flow** ⭐ NEW FEATURE
  - Magic link password reset via email
  - `/forgot-password` page for password reset requests
  - `/reset-password` page with password strength indicator
  - Secure 1-hour reset tokens (shorter than verification for security)
  - Rate limiting: 3 requests per hour per email (prevents abuse)
  - "Forgot Password?" link on login page

- **Testing Infrastructure**
  - Playwright E2E testing framework
  - Comprehensive test suite: 558 tests with ~94% pass rate
  - Backend tests with convex-test
  - Component tests with React Testing Library

- **Deployment Pipeline** (2025-11-22)
  - Production deployment via Vercel + Convex Cloud
  - Automatic deployment from `main` branch
  - Health check monitoring (`/api/health`)
  - Local E2E testing workflow before production push
  - Simplified deployment adapted for Convex free tier constraints

- **Performance Optimizations**
  - Password strength calculation with 300ms debounce (80-90% re-render reduction)
  - Optimized email availability check (30-50% payload reduction)

### Changed

- **Email Verification Upgraded**
  - Changed from console-based to Resend email service with branded templates
  - Added professional HTML emails with inline CSS
  - Added verification UI with auto-redirect after success

- **Password Validation Enhanced**
  - NIST-compliant requirements enforced on frontend and backend
  - Real-time password strength indicator (weak/medium/strong)
  - Password confirmation matching validation
  - Debounced validation for improved performance

- **User Experience Improvements**
  - Auto-redirect after email verification (3-second countdown)
  - Auto-redirect after password reset success
  - Loading states for all async operations
  - Clear error messages for expired/invalid tokens

### Security

- Secure session management with httpOnly cookies
- Open redirect vulnerability protection in authentication flow
- Password hashing via Convex Auth's secure hashing mechanism

- **Enhanced Security Headers**
  - Comprehensive Content Security Policy (CSP) for XSS protection
  - HSTS, X-Frame-Options, X-Content-Type-Options
  - Permissions policy for camera, microphone, geolocation

- **Password Reset Security**
  - Email enumeration prevention (always returns success message)
  - Rate limiting: 3 requests per hour per email
  - Cryptographically secure tokens using crypto.randomUUID()
  - Single-use tokens with 1-hour expiration
  - Proper password hashing via Convex Auth's modifyAccountCredentials

### Fixed

- **Critical Password Update Bug**
  - Fixed password reset flow to actually update passwords (was validating but not updating)
  - Integrated Convex Auth's `modifyAccountCredentials` API for secure password updates

- **CSP Security Issues**
  - Resolved Content Security Policy blocking authentication UI
  - Added proper CSP directives for Convex, Cloudinary, and Google OAuth

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
