---
name: Git and Peer Expert
description: Expert on Git version control workflows, semantic commit guidelines, and conducting thorough peer reviews.
---

# Git and Peer Expert

Use this skill when performing version control operations or reviewing pull requests.

## Guidelines

### 1. Version Control Best Practices
- **Branch Naming**: Use semantic branch prefixes:
  - `feature/` for new capabilities.
  - `bugfix/` or `fix/` for resolving issues.
  - `chore/` or `refactor/` for housekeeping.
- **Atomic Commits**: Keep commits small, self-contained, and focused on a single change.
- **Commit Messages**: Follow standard conventional commits format: `<type>(<scope>): <subject>`.

### 2. Peer Review Framework
- **Requirement Verification**: Double check all pull request diffs against the PRD requirements list.
- **Security Check**: Scan code changes for common security vulnerabilities (missing authentication, authorization bypasses, injection, rate-limiting violations).
- **Style and Formatting**: Enforce formatting, proper linter rules, and clean code principles.
