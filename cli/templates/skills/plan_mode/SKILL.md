---
name: plan_mode
description: {{t "plan_mode.description"}}
---

# {{t "plan_mode.title"}}

> {{t "plan_mode.trigger_title"}}
> 1. {{t "plan_mode.trigger_1"}}
> 2. {{t "plan_mode.trigger_2"}}
> 3. {{t "plan_mode.trigger_3"}}
> 4. {{t "plan_mode.trigger_4"}}
>
> {{t "plan_mode.skip"}}

---

## 1 {{t "plan_mode.plan_output_title"}}

```
## 📋 {{t "plan_mode.plan_output_header"}}

**{{t "plan_mode.plan_output_task"}}**：[{{t "plan_mode.plan_output_task_desc"}}]
**{{t "plan_mode.plan_output_modules"}}**：[{{t "plan_mode.plan_output_modules_list"}}]
**{{t "plan_mode.plan_output_files"}}**：[N]
**{{t "plan_mode.plan_output_rules"}}**：[{{t "plan_mode.plan_output_rules_list"}}]

### {{t "plan_mode.plan_output_steps"}}

| # | {{t "plan_mode.plan_output_col_action"}} | {{t "plan_mode.plan_output_col_target"}} | {{t "plan_mode.plan_output_col_dep"}} | {{t "plan_mode.plan_output_col_check"}} |
|---|------|-------------|------|--------|
| 1 | ... | ... | — | ... |

### ⚠️ {{t "plan_mode.plan_output_risks"}}

### ✅ {{t "plan_mode.plan_output_done_criteria"}}
```

---

## 2 {{t "plan_mode.task_templates_title"}}

{{PLATFORM_SPECIFIC_TASK_TEMPLATES}}

{{#if HAS_NDK}}

### 2.N {{t "plan_mode.ndk_templates_title"}}

#### 2.N.1 {{t "plan_mode.ndk_new_jni_title"}}

```
{{t "plan_mode.ndk_new_jni_content"}}
```

#### 2.N.2 {{t "plan_mode.ndk_new_sign_title"}}

```
{{t "plan_mode.ndk_new_sign_content"}}
```

#### 2.N.3 {{t "plan_mode.ndk_update_whitelist_title"}}

```
{{t "plan_mode.ndk_update_whitelist_content"}}
```

{{/if}}

---

## 3 {{t "plan_mode.principles_title"}}

{{t "plan_mode.principles"}}

---

## 4 {{t "plan_mode.collab_title"}}

{{t "plan_mode.collab_table_header"}}
|---------|-----------|
{{t "plan_mode.collab_new_page"}}
{{t "plan_mode.collab_perf"}}
{{t "plan_mode.collab_cross_module"}}
{{t "plan_mode.collab_post_gen"}}
{{#if HAS_NDK}}
| {{t "plan_mode.collab_ndk_new_jni"}} |
| {{t "plan_mode.collab_ndk_new_sign"}} |
| {{t "plan_mode.collab_ndk_update_whitelist"}} |
| {{t "plan_mode.collab_ndk_memory_opt"}} |
{{/if}}

{{t "plan_mode.checkpoint_note"}}
