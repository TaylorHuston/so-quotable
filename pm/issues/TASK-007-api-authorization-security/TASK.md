---
issue_number: TASK-007
type: task
spec: SPEC-001
status: todo
created: 2025-11-26
jira_issue_key: null
---

# TASK-007: Add API Authorization and Security Hardening

## Summary

Address security vulnerabilities identified in the security audit (score: 85/100). Add authorization checks to all CRUD mutations and remove/secure exposed debug functions.

## Background

A security-focused quality assessment identified two HIGH severity issues:

**HIGH-001: Missing Authorization on Mutations**
- `convex/quotes.ts`: create, update, delete mutations lack auth checks
- `convex/people.ts`: create, update, delete mutations lack auth checks
- `convex/images.ts`: create, update, delete mutations lack auth checks
- `convex/generatedImages.ts`: create, update, delete mutations lack auth checks

**HIGH-002: Debug Functions Publicly Accessible**
- `convex/debugUsers.ts`: exposes user data without authorization
- `convex/cleanupTestUsers.ts`: allows test user deletion without authorization

## Requirements

### Authorization on Mutations

1. All create/update/delete mutations must require authentication
2. Use `getAuthUserId(ctx)` from Convex Auth to verify user identity
3. Throw appropriate error when user is not authenticated
4. Consider ownership checks for update/delete operations (user can only modify their own data)

### Debug Function Security

1. Remove debug functions from production builds, OR
2. Mark debug functions as internal (only callable from other Convex functions), OR
3. Add strict authorization (admin-only access)

**Recommended approach**: Mark as `internalMutation`/`internalQuery` to prevent public access

### Pattern to Implement

```typescript
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }
    // ... rest of implementation
  },
});
```

## Acceptance Criteria

- [ ] All mutations in quotes.ts require authentication
- [ ] All mutations in people.ts require authentication
- [ ] All mutations in images.ts require authentication
- [ ] All mutations in generatedImages.ts require authentication
- [ ] debugUsers.ts functions are internal or removed
- [ ] cleanupTestUsers.ts functions are internal or removed
- [ ] Existing tests updated to pass authentication context
- [ ] New tests added for unauthorized access scenarios
- [ ] Security audit re-run shows improved score (target: 95+)

## Technical Notes

- Convex Auth provides `getAuthUserId(ctx)` for authentication checks
- `internalMutation` and `internalQuery` decorators prevent public API access
- Test helpers may need updates to simulate authenticated contexts
- Consider adding ownership validation (users can only edit their own quotes/images)

## Out of Scope

- Role-based access control (RBAC) - MVP uses simple authenticated/unauthenticated model
- Admin panel for user management
- Audit logging of mutations

## Dependencies

- TASK-004 (Convex Auth) - completed, provides authentication infrastructure
- Security audit findings from 2025-11-26
