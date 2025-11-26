---
issue_id: TASK-007
plan_type: task
created: 2025-11-26
last_updated: 2025-11-26
complexity: 4
status: planned
---

# Implementation Plan: TASK-007 Add API Authorization and Security Hardening

Address security vulnerabilities identified in security audit (score: 85/100, target: 95/100). Add authorization checks to 16 mutations across 4 resource files and secure 2 publicly exposed debug functions.

**Scope**: Fix HIGH-001 (missing authorization on mutations) and HIGH-002 (debug functions publicly accessible).

## Phases

### Phase 1 - Foundation and Auth Helpers

**Objective**: Create reusable authentication utilities and test helpers to support DRY implementation across all protected mutations.

- [x] 1.1 Create `convex/lib/auth.ts` with auth helper functions
  - [x] 1.1.1 Implement `requireAuth(ctx)` - validates user authentication, returns userId or throws
  - [x] 1.1.2 Implement `requireOwnerOrAdmin(ctx, resourceCreatedBy)` - validates ownership or admin role
  - [x] 1.1.3 Define `AUTH_ERRORS` constants for standardized error messages
  - [x] 1.1.4 Add JSDoc documentation for all helper functions
- [ ] 1.2 Create `convex/test.helpers.ts` for authenticated test contexts
  - [ ] 1.2.1 Implement `createTestUser(t, overrides?)` - creates test user with optional role
  - [ ] 1.2.2 Implement `asUser(t, userId)` - returns authenticated test context via `t.withIdentity()`
  - [ ] 1.2.3 Add type exports for helper function signatures
- [ ] 1.3 Update schema with ownership tracking field
  - [ ] 1.3.1 Add `createdBy: v.optional(v.id("users"))` to `people` table
  - [ ] 1.3.2 Add `createdBy: v.optional(v.id("users"))` to `quotes` table
  - [ ] 1.3.3 Add `createdBy: v.optional(v.id("users"))` to `images` table
  - [ ] 1.3.4 Add `createdBy: v.optional(v.id("users"))` to `generatedImages` table
  - [ ] 1.3.5 Add index `by_creator` on `createdBy` field for all 4 tables (enables "my resources" queries)
- [x] 1.4 Write tests for auth helpers
  - [x] 1.4.1 Test `requireAuth` with authenticated user (should return userId)
  - [x] 1.4.2 Test `requireAuth` without authentication (should throw "Authentication required")
  - [x] 1.4.3 Test `requireOwnerOrAdmin` as owner (should pass)
  - [x] 1.4.4 Test `requireOwnerOrAdmin` as admin (should pass via bypass)
  - [x] 1.4.5 Test `requireOwnerOrAdmin` as different user (should throw "Not authorized")

**Test Count Estimate**: 5 helper tests

**Covers TASK.md Acceptance Criteria**: Foundation for all other phases

---

### Phase 2 - Protect Quotes Mutations

**Objective**: Add authentication and ownership checks to all quote mutations (create, update, delete).

- [ ] 2.1 Add authentication to `quotes.create` mutation
  - [ ] 2.1.1 Import `requireAuth` from `convex/lib/auth.ts`
  - [ ] 2.1.2 Call `requireAuth(ctx)` at start of handler, store returned `userId`
  - [ ] 2.1.3 Set `createdBy: userId` when inserting quote document
- [ ] 2.2 Add authorization to `quotes.update` mutation
  - [ ] 2.2.1 Import `requireOwnerOrAdmin` from `convex/lib/auth.ts`
  - [ ] 2.2.2 Fetch existing quote document
  - [ ] 2.2.3 Call `requireOwnerOrAdmin(ctx, quote.createdBy)` before patching
  - [ ] 2.2.4 Handle missing `createdBy` field gracefully (legacy data from Phase 1.3 optional field)
- [ ] 2.3 Add authorization to `quotes.delete` mutation
  - [ ] 2.3.1 Import `requireOwnerOrAdmin` from `convex/lib/auth.ts`
  - [ ] 2.3.2 Fetch existing quote document
  - [ ] 2.3.3 Call `requireOwnerOrAdmin(ctx, quote.createdBy)` before deletion
  - [ ] 2.3.4 Handle missing `createdBy` field gracefully (legacy data)
