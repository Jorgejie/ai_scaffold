# AI 辅助开发体系初始化指南

> 本文档指导您如何完成项目的 AI 辅助开发体系初始化。

## 📋 前置条件

- ✅ CLI 已执行完毕，骨架已创建
- ✅ 已在 Claude Code / Qoder / Codex / OpenCode 中打开本项目
- ⏳ 准备开始 AI 深度初始化

## 🚀 快速开始

### 步骤 1: 在 AI 工具中打开本项目

确保您的 AI 编码助手（Claude Code、Qoder、Codex 或 OpenCode）已加载当前项目。

### 步骤 2: 触发初始化流程

在 AI 对话框中输入以下任一指令：

```
按 project_initialization skill 初始化本项目
```

或

```
阅读 .qoder/skills/project_initialization/SKILL.md 并执行初始化
```

*(注意：根据您使用的 AI 工具，目录名可能是 `.claude/`、`.codex/` 或 `.opencode/`)*

### 步骤 3: 跟随 AI 的引导

AI 将自动执行以下步骤：

1. **检测当前状态** - 检查已有文件和配置
2. **扫描项目结构** - 运行 gen_references.py 生成 _scan.json
3. **深度源码分析** - 读取关键源文件，理解项目架构
4. **交互式配置** - 向您询问 7-11 个关键问题以收集项目约束
5. **生成定制化内容** - 基于实际代码生成规则、Agent 和文档
6. **验证与完成** - 检查所有文件是否正确生成

整个过程预计需要 **2-5 分钟**。

## 📊 初始化后将获得什么

### 1. 完整的规则体系
- `rules/project_rule.md` - 基于实际项目架构的定制规则
- `rules/conflict_resolution.md` - 多规则冲突时的裁决机制

### 2. 智能技能系统
- `skills/plan_mode/SKILL.md` - 任务结构化拆分技能
- `skills/code_review/SKILL.md` - 三级代码审查技能

### 3. 专业 Agent 团队
- `agents/arch-review.md` - 架构合规审查
- `agents/resource-sync.md` - 资源一致性检查
- `agents/proactive-correction.md` - 主动纠错与修复
- `agents/cpp-memory-review.md` - C++ 内存安全（仅 NDK 项目）

### 4. 精准的 References 文档
- `references/{module}.md` - 每个模块的详细文档（类、API、设计模式）
- `references/dependencies.md` - 模块依赖关系图
- `references/conventions.md` - 从源码提取的编码约定

### 5. 自动化 Hook 系统
- `hooks/post-edit-tracker.sh` - 自动追踪代码修改
- `hooks/check-review-needed.sh` - 智能提醒代码审查

## 💡 为什么需要 AI 参与初始化？

传统的脚手架工具只能生成**静态模板**，充满占位符如 "Define XXX here"，需要手动填写大量内容。

**ai_scaffold 的创新之处**：

1. **CLI 搭建骨架** - 快速创建目录结构和基础配置
2. **AI 填充内容** - 通过扫描源码、理解架构，生成真正适配项目的规则
3. **动态适应** - 不同项目生成的规则完全不同，完全基于实际代码

例如：
- ❌ 传统方式：`DEPENDENCY_RULES = "Define dependency rules here"`
- ✅ ai_scaffold：`:app → :feature-home → :lib-core (单向依赖，禁止反向)`

## 🔍 CodeGraph 集成说明

如果您的项目已安装 CodeGraph CLI：

- References 采用**轻量模式**（不包含完整文件列表）
- AI 将使用 `codegraph_explore` 工具进行结构化搜索
- 可减少约 90% 的 AI 工具调用

如果未安装 CodeGraph：

- References 采用**完整模式**（包含详细文件树）
- AI 通过 `_scan.json` 了解项目结构
- 仍可正常工作，只是 token 消耗略高

您可以在初始化过程中选择是否安装 CodeGraph。

## ⚙️ 自定义调整

初始化完成后，您可以：

1. **审查规则** - 检查 `rules/project_rule.md` 是否符合项目实际
2. **调整阈值** - 修改触发 code_review 和 arch-review 的文件/模块数量
3. **补充禁止模式** - 添加项目特有的禁止模式
4. **完善 References** - 运行增量更新命令补充更多模块文档

```bash
# 增量更新 references（仅在项目结构变更后）
python .qoder/scripts/gen_references.py --diff
```

## 🆘 常见问题

### Q: AI 没有自动开始初始化怎么办？

A: 明确告诉 AI："请读取 {{DIR}}/skills/project_initialization/SKILL.md 并按照 Phase 0-3 执行初始化"

### Q: 初始化过程中断怎么办？

A: 重新触发初始化，AI 会检测到未完成的状态并继续执行

### Q: 生成的规则不符合项目实际怎么办？

A: 在交互式配置阶段仔细回答问题，初始化完成后也可以手动修改规则文件

### Q: 可以重新初始化吗？

A: 可以！随时再次触发 project_initialization skill，AI 会检测现有文件并增量更新

## 📞 获取帮助

- 项目仓库: https://github.com/Jorgejie/ai_scaffold
- 查看详细文档: README.md
- 报告问题: GitHub Issues

---

**祝您使用愉快！** 🎉
