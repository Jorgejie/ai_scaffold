---
name: code_review
description: Automated post-generation code review skill. Checks new/modified code against project standards.
---

# Code Review — Post-Generation Review

> **Trigger conditions** (any one):
> 1. Completed multi-file code generation
> 2. Completed code modification involving architecture boundaries
> 3. User explicitly requests "review / check"
> 4. `plan_mode` plan execution completed
>
> **Skip conditions**: Single-line changes, pure config changes, user says "no review needed".

---

## 1 Review Checklist

### 1.1 Fatal (Blocking issues, must fix)

| # | Check Item | Check Method |
|---|-----------|-------------|
| 1 | Module dependency direction violation | Does lib/ import from app/ or components/? |
| 2 | Forbidden pattern usage | Search patterns in project_rule.md §3 |
| 3 | `'use client'` on layout.tsx | Check all layout.tsx for the directive |
| 4 | Server Component using React hooks | Check for useState/useEffect without `'use client'` |
| 5 | Missing error.tsx for async routes | Routes with async data fetch must have error.tsx |
| 6 | Hardcoded keys/privacy data | Search for plaintext API keys, tokens |
| 7 | Server/Client boundary violation | Is a Server Component imported into a Client Component? |
| 8 | `any` type usage | Search for `: any` or `as any` |
| 9 | Missing revalidation after mutation | Does each Server Action call revalidatePath/revalidateTag? |

### 1.2 Warning (Should fix, not blocking)

| # | Check Item | Check Method |
|---|-----------|-------------|
| 10 | Hardcoded strings/colors/dimensions | Color hex, pixel values in code |
| 11 | Raw `<img>` tags | Search for `<img` in tsx files |
| 12 | `<head>` tag instead of Metadata API | Search for Head imports |
| 13 | Missing loading.tsx for slow routes | Routes with >500ms fetch |
| 14 | Large client bundle from heavy imports | Large libs in Client Components without dynamic import |
| 15 | Missing TypeScript types for props | Components with untyped props |

### 1.3 Suggestion (Optional optimization)

| # | Check Item | Check Method |
|---|-----------|-------------|
| 16 | Component too large | Components with 300+ lines |
| 17 | Missing dynamic imports | Heavy components below the fold |
| 18 | Code reuse | Similar code blocks extracted? |
| 19 | Metadata completeness | Each page exports metadata? |
| 20 | Accessibility | Interactive elements have ARIA attributes? |

---

## 2 Review Output Format

```
## Code Review Report

**Review scope**: [Changed file list]
**Overall result**: Pass / N warnings / N fatal

### Fatal Issues

### Warnings

### Optimization Suggestions

### Verified
```

---

## 3 Review Flow

```
Code generation complete
    ↓
[Step 0] Pre-review correction — delegate proactive-correction agent
    ↓
[Step 1] Collect changed file list
    ↓
[Step 2] Check: fatal → warning → suggestion
    ↓
[Step 3] Output review report
    ↓
├── Fatal → Notify user + provide fix
└── Pass/Warning → Output report, continue
```

---

## 4 SubAgent Collaboration

- **Pre-review correction** → `proactive-correction` agent
- **Architecture compliance** → `arch-review` agent
- **Resource sync** → `resource-sync` agent
- Delegation timing: pre-review is mandatory; others when changes involve 2+ modules or resource files
