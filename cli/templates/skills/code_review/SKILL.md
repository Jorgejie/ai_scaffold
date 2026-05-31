---
name: code_review
description: {{t "code_review.description"}}
---

# {{t "code_review.title"}}

> {{t "code_review.trigger_title"}}
> 1. {{t "code_review.trigger_1"}}
> 2. {{t "code_review.trigger_2"}}
> 3. {{t "code_review.trigger_3"}}
> 4. {{t "code_review.trigger_4"}}
>
> {{t "code_review.skip"}}

---

## 1 {{t "code_review.checklist_title"}}

### 1.1 {{t "code_review.fatal_title"}}

| # | Check | Method |
|---|--------|---------|
| 1 | {{t "code_review.fatal_row1"}} |
| 2 | {{t "code_review.fatal_row2"}} |
| 3 | {{t "code_review.fatal_row3"}} |
| 4 | {{t "code_review.fatal_row4"}} |
| 5 | {{t "code_review.fatal_row5"}} |
| 6 | {{t "code_review.fatal_row6"}} |
{{PLATFORM_FATAL_CHECKS}}
{{#if HAS_NDK}}
| F-NDK1 | {{t "code_review.fatal_ndk1"}} |
| F-NDK2 | {{t "code_review.fatal_ndk2"}} |
| F-NDK3 | {{t "code_review.fatal_ndk3"}} |
| F-NDK4 | {{t "code_review.fatal_ndk4"}} |
| F-NDK5 | {{t "code_review.fatal_ndk5"}} |
| F-NDK6 | {{t "code_review.fatal_ndk6"}} |
{{/if}}

### 1.2 {{t "code_review.warning_title"}}

| # | Check | Method |
|---|--------|---------|
| 7 | {{t "code_review.warning_row7"}} |
| 8 | {{t "code_review.warning_row8"}} |
| 9 | {{t "code_review.warning_row9"}} |
| 10 | {{t "code_review.warning_row10"}} |
{{PLATFORM_WARNING_CHECKS}}
{{#if HAS_NDK}}
| W-NDK1 | {{t "code_review.warning_ndk1"}} |
| W-NDK2 | {{t "code_review.warning_ndk2"}} |
| W-NDK3 | {{t "code_review.warning_ndk3"}} |
| W-NDK4 | {{t "code_review.warning_ndk4"}} |
| W-NDK5 | {{t "code_review.warning_ndk5"}} |
{{/if}}

### 1.3 {{t "code_review.suggestion_title"}}

| # | Check | Method |
|---|--------|---------|
| 11 | {{t "code_review.suggestion_row11"}} |
| 12 | {{t "code_review.suggestion_row12"}} |
| 13 | {{t "code_review.suggestion_row13"}} |
| 14 | {{t "code_review.suggestion_row14"}} |
{{PLATFORM_SUGGESTION_CHECKS}}
{{#if HAS_NDK}}
| S-NDK1 | {{t "code_review.suggestion_ndk1"}} |
| S-NDK2 | {{t "code_review.suggestion_ndk2"}} |
| S-NDK3 | {{t "code_review.suggestion_ndk3"}} |
| S-NDK4 | {{t "code_review.suggestion_ndk4"}} |
| S-NDK5 | {{t "code_review.suggestion_ndk5"}} |
{{/if}}

---

## 2 {{t "code_review.output_title"}}

```
## 🔍 {{t "code_review.title"}}

**{{t "code_review.output_scope"}}**：[{{t "code_review.output_scope_value"}}]
**{{t "code_review.output_result"}}**：✅ {{t "code_review.output_pass"}} / ⚠️ N {{t "code_review.output_warnings"}} / ❌ N {{t "code_review.output_fatals"}}

### ❌ {{t "code_review.output_fatal_section"}}

**{{t "code_review.output_issue"}} 1**：[{{t "code_review.output_issue_title"}}]
- **{{t "code_review.output_location"}}**：`file:line`
- **{{t "code_review.output_violated_rule"}}**：[rule]
- **{{t "code_review.output_current_code"}}**：`snippet`
- **{{t "code_review.output_fix"}}**：`fix`

### ⚠️ {{t "code_review.output_warning_section"}}

### 💡 {{t "code_review.output_suggestion_section"}}

### ✅ {{t "code_review.output_passed_section"}}
```

---

## 3 {{t "code_review.flow_title"}}

```
{{t "code_review.flow_content"}}
```

---

## 4 {{t "code_review.collab_title"}}

- {{t "code_review.collab_proactive"}}
- {{t "code_review.collab_arch"}}
- {{t "code_review.collab_resource"}}
{{#if HAS_NDK}}
- {{t "code_review.collab_cpp"}}
{{/if}}
- {{t "code_review.collab_timing_prefix"}} {{ARCH_REVIEW_MODULE_THRESHOLD}}{{t "code_review.collab_timing_suffix"}}{{#if HAS_NDK}}{{t "code_review.collab_timing_ndk"}}{{/if}}