- [ ] 2.4 Update `quotes.test.ts` with authenticated contexts
  - [ ] 2.4.1 Import test helpers (`createTestUser`, `asUser`)
  - [ ] 2.4.2 Update all 12 existing mutation tests to use authenticated context
  - [ ] 2.4.3 Add auth validation tests: create/update/delete without auth (3 tests)
  - [ ] 2.4.4 Add ownership tests: update/delete someone else's quote (2 tests)
  - [ ] 2.4.5 Add admin bypass tests: admin can modify any quote (2 tests)
  - [ ] 2.4.6 Verify all tests pass with new auth checks

**Test Count Estimate**: 12 updated + 7 new = 19 total quote tests

**Covers TASK.md Acceptance Criteria**: "All mutations in quotes.ts require authentication"

---

### Phase 3 - Protect People Mutations

**Objective**: Add authentication and ownership checks to all person mutations (create, update, delete).

- [ ] 3.1 Add authentication to `people.create` mutation
  - [ ] 3.1.1 Import `requireAuth` from `convex/lib/auth.ts`
  - [ ] 3.1.2 Call `requireAuth(ctx)` at start of handler
  - [ ] 3.1.3 Set `createdBy: userId` when inserting person document
- [ ] 3.2 Add authorization to `people.update` mutation
  - [ ] 3.2.1 Import `requireOwnerOrAdmin` from `convex/lib/auth.ts`
  - [ ] 3.2.2 Fetch existing person document
  - [ ] 3.2.3 Call `requireOwnerOrAdmin(ctx, person.createdBy)` before patching
  - [ ] 3.2.4 Handle missing `createdBy` field gracefully (legacy data)
- [ ] 3.3 Add authorization to `people.delete` mutation
  - [ ] 3.3.1 Import `requireOwnerOrAdmin` from `convex/lib/auth.ts`
  - [ ] 3.3.2 Fetch existing person document
  - [ ] 3.3.3 Call `requireOwnerOrAdmin(ctx, person.createdBy)` before deletion
  - [ ] 3.3.4 Handle missing `createdBy` field gracefully (legacy data)
- [ ] 3.4 Update `people.test.ts` with authenticated contexts
  - [ ] 3.4.1 Import test helpers (`createTestUser`, `asUser`)
  - [ ] 3.4.2 Update all 12 existing mutation tests to use authenticated context
  - [ ] 3.4.3 Add auth validation tests: create/update/delete without auth (3 tests)
  - [ ] 3.4.4 Add ownership tests: update/delete someone else's person (2 tests)
  - [ ] 3.4.5 Add admin bypass tests: admin can modify any person (2 tests)
  - [ ] 3.4.6 Verify all tests pass with new auth checks

**Test Count Estimate**: 12 updated + 7 new = 19 total people tests

**Covers TASK.md Acceptance Criteria**: "All mutations in people.ts require authentication"

---

### Phase 4 - Protect Image Mutations

**Objective**: Add authentication and ownership checks to image mutations (create, remove).

- [ ] 4.1 Add authentication to `images.create` mutation
  - [ ] 4.1.1 Import `requireAuth` from `convex/lib/auth.ts`
  - [ ] 4.1.2 Call `requireAuth(ctx)` at start of handler
  - [ ] 4.1.3 Set `createdBy: userId` when inserting image metadata
- [ ] 4.2 Add authorization to `images.remove` mutation
  - [ ] 4.2.1 Import `requireOwnerOrAdmin` from `convex/lib/auth.ts`
  - [ ] 4.2.2 Fetch existing image document
  - [ ] 4.2.3 Call `requireOwnerOrAdmin(ctx, image.createdBy)` before deletion
  - [ ] 4.2.4 Handle missing `createdBy` field gracefully (legacy data)
- [ ] 4.3 Update `images.test.ts` with authenticated contexts
  - [ ] 4.3.1 Import test helpers (`createTestUser`, `asUser`)
  - [ ] 4.3.2 Update all 6 existing mutation tests to use authenticated context
  - [ ] 4.3.3 Add auth validation tests: create/remove without auth (2 tests)
  - [ ] 4.3.4 Add ownership tests: remove someone else's image (1 test)
  - [ ] 4.3.5 Add admin bypass test: admin can remove any image (1 test)
  - [ ] 4.3.6 Verify all tests pass with new auth checks

