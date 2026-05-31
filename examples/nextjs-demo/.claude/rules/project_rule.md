<!--
id: project_rule
domains: [general, code_quality, architecture, nextjs, typescript]
priority: 100
triggers: [code_generation, code_modification, code_review, refactoring, bug_fix, feature_development]
mandatory: true
-->
# Dashboard App Development Rules

> **Scope**: Code generation, modification, review, refactoring operations.
> **Skip conditions**: Casual chat, general knowledge Q&A, non-code discussions, negative context.

### Negative Keyword Protection

| Negative Pattern | Example | Reason |
|-----------------|---------|--------|
| General concept discussion | "What's the difference between X and Y in principle?" | General Q&A |
| Analogy/comparison | "How does this mechanism work in similar projects?" | External project discussion |
| Explicit exclusion | "Help me review the code logic, no need to check standards" | User exclusion |
| Closed context | "That issue has been resolved" | Issue closed |

---

## 1 Code of Conduct

- **Search before writing**: Before generating code, read the target module documentation in `.claude/references/` to confirm components, hooks, and utilities actually exist
- **No fabrication**: Do not use components/hooks/utilities that don't exist in the project; verify with search tools when uncertain
- **No new dependencies**: Only use third-party libraries listed in `.claude/references/dependencies.md`
- **Prioritize existing utilities**: Existing hooks and components must be reused; do not bypass them to re-implement
- **Confirm when uncertain**: Ask the user when encountering gray areas; do not make decisions independently

### 1.N Proactive Correction Guidelines

- **Proactive scanning, not passive waiting**: When touching any source or rule file, proactively check compliance and rationality
- **Fix when found, don't just report**: Provide specific fix proposals and push for closure
- **Rules are not infallible**: Rule files themselves may have defects; proactively point these out
- **Correction closure, not forgetting**: Fatal issues must be tracked until fixed
- **User confirmation required**: Notify user before executing fixes; no unconfirmed auto-modifications
- **Max 5 files per round**: Prevent uncontrolled over-modification

---

## 2 Architecture Constraints

### 2.1 Module Dependency Direction

```
app/ (routes and pages)
  └── can import from: components/, lib/
components/ (shared UI components)
  └── can import from: lib/
lib/ (utilities, types, actions)
  └── must NOT import from: app/, components/
```

- `app/` may import from `components/` and `lib/`
- `components/` may import from `lib/`
- `lib/` must NOT import from `app/` or `components/`
- No circular dependencies allowed
- Shared types live in `lib/types/` or `types/` at project root

### 2.2 Inter-Module Communication

Cross-module communication through React Context + Server Actions. Direct imports between sibling page modules are prohibited. Shared state uses Context providers or Server Actions for data mutation.

### 2.3 Component Classification

- Pages use **Server Components** by default (no directive needed)
- **Client Components** must be explicitly marked with `'use client'` at the top of the file
- `layout.tsx` must remain Server Components
- Interactive components (forms, dropdowns, modals) should be Client Components
- Data fetching components should be Server Components

---

## 3 Forbidden Patterns

| # | Forbidden Pattern | Correct Alternative | Reason |
|---|------------------|-------------------|--------|
| 1 | `'use client'` on `layout.tsx` | Keep layout.tsx as Server Component | Layouts must stay server-rendered for metadata and streaming |
| 2 | `fetch()` in Client Components for initial data | Use Server Components or Server Actions | Prevents waterfall requests; leverages SSR |
| 3 | Direct `process.env` in Client Components | Use `NEXT_PUBLIC_` prefixed vars | Non-prefixed env vars unavailable in client bundles |
| 4 | `useState`/`useEffect` in Server Components | Extract to Client Component with `'use client'` | Server Components cannot use React hooks |
| 5 | Hardcoded API base URLs | Use relative paths or env config | Breaks across environments |
| 6 | `any` type in TypeScript | Use proper types or `unknown` | Defeats type safety |
| 7 | Missing `error.tsx` for routes with async data | Add `error.tsx` error boundary | Prevents unhandled errors |
| 8 | Missing `loading.tsx` for slow routes | Add `loading.tsx` with Suspense | Provides loading UX |
| 9 | `router.push()` in Server Components | Use `redirect()` from `next/navigation` | Server Components cannot use client router |
| 10 | Raw `<img>` tags | Use `next/image` Image component | Misses optimization and lazy loading |

