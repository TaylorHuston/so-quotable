---
id: SPEC-002
name: quote-generation-admin
title: Quote Generation & Admin Dashboard
status: planned
created: 2025-11-23
updated: 2025-11-23
---

# SPEC-002: Quote Generation & Admin Dashboard

## Description

This feature enables users to generate shareable quote images by selecting from pre-populated content. Users browse people in the database, view their associated photos, and choose from verified quotes attributed to them. The system overlays the quote text on the selected person's image using Cloudinary transformations, creating a downloadable quote image.

Includes an admin dashboard for the site administrator to manage the content catalog via full CRUD operations on people, photos, and quotes. This ensures all quotes are properly sourced and attributed before users can generate images.

**MVP Scope**: Simple, functional proof-of-concept with fixed "bottom third" quote layout, basic text customization (font size and color), and direct generation (no live preview). Advanced features (custom positioning, live preview, filters, batch generation) deferred to future iterations.

## Users & Actors

- **End Users (authenticated)** - Browse people and quotes, select combinations, generate quote images with basic customization (font size/color), download results
- **Admin User (single administrator)** - Manage content catalog via admin dashboard, CRUD operations on people/photos/quotes, verify quote attributions, ensure data quality

## Acceptance Scenarios

**Scenario 1: User generates a quote image (happy path)**
- Given: Database has people with photos and attributed quotes
- When: User selects a person from the grid
- Then: Person's photos appear in photo selector
- When: User selects one of the person's photos
- Then: Quotes attributed to that person appear in quote selector
- When: User selects a quote and optionally adjusts font size/color
- And: User clicks "Generate Quote Image"
- Then: System generates image with quote overlaid on photo using Cloudinary (bottom third layout)
- And: Generated image appears with download option
- And: User can download the image or generate another

**Scenario 2: Admin adds a new person with photo**
- Given: Admin is logged into admin dashboard
- When: Admin creates person profile (name, bio, etc.)
- And: Admin uploads photo via Cloudinary integration
- Then: Person appears in database with uploaded photo
- And: Person is immediately available in quote generation flow
- And: Photo can be attributed to quotes

**Scenario 3: Admin attributes quote to person**
- Given: Person exists in database
- When: Admin creates quote with text and source verification
- And: Admin attributes quote to that person
- Then: Quote is linked to person in database
- And: Quote immediately appears in quote generation flow for that person
- And: Quote source is documented for attribution

**Scenario 4: Admin edits existing content**
- Given: Content exists in database (person/photo/quote)
- When: Admin updates any entity via dashboard (edit person bio, update quote text, replace photo)
- Then: Changes are saved to database
- And: Changes are reflected immediately in quote generation flow
- And: No data integrity issues (orphaned records)

**Scenario 5: User customizes quote appearance**
- Given: User has selected person, photo, and quote
- When: User adjusts font size (small/medium/large)
- And: User selects text color (black/white/custom)
- Then: Customization options are saved
- When: User clicks "Generate Quote Image"
- Then: Generated image reflects selected customizations
- And: Quote text is readable with chosen size/color

**Scenario 6: Admin dashboard WCAG compliance**
- Given: Admin navigates to admin dashboard
- When: Admin uses keyboard-only navigation
- Then: All CRUD operations are accessible via keyboard
- And: Screen reader announces all form labels and actions
- And: Color contrast meets WCAG 2.1 AA standards
- And: Focus indicators are clearly visible

## Out of Scope

**Deferred to Future Iterations:**
- Public quote gallery (authenticated users only for MVP)
- Social sharing features (Facebook/Twitter/Instagram integration)
- Quote voting/rating system
- User-submitted quotes (admin-only content curation for MVP)
- Advanced text styling (custom fonts, multiple font options, custom positioning)
- Drag-and-drop quote repositioning
- Live preview (direct generation only for MVP)
- Batch quote generation (single image at a time)
- Quote collections/favorites
- Advanced search/filtering (basic browse only)
- Image background customization (crop, zoom, filters - use photo as-is)
- Multiple layout templates (bottom third only for MVP)
- Quote editing after generation (regenerate only)

**Explicitly Excluded:**
- Mobile app (web-only)
- Video quotes or animated content
- Multi-language support (English only)
- Watermarking or branding options
- Print-quality image export (web resolution only)

## Definition of Done

✅ **Quote Generation Flow:**
- User can browse people with photos in a grid layout
- User can view photos for selected person
- User can view quotes attributed to selected person
- User can customize quote appearance (font size: small/medium/large, color: black/white/custom)
- User can generate quote image with bottom third layout
- Generated images use Cloudinary text overlay transformations
- Generated images are saved to database (generatedImages table)
- User can download generated images
- User can generate another image (reset flow)

✅ **Admin Dashboard:**
- CRUD operations for people (create, read, update, delete with name, bio, etc.)
- CRUD operations for photos (upload via Cloudinary, link to people, delete)
- CRUD operations for quotes (create, edit text, attribute to people, source verification, delete)
- Admin can link multiple photos to a single person
- Admin can attribute multiple quotes to a single person
- All changes reflect immediately in quote generation flow
- Data integrity validation (prevent orphaned records, require attribution)

