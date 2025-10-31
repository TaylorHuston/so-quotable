# Documentation

This directory contains all project documentation for So Quotable.

## Structure

```
docs/
├── project-brief.md    # Product vision and goals
├── project/            # Project-wide documentation
└── development/        # Development guidelines and processes
```

## Key Documents

- **project-brief.md** - The "what" and "why" - product vision, target audience, key features
- **project/** - Architecture decisions, technical design
- **development/** - Development workflows, coding standards, guidelines

## Documentation Workflow

Use `/docs` for unified documentation management:

```bash
/docs generate           # Generate docs from code
/docs validate          # Check for drift
/docs sync             # Sync code changes to docs
/docs "update API docs" # Natural language updates
```

## Keeping Docs Updated

Documentation is a living artifact. Update docs when:
- Adding new features
- Changing architecture
- Updating workflows
- Making decisions (use ADRs in project/)

Run `/docs validate` periodically to catch documentation drift.
