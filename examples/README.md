# Examples

Pre-generated examples showing what ai_scaffold produces for common project types.

## android-demo/

Android Kotlin componentized project with Claude Code. Shows:
- Platform: Android / Gradle Kotlin DSL
- Language: Kotlin
- NDK: Not included
- AI Tool: Claude Code

**Generated files**:
```
CLAUDE.md                         ← Entry point
.claude/
├── CHANGELOG.md
├── settings.json
├── settings.local.json
├── hooks/
│   ├── post-edit-tracker.sh
│   └── check-review-needed.sh
├── rules/
│   ├── project_rule.md           ← Android-specific rules (Kotlin, Gradle, ARouter, etc.)
│   └── conflict_resolution.md
├── skills/
│   ├── plan_mode/SKILL.md        ← Android task templates (new page, new module, etc.)
│   └── code_review/SKILL.md      ← Android-specific fatal/warning checks
├── agents/
│   ├── arch-review.md
│   ├── resource-sync.md          ← Android resource sync (layout, drawable, values)
│   └── proactive-correction.md
├── scripts/
│   └── gen_references.py
└── references/               ← Generated at runtime by gen_references.py + AI
    ├── _scan.json
    ├── dependencies.md
    └── {module}.md × N
```

> **Note**: `references/` is not included in examples — it's generated dynamically when you run `gen_references.py` against a real project and then have AI read the source code to produce module documentation.

## nextjs-demo/

Next.js 14 TypeScript dashboard with Claude Code. Shows:
- Platform: Next.js / npm
- Language: TypeScript/JavaScript
- AI Tool: Claude Code

**Generated files**:
```
CLAUDE.md                         ← Entry point
.claude/
├── CHANGELOG.md
├── settings.json
├── settings.local.json
├── hooks/
│   ├── post-edit-tracker.sh      ← Tracks .ts|.tsx|.js|.jsx|.css edits
│   └── check-review-needed.sh
├── rules/
│   ├── project_rule.md           ← Next.js rules (App Router, Server/Client boundary, etc.)
│   └── conflict_resolution.md
├── skills/
│   ├── plan_mode/SKILL.md        ← Next.js task templates (new page, API route, Server Action)
│   └── code_review/SKILL.md      ← Next.js fatal/warning checks
├── agents/
│   ├── arch-review.md            ← Server/Client boundary + module dependency review
│   ├── resource-sync.md          ← Asset, font, CSS module sync checks
│   └── proactive-correction.md   ← Three-dimension correction scan
├── scripts/
│   └── gen_references.py
└── references/                   ← Generated at runtime
```

**Key differences from android-demo**:
- Rules focus on App Router conventions, Server/Client component boundaries, TypeScript strict mode
- Task templates cover: new page route, new API route, new shared component, Server Action mutation
- Resource sync checks images, fonts, CSS modules, and Tailwind config instead of Android drawable/layout