**Test Count Estimate**: 6 updated + 4 new = 10 total image tests

**Covers TASK.md Acceptance Criteria**: "All mutations in images.ts require authentication"

---

### Phase 5 - Protect GeneratedImage Mutations

**Objective**: Add authentication and ownership checks to generated image mutations (create, remove).

- [ ] 5.1 Add authentication to `generatedImages.create` mutation
  - [ ] 5.1.1 Import `requireAuth` from `convex/lib/auth.ts`
  - [ ] 5.1.2 Call `requireAuth(ctx)` at start of handler
  - [ ] 5.1.3 Set `createdBy: userId` when inserting generated image document
- [ ] 5.2 Add authorization to `generatedImages.remove` mutation
  - [ ] 5.2.1 Import `requireOwnerOrAdmin` from `convex/lib/auth.ts`
  - [ ] 5.2.2 Fetch existing generated image document
  - [ ] 5.2.3 Call `requireOwnerOrAdmin(ctx, genImage.createdBy)` before deletion
  - [ ] 5.2.4 Handle missing `createdBy` field gracefully (legacy data)
- [ ] 5.3 Update `generatedImages.test.ts` with authenticated contexts
  - [ ] 5.3.1 Import test helpers (`createTestUser`, `asUser`)
  - [ ] 5.3.2 Update all 6 existing mutation tests to use authenticated context
  - [ ] 5.3.3 Add auth validation tests: create/remove without auth (2 tests)
  - [ ] 5.3.4 Add ownership tests: remove someone else's generated image (1 test)
  - [ ] 5.3.5 Add admin bypass test: admin can remove any generated image (1 test)
  - [ ] 5.3.6 Verify all tests pass with new auth checks

**Test Count Estimate**: 6 updated + 4 new = 10 total generated image tests

**Covers TASK.md Acceptance Criteria**: "All mutations in generatedImages.ts require authentication"

---

### Phase 6 - Secure Debug Functions

**Objective**: Convert publicly accessible debug functions to internal-only access (not callable from client).

- [ ] 6.1 Secure `debugUsers.ts` queries
  - [ ] 6.1.1 Change `import { query }` to `import { internalQuery }`
  - [ ] 6.1.2 Convert `listAllUsers = query({...})` to `listAllUsers = internalQuery({...})`
  - [ ] 6.1.3 Convert `listAllAuthAccounts = query({...})` to `listAllAuthAccounts = internalQuery({...})`
  - [ ] 6.1.4 Verify functions removed from `_generated/api.d.ts` (no longer client-callable)
- [ ] 6.2 Secure `cleanupTestUsers.ts` mutations
  - [ ] 6.2.1 Change `import { mutation }` to `import { internalMutation }`
  - [ ] 6.2.2 Convert all cleanup mutations to `internalMutation`
  - [ ] 6.2.3 Verify functions still callable from Convex dashboard (manual test)
  - [ ] 6.2.4 Verify functions removed from client API (check generated types)
- [ ] 6.3 Verify debug function security
  - [ ] 6.3.1 Attempt to call `debugUsers.listAllUsers` from Next.js frontend (should fail at compile time)
  - [ ] 6.3.2 Call `debugUsers.listAllUsers` from Convex dashboard (should succeed)
  - [ ] 6.3.3 Verify TypeScript compilation shows no errors

**Test Count Estimate**: 0 new tests (manual verification via dashboard)

**Covers TASK.md Acceptance Criteria**: "debugUsers.ts and cleanupTestUsers.ts functions are internal"

---

### Phase 7 - Schema Finalization and Data Backfill

**Objective**: Make `createdBy` field required and backfill any legacy data created before auth checks.

- [ ] 7.1 Create backfill internal mutation
  - [ ] 7.1.1 Create `convex/migrations/backfillCreatedBy.ts` (internal mutation)
  - [ ] 7.1.2 Query each table for documents missing `createdBy` field
  - [ ] 7.1.3 Assign default admin user ID to legacy data (or mark as system-created)
  - [ ] 7.1.4 Return backfill statistics (tables processed, documents updated)
- [ ] 7.2 Run backfill migration
  - [ ] 7.2.1 Execute backfill from Convex dashboard
  - [ ] 7.2.2 Verify all documents have `createdBy` field populated
  - [ ] 7.2.3 Log backfill results for audit trail
