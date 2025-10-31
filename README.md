# So Quotable

Allows users to generate quotes on top of images of the source of the quote.

Quotes should have a verified, attributed source.

This project uses the AI Toolkit plugin for structured, AI-assisted development.

## Quick Start

### Prerequisites

1. **Claude Code with AI Toolkit Plugin**: Already configured for this project

2. **Review Project Context**:
   - See `CLAUDE.md` for tech stack and project details
   - See `GETTING-STARTED.md` for complete AI Toolkit workflow guide

### Start Developing

```bash
# 1. Complete your project brief
/project-brief

# 2. Create your first epic
/epic

# 3. Plan and implement tasks
/plan TASK-001
/implement TASK-001 1.1

# 4. Check status
/status
```

## Project Structure

```
quoteable/
├── CLAUDE.md              # AI assistant context
├── GETTING-STARTED.md     # AI Toolkit workflow guide
├── pm/                    # Project management
│   ├── epics/            # Feature epics (EPIC-###.md)
│   ├── issues/           # Tasks and bugs (TASK-###.md, BUG-###.md)
│   └── templates/        # Templates for new items
├── docs/                 # Documentation
│   ├── project-brief.md # Product vision
│   ├── project/         # Technical docs, ADRs
│   └── development/     # Dev guidelines
└── src/                  # Your application code (to be created)
```

## AI Toolkit Commands

### Planning & Design
- `/project-brief` - Complete project brief through conversation
- `/epic` - Create or refine feature epics
- `/plan TASK-###` - Add implementation plan to task

### Development
- `/implement TASK-### PHASE` - Execute implementation phase
- `/test-fix` - Automatically detect and fix test failures
- `/commit` - Create quality-checked git commit

### Quality & Documentation
- `/quality` - Comprehensive quality assessment
- `/security-audit` - Security vulnerability scan
- `/docs` - Generate, validate, or sync documentation

### Project Management
- `/status` - View project status and progress
- `/comment "text"` - Log manual changes

See `GETTING-STARTED.md` for complete workflow guide.

## Tech Stack

- **Frontend**: Next.js
- **Backend**: Node.js/Express
- **Infrastructure**: Vercel
- **Database**: TBD

## License

TBD
