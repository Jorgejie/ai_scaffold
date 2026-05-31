---
name: arch-review
description: {{t "arch_review.description"}}
tools: Read, Grep, Glob
---

# {{t "arch_review.title"}}

{{t "arch_review.intro"}} {{PROJECT_NAME}} {{t "arch_review.intro_suffix"}}

## {{t "arch_review.dimension_title"}}

### 1. {{t "arch_review.dep_title"}}

{{t "arch_review.dep_check_title"}}
{{DEPENDENCY_RULES}}

{{t "arch_review.dep_check_method"}}

### 2. {{t "arch_review.forbidden_title"}}

{{t "arch_review.forbidden_desc"}}

{{t "arch_review.forbidden_table_header"}}
|---------|---------|---------|
{{FORBIDDEN_PATTERNS_SEARCH_TABLE}}

### 3. {{t "arch_review.comm_title"}}

{{t "arch_review.comm_desc"}}
{{COMMUNICATION_MECHANISM_CHECKS}}

### 4. {{t "arch_review.inherit_title"}}

{{INHERITANCE_CHECKS}}

{{t "arch_review.inherit_check_rules"}}

{{t "arch_review.inherit_check_method_title"}}
{{t "arch_review.inherit_check_method_steps"}}

### 5. {{t "arch_review.interface_isolation_title"}}

{{t "arch_review.interface_isolation_rules"}}

{{t "arch_review.interface_isolation_method_title"}}
{{t "arch_review.interface_isolation_method_steps"}}

### 6. {{t "arch_review.cycle_detection_title"}}

{{t "arch_review.cycle_detection_method_title"}}
{{t "arch_review.cycle_detection_method_steps"}}

## {{t "arch_review.output_title"}}

```
## 🏗️ {{t "arch_review.title"}}

**{{t "arch_review.output_scope"}}**：[{{t "arch_review.output_scope_value"}}]
**{{t "arch_review.output_result"}}**：✅ {{t "arch_review.output_pass"}} / ⚠️ {{t "arch_review.output_warning"}} / ❌ {{t "arch_review.output_violation"}}

### ❌ {{t "arch_review.output_violation_section"}}

| # | {{t "arch_review.output_col_file"}} | {{t "arch_review.output_col_type"}} | {{t "arch_review.output_col_issue"}} | {{t "arch_review.output_col_fix"}} |
|---|----------|---------|---------|---------|

### ✅ {{t "arch_review.output_passed_section"}}
- [x] {{t "arch_review.output_dep_ok"}}
- [x] {{t "arch_review.output_forbidden_ok"}}
```

## {{t "arch_review.constraints_title"}}

{{t "arch_review.must_do_title"}}
{{t "arch_review.must_do_rules"}}

{{t "arch_review.must_not_title"}}
{{t "arch_review.must_not_rules"}}
