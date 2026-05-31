---
name: ai_scaffold
description: Bootstrap AI coding assistance into ANY project. Supports 4 AI tools — Claude Code, Qoder, Codex, OpenCode. All tools share EXACTLY the same split-file architecture (rules/skills/agents/hooks/references loaded on-demand). Only the entry file name and config directory name differ.
---

# AI Coding Assistance Bootstrap — 通用项目 AI 辅助开发体系初始化

> **核心原则**：四种体系使用**完全相同的分包架构**。差异仅在于入口文件名和配置目录名。

---

## 架构设计

```
                          npx ai-scaffold
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
   │  detect.js   │   │  prompts.js  │   │   render.js      │
   │              │   │              │   │                  │
   │  Platform    │   │  Language    │   │  Handlebars      │
   │  Build Sys   │──▶│  AI Tool     │──▶│  Templates       │
   │  Language    │   │  Config      │   │  + i18n (zh/en)  │
   │  NDK/C++     │   │  CodeGraph   │   │  + Platform Vars │
   │  CodeGraph   │   │  (Phase 1.5) │   │                  │
   └──────────────┘   └──────────────┘   └────────┬─────────┘
                                                   │
           Transaction-safe: temp → validate → atomic commit
                                                   │
                                                   ▼
  ┌─────────────────────────────────────────────────────────┐
  │                    Generated Output                      │
  │                                                         │
  │  ┌─────────────┐  ┌──────────┐  ┌──────────┐           │
  │  │ CLAUDE.md / │  │  rules/  │  │ skills/  │           │
  │  │ AGENTS.md   │  │          │  │          │           │
  │  │             │  │ project  │  │ plan_mode│           │
  │  │ Entry point │  │ _rule.md │  │ SKILL.md │           │
  │  │ + triggers  │  │ conflict │  │ code_    │           │
  │  │ + CodeGraph │  │ _resolu  │  │ review   │           │
  │  │   section   │  │ tion.md  │  │ SKILL.md │           │
  │  └─────────────┘  └──────────┘  └──────────┘           │
  │                                                         │
  │  ┌─────────────────────────┐  ┌────────────────────┐    │
  │  │        agents/          │  │   hooks/ + scripts/ │    │
  │  │                         │  │                     │    │
  │  │  arch-review.md         │  │  post-edit-         │    │
  │  │  resource-sync.md       │  │  tracker.sh  ──▶    │    │
  │  │  proactive-correction   │  │  check-review-      │    │
  │  │  cpp-memory-review.md   │  │  needed.sh   ──▶    │    │
  │  │  (NDK only)             │  │  gen_references.py  │    │
  │  └─────────────────────────┘  │  (--lightweight     │    │
  │                               │   with CodeGraph)   │    │
  │  ┌─────────────────────────┐  └────────────────────┘    │
  │  │      references/        │                            │
  │  │  (generated later)      │                            │
  │  │  _scan.json → AI → .md  │                            │
  │  └─────────────────────────┘                            │
  └─────────────────────────────────────────────────────────┘

  Platform Plugins (dynamic import)
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │ Android  │   iOS    │ HarmonyOS│ Flutter  │  RN      │
  │ Gradle   │  Xcode   │  Hvigor  │ Dart Pub │ npm/yarn │
  │ MVVM     │ SwiftUI  │ ArkUI    │ Widget   │ TurboMod │
  └──────────┴──────────┴──────────┴──────────┴──────────┘
```

**四种体系的文件目录结构完全一致**：

| | Qoder | Claude Code | Codex | OpenCode |
|------|--------|-------------|-------|----------|
| 入口文件 | `AGENTS.md` | `CLAUDE.md` | `AGENTS.md` | `AGENTS.md` |
| 配置目录 | `.qoder/` | `.claude/` | `.codex/` | `.opencode/` |
| 规则目录 | `.qoder/rules/` | `.claude/rules/` | `.codex/rules/` | `.opencode/rules/` |
| 技能目录 | `.qoder/skills/` | `.claude/skills/` | `.codex/skills/` | `.opencode/skills/` |
| Agent目录 | `.qoder/agents/` | `.claude/agents/` | `.codex/agents/` | `.opencode/agents/` |
| Hook目录 | `.qoder/hooks/` | `.claude/hooks/` | `.codex/hooks/` | `.opencode/hooks/` |
| 脚本目录 | `.qoder/scripts/` | `.claude/scripts/` | `.codex/scripts/` | `.opencode/scripts/` |
| 引用目录 | `.qoder/references/` | `.claude/references/` | `.codex/references/` | `.opencode/references/` |
| Hook配置 | `.qoder/settings.json` | `.claude/settings.json` | `.codex/settings.json` | `.opencode/settings.json` |
| 版本记录 | `.qoder/CHANGELOG.md` | `.claude/CHANGELOG.md` | `.codex/CHANGELOG.md` | `.opencode/CHANGELOG.md` |

> **所有目录内的文件内容完全相同**。唯一区别：入口文件第一行版本注释中的路径 + settings.json 中 hook 脚本的路径。

---

## Phase 0: 体系检测与语言选择

### 0.1 语言选择

```
询问用户：生成文件使用哪种语言？
  1. 中文 (Chinese)
  2. English

选择 1 → LANG = "zh", TEMPLATE_DIR = "templates"
选择 2 → LANG = "en", TEMPLATE_DIR = "templates/en"
```

> **注意**：语言选择影响以下文件的生成内容：入口文件 ({{ENTRY}})、project_rule.md、conflict_resolution.md、code_review SKILL.md、plan_mode SKILL.md。
> hooks/、scripts/、settings.json 等技术性文件不受语言影响。

### 0.2 体系检测

```bash
# 检测已有体系文件
# 优先级：用户显式指定 > 文件系统检测 > 询问用户

存在 .qoder/       → TARGET = "qoder",     DIR = ".qoder",     ENTRY = "AGENTS.md"
存在 CLAUDE.md     → TARGET = "claude",    DIR = ".claude",    ENTRY = "CLAUDE.md"
存在 .codex/       → TARGET = "codex",     DIR = ".codex",     ENTRY = "AGENTS.md"
存在 .opencode/    → TARGET = "opencode",  DIR = ".opencode",  ENTRY = "AGENTS.md"
都不存在           → 询问用户选择
```

---

## Phase 1: 项目分析（通用）

### 平台检测

```
settings.gradle / build.gradle.kts  → Android / Gradle
hvigor-config.json5                 → Harmony / Hvigor
*.xcodeproj / Package.swift         → iOS / Xcode / SPM
pubspec.yaml                        → Flutter
package.json + react-native         → React Native
```

