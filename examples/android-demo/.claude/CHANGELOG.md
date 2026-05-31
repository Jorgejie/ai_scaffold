# .claude Changelog

> Format: vX.Y.Z (YYYY.MM.DD)
> X = Architecture refactor | Y = Feature change | Z = Patch

## v1.0.0 (2025.05.26)

### Added
- CLAUDE.md: Project overview, build commands, rules and skill trigger strategy
- rules/project_rule.md: ShopApp main development rules
- rules/conflict_resolution.md: Rule conflict resolution mechanism
- skills/plan_mode/SKILL.md: Structured task decomposition skill
- skills/code_review/SKILL.md: Code review skill
- agents/arch-review.md: Architecture compliance review agent
- agents/resource-sync.md: Resource sync verification agent
- agents/proactive-correction.md: Proactive correction agent
- hooks/post-edit-tracker.sh: Edit tracking hook
- hooks/check-review-needed.sh: Review reminder hook
- settings.json: Hook registration config
- scripts/gen_references.py: Module reference doc auto-generation script
- references/: Module reference documentation