---

## 4 Naming Conventions

### 4.1 Component/File Naming

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `DashboardCard.tsx`, `UserAvatar.tsx` |
| Utility functions | camelCase | `formatDate.ts`, `cn.ts` |
| API route handlers | `route.ts` | `app/api/users/route.ts` |
| Custom hooks | `use` + PascalCase | `useTheme.ts`, `useDebounce.ts` |
| TypeScript types | PascalCase | `UserProfile`, `DashboardMetric` |

### 4.2 Layout Naming (App Router)

| File | Purpose |
|------|---------|
| `page.tsx` | Route segment UI |
| `layout.tsx` | Shared layout wrapping child pages |
| `loading.tsx` | Suspense loading state |
| `error.tsx` | Error boundary for the segment |
| `not-found.tsx` | 404 page |
| `route.ts` | API route handler (GET, POST, etc.) |

---

## 5 Next.js Specific Rules

### 5.1 Server/Client Component Boundary

| # | Rule |
|---|------|
| 1 | Default to Server Components — all `page.tsx` and `layout.tsx` are Server Components unless marked `'use client'` |
| 2 | Minimize Client Component surface — only mark `'use client'` when browser APIs, state, or effects are needed |
| 3 | Push `'use client'` to the lowest possible component in the tree |
| 4 | Use Server Actions (`'use server'`) for form submissions and data mutations |
| 5 | Never import Server Components into Client Components — pass as `children` props instead |

### 5.2 Data Fetching

| # | Rule |
|---|------|
| 1 | Fetch data in Server Components using `async/await` |
| 2 | Use Server Actions for mutations, marked with `'use server'` |
| 3 | Call `revalidatePath()` or `revalidateTag()` after Server Action mutations |
| 4 | No `useEffect` + `fetch` for page-level initial data |
| 5 | Wrap slow fetches in `<Suspense>` with `loading.tsx` |

### 5.3 Performance

| # | Rule |
|---|------|
| 1 | Use `next/image` for all images — never raw `<img>` |
| 2 | Use `next/font` for fonts |
| 3 | Use `next/dynamic` for heavy below-the-fold components |
| 4 | Minimize client bundle — audit Client Component imports |

### 5.4 Styling

| # | Rule |
|---|------|
| 1 | Tailwind CSS as primary styling |
| 2 | CSS Modules for complex component-scoped styles |
| 3 | Global CSS imported only in `layout.tsx` |
| 4 | Use `cn()` utility for conditional class merging |

---

## 6 Code Implementation Quality Rules

- 3+ identical/similar code blocks in the same module must be extracted to a common component or utility
- No copy-paste coding
- Prioritize reusing existing components, hooks, and utilities
- Custom hooks for shared stateful logic

---

## 7 Code Self-Check Checklist

| # | Check Item |
|---|-----------|
| 1 | Referenced components/hooks/utilities actually exist in the project? |
| 2 | Module dependency direction correct (app/ -> components/ -> lib/)? |
| 3 | No forbidden pattern usage? |
| 4 | No hardcoded strings/colors/dimensions/API URLs? |
| 5 | Server/Client component boundary respected? |
| 6 | No duplicate code blocks? |
| 7 | `error.tsx` present for routes with async data? |
| 8 | `loading.tsx` present for slow routes? |
| 9 | `'use client'` only where needed (not on layouts)? |
| 10 | Server Actions used for data mutations? |
| 11 | TypeScript types are strict (no `any`)? |
| 12 | `next/image` used for all images? |
| C1 | Proactive correction scan executed? |
| C2 | Fatal violations found have been fixed and closed? |
| C3 | Rule self-consistency verified? |

---

## 8 .claude Configuration Change Management

Any configuration file modification under `.claude/` **must**:

1. Update `.claude/CHANGELOG.md` (Keep a Changelog format)
2. Bump `CLAUDE.md` first-line version number

| Change Type | Version Bump |
|------------|-------------|
| Architecture-level refactor | X |
| Feature change (new rules/skills/hooks/docs) | Y |
| Patch (fix/supplement) | Z |
