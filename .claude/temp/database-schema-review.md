# Database Schema Review: So Quotable
**Database Architecture and Performance Specialist Review**

**Date**: 2025-10-30
**Reviewer**: Database Architecture Specialist
**Project**: So Quotable - Quote Image Generator
**Database**: Convex (Document Database with TypeScript Schema)
**Phase**: Pre-Implementation Review for MVP

---

## Executive Summary

**Overall Assessment**: **APPROVE WITH CHANGES**

The proposed Convex schema demonstrates solid foundational design with appropriate data modeling for the MVP's core functionality. The schema correctly captures the essential relationships (people → quotes, people → images, quotes → generated images) and includes critical fields for legal compliance (image licensing) and performance (indexes for common queries).

**Key Strengths**:
- Strong relational design despite document database platform
- Type-safe schema with Convex validators
- Well-designed indexes for common query patterns
- Legal compliance built in (image licensing fields)
- Appropriate use of Convex-specific features (search indexes, reactive queries)

**Critical Issues**:
- Missing `url` field in images table (required per task spec)
- Inconsistent timestamp handling (some tables use `createdAt`, others don't)
- `defaultImageId` in people table creates circular dependency risk
- Missing `userId` field in several tables for user-generated content
- No soft delete strategy for data integrity

**Recommendation**: Implement the suggested changes before proceeding with development. The modifications are straightforward and will prevent technical debt and future refactoring.

---

## Overall Schema Assessment

### Verdict: APPROVE WITH CHANGES

**Confidence Level**: 95%

The schema is well-suited for the MVP with the following profile:
- ✅ Correctly models core domain entities
- ✅ Appropriate for Convex document database
- ✅ Type-safe with proper validators
- ✅ Scales adequately for <10k users
- ⚠️ Requires minor corrections for consistency and completeness
- ⚠️ Needs additional fields for production robustness

### Schema Maturity Score: 7.5/10

| Criteria | Score | Notes |
|----------|-------|-------|
| **Data Modeling** | 8/10 | Strong relational design, minor circular dependency issue |
| **Type Safety** | 9/10 | Excellent use of Convex validators, union types |
| **Indexing Strategy** | 8/10 | Good coverage, missing some indexes for edge cases |
| **Scalability** | 8/10 | Adequate for MVP, clear upgrade paths |
| **Data Integrity** | 6/10 | Missing constraints, no soft delete, cascade strategy unclear |
| **Completeness** | 7/10 | Missing critical fields (url, userId, timestamps) |
| **Convex Best Practices** | 9/10 | Excellent use of platform features |
| **Legal Compliance** | 9/10 | Strong licensing attribution support |

---

## Table-by-Table Analysis

### 1. People Table

**Current Schema**:
```typescript
people: defineTable({
  name: v.string(),
  bio: v.optional(v.string()),
  birthDate: v.optional(v.string()),
  deathDate: v.optional(v.string()),
  defaultImageId: v.optional(v.id("images")),
})
  .index("by_name", ["name"])
```

#### Assessment: APPROVE WITH CHANGES

**Strengths**:
- ✅ Clean, simple structure appropriate for MVP
- ✅ Optional fields allow flexibility (not all people have full bio data)
- ✅ String-based dates are pragmatic for MVP (avoid timezone complexity)
- ✅ Index on `name` supports search and alphabetical listing

**Issues**:

1. **CRITICAL: Circular Dependency Risk** (Priority: High)
   - `defaultImageId` references images table, but images table requires `personId`
   - Creates chicken-egg problem: which record gets created first?
   - **Risk**: Insertion logic becomes complex, potential for orphaned references

2. **Missing Timestamps** (Priority: Medium)
   - No `createdAt` or `updatedAt` fields
   - Cannot track when people were added to database
   - Cannot sort by "recently added" for admin UX

3. **Missing Audit Fields** (Priority: Low)
   - No `userId` field to track who created the person record
   - No `isVerified` flag for data quality
   - No `slug` field for SEO-friendly URLs

4. **Date Format Not Specified** (Priority: Medium)
   - `birthDate` and `deathDate` are strings but format not documented
   - Risk of inconsistent formats (ISO 8601 vs "January 1, 1950" vs "1950-01-01")
   - Cannot easily sort or filter by birth year

**Recommendations**:

```typescript
people: defineTable({
  // Core fields
  name: v.string(),
  slug: v.string(), // URL-friendly: "albert-einstein"
  bio: v.optional(v.string()),

  // Dates (ISO 8601 strings: "1879-03-14" or null for unknown)
  birthDate: v.optional(v.string()), // Document format: "YYYY-MM-DD" or "YYYY" for year-only
  deathDate: v.optional(v.string()),

  // Remove circular dependency - use query to find primary image instead
  // defaultImageId: v.optional(v.id("images")), // REMOVE

  // Metadata
  isVerified: v.boolean(), // Data quality flag
  createdAt: v.number(), // Unix timestamp
  updatedAt: v.number(), // Unix timestamp
  createdBy: v.optional(v.id("users")), // Admin who added this person
})
  .index("by_name", ["name"])
  .index("by_slug", ["slug"]) // Unique lookup for URLs
  .index("by_created", ["createdAt"]) // Recent additions
```

**Migration Strategy**:
- **defaultImageId removal**: Query images table with `isPrimary` filter instead
- **slug generation**: Auto-generate from name (e.g., "Albert Einstein" → "albert-einstein")
- **timestamps**: Use `Date.now()` for existing records during migration

**Rationale**:
- **Circular dependency fix**: Move responsibility to application layer
  - Create person → create images → update image to set `isPrimary=true`
  - Query: `db.query("images").withIndex("by_person_primary", q => q.eq("personId", personId).eq("isPrimary", true)).first()`
- **slug field**: Enables SEO-friendly URLs like `/people/albert-einstein`
- **timestamps**: Essential for admin UX and data lifecycle management
- **isVerified**: Supports future user-submitted content workflow

---

### 2. Quotes Table

**Current Schema**:
```typescript
quotes: defineTable({
  personId: v.id("people"),
  text: v.string(),
  source: v.string(),
  sourceUrl: v.optional(v.string()),
  verified: v.boolean(),
  createdAt: v.number(),
})
  .index("by_person", ["personId"])
  .searchIndex("search_text", {
    searchField: "text",
    filterFields: ["verified", "personId"],
  })
```

#### Assessment: APPROVE WITH MINOR CHANGES

**Strengths**:
- ✅ Excellent schema design for core functionality
- ✅ Full-text search index on quote text (critical feature)
- ✅ Filter fields enable verified-only searches
- ✅ Proper foreign key to people table
- ✅ `verified` flag supports data quality workflows
- ✅ Timestamp tracking (`createdAt`)

**Issues**:

1. **Missing `updatedAt` Field** (Priority: Low)
   - Cannot track when quotes were edited
   - Important for audit trail if quotes need correction

2. **Missing User Tracking** (Priority: Medium)
   - No `createdBy` or `userId` field
   - Cannot track who submitted quote (important for Phase 2: user-submitted quotes)

3. **Source Validation Not Enforced** (Priority: Low)
   - `source` is required but no format constraint
   - `sourceUrl` is optional but no URL validation
   - Risk: inconsistent citation formats

4. **No Duplicate Detection** (Priority: Medium)
   - Multiple identical quotes could be added to same person
   - No unique constraint on (personId, text) combination

**Recommendations**:

```typescript
quotes: defineTable({
  // Core fields
  personId: v.id("people"),
  text: v.string(),

  // Source attribution
  source: v.string(), // e.g., "Speech at Princeton University, 1921"
  sourceUrl: v.optional(v.string()), // Verified external URL
  sourceType: v.optional(v.union(
    v.literal("book"),
    v.literal("speech"),
    v.literal("interview"),
    v.literal("letter"),
    v.literal("article"),
    v.literal("unknown")
  )),

  // Data quality
  verified: v.boolean(),
  verifiedBy: v.optional(v.id("users")), // Admin who verified
  verifiedAt: v.optional(v.number()),

  // Metadata
  usageCount: v.number(), // Track popularity for recommendations
  createdAt: v.number(),
  updatedAt: v.number(),
  createdBy: v.optional(v.id("users")), // Support future user submissions
})
  .index("by_person", ["personId"])
  .index("by_verified", ["verified", "personId"]) // Fast verified-only queries
  .index("by_usage", ["usageCount"]) // Popular quotes
  .searchIndex("search_text", {
    searchField: "text",
    filterFields: ["verified", "personId"],
  })
```

**Application-Level Validation**:
```typescript
// In quotes.ts mutation
async create(ctx, { personId, text, source }) {
  // Check for duplicate quotes
  const existing = await ctx.db
    .query("quotes")
    .withIndex("by_person", q => q.eq("personId", personId))
    .filter(q => q.eq(q.field("text"), text))
    .first();

  if (existing) {
    throw new Error("Quote already exists for this person");
  }

  // Validate sourceUrl format if provided
  if (sourceUrl && !isValidUrl(sourceUrl)) {
    throw new Error("Invalid source URL format");
  }

  // Create quote...
}
```

**Rationale**:
- **sourceType**: Enables filtering by quote type, useful for UI ("Show me book quotes")
- **usageCount**: Track popular quotes for recommendations and trending features
- **verification metadata**: Audit trail for data quality process
- **duplicate prevention**: Application-level check prevents data quality issues
- **by_verified index**: Composite index optimizes common query pattern (verified quotes for person)

---

### 3. Images Table

**Current Schema**:
```typescript
images: defineTable({
  personId: v.id("people"),
  cloudinaryId: v.string(),
  category: v.optional(v.string()),
  description: v.optional(v.string()),
  isPrimary: v.boolean(),
  usageCount: v.number(),
  width: v.number(),
  height: v.number(),
  source: v.string(),
  license: v.string(),
  createdAt: v.number(),
})
  .index("by_person", ["personId"])
  .index("by_person_primary", ["personId", "isPrimary"])
```

#### Assessment: REQUIRES CHANGES

**Strengths**:
- ✅ Comprehensive image metadata (width, height for responsive images)
- ✅ **Excellent legal compliance**: source and license fields (MVP-critical)
- ✅ `isPrimary` flag supports multiple images per person
- ✅ `usageCount` enables popularity tracking
- ✅ Composite index for fast primary image lookup
- ✅ Strong attribution support (source field)

**Critical Issues**:

1. **CRITICAL: Missing `url` Field** (Priority: Critical)
   - **Task spec explicitly requires**: "url: v.string()"
   - Cloudinary URL must be stored for direct access
   - Without URL, frontend must reconstruct from cloudinaryId (error-prone)
   - **This is a blocker** - must be added before implementation

2. **License Type Validation** (Priority: High)
   - Current: `license: v.string()` allows any string
   - Task notes suggest union type approach (more type-safe)
   - Risk: typos ("CC BY 40" vs "CC BY 4.0"), inconsistent formats

3. **Missing Metadata** (Priority: Medium)
   - No `updatedAt` timestamp
   - No `uploadedBy` user tracking
   - No `aspectRatio` calculated field (useful for layout)

**Recommendations**:

```typescript
images: defineTable({
  // Core fields
  personId: v.id("people"),
  cloudinaryId: v.string(), // Cloudinary asset ID
  url: v.string(), // CRITICAL: Full Cloudinary URL (per task spec)

  // Image properties
  width: v.number(),
  height: v.number(),
  aspectRatio: v.number(), // Calculated: width/height for layout
  fileSize: v.optional(v.number()), // Bytes (for storage tracking)
  format: v.optional(v.string()), // "jpg", "png", "webp"

  // Classification
  category: v.optional(v.union(
    v.literal("portrait"),
    v.literal("action"),
    v.literal("candid"),
    v.literal("historical"),
    v.literal("other")
  )),
  description: v.optional(v.string()),
  isPrimary: v.boolean(),

  // Legal compliance (MVP-critical)
  source: v.string(), // e.g., "Wikimedia Commons"
  license: v.union(
    v.literal("Public Domain"),
    v.literal("CC0"),
    v.literal("CC BY 4.0"),
    v.literal("CC BY-SA 4.0"),
    v.literal("CC BY 3.0"),
    v.literal("CC BY-SA 3.0"),
    v.literal("Custom") // For special permissions
  ),
  attributionText: v.optional(v.string()), // Formatted attribution for display
  licenseUrl: v.optional(v.string()), // Link to license terms

  // Usage tracking
  usageCount: v.number(),
  lastUsedAt: v.optional(v.number()), // Track image freshness

  // Metadata
  createdAt: v.number(),
  updatedAt: v.number(),
  uploadedBy: v.optional(v.id("users")),
})
  .index("by_person", ["personId"])
  .index("by_person_primary", ["personId", "isPrimary"])
  .index("by_person_category", ["personId", "category"]) // Filter by category
  .index("by_cloudinary_id", ["cloudinaryId"]) // Unique lookup
```

**Rationale**:
- **url field**: Critical for task compliance and frontend performance
  - Eliminates URL reconstruction logic in frontend
  - Single source of truth for image access
  - Simplifies caching and CDN logic
- **license union type**: Type-safe validation prevents legal compliance issues
  - Compiler enforces valid licenses
  - Autocomplete in IDE improves developer experience
  - Prevents typos in critical legal field
- **aspectRatio**: Pre-calculated for layout performance
  - Frontend doesn't need to calculate on every render
  - Useful for responsive image containers
- **category union type**: Structured data enables better UX
  - Frontend can filter by image type ("show me action shots")
  - Type-safe enum prevents inconsistent categories
- **attributionText**: Pre-formatted attribution string
  - Example: "Photo by User:XYZ, CC BY-SA 4.0, via Wikimedia Commons"
  - Simplifies legal compliance display in UI
  - Consistent formatting across all images

**Data Integrity Constraint** (Application-Level):
```typescript
// In images.ts mutation
async setPrimary(ctx, { imageId, personId }) {
  // Only one primary image per person
  await ctx.db
    .query("images")
    .withIndex("by_person_primary", q =>
      q.eq("personId", personId).eq("isPrimary", true)
    )
    .collect()
    .then(images => images.forEach(img =>
      ctx.db.patch(img._id, { isPrimary: false })
    ));

  // Set new primary
  await ctx.db.patch(imageId, { isPrimary: true });
}
```

---

### 4. Generated Images Table

**Current Schema**:
```typescript
generatedImages: defineTable({
  quoteId: v.id("quotes"),
  imageId: v.id("images"),
  cloudinaryId: v.string(),
  userId: v.optional(v.id("users")),
  viewCount: v.number(),
  createdAt: v.number(),
  expiresAt: v.number(),
  isPermanent: v.boolean(),
})
  .index("by_quote", ["quoteId"])
  .index("by_expiration", ["expiresAt"])
```

#### Assessment: APPROVE WITH MINOR CHANGES

**Strengths**:
- ✅ Clean tracking of user-generated content
- ✅ Expiration strategy for storage management (30-day deletion)
- ✅ `isPermanent` flag enables paid tier feature
- ✅ Index on `expiresAt` supports cron cleanup job
- ✅ Relationship to both quote and base image tracked
- ✅ `viewCount` enables analytics

**Issues**:

1. **Missing `url` Field** (Priority: Critical)
   - Consistent with images table issue
   - Need direct URL for sharing (don't reconstruct)
   - Critical for social media sharing feature

2. **Missing Metadata Fields** (Priority: Medium)
   - No `updatedAt` timestamp
   - No shareable slug or short code for URLs
   - No metadata about generation (font, color, position)

3. **Expiration Logic Not Clear** (Priority: Medium)
   - How is `expiresAt` calculated? (createdAt + 30 days)
   - What happens to expired images? (soft delete? hard delete?)
   - No `deletedAt` field for soft delete pattern

4. **Missing Analytics Fields** (Priority: Low)
   - No referrer tracking (where was image shared?)
   - No generation settings saved (can't reproduce)

**Recommendations**:

```typescript
generatedImages: defineTable({
  // Relationships
  quoteId: v.id("quotes"),
  imageId: v.id("images"), // Base image used
  userId: v.optional(v.id("users")), // Anonymous users = null

  // Cloudinary reference
  cloudinaryId: v.string(),
  url: v.string(), // CRITICAL: Full shareable URL
  shareCode: v.string(), // Short code: "a1b2c3d4" for URLs like /share/a1b2c3d4

  // Generation settings (for reproducibility)
  settings: v.optional(v.object({
    fontSize: v.number(),
    fontFamily: v.string(),
    textColor: v.string(),
    textPosition: v.string(), // "top", "center", "bottom"
    overlayOpacity: v.number(),
  })),

  // Analytics
  viewCount: v.number(),
  lastViewedAt: v.optional(v.number()),
  shareCount: v.number(), // Track explicit shares

  // Lifecycle management
  createdAt: v.number(),
  updatedAt: v.number(),
  expiresAt: v.number(), // createdAt + (30 days * 86400000)
  deletedAt: v.optional(v.number()), // Soft delete for grace period
  isPermanent: v.boolean(), // Paid users = true

  // Metadata
  ipAddress: v.optional(v.string()), // Rate limiting, abuse prevention
  userAgent: v.optional(v.string()), // Analytics
})
  .index("by_quote", ["quoteId"])
  .index("by_user", ["userId", "createdAt"]) // User's generation history
  .index("by_expiration", ["expiresAt", "deletedAt"]) // Cleanup job
  .index("by_share_code", ["shareCode"]) // Fast lookup for /share/:code URLs
  .index("by_deleted", ["deletedAt"]) // Find soft-deleted items
```

**Cleanup Cron Job Logic**:
```typescript
// convex/crons.ts
export const cleanupExpiredImages = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const gracePeriodDays = 7;
    const gracePeriodMs = gracePeriodDays * 24 * 60 * 60 * 1000;

    // Find expired non-permanent images
    const expired = await ctx.db
      .query("generatedImages")
      .withIndex("by_expiration", q =>
        q.lt("expiresAt", now).eq("isPermanent", false)
      )
      .filter(q => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Soft delete (mark for deletion, keep data for grace period)
    for (const image of expired) {
      await ctx.db.patch(image._id, {
        deletedAt: now,
        expiresAt: now + gracePeriodMs // Extend expiration for grace period
      });
    }

    // Hard delete after grace period
    const hardDeleteReady = await ctx.db
      .query("generatedImages")
      .withIndex("by_deleted")
      .filter(q => q.lt(q.field("deletedAt"), now - gracePeriodMs))
      .collect();

    for (const image of hardDeleteReady) {
      // Delete from Cloudinary via action
      await ctx.scheduler.runAfter(0, api.images.deleteFromCloudinary, {
        cloudinaryId: image.cloudinaryId
      });
      // Delete from database
      await ctx.db.delete(image._id);
    }
  }
});
```

**Rationale**:
- **url field**: Critical for sharing feature (social media, direct links)
- **shareCode**: Short, unique code for friendly URLs
  - `/share/a1b2c3d4` instead of `/share/k123456789abcdef`
  - Better for social media character limits
- **settings object**: Enables "regenerate with same settings" feature
  - User can reproduce exact image if they lose it
  - Useful for debugging generation issues
- **soft delete pattern**: Grace period before hard deletion
  - Users can recover accidentally expired images
  - Reduces support burden ("I lost my image!")
  - Cleanup job eventually hard-deletes after grace period
- **shareCount tracking**: Distinguish between views and explicit shares
  - Useful for understanding engagement patterns
- **ipAddress tracking**: Essential for abuse prevention
  - Rate limiting (max X generations per IP per day)
  - Prevent spam and storage abuse

---

### 5. Users Table

**Current Schema**:
```typescript
users: defineTable({
  // Managed by Convex Auth
  email: v.string(),
  name: v.optional(v.string()),
  emailVerified: v.boolean(),
})
  .index("by_email", ["email"])
```

#### Assessment: APPROVE (Managed by Convex Auth)

**Strengths**:
- ✅ Minimal schema (auth library handles complexity)
- ✅ Index on email for fast lookups
- ✅ Email verification tracking

**Considerations**:

**Note**: This table is primarily managed by Convex Auth. The schema shown is minimal because the auth library handles most fields internally.

**Recommended Additional Fields** (Optional for MVP):
```typescript
users: defineTable({
  // Managed by Convex Auth
  email: v.string(),
  name: v.optional(v.string()),
  emailVerified: v.boolean(),

  // Optional: Application-specific fields
  role: v.union(
    v.literal("user"),
    v.literal("admin"),
    v.literal("moderator")
  ), // Role-based access control

  isPremium: v.boolean(), // Paid tier flag
  premiumExpiresAt: v.optional(v.number()), // Subscription expiration

  // Quotas (for free tier rate limiting)
  dailyGenerationCount: v.number(),
  dailyGenerationResetAt: v.number(),

  // Metadata
  createdAt: v.number(),
  lastLoginAt: v.number(),
})
  .index("by_email", ["email"])
  .index("by_role", ["role"]) // Admin queries
```

**Rationale**:
- **role field**: Essential for admin features (Phase 2: quote moderation)
- **isPremium**: Enables paid tier features (permanent image storage)
- **dailyGenerationCount**: Rate limiting for free users
  - Example: 10 generations per day for free, unlimited for premium
  - Reset at midnight (dailyGenerationResetAt)
- **lastLoginAt**: User engagement tracking

**Note**: These fields can be added later. For MVP, Convex Auth's default schema is sufficient.

---

## Relationship Modeling Review

### Current Relationships

```
people (1) ----< (N) quotes
  ↓
  |
  └---(1) ----< (N) images
                 ↓
                 |
  quotes (1) ---< (N) generatedImages >--- (1) images
                       ↓
                       |
                 users (0..1)
```

### Assessment: STRONG DESIGN

**Strengths**:
- ✅ Clean one-to-many relationships
- ✅ Proper foreign key references using Convex `v.id("table")` pattern
- ✅ Many-to-many relationship modeled correctly (generatedImages joins quotes + images)
- ✅ Optional user relationship supports anonymous usage

**Issues Identified**:

1. **Circular Dependency** (people.defaultImageId ↔ images.personId)
   - **Problem**: Cannot create person without image, cannot create image without person
   - **Solution**: Remove `defaultImageId`, use query with `isPrimary` filter
   ```typescript
   // Get primary image for person
   const primaryImage = await ctx.db
     .query("images")
     .withIndex("by_person_primary", q =>
       q.eq("personId", personId).eq("isPrimary", true)
     )
     .first();
   ```

2. **Cascade Delete Strategy Unclear**
   - What happens when person is deleted?
     - Delete all quotes? (probably yes, quotes don't exist without person)
     - Delete all images? (maybe, depends on licensing and reusability)
     - Delete all generated images? (yes, if base image is deleted)
   - What happens when quote is deleted?
     - Delete all generated images? (maybe, or mark as orphaned)

**Recommended Cascade Rules**:
```typescript
// In people.ts mutation
async remove(ctx, { personId }) {
  // 1. Delete or orphan generated images
  const generatedImages = await ctx.db
    .query("generatedImages")
    .collect();
  const personGeneratedImages = generatedImages.filter(gi => {
    const quote = ctx.db.get(gi.quoteId);
    return quote?.personId === personId;
  });
  for (const gi of personGeneratedImages) {
    await ctx.db.delete(gi._id); // Or mark orphaned
  }

  // 2. Delete all quotes for person
  const quotes = await ctx.db
    .query("quotes")
    .withIndex("by_person", q => q.eq("personId", personId))
    .collect();
  for (const quote of quotes) {
    await ctx.db.delete(quote._id);
  }

  // 3. Delete all images for person
  const images = await ctx.db
    .query("images")
    .withIndex("by_person", q => q.eq("personId", personId))
    .collect();
  for (const image of images) {
    // Delete from Cloudinary first
    await ctx.scheduler.runAfter(0, api.images.deleteFromCloudinary, {
      cloudinaryId: image.cloudinaryId
    });
    await ctx.db.delete(image._id);
  }

  // 4. Finally delete person
  await ctx.db.delete(personId);
}
```

**Better Approach: Soft Delete Pattern**
```typescript
// Add to all tables
deletedAt: v.optional(v.number())
deletedBy: v.optional(v.id("users"))

// Soft delete instead of hard delete
async remove(ctx, { personId }) {
  await ctx.db.patch(personId, {
    deletedAt: Date.now(),
    deletedBy: ctx.auth.getUserIdentity()._id
  });
  // Cascade soft delete to related records
}

// All queries filter out soft-deleted records
async listPeople(ctx) {
  return await ctx.db
    .query("people")
    .filter(q => q.eq(q.field("deletedAt"), undefined))
    .collect();
}
```

---

## Index Strategy Review

### Current Indexes

**people**:
- ✅ `by_name` - Alphabetical listing, search

**quotes**:
- ✅ `by_person` - Person's quotes
- ✅ `search_text` - Full-text search (excellent!)

**images**:
- ✅ `by_person` - Person's images
- ✅ `by_person_primary` - Fast primary image lookup

**generatedImages**:
- ✅ `by_quote` - Quote usage tracking
- ✅ `by_expiration` - Cleanup cron job

### Assessment: GOOD COVERAGE, MISSING SOME INDEXES

**Strengths**:
- ✅ Core query patterns covered
- ✅ Excellent use of Convex search index (no external service needed)
- ✅ Composite indexes for filtered queries (by_person_primary)

**Missing Indexes**:

1. **quotes.by_verified** (Priority: High)
   ```typescript
   .index("by_verified", ["verified", "personId"])
   ```
   - **Why**: Most queries will filter by `verified=true`
   - **Query**: "Show me all verified quotes for this person"
   - **Without index**: Full table scan filtering verified field

2. **images.by_cloudinary_id** (Priority: Medium)
   ```typescript
   .index("by_cloudinary_id", ["cloudinaryId"])
   ```
   - **Why**: Webhook from Cloudinary might include cloudinaryId, need fast lookup
   - **Query**: "Find image record by Cloudinary ID for webhook processing"

3. **generatedImages.by_share_code** (Priority: High)
   ```typescript
   .index("by_share_code", ["shareCode"])
   ```
   - **Why**: Public sharing URLs need fast lookup
   - **Query**: "GET /share/:code → render image page"
   - **Without index**: Full table scan (terrible for user experience)

4. **generatedImages.by_user** (Priority: Medium)
   ```typescript
   .index("by_user", ["userId", "createdAt"])
   ```
   - **Why**: User dashboard showing generation history
   - **Query**: "Show me all images I've generated, sorted by date"

5. **people.by_slug** (Priority: High)
   ```typescript
   .index("by_slug", ["slug"])
   ```
   - **Why**: SEO-friendly URLs need fast lookup
   - **Query**: "GET /people/albert-einstein → render person page"

### Index Performance Estimation

| Query Pattern | Current Performance | With Recommended Index | Impact |
|---------------|---------------------|------------------------|--------|
| Get verified quotes for person | O(n) - scan all quotes | O(log n) - index seek | 100x faster |
| Share URL lookup (/share/abc123) | O(n) - full table scan | O(1) - index lookup | 1000x faster |
| Person page (/people/einstein) | O(n) - scan by name | O(1) - slug lookup | 1000x faster |
| User generation history | O(n) - scan + filter | O(log n) - index range | 50x faster |

**Recommendation**: Add all missing indexes before launch. Query performance degrades rapidly as data grows, and adding indexes later requires downtime.

---

## Data Type and Validation Analysis

### Type Safety: EXCELLENT

**Strengths**:
- ✅ Convex validators provide runtime type checking
- ✅ TypeScript types auto-generated from schema
- ✅ Union types for enums (license, category, role)
- ✅ Optional fields clearly marked

### Validator Pattern Assessment

**Current Patterns**:
```typescript
v.string()           // ✅ Good
v.number()           // ✅ Good
v.boolean()          // ✅ Good
v.optional(...)      // ✅ Good
v.id("tablename")    // ✅ Excellent (type-safe foreign keys)
v.union(...)         // ✅ Excellent (type-safe enums)
```

### Recommendations for Additional Validation

**1. String Length Constraints** (Priority: Medium)
```typescript
// Current: v.string() - no length limit
// Problem: Users could submit 10MB text as quote

// Recommended: Application-level validation
quotes: defineTable({
  text: v.string(), // Max 1000 chars, validated in mutation
  source: v.string(), // Max 500 chars
})

// In quotes.ts mutation
async create(ctx, { text, source }) {
  if (text.length > 1000) {
    throw new ConvexError("Quote text must be under 1000 characters");
  }
  if (source.length > 500) {
    throw new ConvexError("Source must be under 500 characters");
  }
  // Create quote...
}
```

**2. URL Format Validation** (Priority: Medium)
```typescript
// Current: v.optional(v.string()) for URLs
// Problem: No validation, could be "not a url"

// Recommended: Application-level validation
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// In mutation
if (sourceUrl && !isValidUrl(sourceUrl)) {
  throw new ConvexError("Invalid URL format");
}
```

**3. Date Format Validation** (Priority: Low)
```typescript
// Current: v.optional(v.string()) for dates
// Problem: Inconsistent formats

// Recommended: ISO 8601 validation
function isValidISODate(date: string): boolean {
  // "YYYY-MM-DD" or "YYYY"
  return /^\d{4}(-\d{2}-\d{2})?$/.test(date);
}

// In people.ts mutation
if (birthDate && !isValidISODate(birthDate)) {
  throw new ConvexError("Date must be YYYY-MM-DD or YYYY format");
}
```

**4. Email Format Validation** (Priority: Low - Convex Auth handles this)
```typescript
// Already handled by Convex Auth
// No additional validation needed
```

### Numeric Constraints

**Recommended Application-Level Checks**:
```typescript
// In images.ts mutation
async upload(ctx, { width, height, fileSize }) {
  // Image dimensions
  if (width < 100 || width > 10000) {
    throw new ConvexError("Image width must be 100-10000px");
  }
  if (height < 100 || height > 10000) {
    throw new ConvexError("Image height must be 100-10000px");
  }

  // File size (10MB max)
  if (fileSize && fileSize > 10 * 1024 * 1024) {
    throw new ConvexError("Image must be under 10MB");
  }

  // Aspect ratio sanity check
  const aspectRatio = width / height;
  if (aspectRatio < 0.1 || aspectRatio > 10) {
    throw new ConvexError("Invalid aspect ratio");
  }
}
```

---

## Convex-Specific Optimization Suggestions

### 1. Reactive Query Patterns (EXCELLENT)

**Current Design Strength**: Schema is perfectly suited for Convex's reactive queries.

**Example Usage**:
```typescript
// Frontend automatically re-renders when data changes
const quotes = useQuery(api.quotes.listByPerson, { personId });
const primaryImage = useQuery(api.images.getPrimary, { personId });

// When admin updates quote, all users see update in real-time
// No WebSocket code needed - Convex handles it
```

**Recommendation**: Leverage reactivity for admin features
- Live updates when new quotes are added
- Real-time moderation dashboard
- Usage analytics dashboard (viewCount updates)

### 2. Batch Operations (IMPORTANT)

**Problem**: Convex has transaction limits
- Max 100 operations per transaction
- Max 10 seconds per transaction

**Recommendation**: Use `ctx.scheduler` for large operations
```typescript
// Bad: Delete all quotes in one transaction (could timeout)
async deletePerson(ctx, { personId }) {
  const quotes = await ctx.db.query("quotes")...collect();
  for (const quote of quotes) {
    await ctx.db.delete(quote._id); // Could timeout if 1000+ quotes
  }
}

// Good: Schedule batch deletions
async deletePerson(ctx, { personId }) {
  await ctx.scheduler.runAfter(0, api.people.deleteQuotesBatch, {
    personId,
    batchSize: 50
  });
}

// In deleteQuotesBatch mutation
async deleteQuotesBatch(ctx, { personId, batchSize, cursor }) {
  const quotes = await ctx.db.query("quotes")
    .withIndex("by_person", q => q.eq("personId", personId))
    .paginate({ numItems: batchSize, cursor });

  for (const quote of quotes.page) {
    await ctx.db.delete(quote._id);
  }

  // Schedule next batch if more quotes exist
  if (quotes.isDone === false) {
    await ctx.scheduler.runAfter(0, api.people.deleteQuotesBatch, {
      personId,
      batchSize,
      cursor: quotes.continueCursor
    });
  }
}
```

### 3. Pagination (CRITICAL FOR SCALE)

**Current Schema**: No pagination fields

**Recommendation**: Use Convex's built-in pagination
```typescript
// In quotes.ts
export const listByPerson = query({
  args: {
    personId: v.id("people"),
    paginationOpts: paginationOptsValidator // Built-in Convex validator
  },
  handler: async (ctx, { personId, paginationOpts }) => {
    return await ctx.db
      .query("quotes")
      .withIndex("by_person", q => q.eq("personId", personId))
      .filter(q => q.eq(q.field("verified"), true))
      .order("desc") // Newest first
      .paginate(paginationOpts);
  }
});

// Frontend usage
const { results, status, loadMore } = usePaginatedQuery(
  api.quotes.listByPerson,
  { personId },
  { initialNumItems: 20 }
);
```

**Why**: Large result sets (1000+ quotes) cause performance issues without pagination.

### 4. Search Index Optimization (GOOD)

**Current Design**: Excellent use of search index
```typescript
.searchIndex("search_text", {
  searchField: "text",
  filterFields: ["verified", "personId"],
})
```

**Recommendation**: Add search indexes for other searchable fields
```typescript
// In people table
.searchIndex("search_name", {
  searchField: "name",
  filterFields: ["isVerified"],
})
```

**Usage**:
```typescript
export const searchPeople = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    return await ctx.db
      .query("people")
      .withSearchIndex("search_name", q => q.search("name", query))
      .filter(q => q.eq(q.field("isVerified"), true))
      .collect();
  }
});
```

### 5. Cron Jobs for Maintenance (REQUIRED)

**Recommendation**: Implement scheduled maintenance tasks
```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired images daily at 2 AM UTC
crons.daily(
  "cleanup expired images",
  { hourUTC: 2, minuteUTC: 0 },
  internal.images.cleanupExpired
);

// Reset daily generation counts at midnight UTC
crons.daily(
  "reset daily quotas",
  { hourUTC: 0, minuteUTC: 0 },
  internal.users.resetDailyQuotas
);

// Update usage statistics weekly
crons.weekly(
  "update analytics",
  { hourUTC: 3, minuteUTC: 0, dayOfWeek: "monday" },
  internal.analytics.updateWeeklyStats
);

export default crons;
```

### 6. File Storage (ALTERNATIVE TO CLOUDINARY)

**Current Design**: Cloudinary for all images

**Convex Alternative** (Not recommended for MVP, but worth noting):
```typescript
// Convex has built-in file storage
// Could store images directly in Convex instead of Cloudinary

// Pros: One less service, simpler architecture
// Cons: No text overlay transformations, manual optimization

// Recommendation: Keep Cloudinary for MVP
// Cloudinary transformations are core feature
// Convex storage better for user-uploaded documents/files
```

---

## Missing Tables Analysis

### 1. Users Table (ADDRESSED)
✅ Included in schema (managed by Convex Auth)

### 2. Favorites/Collections Table (OPTIONAL - Phase 2)

**Not needed for MVP**, but consider for future:
```typescript
favorites: defineTable({
  userId: v.id("users"),
  quoteId: v.id("quotes"),
  createdAt: v.number(),
})
  .index("by_user", ["userId", "createdAt"])
  .index("by_quote", ["quoteId"]) // Count favorites per quote

collections: defineTable({
  userId: v.id("users"),
  name: v.string(),
  description: v.optional(v.string()),
  isPublic: v.boolean(),
  createdAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_public", ["isPublic", "createdAt"])

collectionQuotes: defineTable({
  collectionId: v.id("collections"),
  quoteId: v.id("quotes"),
  order: v.number(), // Sort order within collection
  addedAt: v.number(),
})
  .index("by_collection", ["collectionId", "order"])
  .index("by_quote", ["quoteId"])
```

**Recommendation**: Defer to Phase 2. Not critical for MVP quote generation flow.

### 3. Admin Moderation Tables (OPTIONAL - Phase 2)

**Not needed for MVP** (manual quote curation), but consider for user-submitted content:
```typescript
moderationQueue: defineTable({
  entityType: v.union(v.literal("quote"), v.literal("person")),
  entityId: v.string(), // Could be pending record ID
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  ),
  submittedBy: v.id("users"),
  reviewedBy: v.optional(v.id("users")),
  reviewNotes: v.optional(v.string()),
  createdAt: v.number(),
  reviewedAt: v.optional(v.number()),
})
  .index("by_status", ["status", "createdAt"])
  .index("by_submitted_user", ["submittedBy"])
```

**Recommendation**: Defer to Phase 2 when user submissions are enabled.

### 4. Analytics Tables (OPTIONAL - Nice to Have)

**Not critical for MVP**, but useful for understanding usage:
```typescript
analyticsEvents: defineTable({
  eventType: v.union(
    v.literal("quote_view"),
    v.literal("quote_search"),
    v.literal("image_generate"),
    v.literal("image_share"),
    v.literal("person_view")
  ),
  entityId: v.optional(v.string()), // Quote/person/image ID
  userId: v.optional(v.id("users")), // Null for anonymous
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  metadata: v.optional(v.any()), // Flexible JSON for event-specific data
  createdAt: v.number(),
})
  .index("by_event_type", ["eventType", "createdAt"])
  .index("by_date", ["createdAt"]) // Time-series queries
```

**Recommendation**:
- **MVP**: Track basic counts (viewCount, usageCount) in main tables ✅
- **Phase 2**: Add dedicated analytics events table for deeper insights

---

## Data Integrity Recommendations

### 1. Unique Constraints (APPLICATION-LEVEL)

Convex doesn't enforce uniqueness at schema level. Implement in mutations:

**people.slug** (REQUIRED):
```typescript
async create(ctx, { name }) {
  const slug = generateSlug(name); // "albert-einstein"

  // Check for duplicate slug
  const existing = await ctx.db
    .query("people")
    .withIndex("by_slug", q => q.eq("slug", slug))
    .first();

  if (existing) {
    // Handle collision: append number
    let counter = 2;
    let uniqueSlug = slug;
    while (existing) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
      existing = await ctx.db
        .query("people")
        .withIndex("by_slug", q => q.eq("slug", uniqueSlug))
        .first();
    }
    slug = uniqueSlug;
  }

  await ctx.db.insert("people", { name, slug, ...rest });
}
```

**users.email** (HANDLED BY CONVEX AUTH):
✅ Convex Auth enforces email uniqueness

**generatedImages.shareCode** (REQUIRED):
```typescript
function generateShareCode(): string {
  // 8-character alphanumeric code
  return Math.random().toString(36).substring(2, 10);
}

async create(ctx, { ... }) {
  let shareCode = generateShareCode();

  // Ensure unique (collision probability: 1 in 2.8 trillion)
  while (await ctx.db.query("generatedImages")
    .withIndex("by_share_code", q => q.eq("shareCode", shareCode))
    .first()) {
    shareCode = generateShareCode();
  }

  await ctx.db.insert("generatedImages", { shareCode, ...rest });
}
```

### 2. Referential Integrity (CONVEX VALIDATES)

✅ **Convex automatically validates `v.id("table")` references**
- Cannot insert quote with invalid personId
- Runtime error if foreign key doesn't exist

**Additional Application Logic Needed**:
```typescript
// Prevent deletion of person with quotes
async remove(ctx, { personId }) {
  const quoteCount = await ctx.db
    .query("quotes")
    .withIndex("by_person", q => q.eq("personId", personId))
    .collect()
    .then(quotes => quotes.length);

  if (quoteCount > 0) {
    throw new ConvexError(
      `Cannot delete person with ${quoteCount} quotes. Delete quotes first.`
    );
  }

  // Or: cascade delete (delete quotes first)
}
```

### 3. Data Validation Checklist

**Before Insert**:
- ✅ Required fields present
- ✅ Field length constraints (text max 1000 chars)
- ✅ URL format validation
- ✅ Date format validation
- ✅ Numeric ranges (width > 0, height > 0)
- ✅ Enum values (license, category)
- ✅ Unique constraints (slug, email, shareCode)

**Before Update**:
- ✅ Record exists
- ✅ User has permission (ownership check)
- ✅ Immutable fields not changed (createdAt, createdBy)
- ✅ Timestamps updated (updatedAt = Date.now())

**Before Delete**:
- ✅ Record exists
- ✅ User has permission
- ✅ No dependent records (or cascade delete)
- ✅ Soft delete preferred over hard delete

---

## Migration Considerations

### Schema Evolution Strategy

**Convex Strength**: Schema changes are non-breaking by default
- New required fields → Must have default value or make optional initially
- Renamed fields → Keep old field, add new field, migrate data, remove old field
- Deleted fields → Data remains in database (harmless), just not accessed

**Recommended Migration Pattern**:

**Phase 1: Additive Changes** (Zero Downtime)
```typescript
// Original schema
images: defineTable({
  personId: v.id("people"),
  cloudinaryId: v.string(),
})

// Step 1: Add new field as optional
images: defineTable({
  personId: v.id("people"),
  cloudinaryId: v.string(),
  url: v.optional(v.string()), // NEW FIELD
})

// Step 2: Backfill existing records (one-time script)
export const backfillImageUrls = internalMutation({
  handler: async (ctx) => {
    const images = await ctx.db.query("images").collect();
    for (const image of images) {
      if (!image.url) {
        const url = `https://res.cloudinary.com/.../${image.cloudinaryId}`;
        await ctx.db.patch(image._id, { url });
      }
    }
  }
});

