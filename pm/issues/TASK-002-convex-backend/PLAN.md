---
created: 2025-10-31
last_updated: 2025-10-31
complexity_score: 4
task_id: TASK-002
epic_id: EPIC-001
approach: pragmatic-mvp
estimated_phases: 4
estimated_time: 1.5 days
mvp_scope: true
---

# Implementation Plan: TASK-002 - Convex Backend Setup (Pragmatic MVP)

This plan follows a **Pragmatic MVP** approach focused on proving the Convex + Next.js integration works with minimal features. Advanced functionality (generated images, full-text search, comprehensive validation) is deferred to post-MVP iterations.

## MVP Scope Decision

**Approach**: Option B - Pragmatic MVP (recommended)

**What's Included**:
- Convex installation and deployment to dev environment
- Minimal schema (people, quotes, images only - no generatedImages)
- Basic CRUD operations with simple validation
- Simple pagination (limit parameter)
- Health check endpoint
- Manual testing via Convex dashboard (one test per entity)

**What's Deferred**:
- `generatedImages` table (feature, not infrastructure)
- Full-text search and advanced indexing
- Comprehensive validation and error handling taxonomy
- Automated seeding scripts
- Referential integrity enforcement (acceptable for POC with controlled data)
- Primary image constraints (can use single image per person for MVP)
- Cascading delete strategies

**Timeline**: 1.5 days vs 3.5-4 days for full implementation

## Complexity Analysis

**Score**: 4/10 (reduced from 6/10)

**Indicators**:
- multi_domain_integration: 2 points (database + serverless functions, simplified frontend)
- database_schema_changes: 1 point (creating minimal schema with 3 entities)
- testing_requirements: 1 point (manual testing via dashboard)

**Recommendation**: This simplified scope allows rapid validation of the tech stack while establishing patterns for future expansion.

## Implementation Approach

**Pattern**: Pragmatic MVP with manual validation
- **Code-first**: Convex setup, scaffolding, schema definition (Phase 1-2)
- **Test-first lite**: Basic CRUD with simple validation (Phase 3)
- **Manual validation**: Dashboard testing instead of automated tests (Phase 4)

**Key Deliverables**:
1. Convex backend deployed to development environment
2. Minimal TypeScript-safe schema (people, quotes, images)
3. Basic CRUD functions with simple validation and pagination
4. Health check endpoint
5. Working Convex + Next.js integration

**Dependencies**:
- TASK-001: Next.js project must be initialized (✅ completed)
- Convex account (create during Phase 1)
- Environment variables configured

## Phases

### Phase 1 - Convex Installation & Initialization
**Goal**: Set up Convex in the Next.js project and establish development environment

- [x] 1.1 Install Convex dependencies
  - [x] 1.1.1 Run `npm install convex`
  - [x] 1.1.2 Verify package.json updated with convex dependency
- [x] 1.2 Initialize Convex project
  - [x] 1.2.1 Run `npx convex dev` to create new Convex project
  - [x] 1.2.2 Select or create new Convex project when prompted ("So Quotable")
  - [x] 1.2.3 Verify convex.json created with deployment configuration
- [x] 1.3 Configure environment variables
  - [x] 1.3.1 Verify CONVEX_DEPLOYMENT in .env.local (dev:cheery-cow-298)
  - [x] 1.3.2 Verify NEXT_PUBLIC_CONVEX_URL in .env.local
  - [x] 1.3.3 Update .env.local.example with Convex variables (already documented)
- [x] 1.4 Set up Convex provider in Next.js
  - [x] 1.4.1 Create src/app/providers/ConvexClientProvider.tsx
  - [x] 1.4.2 Wrap app layout with ConvexClientProvider
  - [x] 1.4.3 Verify Convex client initialization in browser console

**Validation**:
- Convex dashboard accessible at https://dashboard.convex.dev
- `npx convex dev` runs without errors
- _generated directory created with TypeScript types

### Phase 2 - Minimal Database Schema
**Goal**: Define minimal database schema with TypeScript types (MVP scope)

- [x] 2.1 Create base schema structure
  - [x] 2.1.1 Create convex/schema.ts with defineSchema import
  - [x] 2.1.2 Define table structure using defineTable
- [x] 2.2 Implement People table
  - [x] 2.2.1 Add fields: name (required), slug (required), bio (optional)
  - [x] 2.2.2 Add optional dates: birthDate, deathDate (strings in ISO format)
  - [x] 2.2.3 Add timestamps: createdAt, updatedAt
  - [x] 2.2.4 Create index: by_slug (for lookups)
- [x] 2.3 Implement Quotes table
  - [x] 2.3.1 Add fields: personId (required), text (required), source (optional), sourceUrl (optional)
  - [x] 2.3.2 Add verified field (boolean, default false)
  - [x] 2.3.3 Add timestamps: createdAt, updatedAt
  - [x] 2.3.4 Create index: by_person (for filtering quotes by person)
