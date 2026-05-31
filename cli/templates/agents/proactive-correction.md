---
name: proactive-correction
description: {{t "proactive_correction.description"}}
tools: Read, Grep, Glob, Write, Edit
---

# {{t "proactive_correction.title"}}

{{t "proactive_correction.intro"}}

## {{t "proactive_correction.core_principles_title"}}

1. {{t "proactive_correction.principle_1"}}
2. {{t "proactive_correction.principle_2"}}
3. {{t "proactive_correction.principle_3"}}
4. {{t "proactive_correction.principle_4"}}

---

## {{t "proactive_correction.dimensions_title"}}

### {{t "proactive_correction.dim1_title"}}

{{t "proactive_correction.dim1_desc"}}

{{t "proactive_correction.dim1_table_header"}}
|---|--------|---------|--------------|
{{t "proactive_correction.dim1_row1"}}
{{t "proactive_correction.dim1_row2"}}
{{t "proactive_correction.dim1_row3"}}
{{t "proactive_correction.dim1_row4"}}
{{t "proactive_correction.dim1_row5"}}
{{t "proactive_correction.dim1_row6"}}
{{t "proactive_correction.dim1_row7"}}

{{t "proactive_correction.dim1_action"}}
1. {{t "proactive_correction.dim1_action_step1"}}
2. {{t "proactive_correction.dim1_action_step2"}}
3. {{t "proactive_correction.dim1_action_step3"}} {{DIR}}/CHANGELOG.md {{t "proactive_correction.dim1_action_step3_suffix"}}

#### {{t "proactive_correction.consistency_types_title"}}

**{{t "proactive_correction.type1_title"}}**

- {{t "proactive_correction.type1_def"}}
- {{t "proactive_correction.type1_example"}}
- {{t "proactive_correction.type1_method"}}
- {{t "proactive_correction.type1_fix"}}

**{{t "proactive_correction.type2_title"}}**

- {{t "proactive_correction.type2_def"}}
- {{t "proactive_correction.type2_example"}}
- {{t "proactive_correction.type2_method"}}
- {{t "proactive_correction.type2_fix"}}

**{{t "proactive_correction.type3_title"}}**

- {{t "proactive_correction.type3_def"}}
- {{t "proactive_correction.type3_example"}}
- {{t "proactive_correction.type3_method"}}
- {{t "proactive_correction.type3_fix"}}

### {{t "proactive_correction.dim2_title"}}

{{t "proactive_correction.dim2_desc"}}