- [ ] 7.3 Make `createdBy` required in schema
  - [ ] 7.3.1 Change `createdBy: v.optional(v.id("users"))` to `createdBy: v.id("users")` in all 4 tables
  - [ ] 7.3.2 Verify schema push succeeds (no validation errors)
  - [ ] 7.3.3 Run all tests to ensure no breakage from required field
- [ ] 7.4 Clean up legacy data handling
  - [ ] 7.4.1 Remove "handle missing createdBy gracefully" logic from Phase 2-5 (no longer needed)
  - [ ] 7.4.2 Simplify `requireOwnerOrAdmin` to assume `createdBy` always exists
  - [ ] 7.4.3 Re-run all tests to verify cleanup didn't break anything

**Test Count Estimate**: 0 new tests (validation via existing test suite)

**Covers TASK.md Acceptance Criteria**: Schema migration complete, all data has ownership

---

### Phase 8 - Security Audit and Documentation

**Objective**: Validate security improvements and update project documentation.

- [ ] 8.1 Run security quality assessment
  - [ ] 8.1.1 Execute `/ai-toolkit:quality --focus security` command
  - [ ] 8.1.2 Verify HIGH-001 (missing authorization) marked as resolved
  - [ ] 8.1.3 Verify HIGH-002 (debug functions) marked as resolved
  - [ ] 8.1.4 Confirm security score improved from 85/100 to 95+/100
- [ ] 8.2 Update security guidelines documentation
  - [ ] 8.2.1 Update `docs/development/conventions/security-guidelines.md:38-48` to use `getAuthUserId()` pattern
  - [ ] 8.2.2 Replace deprecated `ctx.auth.getUserIdentity()` example with `getAuthUserId(ctx)`
  - [ ] 8.2.3 Add ownership validation example using `requireOwnerOrAdmin()`
  - [ ] 8.2.4 Document admin role bypass pattern
- [ ] 8.3 Verify CRITICAL action items from code-architect review
  - [ ] 8.3.1 Confirm no public mutation allows `role` field modification (privilege escalation prevention)
  - [ ] 8.3.2 Verify admin creation is via `internalMutation` or database seed only
  - [ ] 8.3.3 Document admin creation procedure in `docs/deployment/runbook.md` (if exists)
- [ ] 8.4 Run comprehensive test suite
  - [ ] 8.4.1 Execute `npm run test:run` (all backend tests)
  - [ ] 8.4.2 Verify 217+ original tests + 28 new auth tests = 245+ tests passing
  - [ ] 8.4.3 Confirm test coverage remains ≥95% (auth helpers contribute to coverage)
  - [ ] 8.4.4 Check for any flaky tests or race conditions

**Test Count Estimate**: 0 new tests (final validation)

**Covers TASK.md Acceptance Criteria**: "Security audit re-run shows improved score (target: 95+)"

---

## Scenario Coverage

**Parent Spec**: SPEC-001 (MVP Infrastructure Setup)

**Note**: TASK-007 addresses security hardening, not new feature scenarios. The following scenarios remain valid after adding auth:

✓ **SPEC-001 Scenario 2: Developer creates type-safe backend function**
  → Auth checks don't break existing developer workflow (functions still type-safe)
  → Covered by Phase 8.4 (comprehensive test suite validation)

✓ **SPEC-001 Scenario 3: Developer runs comprehensive tests**
  → Test suite expands from 217 to 245+ tests (includes auth scenarios)
  → Covered by Phase 8.4 (test count verification)

**Security-Specific Validation** (new implicit scenarios):

✓ **Scenario: Unauthenticated user attempts mutation**
  → All protected mutations return "Authentication required" error
  → Covered by Phases 2.4.3, 3.4.3, 4.3.3, 5.3.3 (auth validation tests)

✓ **Scenario: User attempts to modify another user's resource**
  → Ownership validation returns "Not authorized to modify this resource"
  → Covered by Phases 2.4.4, 3.4.4, 4.3.4, 5.3.4 (ownership tests)

✓ **Scenario: Admin modifies any resource**
  → Admin role bypasses ownership checks, mutation succeeds
  → Covered by Phases 2.4.5, 3.4.5, 4.3.5, 5.3.5 (admin bypass tests)

