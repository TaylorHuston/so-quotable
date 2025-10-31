# Getting Started with AI Toolkit

This guide shows you how to use the AI Toolkit workflow for developing So Quotable.

## Overview

The AI Toolkit provides a structured, AI-assisted development workflow:

1. **Define** - Clarify what you're building (brief, epics)
2. **Plan** - Break down into tasks with implementation plans
3. **Build** - Execute tasks with test-first development
4. **Review** - Quality checks and documentation

## Quick Start

### 1. Complete Your Project Brief

```bash
/project-brief
```

This starts a conversation to fill in the gaps in your project brief. It will ask about:
- The problem you're solving
- Your solution approach
- Target audience
- Key features
- Success metrics

### 2. Create Your First Epic

```bash
/epic
```

Create a feature epic through natural conversation. For example:
- "Create a quote generator that overlays text on images"
- "Build user authentication system"

### 3. Plan a Task

Once you have epics with tasks:

```bash
/plan TASK-001
```

This creates a detailed, phase-based implementation plan with:
- Test requirements first
- Implementation phases
- Success criteria

### 4. Implement a Task

```bash
/implement TASK-001 1.1
```

Execute a specific phase from the task plan. The AI will:
- Write tests first (TDD)
- Implement the phase
- Run tests
- Fix any failures

### 5. Check Status

```bash
/status
```

See your current project status:
- Active epics and tasks
- Recent work
- Next steps

## Core Commands

### Planning & Design

- `/project-brief` - Complete project brief through conversation
- `/epic [EPIC-###]` - Create or refine feature epics
- `/plan TASK-###` - Add implementation plan to task

### Development

- `/implement TASK-### PHASE` - Execute implementation phase
- `/test-fix` - Automatically detect and fix test failures
- `/commit [message]` - Create quality-checked git commit

### Quality & Documentation

- `/quality` - Comprehensive quality assessment
- `/security-audit` - Security vulnerability scan
- `/docs` - Generate, validate, or sync documentation

### Project Management

- `/status` - View project status and progress
- `/comment "text"` - Log manual changes with timestamp

## Workflow Example

Here's a typical workflow:

```bash
# 1. Define a feature
/epic
> "I want to create a quote overlay feature"

# Epic EPIC-001 created with tasks TASK-001, TASK-002, TASK-003

# 2. Plan the first task
/plan TASK-001

# Implementation plan created with phases

# 3. Implement phase by phase
/implement TASK-001 1.1  # Tests
/implement TASK-001 1.2  # Implementation
/implement TASK-001 1.3  # Integration

# 4. Commit when done
/commit

# 5. Check overall progress
/status
```

## Project Structure

```
quoteable/
├── pm/                    # Project management
│   ├── epics/            # Feature epics (EPIC-###.md)
│   ├── issues/           # Tasks and bugs (TASK-###.md, BUG-###.md)
│   └── templates/        # Templates for new items
├── docs/                 # Documentation
│   ├── project-brief.md # Product vision (the "what" and "why")
│   ├── project/         # Technical docs, ADRs
│   └── development/     # Dev guidelines, workflows
├── src/                 # Your application code
└── tests/               # Your tests
```

## Tips

### Natural Language

All commands work with natural language:

```bash
/epic "user authentication with social login"
/plan TASK-005
/implement TASK-005 2.1
```

### Test-First Development

The `/implement` command enforces TDD:
1. Write tests first
2. Implement to pass tests
3. Fix failures automatically

### Track Manual Changes

When you make manual changes, log them:

```bash
/comment "Updated API endpoint to use new auth"
```

This helps AI understand context for future work.

### Use Branches

For features, use branches:

```bash
/branch create TASK-005
# ... work on task ...
/commit
/branch merge main
```

## Next Steps

1. Run `/project-brief` to complete your brief
2. Run `/epic` to create your first feature
3. Use `/plan` and `/implement` to build it

For more details on each command, check the pm/ and docs/ directories.

---

*This is a living guide. As you discover better workflows, update this file!*
