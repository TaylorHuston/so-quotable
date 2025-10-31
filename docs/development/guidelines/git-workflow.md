# Git Workflow

## Purpose

This document defines the Git workflow and branching strategy for the So Quotable project.

## Branching Strategy

### Main Branches

- **main**: Production-ready code
- **develop**: Integration branch

### Supporting Branches

- **feature/**: New features
  - Branch from: main (or develop)
  - Merge to: main (or develop)
  - Naming: `feature/TASK-###-short-description`

- **bugfix/**: Bug fixes
  - Branch from: main (or develop)
  - Merge to: main (or develop)
  - Naming: `bugfix/BUG-###-short-description`

- **hotfix/**: Urgent production fixes
  - Branch from: main
  - Merge to: main (and develop if exists)
  - Naming: `hotfix/issue-description`

## Workflow

### Starting New Work

```bash
# 1. Ensure main is up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/TASK-001-user-authentication

# 3. Work on feature, commit regularly
git add .
git commit -m "feat: add user login form"

# 4. Push to remote
git push -u origin feature/TASK-001-user-authentication
```

### Submitting Changes

```bash
# 1. Ensure branch is up to date with main
git checkout main
git pull origin main
git checkout feature/TASK-001-user-authentication
git rebase main

# 2. Push changes
git push origin feature/TASK-001-user-authentication

# 3. Create pull request
# - Use descriptive title
# - Reference related issues
# - Add reviewers
```

## Commit Messages

Follow Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```
feat(auth): add user login functionality

fix(quotes): resolve image upload validation error

docs(readme): update installation instructions

refactor(api): simplify quote generation logic
```

## Pull Request Guidelines

### Before Creating PR

- All tests pass
- Code follows style guidelines
- No merge conflicts
- Branch is up to date with main

### PR Description

- Clear title summarizing the change
- Description of what changed and why
- Link to related issues (TASK-###, BUG-###)
- Screenshots for UI changes
- Testing instructions

### Review Process

- At least one approval required
- Address all review comments
- Keep discussions focused and constructive
- Request re-review after changes

### Merging

- Use "Squash and merge" for clean history
- Delete branch after merging
- Ensure CI/CD passes

## Best Practices

- Commit early and often
- Keep commits atomic and focused
- Write clear commit messages
- Pull/rebase frequently to avoid conflicts
- Never commit secrets or sensitive data
- Use .gitignore properly

## Tools

Use AI Toolkit commands for git operations:

```bash
/commit              # Create quality-checked commit
/branch create       # Create properly named branch
/branch merge        # Merge with checks
```

---

*Update this document as your Git workflow evolves.*