✓ **Scenario: Client attempts to call debug function**
  → TypeScript compilation error (function not in generated API)
  → Covered by Phase 6.3.1 (frontend call verification)

---

## Complexity Analysis

**Score**: 4/10 (Moderate)

**Indicators**:
- Auth helper creation: +1 (new utility files, straightforward logic)
- Schema migration: +1 (optional field → required, backfill needed)
- Mutation protection: +1 (repetitive pattern across 16 mutations)
- Test updates: +1 (36 existing tests need authenticated context)
- Total: 4/10

**Recommendation**: Task is well-scoped for single PR. Methodical execution required (high test count), but low technical risk (existing auth infrastructure from TASK-004).

**Time Estimate**: 4-5 hours
- Phase 1 (Foundation): 30 min
- Phases 2-5 (Mutations + Tests): 2.5 hours
- Phase 6 (Debug Functions): 15 min
- Phase 7 (Schema Finalization): 30 min
- Phase 8 (Audit + Docs): 30 min

---

## Comparative Context

**Similar Completed Tasks**:

**TASK-004 (Convex Auth Implementation)**:
- Implemented `getAuthUserId()` API that TASK-007 now uses
- Lesson learned: Use `getAuthUserId(ctx)` from "@convex-dev/auth/server", NOT deprecated `ctx.auth.getUserIdentity()`
- TASK-004 WORKLOG shows extensive troubleshooting of JWT token transmission - TASK-007 benefits from stable auth foundation

**TASK-002 (Convex Backend)**:
- Created initial CRUD mutations (146 tests, 97% coverage)
- Test pattern: `convexTest(schema, modules)` with `t.mutation(api.quotes.create, {...})`
- TASK-007 extends this pattern with `t.withIdentity({ subject: userId })`

**Key Differences**:
- TASK-004: Built auth system from scratch (high complexity)
- TASK-002: Built resource layer without auth (medium complexity)
- TASK-007: Integrates existing auth into existing resources (moderate complexity, lower risk)

**Test Count Comparison**:
- TASK-002: 146 backend tests (initial implementation)
- TASK-004: +71 auth tests = 217 total
- TASK-007: +28 auth tests = 245 total (19% increase)

---

## Code-Architect Review Notes

**Status**: Approved with recommendations (2025-11-26)

**Alignment Score**: 93/100

**Key Approvals**:
1. ✅ Auth helper location (`convex/lib/auth.ts`) approved - follows DRY principle
2. ✅ Schema migration strategy (optional → required after backfill) approved
3. ✅ Error handling ("Authentication required", "Not authorized") approved
4. ✅ Test coverage (28 new tests) deemed excellent for security-critical code
5. ✅ Admin bypass pattern (`user.role === "admin"`) appropriate for MVP
6. ✅ Debug function security (`internalMutation`/`internalQuery`) is perfect solution

**CRITICAL Action Items** (addressed in Phase 8.3):
1. Verify no public mutation allows `role` field modification (privilege escalation prevention)
2. Update `security-guidelines.md` with `getAuthUserId()` pattern after implementation

**Recommendations Incorporated**:
- Standardize error messages via `AUTH_ERRORS` constant (Phase 1.1.3)
- Add `by_creator` index for "my resources" queries (Phase 1.3.5)
- Document creator roles (see "Implementation Notes: Creator Roles" below)

**Estimated Effort**: 4-5 hours (aligns with architect estimate)

---

## Implementation Notes

### Creator Roles (Clarification from Review)

**MVP Approach**: Admin-curated catalog

**Resource Creation Permissions**:
- `people`: Admins manually add people (verified sources)
- `quotes`: Admins manually add quotes (verified attribution)
- `images`: Admins upload source images for quotes
- `generatedImages`: **Users** generate quote overlays (authenticated users only)

**Auth Check Justification**:
- Even admin-only resources require auth (admin is authenticated)
- Ownership tracking enables future phase: user-submitted content with approval workflow

**Future Enhancement** (out of scope for TASK-007):
- Add `verified: boolean` field to quotes
- Users can create quotes with `verified: false`
- Admin approval promotes to `verified: true`

### Auth Helper Reusability

**Pattern**: All mutations follow identical structure

