# PM Templates

This directory contains templates for project management artifacts.

## Available Templates

- **epic.md** - Feature epic template
- **task.md** - Task/story template
- **bug.md** - Bug report template

## Usage

Use these templates when creating new epics, tasks, or bug reports. The ai-toolkit commands will use these templates automatically:

- `/epic` - Creates a new epic from epic.md template
- `/plan TASK-###` - Creates task implementation plans
- Bug reports can be created manually using bug.md template

## Template Variables

Templates use the following placeholders that get replaced:

- `XXX` - ID number
- `YYYY-MM-DD` - Date
- `Epic Title` - Actual epic/task/bug title
