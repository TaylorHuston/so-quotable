---
id: TASK-002
title: Set up Convex backend and database schema
epic: EPIC-001
status: done
created: 2025-10-30
updated: 2025-10-30
---

# TASK-002: Set up Convex backend and database schema

## Description

Initialize Convex backend, deploy to development environment, and implement the database schema for people, quotes, images, and generated images as defined in ADR-001. Set up the foundational serverless functions (queries, mutations) for each entity.

## Acceptance Criteria

- [ ] Convex installed and configured in the Next.js project
- [ ] Convex development environment deployed and accessible
- [ ] Database schema implemented in convex/schema.ts with full TypeScript types
- [ ] People table with fields: name, slug, bio, birthDate, deathDate, createdAt, updatedAt
- [ ] Quotes table with fields: personId, text, source, sourceUrl, verified, createdAt, updatedAt
- [ ] Images table with fields: personId, cloudinaryId, url, isPrimary, width, height, source, license (union type), createdAt
- [ ] GeneratedImages table with fields: quoteId, imageId, cloudinaryId, url, createdAt, expiresAt
- [ ] Indexes created for efficient queries (by_name, by_slug, by_person, by_person_primary, search_text)
- [ ] Basic CRUD functions for each entity (queries and mutations)
- [ ] Type-safe API generated and accessible from frontend
- [ ] Development database seeded with sample data

## Technical Notes

- Install `convex` and `convex-react` packages
- Initialize with `npx convex dev` to create development deployment
- Define schema using Convex validators (v.string(), v.id(), v.boolean(), etc.)
- Create search indexes for full-text search on quotes
- Implement proper TypeScript types using Id<"tablename"> pattern
- Follow Convex naming conventions (camelCase for functions)
- Set up convex/ directory structure:
  - schema.ts - Database schema
  - quotes.ts - Quote-related functions
  - people.ts - Person-related functions
  - images.ts - Image-related functions
  - \_generated/ - Auto-generated types (gitignored)
- Schema design decisions (from database specialist review):
  - **People table**: REMOVED defaultImageId (circular dependency) - use query with isPrimary instead
  - **People table**: Added slug field for SEO-friendly URLs (e.g., "albert-einstein")
  - **All tables**: Added createdAt/updatedAt timestamps for audit trail
  - **Images table**: Use union type for license (type-safe enum):
    ```typescript
    license: v.union(
      v.literal("Public Domain"),
      v.literal("CC0"),
      v.literal("CC BY 4.0"),
      v.literal("CC BY-SA 4.0"),
      v.literal("CC BY 3.0"),
      v.literal("CC BY-SA 3.0")
    );
    ```
  - **Images table**: width, height (number) - Required for responsive image generation
  - **Images table**: source (string) - Attribution source (e.g., "Wikimedia Commons")
  - **Indexes**: Add by_person_primary index for finding primary images
  - **Primary image lookup**: Query instead of stored reference:
    ```typescript
    db.query("images")
      .withIndex("by_person_primary", (q) =>
        q.eq("personId", personId).eq("isPrimary", true)
      )
      .first();
    ```

## Dependencies

- TASK-001: Next.js project must be initialized
- Convex account created
- Environment variables configured (CONVEX_DEPLOYMENT, NEXT_PUBLIC_CONVEX_URL)

## Testing

- Verify schema deploys without errors using `npx convex dev`
- Test CRUD operations through Convex dashboard
- Confirm TypeScript types are properly generated
- Verify queries work from React components using useQuery hook
- Test mutations work using useMutation hook
- Ensure search indexes return expected results
- Create health.ts with ping query for health check endpoint (from TASK-001):

  ```typescript
  // convex/health.ts
  import { query } from "./_generated/server";

  export const ping = query({
    handler: async () => {
      return { status: "ok", timestamp: Date.now() };
    },
  });
  ```
