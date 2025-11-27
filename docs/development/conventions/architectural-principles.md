---
last_updated: "2025-11-25"
description: "Design philosophy, architectural patterns, and decision-making principles for So Quotable"

# === Architecture Configuration ===
architecture_style: "serverless"    # Serverless with Convex + Next.js
design_principles: ["DRY", "KISS", "YAGNI", "SOLID"]
layer_separation: "loose"           # Feature-based organization, loose coupling
dependency_direction: "inward"      # Dependencies point inward (clean architecture)
state_management: "Convex"          # Convex reactive queries
database_access: "Convex ORM"       # Convex database API
---

# Architectural Principles

**Referenced by Commands:** `/adr`, code-architect agent

## Quick Reference

This guideline defines our design philosophy, architectural patterns, and decision-making principles for So Quotable. Updated with project-specific decisions from ADRs.

## Core Design Principles

These principles guide all architectural and code decisions:

### 1. Separation of Concerns

- Divide the application into distinct layers
- Each component has a single, well-defined responsibility
- Minimize coupling between components
- Maximize cohesion within components

**So Quotable Implementation:**

- Presentation layer (Next.js UI components in `src/`)
- Business logic layer (Convex functions in `convex/`)
- Data access layer (Convex database schema and queries)

### 2. DRY (Don't Repeat Yourself)
- **Goal**: Single source of truth for every piece of knowledge
- Avoid code duplication
- Abstract common patterns

### 3. KISS (Keep It Simple, Stupid)
- **Goal**: Simplest solution that works
- Avoid over-engineering
- Clear, readable code over clever code

### 4. YAGNI (You Aren't Gonna Need It)
- **Goal**: Don't build features before they're needed
- Focus on MVP requirements
- Add complexity only when necessary

### 5. SOLID Principles
- **Single Responsibility**: One reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable
- **Interface Segregation**: Many specific interfaces over one general
- **Dependency Inversion**: Depend on abstractions, not concretions

## Architecture Style

**Pattern**: Serverless (Next.js + Convex)

See [ADR-001: Initial Tech Stack](../../project/adrs/ADR-001-initial-tech-stack.md) for detailed rationale.

### Current Choice
- **Style**: Serverless architecture
- **Frontend**: Next.js (App Router) on Vercel
- **Backend**: Convex (serverless functions + reactive database)
- **Images**: Cloudinary (storage + transformations)
- **Rationale**:
  - Zero infrastructure management
  - Scales automatically
  - Built-in real-time capabilities
  - Fast development velocity for MVP
  - Cost-effective for early stage

## System Structure

### Layer Organization

```
So Quotable Architecture:

Frontend (Next.js - src/)
├── app/                    # Next.js App Router pages
├── components/             # React UI components
└── lib/                    # Client utilities

Backend (Convex - convex/)
├── schema.ts              # Database schema definition
├── quotes.ts              # Quote queries/mutations
├── people.ts              # Person queries/mutations
└── images.ts              # Image generation actions

External Services
└── Cloudinary             # Image storage and transformations
```

### Dependency Rules

