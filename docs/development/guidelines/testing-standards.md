# Testing Standards

## Purpose

This document defines testing standards and practices for the So Quotable project.

## Testing Philosophy

- Write tests before or alongside code (TDD/BDD)
- Aim for high coverage, but focus on critical paths
- Tests should be fast, isolated, and repeatable
- Tests are documentation - make them readable

## Test Types

### Unit Tests

- Test individual functions and components in isolation
- Mock external dependencies
- Fast execution (< 1s for entire suite)
- Target: 80%+ coverage for business logic

### Integration Tests

- Test interactions between components
- Use minimal mocking
- Test API endpoints
- Database interactions

### End-to-End Tests

- Test complete user workflows
- Test critical user paths
- Keep these minimal (slow to run)
- Run before deployment

## Testing Tools

See [ADR-002: Testing Framework and Strategy](../../project/adrs/ADR-002-testing-framework.md) for detailed rationale.

- **Test Runner**: Vitest (v2.0+) - Unit and integration tests
- **Backend Testing**: convex-test (v0.0.17) - Convex function testing with real database
- **Component Testing**: React Testing Library - User-focused component tests
- **E2E Testing**: Playwright (v1.45+) - Critical user flows
- **BDD Style**: Native describe/it with Given-When-Then comments

**Testing Pyramid** (Backend-First):
- 60%: Backend (Convex functions - core business logic)
- 30%: Frontend (React components - presentation layer)
- 10%: E2E (Critical flows - search → generate → share)

## Test Structure

```javascript
describe('Component/Function Name', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  describe('when condition', () => {
    it('should do expected behavior', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Best Practices

- Use descriptive test names
- Test behavior, not implementation
- One assertion per test (when possible)
- Avoid test interdependencies
- Clean up after tests (afterEach/afterAll)

## Continuous Integration

- All tests must pass before merging
- Run tests on every pull request
- Maintain test suite performance

---

*Update this document as your testing practices evolve.*