// Step 3: Make field required after backfill
images: defineTable({
  personId: v.id("people"),
  cloudinaryId: v.string(),
  url: v.string(), // NOW REQUIRED
})
```

**Phase 2: Breaking Changes** (Requires Planning)
```typescript
// Rename field: birthYear → birthDate

// Step 1: Add new field
people: defineTable({
  name: v.string(),
  birthYear: v.optional(v.string()), // OLD (keep temporarily)
  birthDate: v.optional(v.string()), // NEW
})

// Step 2: Update all mutations to write both fields
async create(ctx, { name, birthDate }) {
  const birthYear = birthDate ? birthDate.substring(0, 4) : undefined;
  await ctx.db.insert("people", { name, birthDate, birthYear });
}

// Step 3: Backfill birthDate from birthYear
export const migrateBirthYears = internalMutation({
  handler: async (ctx) => {
    const people = await ctx.db.query("people").collect();
    for (const person of people) {
      if (person.birthYear && !person.birthDate) {
        await ctx.db.patch(person._id, {
          birthDate: person.birthYear // Just year, no month/day
        });
      }
    }
  }
});

// Step 4: Remove old field
people: defineTable({
  name: v.string(),
  birthDate: v.optional(v.string()), // Only new field remains
})
```

### Initial Data Seeding

**Recommendation**: Create seed script for development
```typescript
// convex/seed.ts
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = internalMutation({
  handler: async (ctx) => {
    // Check if already seeded
    const personCount = await ctx.db.query("people").collect()
      .then(people => people.length);
    if (personCount > 0) {
      console.log("Database already seeded");
      return;
    }

    // Seed people
    const einstein = await ctx.db.insert("people", {
      name: "Albert Einstein",
      slug: "albert-einstein",
      bio: "Theoretical physicist who developed the theory of relativity",
      birthDate: "1879-03-14",
      deathDate: "1955-04-18",
      isVerified: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Seed images
    const einsteinImage = await ctx.db.insert("images", {
      personId: einstein,
      cloudinaryId: "einstein-portrait-1947",
      url: "https://res.cloudinary.com/.../einstein-portrait-1947.jpg",
      width: 800,
      height: 1000,
      aspectRatio: 0.8,
      category: "portrait",
      isPrimary: true,
      source: "Wikimedia Commons",
      license: "Public Domain",
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Seed quotes
    await ctx.db.insert("quotes", {
      personId: einstein,
      text: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.",
      source: "Interview in The Saturday Evening Post, 1929",
      sourceUrl: "https://example.com/source",
      verified: true,
      usageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("Database seeded successfully");
  }
});

// Run via Convex dashboard: npx convex run seed:seedDatabase
```

---

## Suggested Schema Changes - Complete Implementation

### Final Recommended Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================================================
  // PEOPLE TABLE
  // ============================================================================
  people: defineTable({
    // Core fields
    name: v.string(), // Full name
    slug: v.string(), // URL-friendly: "albert-einstein"
    bio: v.optional(v.string()), // Biography text

    // Dates (ISO 8601: "YYYY-MM-DD" or "YYYY" for year-only)
    birthDate: v.optional(v.string()),
    deathDate: v.optional(v.string()),

    // NOTE: Removed defaultImageId to avoid circular dependency
    // Use query: images.withIndex("by_person_primary", personId, isPrimary=true)

    // Data quality
    isVerified: v.boolean(), // Admin-approved record

    // Metadata
    createdAt: v.number(), // Unix timestamp
    updatedAt: v.number(),
    createdBy: v.optional(v.id("users")), // Admin who added
    deletedAt: v.optional(v.number()), // Soft delete
  })
    .index("by_name", ["name"])
    .index("by_slug", ["slug"]) // Unique lookup for SEO URLs
    .index("by_created", ["createdAt"]) // Recent additions
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["isVerified"],
    }),

  // ============================================================================
  // QUOTES TABLE
  // ============================================================================
  quotes: defineTable({
    // Core fields
    personId: v.id("people"),
    text: v.string(), // Quote text (max 1000 chars, validated in mutation)

    // Source attribution
    source: v.string(), // "Speech at Princeton, 1921"
    sourceUrl: v.optional(v.string()), // External URL
    sourceType: v.optional(v.union(
      v.literal("book"),
      v.literal("speech"),
      v.literal("interview"),
      v.literal("letter"),
      v.literal("article"),
      v.literal("unknown")
    )),

    // Data quality
    verified: v.boolean(),
    verifiedBy: v.optional(v.id("users")),
    verifiedAt: v.optional(v.number()),

    // Analytics
    usageCount: v.number(), // Times used in generated images
    lastUsedAt: v.optional(v.number()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.optional(v.id("users")),
    deletedAt: v.optional(v.number()),
  })
    .index("by_person", ["personId"])
    .index("by_verified", ["verified", "personId"]) // Fast verified queries
    .index("by_usage", ["usageCount"]) // Popular quotes
    .index("by_created", ["createdAt"]) // Recent additions
    .searchIndex("search_text", {
      searchField: "text",
      filterFields: ["verified", "personId"],
    }),

  // ============================================================================
  // IMAGES TABLE (Base person photos)
  // ============================================================================
  images: defineTable({
    // Core fields
    personId: v.id("people"),
    cloudinaryId: v.string(), // Cloudinary asset ID
    url: v.string(), // CRITICAL: Full Cloudinary URL

    // Image properties
    width: v.number(),
    height: v.number(),
    aspectRatio: v.number(), // Calculated: width/height
    fileSize: v.optional(v.number()), // Bytes
    format: v.optional(v.string()), // "jpg", "png", "webp"

    // Classification
    category: v.optional(v.union(
      v.literal("portrait"),
      v.literal("action"),
      v.literal("candid"),
      v.literal("historical"),
      v.literal("other")
    )),
    description: v.optional(v.string()),
    isPrimary: v.boolean(), // Default image for this person

    // Legal compliance (MVP-CRITICAL)
    source: v.string(), // "Wikimedia Commons"
    license: v.union(
      v.literal("Public Domain"),
      v.literal("CC0"),
      v.literal("CC BY 4.0"),
      v.literal("CC BY-SA 4.0"),
      v.literal("CC BY 3.0"),
      v.literal("CC BY-SA 3.0"),
      v.literal("Custom")
    ),
    attributionText: v.optional(v.string()), // Pre-formatted for UI
    licenseUrl: v.optional(v.string()), // Link to license terms

    // Analytics
    usageCount: v.number(),
    lastUsedAt: v.optional(v.number()),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    uploadedBy: v.optional(v.id("users")),
    deletedAt: v.optional(v.number()),
  })
    .index("by_person", ["personId"])
    .index("by_person_primary", ["personId", "isPrimary"]) // Fast primary lookup
    .index("by_person_category", ["personId", "category"]) // Filter by type
    .index("by_cloudinary_id", ["cloudinaryId"]) // Webhook lookup
    .index("by_usage", ["usageCount"]), // Popular images

  // ============================================================================
  // GENERATED IMAGES TABLE (User-created quote overlays)
  // ============================================================================
  generatedImages: defineTable({
    // Relationships
    quoteId: v.id("quotes"),
    imageId: v.id("images"), // Base image used
    userId: v.optional(v.id("users")), // Null for anonymous

    // Cloudinary reference
    cloudinaryId: v.string(),
    url: v.string(), // CRITICAL: Full shareable URL
    shareCode: v.string(), // Short code: "a1b2c3d4"

    // Generation settings (for reproducibility)
    settings: v.optional(v.object({
      fontSize: v.number(),
      fontFamily: v.string(),
      textColor: v.string(),
      textPosition: v.string(), // "top", "center", "bottom"
      overlayOpacity: v.number(),
    })),

    // Analytics
    viewCount: v.number(),
    lastViewedAt: v.optional(v.number()),
    shareCount: v.number(),

    // Lifecycle management
    createdAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.number(), // createdAt + 30 days (free tier)
    deletedAt: v.optional(v.number()), // Soft delete with grace period
    isPermanent: v.boolean(), // Paid users = true

    // Abuse prevention
    ipAddress: v.optional(v.string()), // Rate limiting
    userAgent: v.optional(v.string()), // Analytics
  })
    .index("by_quote", ["quoteId"])
    .index("by_image", ["imageId"])
    .index("by_user", ["userId", "createdAt"]) // User history
    .index("by_expiration", ["expiresAt", "deletedAt"]) // Cleanup cron
    .index("by_share_code", ["shareCode"]) // Fast public lookup
    .index("by_deleted", ["deletedAt"]) // Soft-deleted items
    .index("by_created", ["createdAt"]), // Recent generations

  // ============================================================================
  // USERS TABLE (Managed by Convex Auth)
  // ============================================================================
  users: defineTable({
    // Core fields (managed by Convex Auth)
    email: v.string(),
    name: v.optional(v.string()),
    emailVerified: v.boolean(),

    // Application-specific fields
    role: v.optional(v.union(
      v.literal("user"),
      v.literal("admin"),
      v.literal("moderator")
    )),

    // Premium tier
    isPremium: v.boolean(),
    premiumExpiresAt: v.optional(v.number()),

    // Rate limiting (free tier)
    dailyGenerationCount: v.number(),
    dailyGenerationResetAt: v.number(),

    // Metadata
    createdAt: v.number(),
    lastLoginAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
});
```

---

## Sample Convex Functions (Implementation Examples)

### people.ts - CRUD Operations
```typescript
// convex/people.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

export const list = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("people")
      .filter(q => q.eq(q.field("deletedAt"), undefined))
      .order("asc")
      .collect();
  }
});

export const get = query({
  args: { personId: v.id("people") },
  handler: async (ctx, { personId }) => {
    const person = await ctx.db.get(personId);
    if (!person || person.deletedAt) {
      return null;
    }
    return person;
  }
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("people")
      .withIndex("by_slug", q => q.eq("slug", slug))
      .filter(q => q.eq(q.field("deletedAt"), undefined))
      .first();
  }
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    return await ctx.db
      .query("people")
      .withSearchIndex("search_name", q => q.search("name", query))
      .filter(q =>
        q.and(
          q.eq(q.field("isVerified"), true),
          q.eq(q.field("deletedAt"), undefined)
        )
      )
      .take(20);
  }
});

// ============================================================================
// MUTATIONS
// ============================================================================

export const create = mutation({
  args: {
    name: v.string(),
    bio: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    deathDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate slug from name
    const slug = args.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/--+/g, '-'); // Remove duplicate hyphens

    // Check for duplicate slug
    let uniqueSlug = slug;
    let counter = 2;
    while (await ctx.db
      .query("people")
      .withIndex("by_slug", q => q.eq("slug", uniqueSlug))
      .first()
    ) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Validate dates if provided
    if (args.birthDate && !/^\d{4}(-\d{2}-\d{2})?$/.test(args.birthDate)) {
      throw new Error("birthDate must be YYYY or YYYY-MM-DD format");
    }
    if (args.deathDate && !/^\d{4}(-\d{2}-\d{2})?$/.test(args.deathDate)) {
      throw new Error("deathDate must be YYYY or YYYY-MM-DD format");
    }

    // Create person
    const now = Date.now();
    return await ctx.db.insert("people", {
      ...args,
      slug: uniqueSlug,
      isVerified: false, // Admin must verify
      createdAt: now,
      updatedAt: now,
    });
  }
});
```

### images.ts - Image Management
```typescript
// convex/images.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getPrimary = query({
  args: { personId: v.id("people") },
  handler: async (ctx, { personId }) => {
    return await ctx.db
      .query("images")
      .withIndex("by_person_primary", q =>
        q.eq("personId", personId).eq("isPrimary", true)
      )
      .filter(q => q.eq(q.field("deletedAt"), undefined))
      .first();
  }
});

export const listByPerson = query({
  args: { personId: v.id("people") },
  handler: async (ctx, { personId }) => {
    return await ctx.db
      .query("images")
      .withIndex("by_person", q => q.eq("personId", personId))
      .filter(q => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .collect();
  }
});

export const setPrimary = mutation({
  args: {
    imageId: v.id("images"),
    personId: v.id("people")
  },
  handler: async (ctx, { imageId, personId }) {
    // Remove primary flag from all images for this person
    const existingPrimary = await ctx.db
      .query("images")
      .withIndex("by_person_primary", q =>
        q.eq("personId", personId).eq("isPrimary", true)
      )
      .collect();

    for (const img of existingPrimary) {
      await ctx.db.patch(img._id, { isPrimary: false, updatedAt: Date.now() });
    }

    // Set new primary
    await ctx.db.patch(imageId, {
      isPrimary: true,
      updatedAt: Date.now()
    });
  }
});

export const create = mutation({
  args: {
    personId: v.id("people"),
    cloudinaryId: v.string(),
    url: v.string(),
    width: v.number(),
    height: v.number(),
    source: v.string(),
    license: v.union(
      v.literal("Public Domain"),
      v.literal("CC0"),
      v.literal("CC BY 4.0"),
      v.literal("CC BY-SA 4.0"),
      v.literal("CC BY 3.0"),
      v.literal("CC BY-SA 3.0"),
      v.literal("Custom")
    ),
    category: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate dimensions
    if (args.width < 100 || args.height < 100) {
      throw new Error("Image must be at least 100x100 pixels");
    }
    if (args.width > 10000 || args.height > 10000) {
      throw new Error("Image must be under 10000x10000 pixels");
    }

    // Calculate aspect ratio
    const aspectRatio = args.width / args.height;

    const now = Date.now();
    return await ctx.db.insert("images", {
      ...args,
      aspectRatio,
      isPrimary: args.isPrimary ?? false,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }
});
```

---

## Performance Benchmarks (Estimated)

### Query Performance (Expected)

| Query | Without Index | With Index | Records | Notes |
|-------|--------------|------------|---------|-------|
| Get person by slug | O(n) ~500ms | O(1) ~5ms | 10,000 | Critical for SEO URLs |
| List verified quotes for person | O(n) ~200ms | O(log n) ~10ms | 5,000 | Common query pattern |
| Search quotes by text | N/A | ~50ms | 50,000 | Convex full-text search |
| Get primary image | O(n) ~100ms | O(1) ~5ms | 1,000 | Every page load |
| Share URL lookup | O(n) ~300ms | O(1) ~5ms | 100,000 | Public sharing critical |

**Conclusion**: Recommended indexes provide 10-100x performance improvement for common queries.

### Write Performance (Expected)

| Operation | Time | Notes |
|-----------|------|-------|
| Insert quote | ~20ms | Single record write |
| Update quote usageCount | ~15ms | Atomic increment |
| Batch delete (50 quotes) | ~500ms | Within transaction limit |
| Batch delete (1000 quotes) | ~10s | Use scheduler for pagination |
| Soft delete person | ~10ms | Single field update |

**Conclusion**: Convex write performance is excellent for single records. Use scheduler for large batch operations.

---

## Risk Assessment and Mitigation

### High-Risk Areas

1. **Circular Dependency (people.defaultImageId)**
   - **Risk**: Cannot create person without image, cannot create image without person
   - **Mitigation**: ✅ REMOVE from schema, use query-based lookup
   - **Status**: CRITICAL - must fix before implementation

2. **Missing `url` Fields (images, generatedImages)**
   - **Risk**: Frontend must reconstruct URLs (error-prone, inconsistent)
   - **Mitigation**: ✅ ADD url field to both tables
   - **Status**: CRITICAL - blocking for MVP

3. **No Soft Delete Strategy**
   - **Risk**: Accidental deletions are permanent, data loss
   - **Mitigation**: ✅ ADD deletedAt field, filter in all queries
   - **Status**: HIGH - prevents production incidents

4. **Duplicate Quote Detection**
   - **Risk**: Same quote added multiple times for person
   - **Mitigation**: ✅ Application-level validation in create mutation
   - **Status**: MEDIUM - data quality issue

5. **Batch Operation Limits**
   - **Risk**: Large deletions timeout (>100 records, >10 seconds)
   - **Mitigation**: ✅ Use ctx.scheduler for paginated batch operations
   - **Status**: MEDIUM - impacts admin operations

### Medium-Risk Areas

1. **License Type Validation**
   - **Current**: String type allows typos ("CC BY 40" vs "CC BY 4.0")
   - **Mitigation**: ✅ Use union type for type-safe validation
   - **Status**: MEDIUM - legal compliance risk

2. **Primary Image Constraint**
   - **Risk**: Multiple images marked isPrimary=true for same person
   - **Mitigation**: ✅ Application-level enforcement in setPrimary mutation
   - **Status**: LOW - UI inconsistency, not data corruption

3. **Missing Timestamps**
   - **Risk**: Cannot track data lifecycle (when created, updated)
   - **Mitigation**: ✅ ADD createdAt, updatedAt to all tables
   - **Status**: LOW - operational visibility issue

### Low-Risk Areas

1. **Date Format Inconsistency**
   - **Risk**: Birthdate stored as "1950" vs "1950-01-01" vs "January 1, 1950"
   - **Mitigation**: ✅ Document format, validate in mutation
   - **Status**: LOW - display issue, not functional

2. **Missing Analytics Fields**
   - **Risk**: Cannot track popular quotes, trending images
   - **Mitigation**: ✅ ADD usageCount, lastUsedAt fields
   - **Status**: LOW - nice-to-have for Phase 2

---

## Final Recommendations Priority List

### CRITICAL (Must Fix Before Implementation)
1. ✅ **Remove people.defaultImageId** → Use query-based lookup
2. ✅ **Add images.url field** → Store full Cloudinary URL
3. ✅ **Add generatedImages.url field** → Store shareable URL
4. ✅ **Add all missing indexes** → Performance critical

### HIGH PRIORITY (Fix in MVP Sprint 1)
5. ✅ **Add deletedAt fields** → Soft delete pattern
6. ✅ **Add timestamps (createdAt, updatedAt)** → All tables
7. ✅ **Add generatedImages.shareCode** → Short shareable URLs
8. ✅ **Change license to union type** → Type-safe validation
9. ✅ **Add slug field to people** → SEO-friendly URLs

### MEDIUM PRIORITY (MVP Sprint 2 or Post-MVP)
10. ✅ **Add duplicate quote validation** → Application-level check
11. ✅ **Add usage tracking fields** → usageCount, lastUsedAt
12. ✅ **Add verification metadata** → verifiedBy, verifiedAt
13. ✅ **Add batch operation scheduler** → Handle large deletions
14. ✅ **Add category union types** → Type-safe enums

### LOW PRIORITY (Post-MVP / Phase 2)
15. ⚠️ **Add favorites table** → User collections (Phase 2)
16. ⚠️ **Add moderation queue** → User-submitted content (Phase 2)
17. ⚠️ **Add analytics events** → Detailed usage tracking (Phase 2)
18. ⚠️ **Add generation settings** → Reproducibility (nice-to-have)

---

## Conclusion

The proposed Convex schema is **well-designed and appropriate for the MVP**, with strong foundational architecture that correctly models the core domain. The schema demonstrates excellent use of Convex-specific features (reactive queries, search indexes, type-safe validators) and includes critical legal compliance fields (image licensing).

**Key Strengths**:
- Clean relational design despite document database
- Type-safe schema with Convex validators
- Legal compliance built in (licensing, attribution)
- Appropriate indexes for common query patterns
- Scalable architecture for <10k users

**Critical Issues to Address**:
1. Circular dependency in people table (defaultImageId)
2. Missing `url` fields in images and generatedImages tables
3. Inconsistent timestamp handling across tables
4. No soft delete strategy for data integrity

**Recommendation**: **APPROVE WITH CHANGES**

Implement the CRITICAL and HIGH PRIORITY changes from the recommendations list before proceeding with development. These changes are straightforward and will prevent technical debt, refactoring, and production incidents. The schema will then be production-ready for MVP launch.

**Estimated Implementation Time**:
- Critical fixes: 2-3 hours
- High priority additions: 4-6 hours
- Total: 1 day of schema refinement before implementation

**Confidence Level**: 95% - This schema will successfully support the MVP and scale to 10k users with the recommended changes implemented.

---

## Next Steps

1. ✅ **Review this document** with project stakeholder
2. ✅ **Implement critical schema changes** (remove defaultImageId, add url fields)
3. ✅ **Add recommended indexes** (by_verified, by_share_code, by_slug)
4. ✅ **Update TASK-002 acceptance criteria** with refined schema
5. ✅ **Implement schema in convex/schema.ts** with all changes
6. ✅ **Create seed script** for development data
7. ✅ **Write basic CRUD functions** (people.ts, quotes.ts, images.ts)
8. ✅ **Test schema deployment** with `npx convex dev`
9. ✅ **Validate TypeScript types** are properly generated
10. ✅ **Document schema decisions** in ADR if needed

---

**Document Version**: 1.0
**Review Date**: 2025-10-30
**Next Review**: After MVP implementation (3-6 months)
**Reviewer**: Database Architecture and Performance Specialist
