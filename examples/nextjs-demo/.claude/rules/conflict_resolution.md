# Rule Conflict Resolution

> This file defines the priority arbitration mechanism when multiple rules are loaded simultaneously.
> Each rule file header declares `id`, `domains`, and `priority` via HTML comments.

## Priority Principles

1. **Domain-specific rules override general rules** — narrower domain wins within its territory
2. **Higher priority value wins within overlapping domains** — only compared when domains overlap
3. **Rules stack by default, only conflicting items are arbitrated** — non-conflicting parts are all retained
4. **Conflicts not covered by arbitration table → ask user** — register to this table after confirmation

## Current Rule Domain Registration

| Rule ID | Priority | Domains |
|---------|----------|---------|
| project_rule | 100 | general, code_quality, architecture, nextjs, typescript |

## Known Conflict Arbitration Table

| # | Conflict Scenario | Rule A Guidance | Rule B Guidance | Decision | Reason |
|---|------------------|----------------|----------------|----------|--------|
| 1 | proactive-correction finds fatal violation vs. code_review only reports | proactive-correction proposes fixes and pushes for closure | code_review only reports | proactive-correction priority | Fatal issues must be closed; reporting alone leaves issues unresolved |
| 2 | proactive-correction scans all code vs. arch-review scans only changes | proactive-correction scans all code | arch-review scans only changes | Each does its job | Full-scan and change-introduced violations are different in nature |
| 3 | proactive-correction finds rule defect vs. project_rule forbidden patterns | proactive-correction believes rules have gaps | project_rule defines current patterns | project_rule priority, but proactive-correction should alert user | Rules are user-defined; agents cannot modify rules |
| 4 | proactive-correction requests fix vs. user refuses | proactive-correction pushes for closure | User chooses not to fix | User decision priority | Corrections require user confirmation |
| 5 | 5-file limit vs. more violations found | Max 5 files per round | >5 violation files | 5-file limit priority; remaining recorded as "known but not fixed" | Prevent over-modification |
| 6 | Server Component needs client interactivity vs. layout must stay server | Server Component default | `'use client'` forbidden on layout | Extract interactive parts to Client Component children | Keep layout server-rendered |
| — | Others TBD | — | — | — | To be supplemented |

## New Rule Registration Process

1. Add `id`, `domains`, `priority` metadata comments to new rule file header
2. Register in Domain Registration table
3. Check new rule domains for intersections with existing rules
4. Identify conflict points and register in arbitration table
5. Arbitration principle: narrower/more specialized domain rules take priority
6. Add trigger conditions and core constraint summary in `CLAUDE.md`

## Arbitration Table Maintenance

- AI should alert user and record when encountering uncovered conflicts
- Arbitration table updates must sync with `.claude/CHANGELOG.md`
- Arbitration reasons must be stated; no empty entries allowed
