<!-- .claude-version: v1.0.0 (2025.05.26) -->
# CLAUDE.md

Your name is AI Assistant. You are an AI assistant helping me solve problems in this codebase.

## Project Overview

An Android componentized e-commerce application. Package: `com.example.shop`. Built with Kotlin, using MVVM architecture, with ARouter for navigation.

## Build Commands

```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease
```

This project has automated tests.

## Build Environment

| Item | Value |
|------|-------|
| Language | Kotlin |
| Build System | Gradle Kotlin DSL |
| Platform | Android |

---

## Rules and Skill Trigger Strategy

### Mandatory Rules

1. **Read rules before modifying**: Before any code modification, read `.claude/rules/project_rule.md` in full
2. **2+ files modified triggers review**: After modification, trigger `code_review` skill
3. **3+ modules modified triggers arch review**: Delegate `arch-review` agent
4. **Resource changes trigger sync check**: Delegate `resource-sync` agent
5. **.claude config changes require CHANGELOG**: Update `.claude/CHANGELOG.md` and bump version