- [x] 2.4 Implement Images table (simplified)
  - [x] 2.4.1 Add fields: personId (required), cloudinaryId (required), url (required)
  - [x] 2.4.2 Add dimensions: width, height (optional numbers)
  - [x] 2.4.3 Add attribution: source (optional string), license (optional string)
  - [x] 2.4.4 Add timestamps: createdAt
  - [x] 2.4.5 Create index: by_person
  - [x] 2.4.6 **Note**: Primary image constraint deferred - use single image per person for MVP
- [x] 2.5 Deploy and validate schema
  - [x] 2.5.1 Run `npx convex dev` to deploy schema (auto-deployed)
  - [x] 2.5.2 Verify no schema errors in console (TypeScript compilation passes)
  - [x] 2.5.3 Check Convex dashboard shows 3 tables (people, quotes, images)

**Validation**:
- Schema deploys without TypeScript errors
- All 3 tables visible in Convex dashboard
- Generated types available in _generated/dataModel.d.ts

**Deferred to Post-MVP**:
- generatedImages table (feature, not infrastructure)
- Full-text search indexes
- License union type validation (accept any string for MVP)
- Primary image constraint enforcement

### Phase 3 - Basic CRUD Functions with Simple Validation
**Goal**: Implement core queries and mutations with basic validation (MVP scope)

- [x] 3.1 Create people.ts with basic CRUD
  - [x] 3.1.1 Implement `list` query with simple pagination (limit parameter, default 50)
  - [x] 3.1.2 Implement `get` query (by ID)
  - [x] 3.1.3 Implement `getBySlug` query (using by_slug index)
  - [x] 3.1.4 Implement `create` mutation with validation:
    - [x] 3.1.4.1 Require name (non-empty string)
    - [x] 3.1.4.2 Require slug (non-empty, URL-safe)
    - [x] 3.1.4.3 Set createdAt, updatedAt timestamps
  - [x] 3.1.5 Implement `update` mutation with updatedAt timestamp
  - [x] 3.1.6 Implement `remove` mutation (hard delete for MVP)
- [x] 3.2 Create quotes.ts with basic CRUD
  - [x] 3.2.1 Implement `list` query with pagination and optional personId filter
  - [x] 3.2.2 Implement `getByPerson` query (using by_person index)
  - [x] 3.2.3 Implement `get` query (by ID)
  - [x] 3.2.4 Implement `create` mutation with validation:
    - [x] 3.2.4.1 Require text (non-empty string)
    - [x] 3.2.4.2 Require personId (must exist in people table)
    - [x] 3.2.4.3 Set verified default to false
    - [x] 3.2.4.4 Set createdAt, updatedAt timestamps
  - [x] 3.2.5 Implement `update` mutation with verified flag support
  - [x] 3.2.6 Implement `remove` mutation (hard delete)
- [x] 3.3 Create images.ts with basic CRUD
  - [x] 3.3.1 Implement `getByPerson` query (all images for a person)
  - [x] 3.3.2 Implement `create` mutation with validation:
    - [x] 3.3.2.1 Require personId, cloudinaryId, url
    - [x] 3.3.2.2 Set createdAt timestamp
  - [x] 3.3.3 Implement `remove` mutation (hard delete)
  - [x] 3.3.4 **Note**: Skip primary image logic for MVP (one image per person)
- [x] 3.4 Automated Tests with convex-test (Following ADR-002)
  - [x] 3.4.1 Install convex-test package
  - [x] 3.4.2 Write tests for people.ts (6 functions) - 18 test cases
  - [x] 3.4.3 Write tests for quotes.ts (6 functions) - 18 test cases
  - [x] 3.4.4 Write tests for images.ts (3 functions) - 12 test cases
  - [x] 3.4.5 Run test suite and verify all pass - 50/50 tests passing
  - [x] 3.4.6 Verify 80%+ coverage for backend functions - 97.89% coverage achieved
- [x] 3.5 Manual verification via Convex dashboard (smoke test)
  - [x] 3.5.1 Skipped - comprehensive automated tests (Phase 3.4) already verify all functionality
  - [x] 3.5.2 User confirmed manual testing worked earlier in session

**Validation**:
- All CRUD operations executable in Convex dashboard
- Basic validation prevents empty/invalid data
- Pagination works with limit parameter
- Foreign key references work (personId in quotes/images)

**Deferred to Post-MVP**:
- Full-text search functionality
- Advanced validation (slug uniqueness, URL format, etc.)
- Soft delete support
- Referential integrity enforcement (trust client for MVP)

### Phase 4 - Health Check & Frontend Integration
**Goal**: Verify Convex integration works end-to-end (MVP scope)

- [x] 4.1 Create health.ts endpoint
  - [x] 4.1.1 Implement `ping` query returning status and timestamp
  - [x] 4.1.2 Add simple database connectivity check (count people)
  - [x] 4.1.3 Return deployment environment info
  - [x] 4.1.4 Write comprehensive tests (5 test cases, all passing)
- [x] 4.2 Update Next.js health endpoint
  - [x] 4.2.1 Update app/api/health/route.ts to call Convex health.ping
  - [x] 4.2.2 Include Convex status in health response
  - [x] 4.2.3 Add test for Convex health integration
  - [x] 4.2.4 Set NEXT_PUBLIC_CONVEX_URL in tests/setup.ts
