# Architecture Decision Records (ADRs)

## What are ADRs?

Architecture Decision Records (ADRs) are documents that capture important architectural decisions made along with their context and consequences.

## Why use ADRs?

- **Document important decisions**: Capture the reasoning behind key architectural choices
- **Provide context**: Help future developers understand why decisions were made
- **Track evolution**: See how the architecture has evolved over time
- **Enable onboarding**: Help new team members understand the system
- **Prevent reverting decisions**: Avoid revisiting settled decisions without context

## When to create an ADR?

Create an ADR for decisions that:

- Have significant impact on the system architecture
- Are difficult or expensive to reverse
- Affect multiple parts of the system
- Set precedents for future decisions
- Involve trade-offs between alternatives
- Need stakeholder alignment

## ADR Format

Each ADR should follow a consistent format. See `adr-template.md` for the template.

### Sections

1. **Title**: Short, descriptive name
2. **Status**: Proposed, Accepted, Deprecated, Superseded
3. **Context**: What is the issue we're trying to solve?
4. **Decision**: What is the change that we're proposing/doing?
5. **Consequences**: What becomes easier or more difficult because of this change?
6. **Alternatives Considered**: What other options did we evaluate?

## ADR Naming Convention

```
adr-NNN-short-title.md
```

Where NNN is a sequential number (001, 002, etc.).

Examples:
- `adr-001-database-selection.md`
- `adr-002-authentication-strategy.md`
- `adr-003-frontend-framework.md`

## Creating a New ADR

1. Copy the template:
   ```bash
   cp docs/project/adrs/adr-template.md docs/project/adrs/adr-001-your-decision.md
   ```

2. Fill in the sections

3. Submit for review (via PR if team project)

4. Update status as decision evolves

## ADR Lifecycle

- **Proposed**: Decision is being considered
- **Accepted**: Decision has been made and is active
- **Deprecated**: Decision is no longer recommended but may still be in use
- **Superseded**: Decision has been replaced (link to new ADR)

## Example ADRs

### ADR-001: Database Selection

**Status**: Accepted

**Context**: We need to choose a database for storing quotes, user data, and image metadata.

**Decision**: Use PostgreSQL as the primary database.

**Consequences**:
- Pros: Strong ACID guarantees, excellent JSON support, mature ecosystem
- Cons: May need caching layer for high read loads

**Alternatives**:
- MongoDB: Rejected due to need for strong consistency
- MySQL: Rejected due to inferior JSON support

---

## Existing ADRs

- [ADR-001: Initial Tech Stack Selection](./ADR-001-initial-tech-stack.md) - Accepted (2025-10-30)

<!--
Future ADRs as needed:
- ADR-002: Image Cleanup Cron Strategy
- ADR-003: Paid User Tier Implementation
- ADR-004: User-Submitted Quote Workflow
-->

---

*Create your first ADR when you make your first major architectural decision.*
