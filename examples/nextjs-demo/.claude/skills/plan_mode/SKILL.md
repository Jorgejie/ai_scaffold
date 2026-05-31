---
name: plan_mode
description: Structured decomposition skill for complex development tasks. Outputs step-by-step plans before execution.
---

# Plan Mode — Structured Task Decomposition

> **Trigger conditions** (any one):
> 1. Involves collaboration across 2+ modules
> 2. Requires modifying 3+ files
> 3. User explicitly requests "plan first / plan / decompose task"
>
> **Skip conditions**: Single-file simple modifications, user says "just do it", pure Q&A.

---

## 1 Plan Output Format

```
## Execution Plan

**Task**: [One-sentence description]
**Involved modules**: [Module list]
**Estimated files to modify**: [N]
**Rules/skills to load**: [List]

### Step Decomposition

| # | Action | Target file/location | Dependency | Checkpoint |
|---|--------|---------------------|-----------|------------|
| 1 | ... | ... | None | ... |

### Risks

### Completion Criteria
```

---

## 2 High-Frequency Task Templates

### 2.1 New Page Route

```
## Execution Plan

**Task**: New page route at [path]
**Involved modules**: app/ + components/ + lib/
**Estimated files to modify**: 2-5
**Rules/skills to load**: project_rule + code_review + proactive-correction

### Step Decomposition

| # | Action | Target file/location | Dependency | Checkpoint |
|---|--------|---------------------|-----------|------------|
| 1 | Create page directory under `app/` | `app/[segment]/page.tsx` | None | Directory structure correct |
| 2 | Implement page as Server Component with data fetching | `app/[segment]/page.tsx` | None | Async data fetch returns expected shape |
| 3 | Create reusable components if needed | `components/[Name].tsx` | None | Client Components only if interactive |
| 4 | Add `loading.tsx` if data fetch is slow | `app/[segment]/loading.tsx` | Step 2 | Suspense boundary wraps content |
| 5 | Add `error.tsx` for error handling | `app/[segment]/error.tsx` | Step 2 | Error boundary catches fetch errors |
| 6 | Add metadata export or `generateMetadata()` | `app/[segment]/page.tsx` | Step 2 | SEO metadata present |

### Risks
- Server/Client boundary violations (using hooks in Server Components)
- Missing error/loading states for async operations

### Completion Criteria
- Page renders correctly at the expected URL
- No `'use client'` on layout.tsx
- loading.tsx and error.tsx present for async routes
- Metadata API used for SEO
```

### 2.2 New API Route

```
## Execution Plan

**Task**: New API route handler
**Involved modules**: app/api/
**Estimated files to modify**: 1-3
**Rules/skills to load**: project_rule + code_review

### Step Decomposition

| # | Action | Target file/location | Dependency | Checkpoint |
|---|--------|---------------------|-----------|------------|
| 1 | Create route directory under `app/api/` | `app/api/[segment]/route.ts` | None | Directory structure correct |
| 2 | Implement HTTP method handlers | `app/api/[segment]/route.ts` | Step 1 | Each handler returns `NextResponse` |
| 3 | Add input validation (zod) | `app/api/[segment]/route.ts` | Step 2 | Invalid input returns 400 |
| 4 | Add error handling with proper status codes | `app/api/[segment]/route.ts` | Step 2 | Errors return structured JSON |

### Risks
- Hardcoded API base URLs in client code
- Missing input validation on POST/PUT
- Leaking server-only secrets in responses

### Completion Criteria
- All HTTP methods return proper `NextResponse.json()`
- Input validation present for write operations
- Error responses include meaningful status codes
```

### 2.3 New Shared Component

```
## Execution Plan

**Task**: New shared UI component
**Involved modules**: components/ + lib/
**Estimated files to modify**: 1-3
**Rules/skills to load**: project_rule + code_review

### Step Decomposition

| # | Action | Target file/location | Dependency | Checkpoint |
|---|--------|---------------------|-----------|------------|
| 1 | Create component file | `components/[Name].tsx` | None | PascalCase naming |
| 2 | Add `'use client'` only if interactive | `components/[Name].tsx` | Step 1 | Directive only if needed |
| 3 | Define TypeScript props interface | `components/[Name].tsx` | Step 1 | Props fully typed (no `any`) |
| 4 | Add styles (Tailwind or CSS Module) | Component file | Step 1 | Styles are scoped |
| 5 | Export component | `components/[Name].tsx` | Steps 1-3 | Default or barrel export |

### Risks
- Unnecessary `'use client'` increasing client bundle
- Missing TypeScript types for props

### Completion Criteria
- Component renders correctly in isolation
- `'use client'` only present if needed
- Props are fully typed
```

### 2.4 Add Server Action (Data Mutation)

```
## Execution Plan

**Task**: Add Server Action for data mutation
**Involved modules**: app/ + lib/ + components/
**Estimated files to modify**: 2-4
**Rules/skills to load**: project_rule + code_review

### Step Decomposition

| # | Action | Target file/location | Dependency | Checkpoint |
|---|--------|---------------------|-----------|------------|
| 1 | Create Server Action | `lib/actions/[name].ts` | None | File starts with `'use server'` |
| 2 | Implement action with input validation | `lib/actions/[name].ts` | Step 1 | Zod schema validates input |
| 3 | Add `revalidatePath` after mutation | `lib/actions/[name].ts` | Step 2 | Cache revalidation present |
| 4 | Wire action to form/component | `components/[Form].tsx` | Step 3 | Form calls action via `action` prop |

### Risks
- Missing revalidation after mutation (stale data)
- No error handling in Server Action

### Completion Criteria
- Mutation persists data correctly
- UI updates reflect the mutation without full page reload
- Error states are handled and displayed
```

---

## 3 Execution Principles

1. **Output plan first, wait for user confirmation** (unless user says "just do it")
2. **Strict sequential execution when steps have dependencies**, parallel when independent
3. **Verify checkpoint after each step**; stop and explain if not passed
4. **Correction checkpoint after each step** — delegate `proactive-correction` agent for dimension 2 scan
5. **Pause and ask when encountering gray areas**
6. **Plan is iterative**: Update plan and notify user when new situations arise
7. **Correction closure**: After all steps, trigger `proactive-correction` for dimension 2+3 scan

---

## 4 Collaboration with Other Rules/Skills

| Task Scenario | Additional Rules to Load |
|--------------|------------------------|
| New page | `project_rule` + `proactive-correction` |
| New API route | `project_rule` + `proactive-correction` |
| New Server Action | `project_rule` + `proactive-correction` |
| Post-code generation | Auto-trigger `code_review` |
| Performance optimization | `project_rule` + `code_review` + `proactive-correction` |