### NDK / C++ 检测

```
# 在平台检测之后，自动检测项目是否包含 C++ / NDK 代码
# 检测到时设置 HAS_NDK = true，影响后续 Phase 2-3 的变量生成

存在 jni/ 目录 + Android.mk/CMakeLists.txt   → HAS_NDK = true
存在 *.cpp / *.c / *.h 源文件               → HAS_NDK = true
存在 CMakeLists.txt（非 Android）             → HAS_NDK = true
存在 Makefile / configure.ac / meson.build   → HAS_NDK = true
以上都不存在                                    → HAS_NDK = false
```

### CodeGraph 检测

```
# 在 NDK 检测之后，自动检测用户本地是否安装了 CodeGraph CLI
# 检测到时设置 HAS_CODEGRAPH = true，影响后续 Phase 2-3 的行为

执行 codegraph --version 命令（3s 超时）
  成功  → HAS_CODEGRAPH = true（参考文档采用轻量模式）
  失败  → HAS_CODEGRAPH = false（参考文档采用完整模式）
```

> **CodeGraph** 是一个代码关系图工具，可为 AI 提供项目结构探索能力（类/方法/符号搜索）。安装后可减少约 90% 的 AI 工具调用。

### 模块结构 + 源码扫描

- 解析模块列表和依赖关系
- 扫描源码目录，提取主包名
- 确定源文件扩展名列表
- 提取构建环境信息（版本号等）

### 输出摘要

```
📋 项目分析：
- 目标体系：{{TARGET}}
- 平台：{{PLATFORM}} / {{BUILD_SYSTEM}} / {{LANGUAGE}}
- X 个模块：[模块列表]
- 主包名：{{PACKAGE_NAME}}
- 源文件扩展名：{{SOURCE_EXTENSIONS}}
- NDK / C++ 项目：{{HAS_NDK}} (true/false)
- CodeGraph：{{#if HAS_CODEGRAPH}}已安装（轻量参考模式）{{else}}未安装（完整参考模式）{{/if}}
```

---

## Phase 2: 交互配置（通用）

7 组问题收集项目特有信息。所有体系使用同一套变量。当 `HAS_NDK = true` 时，追加 Q8 问题组。当 `HAS_CODEGRAPH = false` 时，在配置问题之前增加 Phase 1.5 安装提示。

| 组 | 变量 | 说明 |
|----|------|------|
| Q1 项目身份 | PROJECT_NAME, PROJECT_DESCRIPTION, PACKAGE_NAME, AI_NAME | 项目基本信息 |
| Q2 构建环境 | BUILD_COMMAND_DEBUG, BUILD_COMMAND_RELEASE, HAS_TESTS, BUILD_ENV_TABLE | 构建和测试命令 |
| Q3 架构约束 | DEPENDENCY_RULES, COMMUNICATION_MECHANISM, INHERITANCE_RULES | 模块依赖和通信方式 |
| Q4 禁止模式 | FORBIDDEN_PATTERNS_TABLE | "禁止什么 → 应使用什么" |
| Q5 命名规范 | RESOURCE_PREFIXES, CLASS_NAMING, LAYOUT_NAMING | 命名约定 |
| Q6 强制规则 | REVIEW_FILE_THRESHOLD, ARCH_REVIEW_MODULE_THRESHOLD | 触发阈值（默认2/3） |
| Q7 平台细节 | PLATFORM_SPECIFIC_RULES, BUILD_ENV_TABLE 等 | 平台特定的 SDK/框架版本 |
| Q8 NDK/C++ 配置（仅 HAS_NDK=true） | NDK_BUILD_SYSTEM, JNI_REGISTRATION_METHOD, NDK_ABI_TARGETS, NDK_SECURITY_FLAGS | NDK 构建和 JNI 配置 |

#### Phase 1.5: CodeGraph 安装提示（在配置问题之前执行）

当 `HAS_CODEGRAPH = false` 时，询问用户是否安装 CodeGraph：

| 用户选择 | 行为 |
|---------|------|
| ✅ 安装 | 自动执行 `npx @colbymchenry/codegraph` 安装 CLI，然后执行 `codegraph init` 在项目下初始化 |
| ❌ 跳过 | 正常继续，references/ 采用完整模式（包含文件列表、目录树等结构信息） |

安装成功后设置 `HAS_CODEGRAPH = true`，影响后续生成行为：
- `project_rule.md` §1 行为准则使用 CodeGraph 版本（AI 优先使用 `codegraph_explore` 工具）
- `{{ENTRY}}` 入口文件追加 CodeGraph 集成说明
- `gen_references.py` 推荐使用 `--lightweight` 标志（跳过文件列表/目录树）
- `references/` 仅包含架构决策、业务逻辑摘要和项目约定

安装失败不阻塞流程，降级为完整模式继续。

#### Q8 详解（仅当 HAS_NDK=true 时询问）

| 变量 | 问题 | 默认值 |
|------|------|--------|
| NDK_BUILD_SYSTEM | 构建系统是 ndk-build 还是 CMake？ | ndk-build |
| JNI_REGISTRATION_METHOD | JNI native 方法注册方式：动态（RegisterNatives in JNI_OnLoad）还是静态（javah 生成的函数名）？ | 动态 |
| NDK_ABI_TARGETS | 需要支持的 ABI 架构？ | armeabi-v7a, arm64-v8a |
| NDK_SECURITY_FLAGS | 安全编译选项？ | -fstack-protector-all -fvisibility=hidden |

---

## Phase 3: 生成

### 生成规则

1. 所有文件从 `ai_scaffold_skill/` 下的模板生成
2. 模板中的 `{{VARIABLE}}` 用 Phase 1+2 收集的值替换
3. `{{DIR}}` = 配置目录名（`.qoder` / `.claude` / `.codex` / `.opencode`）
4. `{{ENTRY}}` = 入口文件名（`AGENTS.md` / `CLAUDE.md`）
5. `{{ENTRY_VERSION_LINE}}` = `<!-- {{DIR}}-version: v1.0.0 ({{GENERATION_DATE}}) -->`
6. `{{TEMPLATE_DIR}}` = 模板目录（`templates` / `templates/en`），由 Phase 0 语言选择决定
7. 语言相关文件从 `{{TEMPLATE_DIR}}/` 读取，语言无关文件从 `templates/`（固定）读取
8. 目标路径均为 `{{DIR}}/xxx`，复制到项目根目录
9. `{{#if HAS_CODEGRAPH}}...{{/if}}` 条件分支控制 CodeGraph 相关内容的生成（参考文档轻量模式 vs 完整模式）
10. `{{#if HAS_NDK}}...{{/if}}` 条件分支控制 NDK/C++ 相关内容的生成

