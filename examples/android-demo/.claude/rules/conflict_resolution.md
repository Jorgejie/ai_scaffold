# 规则冲突解决

> 本文件定义多规则同时加载时的优先级裁决机制。
> 每条规则文件头部通过 HTML 注释声明 `id`、`domains`、`priority`。

## 优先级原则

1. **特定领域规则优先于通用规则** — domain 更窄者在其领域内胜出
2. **priority 数值越高，在其声明的 domain 内优先级越高** — 仅在 domain 重叠时比较
3. **规则默认叠加，仅冲突条目按优先级裁决** — 非冲突部分全部保留
4. **裁决表未覆盖的冲突 → 向用户确认** — 确认后补充登记到本表

## 当前规则 Domain 注册

| 规则 ID | priority | domains |
|---------|----------|---------|
| project_rule | 100 | general, code_quality, architecture, android |

## 已知冲突裁决表

| # | 冲突场景 | 规则A 指导 | 规则B 指导 | 裁决 | 原因 |
|---|---------|-----------|-----------|------|------|
| 1 | proactive-correction 发现致命违规 vs. code_review 仅报告 | proactive-correction 主动提修正方案并推动闭环 | code_review 只报告不推动修正 | proactive-correction 优先 | 致命问题必须闭环解决，仅报告会导致问题遗留 |
| 2 | proactive-correction 扫描存量代码违规 vs. arch-review 只扫变更代码 | proactive-correction 扫全量代码 | arch-review 只扫变更部分 | proactive-correction 扫全量，arch-review 扫变更 | 全量违规和变更引入的违规性质不同，需分别处理 |
| 3 | proactive-correction 发现规则自洽性缺陷 vs. project_rule 禁止模式表 | proactive-correction 认为规则有遗漏/矛盾 | project_rule 定义了当前禁止模式 | project_rule 优先，但 proactive-correction 应记录并提示用户 | 规则由用户定义，agent 不能自行修改规则，但必须主动提醒 |
| 4 | proactive-correction 要求修正 vs. 用户拒绝修正 | proactive-correction 推动修正闭环 | 用户选择不修正 | 用户决策优先 | 纠错需用户确认，用户有权拒绝修正 |
| 5 | proactive-correction 同一轮限 5 文件 vs. 发现更多违规 | proactive-correction 限制每轮最多修改 5 文件 | 实际存在 > 5 个违规文件 | 5 文件限制优先，剩余违规记录为"已知但未修正" | 防止过度修改失控，多轮迭代处理 |
| 6 | plan_mode 纠错检查点触发 vs. 用户说"直接做" | plan_mode 每步完成后触发纠错扫描 | 用户要求跳过检查直接执行 | 用户优先，但致命问题仍需标记 | 用户有权决定流程节奏，但致命问题不得静默忽略 |
| — | 其他暂无 | — | — | — | 待项目发展中补充 |

## 新增规则登记流程

1. 在新规则文件头部添加 `id`、`domains`、`priority` 元数据注释
2. 在 Domain 注册表中登记
3. 检查新规则 domains 与已有规则的交集
4. 识别冲突点，在裁决表中登记
5. 裁决原则：领域更窄/更专业的规则优先
6. 在 `CLAUDE.md` 中添加触发条件和核心约束摘要

## 裁决表维护规范

- AI 在实际场景中遇到未覆盖的冲突，应提示用户并记录
- 裁决表更新需同步更新 `.claude/CHANGELOG.md`
- 裁决理由必须写明，禁止留空
