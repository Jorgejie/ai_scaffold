<!--
id: project_rule
domains: [{{DOMAINS}}]
priority: 100
triggers: [code_generation, code_modification, code_review, refactoring, bug_fix, feature_development]
mandatory: true
-->
# {{PROJECT_NAME}} {{t "project_rule.title"}}

> {{t "project_rule.scope"}}
> {{t "project_rule.skip_conditions"}}

### {{t "project_rule.negative_title"}}

{{t "project_rule.negative_table_header"}}
|---------|------|------|
{{t "project_rule.negative_row1"}}
{{t "project_rule.negative_row2"}}
{{t "project_rule.negative_row3"}}
{{t "project_rule.negative_row4"}}

---

## 1 {{t "project_rule.conduct_title"}}

{{#if HAS_CODEGRAPH}}
- {{t "project_rule.conduct_codegraph_search"}} `{{DIR}}/references/` {{t "project_rule.conduct_codegraph_search_suffix"}}
- {{t "project_rule.conduct_no_fabrication"}}
- {{t "project_rule.conduct_no_new_deps"}} `{{DIR}}/references/dependencies.md` {{t "project_rule.conduct_no_new_deps_suffix"}}
- {{t "project_rule.conduct_codegraph_lightweight"}}
{{else}}
- {{t "project_rule.conduct_search_first"}} `{{DIR}}/references/` {{t "project_rule.conduct_search_first_suffix"}}
- {{t "project_rule.conduct_no_fabrication"}}
- {{t "project_rule.conduct_no_new_deps"}} `{{DIR}}/references/dependencies.md` {{t "project_rule.conduct_no_new_deps_suffix"}}
{{/if}}
- {{t "project_rule.conduct_reuse"}}
- {{t "project_rule.conduct_confirm"}}

### 1.N {{t "project_rule.proactive_title"}}

- {{t "project_rule.proactive_scan"}}
- {{t "project_rule.proactive_fix"}}
- {{t "project_rule.proactive_rules"}}
- {{t "project_rule.proactive_closure"}}
- {{t "project_rule.proactive_confirm"}}
- {{t "project_rule.proactive_limit"}}

---

## 2 {{t "project_rule.arch_title"}}

### 2.1 {{t "project_rule.arch_dep_title"}}
{{DEPENDENCY_RULES}}

### 2.2 {{t "project_rule.arch_comm_title"}}
{{t "project_rule.arch_comm_desc"}}

### 2.3 {{t "project_rule.arch_inherit_title"}}
{{INHERITANCE_RULES}}

---

## 3 {{t "project_rule.forbidden_title"}}

{{t "project_rule.forbidden_desc"}}

{{t "project_rule.forbidden_table_header"}}
|---|---------|---------|------|
{{FORBIDDEN_PATTERNS_TABLE}}

---

## 4 {{t "project_rule.naming_title"}}

### 4.1 {{t "project_rule.naming_resource_title"}}
{{RESOURCE_PREFIXES}}

### 4.2 {{t "project_rule.naming_class_title"}}
{{CLASS_NAMING}}

### 4.3 {{t "project_rule.naming_layout_title"}}
{{LAYOUT_NAMING}}

---

## 5 {{PLATFORM}} {{t "project_rule.platform_title"}}

{{PLATFORM_SPECIFIC_RULES}}

{{#if HAS_NDK}}

### 5.N {{t "project_rule.ndk_title"}}

#### 5.N.1 {{t "project_rule.ndk_jni_memory_title"}}

{{t "project_rule.ndk_jni_memory_desc"}}

{{t "project_rule.ndk_jni_memory_table_header"}}
|---|------|------|
{{t "project_rule.ndk_jni_memory_row1"}}
{{t "project_rule.ndk_jni_memory_row2"}}
{{t "project_rule.ndk_jni_memory_row3"}}
{{t "project_rule.ndk_jni_memory_row4"}}
{{t "project_rule.ndk_jni_memory_row5"}}
{{t "project_rule.ndk_jni_memory_row6"}}

#### 5.N.2 {{t "project_rule.ndk_jni_coding_title"}}

{{t "project_rule.ndk_jni_coding_table_header"}}
|---|------|------|
{{t "project_rule.ndk_jni_coding_row1"}}
{{t "project_rule.ndk_jni_coding_row2"}}
{{t "project_rule.ndk_jni_coding_row3"}}
{{t "project_rule.ndk_jni_coding_row4"}}

#### 5.N.3 {{t "project_rule.ndk_memory_safety_title"}}

| # | Rule | Description |
|---|------|------|
| 1 | {{t "project_rule.ndk_memory_safety_row1"}} |
| 2 | {{t "project_rule.ndk_memory_safety_row2"}} |
| 3 | {{t "project_rule.ndk_memory_safety_row3"}} |
| 4 | {{t "project_rule.ndk_memory_safety_row4"}} |
| 5 | {{t "project_rule.ndk_memory_safety_row5"}} |
| 6 | {{t "project_rule.ndk_memory_safety_row6"}} |

#### 5.N.4 {{t "project_rule.ndk_build_title"}}

| # | Rule | Description |
|---|------|------|
| 2 | {{t "project_rule.ndk_build_row2"}} |
| 3 | {{t "project_rule.ndk_build_row3"}} |
| 4 | {{t "project_rule.ndk_build_row4"}} |
| 5 | {{t "project_rule.ndk_build_row5"}} |
| 6 | {{t "project_rule.ndk_build_row6"}} |

{{/if}}

---

## 6 {{t "project_rule.quality_title"}}

{{t "project_rule.quality_rules"}}

{{#if HAS_NDK}}

### 6.N {{t "project_rule.quality_ndk_title"}}

{{t "project_rule.quality_ndk_rules"}}

{{/if}}

---

## 7 {{t "project_rule.checklist_title"}}

{{t "project_rule.checklist_desc"}}

{{t "project_rule.checklist_table_header"}}
|---|--------|
{{t "project_rule.checklist_row1"}}
{{t "project_rule.checklist_row2"}}
{{t "project_rule.checklist_row3"}}
{{t "project_rule.checklist_row4"}}
{{t "project_rule.checklist_row5"}}
{{t "project_rule.checklist_row6"}}
{{t "project_rule.checklist_rowC1"}}
{{t "project_rule.checklist_rowC2"}}
{{t "project_rule.checklist_rowC3"}}
{{PLATFORM_SELF_CHECK_ITEMS}}
{{#if HAS_NDK}}
| N1 | {{t "project_rule.checklist_ndk_row1"}} |
| N2 | {{t "project_rule.checklist_ndk_row2"}} |
| N3 | {{t "project_rule.checklist_ndk_row3"}} |
| N4 | {{t "project_rule.checklist_ndk_row4"}} |
| N5 | {{t "project_rule.checklist_ndk_row5"}} |
| N6 | {{t "project_rule.checklist_ndk_row6"}} |
| N7 | {{t "project_rule.checklist_ndk_row7"}} |
| N8 | {{t "project_rule.checklist_ndk_row8"}} |
| N9 | {{t "project_rule.checklist_ndk_row9"}} |
| N10 | {{t "project_rule.checklist_ndk_row10"}} |
{{/if}}

---

## 8 {{DIR}} {{t "project_rule.config_title"}}

{{t "project_rule.config_desc"}} `{{DIR}}/` {{t "project_rule.config_desc_suffix"}}

1. {{t "project_rule.config_step1"}} `{{DIR}}/CHANGELOG.md` {{t "project_rule.config_step1_suffix"}}
2. {{t "project_rule.config_step2_prefix"}} `{{ENTRY}}` {{t "project_rule.config_step2_suffix"}}

{{t "project_rule.config_version_table_header"}}
|---------|---------|
{{t "project_rule.config_version_row1"}}
{{t "project_rule.config_version_row2"}}
{{t "project_rule.config_version_row3"}}

{{t "project_rule.config_scope"}}

{{t "project_rule.config_scope_table_header"}}
|------|------|
| `{{ENTRY}}` | {{t "project_rule.config_scope_entry"}} |
| `{{DIR}}/rules/*.md` | {{t "project_rule.config_scope_rules"}} |
| `{{DIR}}/skills/*/SKILL.md` | {{t "project_rule.config_scope_skills"}} |
| `{{DIR}}/agents/*.md` | {{t "project_rule.config_scope_agents"}} |
| `{{DIR}}/hooks/*.sh` | {{t "project_rule.config_scope_hooks"}} |
| `{{DIR}}/settings.json` | {{t "project_rule.config_scope_settings"}} |
| `{{DIR}}/references/*.md` | {{t "project_rule.config_scope_references"}} |
| `{{DIR}}/scripts/*` | {{t "project_rule.config_scope_scripts"}} |