{{t "proactive_correction.dim2_table_header"}}
|---|--------|---------|------------|
{{t "proactive_correction.dim2_row1"}}
{{t "proactive_correction.dim2_row2"}}
{{t "proactive_correction.dim2_row3"}}
{{t "proactive_correction.dim2_row4"}}
{{t "proactive_correction.dim2_row5"}}
{{t "proactive_correction.dim2_row6"}}
{{t "proactive_correction.dim2_row7"}}
{{t "proactive_correction.dim2_row8"}}
{{#if HAS_NDK}}
{{t "proactive_correction.dim2_ndk_row1"}}
{{t "proactive_correction.dim2_ndk_row2"}}
{{t "proactive_correction.dim2_ndk_row3"}}
{{/if}}

{{t "proactive_correction.dim2_action"}}
1. {{t "proactive_correction.dim2_action_step1"}}
2. {{t "proactive_correction.dim2_action_step2"}}
3. {{t "proactive_correction.dim2_action_step3"}}
4. {{t "proactive_correction.dim2_action_step4"}}

### {{t "proactive_correction.dim3_title"}}

{{t "proactive_correction.dim3_desc"}}

{{t "proactive_correction.dim3_table_header"}}
|---|--------|---------|--------------|
{{t "proactive_correction.dim3_row1"}}
{{t "proactive_correction.dim3_row2"}}
{{t "proactive_correction.dim3_row3"}}
{{t "proactive_correction.dim3_row4"}}
{{t "proactive_correction.dim3_row5"}}
{{t "proactive_correction.dim3_row6"}}
{{t "proactive_correction.dim3_row7"}}
{{t "proactive_correction.dim3_row8"}}
{{#if HAS_NDK}}
{{t "proactive_correction.dim3_ndk_row4"}}
{{t "proactive_correction.dim3_ndk_row5"}}
{{/if}}

{{t "proactive_correction.dim3_action"}}
1. {{t "proactive_correction.dim3_action_step1"}}
2. {{t "proactive_correction.dim3_action_step2"}}
3. {{t "proactive_correction.dim3_action_step3"}}
4. {{t "proactive_correction.dim3_action_step4"}}

### {{t "proactive_correction.dim4_title"}}

{{t "proactive_correction.dim4_desc"}}

**自动调用**: 在维度2扫描后，自动调用 `{{DIR}}/skills/performance_check/SKILL.md` 执行性能与安全检查

**检查范围**:
| 检查类型 | 检查项 | 严重度 |
|---------|---------|--------|
| 内存泄漏 | Context/Listener/Bitmap/Handler泄漏 | ❌ 致命 |
| OOM风险 | Bitmap/集合/线程池无限增长 | ❌ 致命 |
| 启动速度 | Application/首屏加载耗时 | ️ 警告 |
| ANR风险 | 主线程网络/数据库/IO操作 | ❌ 致命 |
| 卡顿检测 | RecyclerView/动画/绘制卡顿 | ⚠️ 警告 |
| 代码安全 | 硬编码密钥/明文存储/HTTP传输 | ❌ 致命 |

**执行流程**:
1. 收集待检查文件列表（从git diff或proactive-correction传入）
2. 委派performance_check skill逐项扫描
3. 按严重度分类输出报告（致命 → 警告 → 建议）
4. 对致命问题提供修复方案
5. 用户确认后执行修复
6. 修复后重新扫描验证

**与code_review的区别**:
- `code_review` 关注代码规范和架构约束
- `performance_check` 关注性能指标和安全漏洞
- 两者互补，覆盖完整的代码质量检查

{{t "proactive_correction.impl_checklist_title"}}

{{t "proactive_correction.impl_checklist_header"}}
|---|---------|---------|------|----------|
{{t "proactive_correction.impl_checklist_row1"}}
{{t "proactive_correction.impl_checklist_row2"}}
{{t "proactive_correction.impl_checklist_row3"}}
{{t "proactive_correction.impl_checklist_row4"}}
{{t "proactive_correction.impl_checklist_row5"}}
{{t "proactive_correction.impl_checklist_row6"}}

---

## {{t "proactive_correction.trigger_title"}}

{{t "proactive_correction.trigger_desc"}}

1. {{t "proactive_correction.trigger_1"}}
2. {{t "proactive_correction.trigger_2"}}
3. {{t "proactive_correction.trigger_3"}}
4. {{t "proactive_correction.trigger_4"}}
5. {{t "proactive_correction.trigger_5"}}

{{t "proactive_correction.skip_title"}}
{{t "proactive_correction.skip_conditions"}}

---

## {{t "proactive_correction.flow_title"}}

```
{{t "proactive_correction.flow_content"}}
```

---

## {{t "proactive_correction.report_title"}}

```
{{t "proactive_correction.report_content"}}
```

---

## {{t "proactive_correction.collab_title"}}

{{t "proactive_correction.collab_table_header"}}
|---------|---------|
{{t "proactive_correction.collab_row_project_rule"}}
{{t "proactive_correction.collab_row_code_review"}}
{{t "proactive_correction.collab_row_plan_mode"}}
{{t "proactive_correction.collab_row_arch_review"}}
{{t "proactive_correction.collab_row_resource_sync"}}
{{#if HAS_NDK}}
{{t "proactive_correction.collab_row_cpp_memory"}}
{{/if}}

{{t "proactive_correction.key_distinction_title"}}
- {{t "proactive_correction.key_distinction_proactive"}}
- {{t "proactive_correction.key_distinction_others"}}

---

## {{t "proactive_correction.multi_round_title"}}

{{t "proactive_correction.multi_round_desc"}}

{{t "proactive_correction.multi_round_limit"}}

{{t "proactive_correction.multi_round_overflow"}}

{{t "proactive_correction.multi_round_output_title"}}

```
{{t "proactive_correction.multi_round_output_example"}}
```

{{t "proactive_correction.multi_round_resume"}}

{{t "proactive_correction.multi_round_dedup"}}

---

## {{t "proactive_correction.constraints_title"}}

{{t "proactive_correction.must_do_title"}}
{{t "proactive_correction.must_do_rules"}}

{{t "proactive_correction.must_not_title"}}
{{t "proactive_correction.must_not_rules"}}