- [x] 4.3 Create simple frontend test (optional)
  - [x] 4.3.1 Create app/test-convex/page.tsx showing real-time people count
  - [x] 4.3.2 Use useQuery to fetch people list with real-time updates
  - [x] 4.3.3 Display count, connection status, and instructions
  - [x] 4.3.4 **Note**: This is for manual validation, not user-facing

**Validation**:
- ✅ Health endpoint returns successful ping from both Next.js and Convex (3 tests passing)
- ✅ Frontend can query Convex data (test page created)
- ✅ Real-time updates work (test page demonstrates live count updates)
- ✅ All 56 tests passing (5 health tests + 48 CRUD tests + 3 integration tests)

**Deferred to Post-MVP**:
- Comprehensive error handling taxonomy
- Frontend test/debug pages (use Convex dashboard instead)
- Mutation testing from frontend (use dashboard for MVP)

## Testing Strategy (MVP Scope)

### Manual Testing Approach
For MVP, we use **manual validation via Convex dashboard** instead of automated tests:

**Why Manual for MVP**:
- Faster implementation (no test infrastructure setup)
- Convex dashboard provides excellent testing UI
- Validates core functionality without test overhead
- Formal tests added later in TASK-005 (testing infrastructure)

**Manual Test Coverage**:
- Create, read, update, delete operations for all entities
- Basic validation (required fields, data types)
- Foreign key relationships (personId references)
- Pagination (limit parameter)
- Health check endpoint

**What to Test Manually** (Phase 3.4):
1. Create person → Verify in dashboard
2. Query by slug → Verify result
3. Create quote with personId → Verify relationship
4. Query quotes by person → Verify filtering
5. Create image with personId → Verify relationship
6. Health check → Verify response

### Code-First Approach
- All phases use code-first (no TDD for MVP)
- Scaffolding and implementation done together
- Validation via dashboard after each function

### Future Testing
- TASK-005 will add formal tests with convex-test
- Will achieve 95% coverage for CRUD functions
- Will add integration tests for frontend

## Success Criteria (MVP Scope)

All MVP-scoped acceptance criteria from TASK.md have been met:

- [x] Convex installed and configured in Next.js project
- [x] Convex development environment deployed and accessible
- [x] Database schema implemented with TypeScript types (3 tables: people, quotes, images)
- [x] Basic indexes for lookups (by_slug, by_person)
- [x] Basic CRUD functions with simple validation for each entity
- [x] Pagination support (limit parameter)
- [x] Type-safe API generated and accessible from frontend
- [x] Health check endpoint integrated
- [x] Automated testing completed (56 tests, 97.89% coverage) - exceeded manual testing requirement

**Deferred from Original Criteria**:
- ~~All 4 tables~~ → 3 tables (generatedImages deferred)
- ~~Indexes for efficient queries~~ → Basic indexes only (full-text search deferred)
- ~~Development database seeded~~ → Manual data entry via dashboard for MVP

## Notes

### MVP Technical Decisions
- **Simplified schema**: 3 tables only (people, quotes, images)
- **No generatedImages**: Feature deferred to post-MVP
- **Hard delete**: Using hard delete for MVP simplicity (soft delete later)
- **Manual testing**: Dashboard-based validation instead of automated tests
- **Basic validation**: Required fields only, advanced validation later
- **Simple pagination**: Limit parameter only (cursor-based pagination later)
- **Trust client**: No server-side referential integrity for MVP

### Dependencies for Next Phases
- **TASK-003**: Cloudinary integration will use cloudinaryId fields in images table
- **TASK-004**: Convex Auth will add user relationships to all tables
- **TASK-005**: Testing infrastructure will add formal convex-test suite
- **Future tasks**: Will add generatedImages, full-text search, advanced validation

### Key Architecture Principles Maintained
- No circular dependencies: People don't reference images directly
- TypeScript-first: Full type safety from schema
- Timestamps for audit trail: createdAt/updatedAt on all tables
- Slug field on People for SEO-friendly URLs
- Index-based queries: by_slug, by_person indexes

### Potential Gotchas
- Convex dev server must run alongside Next.js dev server (2 terminals)
- Schema changes require restart of `npx convex dev`
- TypeScript types in _generated/ are gitignored (regenerated on deploy)
- Indexes must be defined in schema.ts, not at runtime
- Real-time subscriptions require ConvexClientProvider wrapper in layout

### Post-MVP Hardening (from Architecture Review)
When ready to move beyond MVP, address these items:
1. **Critical**: Referential integrity validation in mutations
2. **Critical**: Primary image constraint with race condition handling
3. **Critical**: Cascading delete strategy (needs ADR)
4. **Medium**: Additional indexes (by_cloudinary_id, by_expires_at)
5. **Medium**: Cursor-based pagination for large datasets
6. **Medium**: Full-text search for quotes
7. **Medium**: Comprehensive validation (slug uniqueness, URL format)
8. **Medium**: Error handling taxonomy and consistent error types