# Contributing to ai_scaffold

Thank you for your interest in contributing! This document provides guidelines for contributing to ai_scaffold.

## How to Contribute

### Reporting Issues

- Use [GitHub Issues](../../issues) to report bugs or request features
- Search existing issues before creating a new one
- Include clear reproduction steps for bug reports

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test your changes against at least one sample project
5. Submit a PR with a clear description of what and why

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai_scaffold.git
cd ai_scaffold

# The project is template-based — no build step required
# To test: reference SKILL.md in your AI coding tool and run against a sample project
```

### Adding a New Platform Template

1. Add platform detection logic in `SKILL.md` (Phase 1 section)
2. Create platform-specific rule templates in `templates/rules/`
3. Add platform-specific variables to the Q7 configuration group
4. Update `scripts/gen_references.py` if the platform uses a non-standard build system
5. Test with a real project of that platform type

### Adding a New AI Tool

1. Add the tool's entry file name and config directory to the mapping table in `SKILL.md`
2. Verify all templates render correctly with the new directory name
3. Test the full initialization flow end-to-end

### Code Style

- Shell scripts: POSIX-compatible, no bashisms
- Python: PEP 8, no external dependencies (stdlib only)
- Markdown templates: Use `{{VARIABLE}}` for placeholders, `{{#if CONDITION}}` for conditionals

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
