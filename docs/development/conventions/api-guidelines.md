---
# === Metadata ===
template_type: "guideline"
version: "1.0.0"
created: "2025-10-30"
last_updated: "2025-10-31"
status: "Active"
target_audience: ["AI Assistants", "API Designers", "Backend Developers"]
description: "API design patterns, structure, and conventions for Convex function-based API"

# === API Configuration (Machine-readable for AI agents) ===
api_pattern: "Convex Functions"  # Convex function-based API
api_location: "convex/"          # Convex backend functions
authentication: "Convex Auth"    # Convex Auth (email/password + OAuth)
versioning: "none"               # No versioning for MVP
error_format: "throw Error"      # Standard JavaScript errors
documentation: "TypeScript"      # TypeScript types + comments
---

# API Guidelines

**Referenced by Commands:** `/implement`, backend-specialist agent

## Quick Reference

This guideline defines our API design patterns, structure, and conventions. So Quotable uses Convex's function-based API instead of traditional REST endpoints.

See [ADR-001: Initial Tech Stack](../../project/adrs/ADR-001-initial-tech-stack.md) for rationale on choosing Convex's function-based API over traditional REST.

## Convex Function-Based API

So Quotable uses Convex's function-based API instead of traditional REST endpoints. The API consists of TypeScript functions that are automatically exposed to the frontend.

### Function Types

- **Queries**: Read-only operations (automatically cached, reactive)
- **Mutations**: Write operations (transactional, atomic)
- **Actions**: External API calls (non-transactional, can call third-party services)

### Function Naming

Use descriptive, action-oriented names:

```typescript
// Queries (convex/quotes.ts)
export const list = query(...)           // List all quotes
export const get = query(...)            // Get single quote by ID
export const search = query(...)         // Full-text search
export const getByPerson = query(...)    // Get quotes by person

// Mutations (convex/quotes.ts)
export const create = mutation(...)      // Create new quote
export const update = mutation(...)      // Update existing quote
export const remove = mutation(...)      // Delete quote

// Actions (convex/images.ts)
export const generateQuoteImage = action(...)  // Generate image via Cloudinary
```

### File Structure

- **Location**: `convex/` directory
- **Naming Convention**: Resource-based files (quotes.ts, people.ts, images.ts)
- **Organization**: By domain entity

### Frontend Usage

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Query (reactive - auto-updates on data changes)
const quotes = useQuery(api.quotes.list, { verified: true });

// Mutation
const createQuote = useMutation(api.quotes.create);
await createQuote({ text: "...", personId: "..." });
```

### Input Validation

Use Convex validators for type-safe inputs:

```typescript
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const create = mutation({
  args: {
    text: v.string(),
    personId: v.id("people"),
    source: v.string(),
    sourceUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validation
    if (args.text.length < 10) {
      throw new Error("Quote text must be at least 10 characters");
    }

    // Business logic
    return await ctx.db.insert("quotes", {
      ...args,
      verified: false,
      createdAt: Date.now(),
    });
  },
});
```

### Error Handling

Throw descriptive errors:

```typescript
// Good: Clear, actionable error
throw new Error("Quote not found");

// Better: Include context
throw new Error(`Quote ${quoteId} not found`);

// Best: Structured error handling
if (!quote) {
  throw new Error(
    JSON.stringify({
      code: "QUOTE_NOT_FOUND",
      message: "Quote not found",
      quoteId,
    })
  );
}
```

Frontend error handling:

```typescript
try {
  await createQuote({ text: "..." });
} catch (error) {
  console.error("Failed to create quote:", error);
  // Show user-friendly error message
}
```

### Authentication

Use Convex Auth to protect functions:

```typescript
import { mutation } from "./_generated/server";

export const create = mutation({
  args: {
    /* ... */
  },
  handler: async (ctx, args) => {
    // Require authentication
    const user = await ctx.auth.getUserIdentity();
    if (!user) {
      throw new Error("Authentication required");
    }

    // Business logic with user context
    return await ctx.db.insert("quotes", {
      ...args,
      userId: user.subject,
      createdAt: Date.now(),
    });
  },
});
```

### Pagination

Use cursor-based pagination for large datasets:

```typescript
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quotes")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

### Performance

- **Indexes**: Create indexes for commonly queried fields
- **Selective Fetching**: Only fetch needed fields
- **Caching**: Queries are automatically cached and reactive
- **Batch Operations**: Use Promise.all for parallel operations

```typescript
// Create indexes in schema.ts
quotes: defineTable({...})
  .index("by_person", ["personId"])
  .searchIndex("search_text", {
    searchField: "text",
    filterFields: ["verified"],
  })
```

## Legacy REST Reference

The following REST principles may be useful for external API integrations (e.g., Cloudinary), but the primary So Quotable API uses Convex functions.

### RESTful Design Principles (External APIs Only)

### Resource Naming

- Use nouns, not verbs
- Use plural names for collections
- Use lowercase with hyphens
- Be consistent

```
✓ Good:
  GET /quotes
  GET /quotes/123
  POST /quotes
  PUT /quotes/123
  DELETE /quotes/123

✗ Bad:
  GET /getQuotes
  POST /createQuote
  GET /quote/123 (inconsistent plural/singular)
```

### HTTP Methods

- **GET**: Retrieve resources (safe, idempotent)
- **POST**: Create new resources
- **PUT**: Update entire resource (idempotent)
- **PATCH**: Partial update
- **DELETE**: Remove resource (idempotent)

### Status Codes

Use appropriate HTTP status codes:

**Success:**

- 200 OK: Successful GET, PUT, PATCH
- 201 Created: Successful POST
- 204 No Content: Successful DELETE

**Client Errors:**

- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource doesn't exist
- 409 Conflict: Resource conflict
- 422 Unprocessable Entity: Validation errors

**Server Errors:**

- 500 Internal Server Error: General server error
- 503 Service Unavailable: Temporary unavailability

## Examples

This section documents real API implementations for consistency.

### Endpoint Example
- TBD - Add link to first Convex function

### Authentication Example
- TBD - Add link to auth implementation

### Error Handling Example
- TBD - Add link to error handler

## General API Knowledge

For API design best practices, Claude has extensive knowledge of:
- REST principles (resources, verbs, status codes)
- GraphQL schema design and query optimization
- API security (authentication, authorization, rate limiting)
- Versioning strategies and backward compatibility
- Documentation standards (OpenAPI, AsyncAPI)
- Convex function patterns and best practices

Ask questions like "What's the best way to design [X] function?" and Claude will provide guidance based on industry standards and Convex patterns.

---

_Update this document as your API evolves._
