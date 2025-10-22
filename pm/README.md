# Project Management

This directory contains all project management artifacts for So Quoteable.

## Structure

```
pm/
├── epics/          # Feature epics
├── issues/         # Tasks and bugs
└── templates/      # Templates for epics, tasks, bugs
```

## Workflow

1. **Create Epic** - Use `/epic` to create a new feature epic
2. **Break Down** - Epic creates individual tasks
3. **Plan** - Use `/plan TASK-###` to create implementation plan
4. **Implement** - Use `/implement TASK-### PHASE` to execute phases
5. **Track** - Use `/status` to see current progress

## Work Log

Track manual changes and communicate context with `/comment`:

```bash
/comment "Updated API endpoint to use new authentication"
/comment "Fixed styling issue in mobile view"
```

Comments are logged with timestamps and provide context for AI assistants.

## Commands

- `/epic` - Create or refine epics
- `/plan TASK-###` - Add implementation plan to task
- `/implement TASK-### PHASE` - Execute implementation phase
- `/status` - View project status
- `/comment "text"` - Log work entry
