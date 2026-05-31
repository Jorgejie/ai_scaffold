{{ENTRY_VERSION_LINE}}
# {{ENTRY}}

> ⚠️ **本项目尚未完成AI辅助体系初始化**
> 
> ## 🚀 快速开始
> 
> **在{{TARGET_DISPLAY}}中执行以下指令**:
> ```
> 阅读 {{DIR}}/skills/project_initialization/SKILL.md
> 然后按其中的Phase 0-3完成本项目初始化
> ```
> 
> 或者直接说: "按 project_initialization skill 初始化本项目"

## 项目基本信息

- **平台**: {{PLATFORM}} / {{BUILD_SYSTEM}}
- **语言**: {{LANGUAGE}}
- **NDK/C++**: {{#if HAS_NDK}}是{{else}}否{{/if}}
- **CodeGraph**: {{#if HAS_CODEGRAPH}}已安装（轻量模式）{{else}}未安装（完整模式）{{/if}}
- **包名/命名空间**: {{PACKAGE_NAME}}

## 待初始化内容

AI将根据实际项目源码生成以下内容：

- [ ] `{{DIR}}/rules/project_rule.md` - 项目主规则（基于实际架构）
- [ ] `{{DIR}}/rules/conflict_resolution.md` - 冲突裁决框架
- [ ] `{{DIR}}/skills/plan_mode/SKILL.md` - 任务规划技能
- [ ] `{{DIR}}/skills/code_review/SKILL.md` - 代码审查技能
- [ ] `{{DIR}}/agents/arch-review.md` - 架构审查Agent
- [ ] `{{DIR}}/agents/resource-sync.md` - 资源同步Agent
- [ ] `{{DIR}}/agents/proactive-correction.md` - 主动纠错Agent
{{#if HAS_NDK}}
- [ ] `{{DIR}}/agents/cpp-memory-review.md` - C++内存安全Agent
{{/if}}
- [ ] `{{DIR}}/references/` - 模块文档目录（需AI扫描源码生成）
  - `_scan.json` - 项目结构扫描数据
  - `{module}.md × N` - 各模块详细文档
  - `dependencies.md` - 依赖关系图
  - `conventions.md` - 编码约定

## 当前状态

✅ **已完成**:
- CLI骨架搭建
- 基础目录结构创建
- 项目类型检测
- 配置文件生成

⏳ **待完成** (需要AI执行):
- 深度源码分析
- 定制化规则生成
- References文档生成
- 入口文件完善

---

*此文件由 ai-scaffold CLI 自动生成，将在AI完成初始化后被替换为完整版本*

*更多信息请查看: `AI_INIT_GUIDE.md`*