### 生成文件清单

按以下顺序生成，每个文件从对应模板读取、替换变量、写入目标路径：

| # | 模板文件 | 目标路径 | 语言 | 说明 |
|---|---------|---------|------|------|
| 1 | `{{TEMPLATE_DIR}}/CHANGELOG.md` | `{{DIR}}/CHANGELOG.md` | ✅ | 版本记录 |
| 2 | `templates/settings.json` | `{{DIR}}/settings.json` | — | Hook 注册 |
| 3 | `templates/settings.local.json` | `{{DIR}}/settings.local.json` | — | 本地权限 |
| 4 | `hooks/post-edit-tracker.sh` | `{{DIR}}/hooks/post-edit-tracker.sh` | — | 编辑追踪钩子 |
| 5 | `hooks/check-review-needed.sh` | `{{DIR}}/hooks/check-review-needed.sh` | — | 审查提醒钩子 |
| 6 | `{{TEMPLATE_DIR}}/rules/project_rule.md` | `{{DIR}}/rules/project_rule.md` | ✅ | 项目开发主规则 |
| 7 | `{{TEMPLATE_DIR}}/rules/conflict_resolution.md` | `{{DIR}}/rules/conflict_resolution.md` | ✅ | 冲突裁决框架 |
| 8 | `{{TEMPLATE_DIR}}/skills/plan_mode/SKILL.md` | `{{DIR}}/skills/plan_mode/SKILL.md` | ✅ | 任务规划技能 |
| 9 | `{{TEMPLATE_DIR}}/skills/code_review/SKILL.md` | `{{DIR}}/skills/code_review/SKILL.md` | ✅ | 代码审查技能 |
| 10 | `{{TEMPLATE_DIR}}/agents/arch-review.md` | `{{DIR}}/agents/arch-review.md` | ✅ | 架构审查 agent |
| 11 | `{{TEMPLATE_DIR}}/agents/resource-sync.md` | `{{DIR}}/agents/resource-sync.md` | ✅ | 资源同步 agent |
| 11a | `{{TEMPLATE_DIR}}/agents/cpp-memory-review.md` | `{{DIR}}/agents/cpp-memory-review.md` | ✅ | C++ 内存安全审查 agent（仅 HAS_NDK=true） |
| 11b | `{{TEMPLATE_DIR}}/agents/proactive-correction.md` | `{{DIR}}/agents/proactive-correction.md` | ✅ | 主动纠错 agent |
| 12 | `scripts/gen_references.py` | `{{DIR}}/scripts/gen_references.py` | — | 模块文档生成器 |
| 13 | —（自动生成） | `{{DIR}}/references/{module}.md` × N | 模块参考文档 |
| 14 | —（自动生成） | `{{DIR}}/references/dependencies.md` | 依赖关系文档 |
| 15 | —（自动生成） | `{{DIR}}/references/conventions.md` | 编码约定文档 |
| 16 | —（从下方模板生成） | `{{ENTRY}}` | 入口调度层 |

### 文件 1-5: 基础配置

**文件 1** `templates/CHANGELOG.md` → `{{DIR}}/CHANGELOG.md`
: 版本记录。替换 `{{DIR}}`、`{{ENTRY}}`、`{{PROJECT_NAME}}`、`{{GENERATION_DATE}}`。

**文件 2** `templates/settings.json` → `{{DIR}}/settings.json`
: Hook 注册配置。替换 `{{DIR}}`。

**文件 3** `templates/settings.local.json` → `{{DIR}}/settings.local.json`
: 本地权限模板，无需替换。

**文件 4** `hooks/post-edit-tracker.sh` → `{{DIR}}/hooks/post-edit-tracker.sh`
: 编辑追踪钩子。替换 `__DIR__` 为 `{{DIR}}`，`kt|java|xml|gradle` 为 `{{SOURCE_EXTENSIONS}}`。

**文件 5** `hooks/check-review-needed.sh` → `{{DIR}}/hooks/check-review-needed.sh`
: 审查提醒钩子。替换 `__DIR__` 为 `{{DIR}}`，`2` 为 `{{REVIEW_FILE_THRESHOLD}}`。

### 文件 6-7: 规则

**文件 6** `templates/rules/project_rule.md` → `{{DIR}}/rules/project_rule.md`
: 项目主规则。替换所有 `{{VARIABLE}}`。关键内容：
- §1 行为准则（先查后写、禁止虚构、优先复用、不确定即确认）
- §2 架构约束（{{DEPENDENCY_RULES}} + {{COMMUNICATION_MECHANISM}} + {{INHERITANCE_RULES}}）
- §3 禁止模式表（{{FORBIDDEN_PATTERNS_TABLE}}）
- §4 命名规范（{{RESOURCE_PREFIXES}} + {{CLASS_NAMING}} + {{LAYOUT_NAMING}}）
- §5 {{PLATFORM}} 专项规则
- §5.N C++ / NDK 专项规则（仅 HAS_NDK=true 时包含）
- §6-7 代码质量规则 + 自查清单（含 NDK 内存安全自查项）
- §8 {{DIR}} 配置变更管理

**文件 7** `templates/rules/conflict_resolution.md` → `{{DIR}}/rules/conflict_resolution.md`
: 冲突裁决框架。替换 `{{DOMAINS}}`、`{{ENTRY}}`、`{{DIR}}`。

### 文件 8-9: 技能

**文件 8** `templates/skills/plan_mode/SKILL.md` → `{{DIR}}/skills/plan_mode/SKILL.md`
: 任务规划技能。替换 `{{PLATFORM_SPECIFIC_TASK_TEMPLATES}}`。

**文件 9** `templates/skills/code_review/SKILL.md` → `{{DIR}}/skills/code_review/SKILL.md`
: 代码审查技能。替换 `{{PLATFORM_FATAL_CHECKS}}`、`{{PLATFORM_WARNING_CHECKS}}`、`{{PLATFORM_SUGGESTION_CHECKS}}`、`{{ARCH_REVIEW_MODULE_THRESHOLD}}`。

### 文件 10-11: Agent

**文件 10** `templates/agents/arch-review.md` → `{{DIR}}/agents/arch-review.md`
: 架构审查 agent。替换 `{{PROJECT_NAME}}`、`{{DEPENDENCY_RULES}}`、`{{FORBIDDEN_PATTERNS_SEARCH_TABLE}}`、`{{COMMUNICATION_MECHANISM_CHECKS}}`、`{{INHERITANCE_CHECKS}}`。

