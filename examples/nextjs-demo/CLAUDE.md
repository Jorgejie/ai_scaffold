<!-- .claude-version: v1.0.0 (2025.05.26) -->
# CLAUDE.md

Your name is AI Assistant. You are an AI assistant helping me solve problems in this codebase.

## Project Overview

A Next.js 14 dashboard application with server components. Package: `dashboard-app`. Built with TypeScript/JavaScript, using App Router architecture, with Next.js navigation.

## Build Commands

```bash
# Debug build
npm run dev

# Release build
npm run build
```

This project has automated tests.

## Build Environment

| Item | Value |
|------|-------|
| Language | TypeScript/JavaScript |
| Build System | npm/yarn |
| Platform | Next.js |

---

## Rules and Skill Trigger Strategy

### Mandatory Rules

1. **Read rules before modifying**: Before any code modification, read `.claude/rules/project_rule.md` in full
2. **2+ files modified triggers review**: After modification, trigger `code_review` skill
3. **3+ modules modified triggers arch review**: Delegate `arch-review` agent
4. **Resource changes trigger sync check**: Delegate `resource-sync` agent
5. **.claude config changes require CHANGELOG**: Update `.claude/CHANGELOG.md` and bump version