- **Direction**: Dependencies point inward (UI depends on backend, backend doesn't know about UI)
- **Boundary**: Clear separation between Next.js and Convex code
- **Violations**: None - enforced by project structure

## Modularity

- Build independent, reusable modules
- Each module should be replaceable
- Clear interfaces between modules
- Avoid tight coupling

**So Quotable Implementation:**
- Convex functions are independent, testable modules
- React components are isolated and reusable
- Cloudinary integration is abstracted in Convex actions

## Data Management

### Database Strategy

See [ADR-001](../../project/adrs/ADR-001-initial-tech-stack.md) for database decision.

- **Type**: Convex (document database with relational capabilities)
- **Access Pattern**: Convex database API (type-safe, reactive)
- **Migration**: Convex schema versioning
- **Indexes**: Defined in schema.ts for query performance

### Database Design

- Normalize appropriately (usually 3NF)
- Denormalize for performance when needed (Convex supports both)
- Use indexes wisely
- Plan for data growth
- Automatic backups via Convex

### Data Integrity

- Enforce constraints at schema level (Convex validators)
- Use transactions appropriately (Convex mutations are atomic)
- Validate data before persistence
- Handle concurrent access (Convex handles automatically)

### State Management

- **Client State**: React useState/useReducer for local UI state
- **Server State**: Convex reactive queries (automatic updates)
- **No Redux/Zustand needed**: Convex handles data synchronization

## Quality Attributes

### Priorities

Ranked for So Quotable MVP:

1. **Maintainability**: High priority - Code clarity and testability
2. **Security**: High priority - User data protection, verified quotes
3. **Performance**: Medium priority - Good enough for MVP, optimize later
4. **Scalability**: Medium priority - Convex scales automatically
5. **Reliability**: High priority - Quote verification accuracy
6. **Usability**: High priority - Simple, intuitive quote creation

### Trade-offs

- **Chose Convex over traditional backend**: Traded flexibility for development speed and built-in real-time
- **Serverless over containers**: Traded control for simplicity and auto-scaling
- **MVP scope**: Traded features for faster time to market

## Scalability

Design for growth:

- Horizontal scaling capability (Convex auto-scales)
- Efficient resource usage
- Caching strategies (Convex queries auto-cache)
- Database optimization (indexes in schema.ts)
- Load balancing ready (handled by Vercel + Convex)

## Security First

- Security is not an afterthought
- Validate all inputs (Convex validators)
- Sanitize all outputs
- Principle of least privilege
- Defense in depth
- Secure by default

See [Security Guidelines](./security-guidelines.md) for detailed security practices.

## Performance

- Optimize critical paths
- Lazy loading where appropriate (Next.js dynamic imports)
- Efficient database queries (Convex indexes)
- Minimize network requests (Convex batches automatically)
- Monitor and measure performance (Vercel Analytics for MVP)

## Reliability

- Graceful error handling (try/catch in Convex functions)
- Proper logging and monitoring (Convex logs, Vercel Analytics)
- Automated testing (Vitest, convex-test, Playwright)
- Backup and recovery plans (Convex automatic backups)
- Failover mechanisms (Convex high availability)

## Testing Strategy

See [ADR-002: Testing Framework](../../project/adrs/ADR-002-testing-framework.md) for testing framework rationale.

### Testing Pyramid (Backend-First)

```
     /\
    /E2E\          10%: Playwright - Critical flows
   /------\
  /Frontend\       30%: Vitest + Testing Library - Key components
 /----------\
/  Backend   \     60%: Vitest + convex-test - Business logic
--------------
```

**Rationale**: Backend-first because core business logic lives in Convex functions.

**Framework**: Vitest (unit/integration), convex-test (Convex functions), Playwright (E2E)

**Coverage Goals**: 80%+ backend, 70%+ frontend

- Emphasize backend testing (business logic)
- Strategic component tests (user-facing behavior)
- Minimal but critical E2E tests (complete flows)
- Test coverage as a guide, not a goal

## Error Handling Strategy

- Fail fast, fail loudly
- Provide meaningful error messages
- Log errors with context (Convex logging)
- Don't expose sensitive information
- Implement retry logic where appropriate (Convex automatic retries)

## Deployment

See [ADR-003: Deployment Strategy](../../project/adrs/ADR-003-environment-and-deployment-strategy.md) for deployment decisions.

- **CI/CD**: GitHub Actions (basic MVP pipeline)
- **Environments**: Development (preview) and Production
- **Frontend**: Vercel (automatic deployment from git)
- **Backend**: Convex (automatic deployment on push)
- **Rollback**: Git revert + redeploy
- **Monitoring**: Vercel Analytics (MVP), health check endpoint

## Decision-Making Framework

### When to Create an ADR

Run `/adr` and create an ADR for:
- Technology choices (framework, database, language)
- Architectural patterns (microservices, event-driven, etc.)
- System boundaries and integration patterns
- Performance/scalability trade-offs
- Security model decisions

### Architecture Review Triggers

Review architecture when:
- **Scale Changes**: 10x traffic/data/users
- **New Domain**: Adding significant new capability
- **Performance Issues**: Current architecture can't meet needs
- **Team Growth**: Architecture doesn't support team structure

## Design Patterns

### Preferred Patterns

**Repository Pattern** (Convex queries/mutations)
- Abstract data access logic in Convex functions
- Easier testing with convex-test
- Centralized data queries

**Service Layer** (Convex functions)
- Encapsulate business logic in Convex functions
- Reusable across different interfaces
- Easier to test

**Factory Pattern**
- Object creation abstraction
- Centralized object instantiation (e.g., image generation)
- Flexibility in object creation

### Anti-Patterns to Avoid

- **God objects**: Objects that know/do too much
- **Spaghetti code**: Tangled dependencies
- **Magic numbers/strings**: Unexplained constants
- **Copy-paste programming**: Duplicating code instead of abstracting
- **Premature optimization**: Optimizing before measuring
- **Not invented here**: Rejecting external solutions without reason

## Documentation

### Code Documentation

- Self-documenting code preferred
- Comments explain "why", not "what"
- Keep documentation close to code
- Document public APIs thoroughly (TypeScript types in Convex)

### System Documentation

- Architecture diagrams (docs/project/architecture-overview.md)
- Component relationships
- Data flow diagrams
- Deployment architecture (ADR-003)
- ADRs for major decisions (docs/project/adrs/)

## Continuous Improvement

- Regular architecture reviews
- Refactor proactively
- Address technical debt
- Learn from incidents
- Update documentation

## Examples

### Good Architecture Decision
- [ADR-001: Initial Tech Stack](../../project/adrs/ADR-001-initial-tech-stack.md) - Clear rationale, alternatives considered

### Well-Structured Module
- TBD - Add link to exemplary Convex function

### Dependency Management
- TBD - Example of proper dependency direction

## General Architecture Knowledge

For architectural patterns and principles, Claude has extensive knowledge of:
- Architecture styles (monolith, microservices, event-driven, serverless)
- Design patterns (GoF patterns, enterprise patterns)
- SOLID, DRY, KISS, YAGNI principles
- Clean Architecture, Hexagonal Architecture, Onion Architecture
- Domain-Driven Design (DDD)
- System design and scalability patterns

Ask questions like "How should I architect [X]?" and Claude will provide guidance based on established architectural principles and patterns.

---

_Review and update these principles regularly as the project evolves._
