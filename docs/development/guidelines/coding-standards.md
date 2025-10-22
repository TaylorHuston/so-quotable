# Coding Standards

## Purpose

This document defines coding standards for the So Quoteable project to ensure consistency, maintainability, and quality across the codebase.

## General Principles

- Write clear, self-documenting code
- Follow the principle of least surprise
- Keep functions small and focused
- Use meaningful variable and function names
- Comment only when necessary to explain "why", not "what"

## Language-Specific Standards

### JavaScript/TypeScript

- Use TypeScript for type safety
- Follow ESLint configuration
- Use async/await over callbacks
- Prefer const over let, avoid var
- Use template literals for string interpolation

### CSS/Styling

- Use CSS modules or styled-components
- Follow BEM naming convention if using plain CSS
- Mobile-first responsive design
- Avoid inline styles

## File Organization

- One component per file
- Group related files together
- Use index files for clean imports
- Keep file names lowercase with hyphens

## Error Handling

- Always handle errors explicitly
- Use try/catch for async operations
- Provide meaningful error messages
- Log errors appropriately

## Code Reviews

All code must be reviewed before merging. Reviewers should check for:

- Adherence to these standards
- Code clarity and maintainability
- Proper error handling
- Test coverage
- Security considerations

---

*Update this document as the project evolves and new patterns emerge.*