```typescript
// Create mutation (set ownership)
const userId = await requireAuth(ctx);
await ctx.db.insert("quotes", { ...args, createdBy: userId });

// Update/Delete mutation (check ownership)
const quote = await ctx.db.get(args.id);
await requireOwnerOrAdmin(ctx, quote.createdBy);
await ctx.db.patch(args.id, updates);
```

**Benefit**: DRY principle enforced across 16 mutations via 2 helper functions

### Test Pattern Migration

**Before** (no auth):
```typescript
const personId = await t.mutation(api.people.create, { name: "Einstein" });
const quoteId = await t.mutation(api.quotes.create, { personId, text: "E=mc²" });
```

**After** (authenticated):
```typescript
const userId = await createTestUser(t);
const tAuth = asUser(t, userId);

const personId = await tAuth.mutation(api.people.create, { name: "Einstein" });
const quoteId = await tAuth.mutation(api.quotes.create, { personId, text: "E=mc²" });
```

**Migration Effort**: Mechanical transformation, low risk of logic errors

### Schema Migration Safety

**Why Optional First**:
1. Existing production data may lack `createdBy` field
2. Making field required immediately causes validation errors on existing documents
3. Optional field allows gradual rollout, then backfill, then enforce

**Backfill Strategy**:
- Assign legacy data to designated "System" admin user
- Alternative: Create special "Legacy Content" user ID
- Log all backfilled document IDs for audit trail

---

## Post-MVP Enhancements

**Out of Scope for TASK-007** (documented for future reference):

1. **Audit Logging**: Log admin bypass actions for compliance (GDPR Article 30)
2. **Role-Based Access Control (RBAC)**: Granular permissions beyond simple admin/user
3. **Resource Visibility**: Private/public toggle (e.g., draft quotes)
4. **Ownership Transfer**: Allow transferring resource ownership between users
5. **Multi-Tenancy**: Organization-level isolation with `organizationId` field

---

## Test Count Summary

| Phase | Existing Tests Updated | New Tests Added | Total |
|-------|----------------------|----------------|-------|
| Phase 1 (Foundation) | 0 | 5 | 5 |
| Phase 2 (Quotes) | 12 | 7 | 19 |
| Phase 3 (People) | 12 | 7 | 19 |
| Phase 4 (Images) | 6 | 4 | 10 |
| Phase 5 (GeneratedImages) | 6 | 4 | 10 |
| Phase 6 (Debug Functions) | 0 | 0 | 0 |
| Phase 7 (Schema) | 0 | 0 | 0 |
| Phase 8 (Audit) | 0 | 0 | 0 |
| **TOTAL** | **36** | **28** | **64** |

**Grand Total**: 217 existing + 28 new = **245 backend tests**

**Coverage Impact**: Auth helpers increase coverage to ≥95% target (security-critical code fully tested)

---

## Alternative Approaches Considered

### 1. Separate Admin Mutations (Rejected)

**Approach**: Create `adminUpdateQuote`, `adminDeleteQuote` alongside user mutations

**Pros**: Explicit separation of admin vs user operations

**Cons**:
- Code duplication (2x mutations for same logic)
- Harder to maintain (changes need updating in 2 places)
- Over-engineering for MVP (YAGNI violation)

**Decision**: Use single mutation with `requireOwnerOrAdmin` bypass

---

### 2. Permissions Table (Rejected)

**Approach**: Create `permissions` table with user-resource-action tuples

**Pros**: Maximum flexibility, enterprise-grade RBAC

**Cons**:
- Massive scope increase (new table, complex queries)
- Performance overhead (permission checks on every mutation)
- Premature optimization (no requirement for fine-grained permissions)

**Decision**: Use simple role-based checks for MVP

---

### 3. Feature Flag for Auth Checks (Rejected)

**Approach**: Add `FEATURE_AUTH_CHECKS` env var to enable/disable auth

**Pros**: Can roll back without code changes

**Cons**:
- Security feature should NEVER be toggleable in production
- Creates false sense of safety (forgot to enable flag = security breach)
- Adds code complexity for questionable benefit

**Decision**: Implement auth checks unconditionally (security non-negotiable)

---

**Next Step**: `/implement TASK-007 1.1` to begin Phase 1 (Foundation)