✅ **UI/Design System:**
- Design system established (design tokens: colors, typography, spacing, accessibility-compliant contrast ratios)
- Reusable component library (buttons, forms, cards, modals, navigation with ARIA support)
- Page layouts and navigation patterns defined
- Consistent styling across admin dashboard and user-facing pages
- Responsive design (desktop primary, tablet secondary, mobile deferred)
- **WCAG 2.1 AA compliance** throughout application
- Semantic HTML with proper ARIA labels
- Keyboard navigation support for all interactive elements
- Screen reader compatibility validated

✅ **Quality:**
- E2E tests for complete quote generation flow (person → photo → quote → customize → generate → download)
- E2E tests for admin CRUD operations (create, read, update, delete for all entities)
- Unit tests for Cloudinary text overlay logic
- 90%+ test coverage for new code
- **Accessibility audit passes** (axe-core or similar)
- Manual keyboard navigation testing completed
- Manual screen reader testing completed

## Success Metrics

- **Test Coverage**: ≥90% for new quote generation and admin dashboard code
- **Performance**: Quote image generation <3 seconds end-to-end
- **Image Quality**: Generated images meet quality standards (readable text overlay, proper contrast, bottom third positioning accurate)
- **UI Responsiveness**: Admin dashboard functional on desktop (1920x1080) and tablet (1024x768), mobile deferred
- **Data Integrity**: Zero orphaned records (quotes without people, photos without people) enforced by database constraints
- **User Flow**: Quote generation flow completable in ≤5 clicks (person → photo → quote → customize → generate)
- **Accessibility**: WCAG 2.1 AA compliance validated, zero critical accessibility issues in axe-core audit
- **Keyboard Navigation**: 100% of interactive elements accessible via keyboard only (no mouse required)
- **Download Success**: 100% of generated images successfully downloadable in common formats (PNG/JPEG)

## Dependencies

**Completed Infrastructure (SPEC-001):**
- ✅ Next.js + TypeScript project (TASK-001)
- ✅ Convex backend with database schema (TASK-002)
  - `people` table (name, bio, metadata)
  - `images` table (Cloudinary URLs, person attribution)
  - `quotes` table (text, attribution, source)
  - `generatedImages` table (user, Cloudinary URL, 30-day auto-delete)
- ✅ Cloudinary integration (TASK-003)
  - Image upload actions
  - Text overlay transformations (already tested)
  - CDN delivery with auto-format optimization
- ✅ Authentication & authorization (TASK-004)
  - Email/password + Google OAuth
  - Protected routes for admin dashboard
  - User session management
- ✅ Testing infrastructure (TASK-005)
  - Vitest for unit tests
  - Playwright for E2E tests
  - convex-test for backend testing
- ✅ Deployment pipeline (TASK-006)
  - Vercel production deployment
  - Convex Cloud backend

**Architecture Decisions:**
- ADR-001: Tech Stack (Next.js + Convex + Cloudinary)
- ADR-002: Testing Framework (Vitest + Playwright + convex-test)
- ADR-003: Deployment Strategy (Vercel + Convex Cloud, free tier adapted)

**External Services (Already Configured):**
- Cloudinary account with upload presets and transformations
- Convex production deployment
- Vercel hosting

## Tasks

Progress: 0/3 tasks complete (0%)

- [ ] **TASK-008**: Establish UI design system and component library
  - Design tokens (colors, typography, spacing with WCAG AA contrast)
  - Component library (buttons, forms, cards, modals with ARIA support)
  - Page layouts and navigation patterns
  - Accessibility guidelines and axe-core testing setup
  - Storybook or component documentation (optional)

- [ ] **TASK-009**: Build admin dashboard with CRUD operations
  - People management UI (create, read, update, delete)
  - Photo management (Cloudinary upload, link to people, preview)
  - Quote management (create, attribute to people, source verification)
  - Admin route protection and authorization
  - Data integrity validation (prevent orphaned records)
  - E2E tests for all CRUD operations

- [ ] **TASK-010**: Implement quote generation user flow
  - Person browser/selector (grid layout)
  - Photo selector (filtered by selected person)
  - Quote selector (filtered by selected person)
  - Quote customization UI (font size, color picker)
  - Cloudinary text overlay generation (bottom third layout)
  - Generated image gallery and download
  - E2E tests for complete flow

---

## Notes

**Development Approach:**
- **UI-first**: TASK-008 establishes design system before building features
- **Admin-first**: TASK-009 enables content population before user-facing features
- **Incremental complexity**: Start with fixed layout, add advanced features in future iterations
- **Accessibility from start**: WCAG compliance built-in, not retrofitted

**Technical Highlights:**
- Leverages existing Cloudinary text overlay transformations (tested in TASK-003)
- Uses existing database schema (defined in TASK-002)
- Progressive disclosure UI pattern (single page, show/hide sections)
- Direct generation (no live preview) for MVP simplicity
- Bottom third layout only (simplest Cloudinary transformation)

**Future Enhancements (Post-MVP):**
- Custom quote positioning (drag-and-drop)
- Live preview with Cloudinary preview URLs
- Multiple layout templates (center, top, custom)
- Advanced text styling (custom fonts, shadows, outlines)
- Image filters and adjustments (B&W, sepia, crop, zoom)
- Batch generation (multiple quotes at once)
- Quote collections and favorites
- Public gallery and social sharing
- User-submitted quote suggestions (admin approval workflow)

**Current Status**: Planned. SPEC-001 infrastructure complete. Ready to begin design system work (TASK-008).
