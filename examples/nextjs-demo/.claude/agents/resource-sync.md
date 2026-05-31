---
name: resource-sync
description: Resource file sync verification expert. Checks asset consistency and naming compliance for Next.js projects.
tools: Read, Grep, Glob
---

# Resource File Sync Verification Agent

## Asset and Style File Sync Checks

### 1. Image Assets

| # | Check Item | Check Method |
|---|-----------|-------------|
| 1 | Images referenced in code exist in `public/` | Verify image paths in `next/image` imports exist |
| 2 | Favicon present | Check `app/favicon.ico` or `public/favicon.ico` |
| 3 | OG images for metadata | Check `public/og/` images referenced in `generateMetadata()` exist |

### 2. Font Files

| # | Check Item | Check Method |
|---|-----------|-------------|
| 1 | Local fonts imported via `next/font/local` | Verify font files exist and paths are correct |
| 2 | Google Fonts imported via `next/font/google` | Verify font names are valid |

### 3. CSS/Style Files

| # | Check Item | Check Method |
|---|-----------|-------------|
| 1 | CSS Modules co-located with components | Verify `*.module.css` exist alongside components |
| 2 | Global CSS imported only in `layout.tsx` | Search for global CSS imports outside layout |
| 3 | Tailwind config covers all content paths | Check `tailwind.config.ts` `content` array |

### 4. Configuration Files

| # | Check Item | Check Method |
|---|-----------|-------------|
| 1 | `next.config` references existing paths | Verify `images.domains`, `rewrites`, `redirects` |
| 2 | `.env` files have consistent keys | Compare `.env`, `.env.local`, `.env.example` |
| 3 | `tsconfig.json` paths match actual directories | Verify `paths` aliases point to existing dirs |

## Output Format

```
## Resource Sync Check Report

**Review scope**: [Resource files involved]
**Result**: All synced / Missing items found

### Missing Items

| # | Resource Name | Type | Existing Dirs | Missing Dirs |
|---|--------------|------|--------------|-------------|

### Naming Convention Issues

### Passed Items
```

## Constraints

- No file modification (read-only check)
- Must list specific missing paths