**文件 11** `templates/agents/resource-sync.md` → `{{DIR}}/agents/resource-sync.md`
: 资源同步 agent。替换 `{{PLATFORM_RESOURCE_SYNC_CONTENT}}`。

**文件 11a** `templates/agents/cpp-memory-review.md` → `{{DIR}}/agents/cpp-memory-review.md`
: C++ / NDK 内存安全审查 agent。**仅当 `HAS_NDK = true` 时生成**。无占位符替换，直接复制。职责：检测 JNI 引用泄漏、C 堆内存泄漏、缓冲区溢出、敏感数据残留、代码合理性。

**文件 11b** `templates/agents/proactive-correction.md` → `{{DIR}}/agents/proactive-correction.md`
: 主动纠错 agent。替换 `{{PROJECT_NAME}}`、`{{DIR}}`、`{{PACKAGE_NAME}}`、`{{CLASS_NAMING}}`、`{{LAYOUT_NAMING}}`{{#if HAS_NDK}}、`{{HAS_NDK}}`{{/if}}。职责：主动扫描规则自洽性、存量代码合规性、实现合理性，发现问题时主动提出修正方案并推动闭环。与被动审查 agent（arch-review/resource-sync/cpp-memory-review）互补——proactive-correction 扫全量+可执行修正，其余只扫变更+只读报告。

### 文件 12: 脚本

**文件 12** `scripts/gen_references.py` → `{{DIR}}/scripts/gen_references.py`
: **项目结构扫描器**。扫描项目模块/文件/依赖/资源，输出 `_scan.json` 中间数据。不生成 Markdown，不做源码语义解析。适配 Gradle / Maven / SPM / npm / Cargo / Go Modules / Hvigor 等构建系统。

> **两种扫描模式**：
> - **完整模式**（默认）：包含完整的文件列表、目录树、资源文件清单 — 当 `HAS_CODEGRAPH = false` 时使用
> - **轻量模式**（`--lightweight`）：跳过文件列表、目录树和资源扫描，仅保留模块元信息和依赖关系 — 当 `HAS_CODEGRAPH = true` 时使用，避免冗余

### 文件 13-15: 引用文档（AI 深度生成）

> **关键变更**：引用文档不再由脚本生成，而是由 AI 基于扫描数据 + 源码阅读深度生成。

**生成流程**：

```
Step 1: 运行 gen_references.py → 输出 _scan.json（结构数据）
Step 2: AI 逐模块读取源码 → 生成完整 Markdown 文档
Step 3: AI 生成 dependencies.md 和 conventions.md
```

**增量更新**（项目结构变更后使用）：

```
Step 1: 运行 gen_references.py --diff → 输出 _diff.json（变更列表）+ 更新 _scan.json
Step 2: AI 读取 _diff.json → 只重新阅读变更模块的源码
Step 3: 增量更新受影响的 {module}.md / dependencies.md
```

`--diff` 模式自动检测：
- 新增/删除模块 → 完整生成/清理文档
- 模块重命名（基于文件相似度）→ 迁移文档
- 文件变更 → 仅更新变更部分的类/接口详情
- 依赖变更 → 标记需更新 dependencies.md

**Step 1** 执行 `python {{DIR}}/scripts/gen_references.py`，得到 `{{DIR}}/references/_scan.json`（首次）；后续执行 `python {{DIR}}/scripts/gen_references.py --diff` 获取增量变更。

**Step 2** AI 对每个模块执行以下操作：

1. 读取 `_scan.json` 中该模块的结构数据（目录树、文件列表、依赖）
2. **逐个读取**该模块的所有源码文件（使用工具读取文件内容）
3. 基于源码理解，生成完整参考文档

**文件 13** 为每个模块生成 `{{DIR}}/references/{module}.md`，必须包含以下完整内容：

```markdown
# {模块名}

## 模块概述
<!-- 用1-3句话概括模块的职责和定位，必须基于源码理解，禁止写"待补充" -->

## 元信息
| 项 | 值 |
|----|-----|
| 类型 | {application/library} |
| 包名 | {所有顶层包} |
| 依赖 | {项目内依赖} |
| 外部依赖 | {关键外部依赖} |
| 源文件数 | {N} |

## 目录结构
<!-- 完整目录树，4层深度 -->

## 类与接口详情
<!-- 按职责分组，每组包含：

### {分类名}（N个）

#### `{类名}` [{class/interface/data class/enum/object/abstract class}]
- **继承**: {父类} → {祖父类}
- **实现**: {接口列表}
- **说明**: {从 KDoc/JavaDoc 或源码逻辑推断的一句话描述}
- **关键注解**: {@Route(path="..."), @Singleton 等}
- **公共 API**:
  - `{方法签名}`
  - `{方法签名}`
-->

## 路由表
<!-- 仅 Android/Harmony 项目，列出所有 @Route 路径 -->

## 数据模型
<!-- 列出所有 data class / Bean / Entity / Model，含字段概要 -->

## 资源文件
<!-- 布局文件 / Drawable / Assets 等清单 -->

## 跨模块 API
<!-- 该模块对外暴露的接口/方法（供其他模块调用） -->

## 设计模式与约定
<!-- 该模块中使用的设计模式（单例、观察者、工厂等）和内部约定 -->
```

**分类优先级**（按此顺序组织类详情）：

| 优先级 | 分类 | 识别规则 |
|--------|------|----------|
| 1 | 页面 | Activity / Fragment / ViewController / Page |
| 2 | 视图模型 | ViewModel / Presenter / Controller |
| 3 | 服务接口 | Provider / Service / Repository / API |
| 4 | 接口定义 | interface / protocol |
| 5 | 网络层 | Retrofit Service / API Client / HTTP Handler |
| 6 | 适配器 | Adapter / Delegate |
| 7 | 工具类 | Util / Helper / Manager / Extension |
| 8 | 数据模型 | data class / Bean / Entity / Model / DTO |
| 9 | 枚举 | enum |
| 10 | 其他 | 未归入以上分类的类 |

**类详情的最小完整度要求**：

| 信息项 | 必须 | 说明 |
|--------|------|------|
| 一句话说明 | ✅ | 从 KDoc 或源码逻辑推断，禁止留空 |
| 继承关系 | ✅ | 直接父类 + 实现的接口 |
| 公共 API | ✅ | 所有 public/open 方法签名（省略 getter/setter） |
| 关键注解 | ✅ | @Route, @Singleton, @Autowired 等业务注解 |
| 内部实现摘要 | ⚠️ | 关键逻辑的简要说明 |
| 使用示例 | 💡 | 该类如何被其他代码使用 |

**文件 14** `{{DIR}}/references/dependencies.md`
: 从 _scan.json 的依赖信息 + AI 分析跨模块调用关系生成。必须包含：
- 模块依赖关系图（Mermaid）
- 每条依赖的方向和类型
- 循环依赖检测

**文件 15** `{{DIR}}/references/conventions.md`
: 从 Q4+Q5 生成的编码约定 + AI 从源码中提取的实际约定生成。

### 文件 16: 入口调度层

**文件 16** `{{ENTRY}}` → 项目根目录
: 从下方模板生成。替换所有 `{{VARIABLE}}`。

---

## {{ENTRY}} 模板（LANG=zh 时使用）

```markdown
{{ENTRY_VERSION_LINE}}
# {{ENTRY}}
你的名字是{{AI_NAME}}，你是一个AI助手，你的任务是帮助我解决代码仓库中的问题。

## 项目概述

{{PROJECT_DESCRIPTION}}。包名：`{{PACKAGE_NAME}}`。采用{{LANGUAGE}}开发，使用{{ARCHITECTURE}}架构，通过{{NAVIGATION}}进行页面导航。

## 构建命令

\`\`\`bash
# Debug 构建
{{BUILD_COMMAND_DEBUG}}

# Release 构建
{{BUILD_COMMAND_RELEASE}}
\`\`\`

本项目{{#if HAS_TESTS}}有{{else}}无{{/if}}自动化测试。

## 构建环境

| 项目 | 值 |
|------|-----|
{{BUILD_ENV_TABLE}}

---

## 规则与技能触发策略

### 强制执行规则

1. **修改前必读规则**：执行任何代码修改前，必须先阅读 `{{DIR}}/rules/project_rule.md` 全文，逐项对照
2. **{{REVIEW_FILE_THRESHOLD}}+ 文件修改必触发审查**：修改完成后**必须**触发 `code_review` 技能
3. **{{ARCH_REVIEW_MODULE_THRESHOLD}}+ 模块修改必触发架构审查**：修改完成后**必须**委派 `arch-review` agent
4. **资源文件变更必触发同步检查**：**必须**委派 `resource-sync` agent
5. **{{DIR}} 配置变更必更新 CHANGELOG**：凡修改 `{{DIR}}/` 下配置文件，**必须**同步更新 `{{DIR}}/CHANGELOG.md` 并升级版本号
{{#if HAS_CODEGRAPH}}
### CodeGraph 集成

本项目已集成 CodeGraph。探索代码库时优先使用 `codegraph_explore` 工具进行结构化搜索。`{{DIR}}/references/` 目录采用轻量模式，仅包含架构决策、业务逻辑摘要和项目约定——请与 CodeGraph 配合使用。
{{/if}}
---

{{ENTRY}} 作为规则和技能的统一调度入口，根据当前任务场景按需加载。若用户消息中不涉及项目开发相关内容，则跳过所有规则和技能。

### 否定词保护（防误触发）

关键词匹配仅是初步筛选，必须结合用户意图做语义二次判断。

| 否定模式 | 示例消息 | 应跳过 | 原因 |
|---------|---------|--------|------|
| 已关闭/已完成 | "XX问题已经修好了" | 对应规则 | 工作已完成 |
| 类比/对比 | "类似 XX，但跟本项目无关" | 项目规则 | 仅做类比 |
| 通用概念讨论 | "X 和 Y 在原理上有什么区别？" | 所有规则 | 通用问答 |
| 明确排除 | "不需要检查规范" | 所有规则 | 用户排除 |

### 多规则冲突处理

当多条规则同时触发且冲突时，参照 `{{DIR}}/rules/conflict_resolution.md` 裁决表执行。

---

### project_rule.md（项目开发主规则）

**触发条件**（满足任一即加载）：
1. 执行代码生成、修改、审查、重构操作
2. 处理开发需求（新增功能、Bug修复、性能优化等）
3. 询问项目开发相关问题
4. 涉及项目源码文件的任何操作

**跳过条件**：纯闲聊、通用知识问答、非代码讨论、否定语境。

**核心约束摘要**（完整规则见 `{{DIR}}/rules/project_rule.md`）：

| 类别 | 关键约束 |
|------|----------|
| 架构 | {{DEPENDENCY_RULES_SUMMARY}} |
| 禁止模式 | {{FORBIDDEN_PATTERNS_COUNT}} 条禁止模式 |
| 命名 | {{NAMING_SUMMARY}} |
| {{PLATFORM}} | {{PLATFORM_RULES_SUMMARY}} |

---

### plan_mode（任务结构化拆分技能）

**触发条件**（满足任一即自动加载）：
1. 开发任务涉及 2 个及以上模块的协作
2. 需要修改 3 个及以上文件
3. 用户明确要求"先规划/先列步骤/plan/拆分任务"

**核心能力摘要**（完整技能见 `{{DIR}}/skills/plan_mode/SKILL.md`）：

| 类别 | 内容 |
|------|------|
| 计划格式 | 任务描述 + 涉及模块 + 步骤表 + 风险点 + 完成标准 |
| 内置模板 | {{PLATFORM}} 平台高频任务模板 |
| 执行原则 | 先计划后执行、有依赖严格顺序、每步对照检查点 |

---

### code_review（代码审查技能）

**触发条件**（满足任一即自动执行）：
1. 完成了多文件代码生成
2. 完成了涉及架构边界的代码修改
3. 用户明确要求"审查/review/检查代码"
4. `plan_mode` 的计划执行完毕后

**核心审查项摘要**（完整技能见 `{{DIR}}/skills/code_review/SKILL.md`）：

| 级别 | 检查项 |
|------|--------|
| ❌ 致命 | 模块依赖方向违规、禁止模式使用、继承体系错误、硬编码密钥{{#if HAS_NDK}}、JNI 内存泄漏、JNI 签名不一致{{/if}} |
| ⚠️ 警告 | 硬编码字符串/颜色/尺寸、未使用项目工具类、资源未同步{{#if HAS_NDK}}、JNI 引用未空指针检查、敏感数据未清零{{/if}} |
| 💡 建议 | 日志工具选择、弱引用模式、单例线程安全、代码复用{{#if HAS_NDK}}、RAII 封装、goto cleanup 模式{{/if}} |

---

### arch-review SubAgent

**触发条件**（由 `code_review` 委派，或用户手动指定）：
1. 代码变更涉及 {{ARCH_REVIEW_MODULE_THRESHOLD}}+ 模块
2. 用户明确要求架构审查
3. `code_review` 检测到潜在依赖方向问题

**职责**：深度检测模块依赖方向、禁止模式、跨模块通信合规性、继承体系。仅只读审查。

**配置详情**：`{{DIR}}/agents/arch-review.md`

---

### resource-sync SubAgent

**触发条件**（由 `code_review` 委派，或用户手动指定）：
1. 新增或修改了资源文件
2. `code_review` 检测到资源可能未全目录同步

**职责**：检测资源全目录一致性、命名前缀规范。仅只读检查。

**配置详情**：`{{DIR}}/agents/resource-sync.md`

---

### proactive-correction SubAgent

**触发条件**（满足任一即执行扫描）：
1. 接触源码文件时 — 主动检查该文件及关联文件的合规性和合理性
2. 接触规则文件时 — 主动检查规则自洽性
3. `plan_mode` 的每步完成后 — 纠错检查点，扫描已修改文件的合规性
4. `code_review` 前置 — 在审查前执行存量合规性扫描
5. `code_review` 后续 — 验证修复效果
6. 用户明确要求"纠错/correction/修复问题/扫描违规"

**跳过条件**：纯闲聊、用户说"不需要纠错"、否定语境。

**职责**：主动扫描规则自洽性（维度1）、存量代码合规性（维度2）、实现合理性（维度3），发现问题时主动提出修正方案并推动闭环。**可执行修正**（经用户确认后），与被动只读审查 agent 互补。

**核心区分**：proactive-correction 扫全量 + 可执行修正；arch-review/resource-sync/cpp-memory-review 只扫变更 + 只读报告。

**配置详情**：`{{DIR}}/agents/proactive-correction.md`

---

### cpp-memory-review SubAgent{{#if HAS_NDK}}（已启用）{{else}}（未启用 — 非 NDK 项目）{{/if}}

**触发条件**（由 `code_review` 委派，或用户手动指定）{{#if HAS_NDK}}：
1. 变更涉及 .cpp/.h/.c 文件
2. 用户明确要求"内存审查/memory review/内存泄漏检查"
3. `code_review` 检测到 JNI/C++ 代码变更
4. `plan_mode` 的任务涉及 JNI 层修改
{{else}}
- 本项目不包含 C++/NDK 代码，此 agent 不会触发
{{/if}}

**职责**：深度检测 JNI 引用泄漏、C 堆内存泄漏、缓冲区溢出风险、敏感数据残留、C++ 代码合理性。仅只读审查。

**配置详情**：`{{DIR}}/agents/cpp-memory-review.md`

---

## 任务编排与审查协作流程

\`\`\`
用户提出开发任务
    ↓
[判断] 是否满足 plan_mode 触发条件？
    ├─ 是 → plan_mode 输出执行计划 → 用户确认 → 按步骤执行
    │        ↓ （每步完成后触发 proactive-correction 纠错检查点）
    └─ 否 → 直接执行
    ↓
代码生成/修改完成
    ↓
[前置纠错检查] proactive-correction 执行存量合规性扫描
    ├─ 发现致命违规 → 立即修正后再进入审查
    └─ 无致命违规 → 进入正式审查
    ↓
[判断] 是否满足 code_review 触发条件？
    ├─ 是 → 执行审查清单
    │       ├─ {{ARCH_REVIEW_MODULE_THRESHOLD}}+ 模块 → 委派 arch-review Agent
    │       ├─ 涉及资源文件 → 委派 resource-sync Agent
    │       ├─ 涉及 C++/NDK 代码 → 委派 cpp-memory-review Agent
    │       ├─ 审查后致命问题修正 → proactive-correction 验证修复效果
    │       └─ 常规变更 → 直接审查
    └─ 否 → 跳过审查
    ↓
输出审查报告
    ├─ ❌ 有致命问题 → 告知用户 + 给出修复方案 + proactive-correction 推动闭环
    └─ ✅/⚠️ → 完成
\`\`\`

**关键原则**：
- plan_mode 和 code_review 可独立触发，互不依赖
- SubAgent 仅由 code_review 委派或用户手动指定（proactive-correction 除外，可自主触发）
- 被动审查 agent（arch-review/resource-sync/cpp-memory-review）仅只读，不自动修改代码
- 主动纠错 agent（proactive-correction）可执行修正，但必须经用户确认
- 审查发现致命问题时必须告知用户，由用户决定是否修复
- 纠错闭环：致命问题必须追踪至修复完成，禁止"报告即遗忘"
```

---

## 生成后总结

所有文件生成完毕后，输出：

```
## {{TARGET}} 体系初始化完成 ✅

入口文件：{{ENTRY}}
配置目录：{{DIR}}/

### 已生成 {{#if HAS_NDK}}18{{else}}17{{/if}} 个文件（按需加载的分包架构）：

{{ENTRY}}                      入口调度层（触发/跳过条件 + 各模块索引）
{{DIR}}/CHANGELOG.md           版本记录 v1.0.0
{{DIR}}/settings.json          Hook 注册配置
{{DIR}}/rules/                 project_rule.md + conflict_resolution.md
{{DIR}}/skills/                plan_mode + code_review
{{DIR}}/agents/                arch-review + resource-sync + proactive-correction{{#if HAS_NDK}} + cpp-memory-review{{/if}}
{{DIR}}/hooks/                 post-edit-tracker.sh + check-review-needed.sh
{{DIR}}/scripts/               gen_references.py
{{DIR}}/references/            模块文档 + 依赖关系 + 编码约定

### 架构特点：
- 规则/技能/Agent 分文件管理，按需加载
- 与 Qoder / Claude Code / Codex / OpenCode 的其他实例内容完全相同
- 差异仅在于目录名（{{DIR}}）和入口文件名（{{ENTRY}}）

### 下一步：
1. 审查 {{DIR}}/rules/project_rule.md 中的禁止模式和架构约束
2. 运行 `python {{DIR}}/scripts/gen_references.py{{#if HAS_CODEGRAPH}} --lightweight{{/if}}` 生成 `_scan.json`（首次）{{#if HAS_CODEGRAPH}}（轻量模式：CodeGraph 替代了文件列表和目录树）{{/if}}
3. AI 基于 `_scan.json` + 源码阅读生成完整的 `{{DIR}}/references/` 文档
4. 后续结构变更时运行 `python {{DIR}}/scripts/gen_references.py --diff{{#if HAS_CODEGRAPH}} --lightweight{{/if}}` 增量更新
5. 修改 {{DIR}}/ 下配置后自动提醒更新 CHANGELOG 和版本号

### 项目结构总览：

\`\`\`
{{ENTRY}}                          ← 入口调度层
{{DIR}}/
├── CHANGELOG.md                   ← 版本记录
├── settings.json                  ← Hook 注册
├── settings.local.json            ← 本地权限
├── hooks/
│   ├── post-edit-tracker.sh       ← 编辑追踪
│   └── check-review-needed.sh     ← 审查提醒
├── rules/
│   ├── project_rule.md            ← 项目主规则
│   └── conflict_resolution.md     ← 冲突裁决
├── skills/
│   ├── plan_mode/SKILL.md         ← 任务规划
│   └── code_review/SKILL.md       ← 代码审查
├── agents/
│   ├── arch-review.md             ← 架构审查
│   ├── resource-sync.md           ← 资源同步
│   ├── proactive-correction.md    ← 主动纠错
│   └── cpp-memory-review.md       ← C++ 内存安全审查（仅 HAS_NDK=true）
├── scripts/
│   └── gen_references.py          ← 结构扫描器 → _scan.json
└── references/
    ├── _scan.json                 ← 扫描中间数据
    ├── dependencies.md            ← 依赖关系（AI 生成）
    ├── conventions.md             ← 编码约定（AI 生成）
    └── {module}.md × N           ← 模块文档（AI 生成）
\`\`\`
```

---

## {{ENTRY}} 模板（LANG=en 时使用）

```markdown
{{ENTRY_VERSION_LINE}}
# {{ENTRY}}
Your name is {{AI_NAME}}. You are an AI assistant helping me solve problems in this codebase.

## Project Overview

{{PROJECT_DESCRIPTION}}. Package: `{{PACKAGE_NAME}}`. Built with {{LANGUAGE}}, using {{ARCHITECTURE}} architecture, with {{NAVIGATION}} for navigation.

## Build Commands

\`\`\`bash
# Debug build
{{BUILD_COMMAND_DEBUG}}

# Release build
{{BUILD_COMMAND_RELEASE}}
\`\`\`

This project {{#if HAS_TESTS}}has{{else}}does not have{{/if}} automated tests.

## Build Environment

| Item | Value |
|------|-------|
{{BUILD_ENV_TABLE}}

---

## Rules and Skill Trigger Strategy

### Mandatory Rules

1. **Read rules before modifying**: Before any code modification, you MUST read `{{DIR}}/rules/project_rule.md` in full and verify each item
2. **{{REVIEW_FILE_THRESHOLD}}+ files modified triggers review**: After modification, you MUST trigger the `code_review` skill
3. **{{ARCH_REVIEW_MODULE_THRESHOLD}}+ modules modified triggers architecture review**: After modification, you MUST delegate to `arch-review` agent
4. **Resource file changes trigger sync check**: You MUST delegate to `resource-sync` agent
5. **{{DIR}} config changes require CHANGELOG update**: Any config file change under `{{DIR}}/` MUST update `{{DIR}}/CHANGELOG.md` and bump the version number
{{#if HAS_CODEGRAPH}}
### CodeGraph Integration

This project uses CodeGraph. When exploring the codebase, prefer the `codegraph_explore` tool for structural search. The `{{DIR}}/references/` directory contains lightweight architecture decisions, business logic summaries, and conventions — use it alongside CodeGraph.
{{/if}}
---

{{ENTRY}} serves as the unified dispatch entry for rules and skills, loading them on demand based on the current task. If the user message does not involve project development, all rules and skills are skipped.

### Negative Keyword Protection (Prevent False Triggers)

Keyword matching is only the first filter; semantic intent analysis is required.

| Negative Pattern | Example Message | Should Skip | Reason |
|-----------------|----------------|-------------|--------|
| Already resolved | "That issue is already fixed" | Corresponding rules | Work is done |
| Analogy/comparison | "Similar to XX, but unrelated to this project" | Project rules | Just an analogy |
| General concept discussion | "What's the difference between X and Y in principle?" | All rules | General Q&A |
| Explicit exclusion | "No need to check standards" | All rules | User exclusion |

### Multi-Rule Conflict Resolution

When multiple rules trigger simultaneously and conflict, refer to the arbitration table in `{{DIR}}/rules/conflict_resolution.md`.

---

### project_rule.md (Main Project Rules)

**Trigger conditions** (any one):
1. Performing code generation, modification, review, or refactoring
2. Handling development requests (new features, bug fixes, performance optimization, etc.)
3. Asking project development related questions
4. Any operation involving project source files

**Skip conditions**: Casual chat, general knowledge Q&A, non-code discussion, negative context.

**Core constraints summary** (full rules in `{{DIR}}/rules/project_rule.md`):

| Category | Key Constraints |
|----------|----------------|
| Architecture | {{DEPENDENCY_RULES_SUMMARY}} |
| Forbidden patterns | {{FORBIDDEN_PATTERNS_COUNT}} forbidden patterns |
| Naming | {{NAMING_SUMMARY}} |
| {{PLATFORM}} | {{PLATFORM_RULES_SUMMARY}} |

---

### plan_mode (Structured Task Decomposition Skill)

**Trigger conditions** (any one):
1. Development task involves 2+ modules
2. Requires modifying 3+ files
3. User explicitly requests "plan first / list steps / plan / decompose task"

**Core capability summary** (full skill in `{{DIR}}/skills/plan_mode/SKILL.md`):

| Category | Content |
|----------|---------|
| Plan format | Task description + involved modules + step table + risks + completion criteria |
| Built-in templates | {{PLATFORM}} platform high-frequency task templates |
| Execution principles | Plan before execute, strict order for dependencies, checkpoint per step |

---

### code_review (Code Review Skill)

**Trigger conditions** (any one):
1. Completed multi-file code generation
2. Completed code modification involving architecture boundaries
3. User explicitly requests "review / check code"
4. `plan_mode` plan execution completed

**Core review items summary** (full skill in `{{DIR}}/skills/code_review/SKILL.md`):

| Level | Check Items |
|-------|------------|
| ❌ Fatal | Module dependency direction violations, forbidden pattern usage, inheritance errors, hardcoded keys{{#if HAS_NDK}}, JNI memory leaks, JNI signature mismatches{{/if}} |
| ⚠️ Warning | Hardcoded strings/colors/dimensions, unused project utilities, unsynced resources{{#if HAS_NDK}}, JNI references without null check, sensitive data not cleared{{/if}} |
| 💡 Suggestion | Logging tool choice, weak reference patterns, singleton thread safety, code reuse{{#if HAS_NDK}}, RAII wrapping, goto cleanup pattern{{/if}} |

---

### arch-review SubAgent

**Trigger conditions** (delegated by `code_review`, or user-specified):
1. Code changes involve {{ARCH_REVIEW_MODULE_THRESHOLD}}+ modules
2. User explicitly requests architecture review
3. `code_review` detects potential dependency direction issues

**Responsibilities**: Deep detection of module dependency direction, forbidden patterns, cross-module communication compliance, inheritance. Read-only review.

**Config**: `{{DIR}}/agents/arch-review.md`

---

### resource-sync SubAgent

**Trigger conditions** (delegated by `code_review`, or user-specified):
1. Resource files added or modified
2. `code_review` detects resources may not be synced across all directories

**Responsibilities**: Check resource consistency across all directories, naming prefix compliance. Read-only check.

**Config**: `{{DIR}}/agents/resource-sync.md`

---

### proactive-correction SubAgent

**Trigger conditions** (any one triggers a scan):
1. Touching source files — proactively check the file and related files for compliance
2. Touching rule files — proactively check rule self-consistency
3. After each `plan_mode` step — error correction checkpoint, scan modified files for compliance
4. Before `code_review` — scan existing code compliance before formal review
5. After `code_review` — verify fix effectiveness
6. User explicitly requests "correction / fix issues / scan violations"

**Skip conditions**: Casual chat, user says "no correction needed", negative context.

**Responsibilities**: Proactively scan rule self-consistency (dimension 1), existing code compliance (dimension 2), implementation rationality (dimension 3). When issues are found, propose fixes and push for closure. **Can execute fixes** (with user confirmation), complementing passive read-only review agents.

**Key distinction**: proactive-correction scans all code + can execute fixes; arch-review/resource-sync/cpp-memory-review scan only changes + read-only reports.

**Config**: `{{DIR}}/agents/proactive-correction.md`

---

### cpp-memory-review SubAgent{{#if HAS_NDK}} (enabled){{else}} (disabled — not an NDK project){{/if}}

**Trigger conditions** (delegated by `code_review`, or user-specified){{#if HAS_NDK}}:
1. Changes involve .cpp/.h/.c files
2. User explicitly requests "memory review / memory leak check"
3. `code_review` detects JNI/C++ code changes
4. `plan_mode` task involves JNI layer modifications
{{else}}
- This project does not contain C++/NDK code, this agent will not trigger
{{/if}}

**Responsibilities**: Deep detection of JNI reference leaks, C heap memory leaks, buffer overflow risks, sensitive data residue, C++ code rationality. Read-only review.

**Config**: `{{DIR}}/agents/cpp-memory-review.md`

---

## Task Orchestration and Review Collaboration Flow

\`\`\`
User proposes development task
    ↓
[Check] Does plan_mode trigger condition apply?
    ├─ Yes → plan_mode outputs execution plan → user confirms → execute step by step
    │        ↓ (proactive-correction error checkpoint after each step)
    └─ No → Direct execution
    ↓
Code generation/modification complete
    ↓
[Pre-review correction] proactive-correction scans existing code compliance
    ├─ Fatal violations found → Fix immediately before review
    └─ No fatal violations → Proceed to formal review
    ↓
[Check] Does code_review trigger condition apply?
    ├─ Yes → Execute review checklist
    │       ├─ {{ARCH_REVIEW_MODULE_THRESHOLD}}+ modules → Delegate arch-review Agent
    │       ├─ Resource files involved → Delegate resource-sync Agent
    │       ├─ C++/NDK code involved → Delegate cpp-memory-review Agent
    │       ├─ Post-review fatal fix → proactive-correction verifies fix
    │       └─ Regular changes → Direct review
    └─ No → Skip review
    ↓
Output review report
    ├─ ❌ Fatal issues → Notify user + provide fix plan + proactive-correction pushes for closure
    └─ ✅/⚠️ → Done
\`\`\`

**Key principles**:
- plan_mode and code_review can trigger independently
- SubAgents are only delegated by code_review or specified by user (proactive-correction can self-trigger)
- Passive review agents (arch-review/resource-sync/cpp-memory-review) are read-only, do not auto-modify code
- Active correction agent (proactive-correction) can execute fixes, but must have user confirmation
- Fatal issues found during review must be reported to user, user decides whether to fix
- Error correction closure: fatal issues must be tracked until fixed, no "report and forget"
\`\`\`
```

---

## 错误处理

| 场景 | 处理 |
|------|------|
| 已有体系文件 | 提供覆盖/补充/取消三个选项 |
| 未知平台 | 降级为通用模式，平台相关内容留空请用户手动填充 |
| 体系不明确 | 询问用户选择（Qoder / Claude Code / Codex / OpenCode） |
| 跨体系迁移 | 读取已有配置内容，换外壳重新生成（内容不变，只换 {{DIR}} 和 {{ENTRY}}） |

---

## 模板文件索引

本 skill 使用的所有模板文件位于 `ai_scaffold_skill/` 目录下：

```
ai_scaffold_skill/
├── SKILL.md                              ← 本文件
├── hooks/                                ← 语言无关（中英文共用）
│   ├── post-edit-tracker.sh              ← 模板：编辑追踪钩子
│   └── check-review-needed.sh            ← 模板：审查提醒钩子
├── scripts/                              ← 语言无关（中英文共用）
│   └── gen_references.py                 ← 模板：项目结构扫描器
├── templates/                            ← 语言相关模板
│   ├── CHANGELOG.md                      ← 版本记录（语言无关）
│   ├── settings.json                     ← Hook 注册配置（语言无关）
│   ├── settings.local.json               ← 本地权限（语言无关）
│   ├── rules/                            ← 中文模板
│   │   ├── project_rule.md
│   │   └── conflict_resolution.md
│   ├── skills/
│   │   ├── plan_mode/SKILL.md
│   │   └── code_review/SKILL.md
│   ├── agents/
│   │   ├── arch-review.md
│   │   ├── resource-sync.md
│   │   ├── proactive-correction.md
│   │   └── cpp-memory-review.md
│   └── en/                               ← 英文模板（LANG=en 时使用）
│       ├── rules/
│       │   ├── project_rule.md
│       │   └── conflict_resolution.md
│       ├── skills/
│       │   ├── plan_mode/SKILL.md
│       │   └── code_review/SKILL.md
│       └── agents/
│           ├── arch-review.md
│           ├── resource-sync.md
│           ├── proactive-correction.md
│           └── cpp-memory-review.md
```
