# ai_scaffold

> AI Coding Skeleton v2.0 — CLI + LLM 协作架构：CLI搭建骨架 → AI深度初始化
>
> AI 编码骨架 v2.0 — 为你的项目生成结构化的规则、技能、Agent 和 Hook 体系。

[English](#english) | [中文](#中文)

---

## English

### What is ai_scaffold?

ai_scaffold v2.0 is a **CLI + LLM collaborative scaffolding system** that generates a complete AI coding assistance framework for your existing project. It uses a unique two-phase approach:

1. **CLI Phase** (10 seconds): Auto-detects your project type and creates the skeleton structure
2. **AI Phase** (2-5 minutes): Scans your source code, understands architecture, and generates customized rules

Instead of generating static templates with placeholders, ai_scaffold leverages AI to create rules that truly match your project's actual code structure.

### Key Features

- **CLI + LLM Collaboration**: CLI builds skeleton instantly, AI fills in customized content by scanning source code
- **Multi-tool support**: Works with Claude Code, Qoder, Codex, and OpenCode — same content, different "shell"
- **Multi-platform**: Android, iOS, HarmonyOS, Flutter, React Native (and generic fallback)
- **SKILL.md as AI Manual**: Comprehensive initialization guide that AI follows to generate project-specific rules
- **Cross-platform rule templates**: Platform-specific rules auto-injected based on actual project analysis
- **Split-file architecture**: Rules, skills, agents, hooks, and references are loaded on-demand — no bloated single file
- **Conflict resolution**: Explicit priority-based arbitration when multiple rules collide
- **Auto-generated references**: AI scans project structure + reads source code to generate accurate module documentation
- **Proactive error correction**: An agent that actively scans code compliance, not just passively reviews
- **CodeGraph integration** (optional): Dynamically detects CodeGraph CLI — when present, `references/` operates in lightweight mode while CodeGraph handles structural exploration, reducing AI tool calls by ~90%

### Architecture

```
                    npx ai-scaffold-pro (CLI Phase - 10s)
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
   │  detect.js   │   │promptMinimal │   │ createSkeleton   │
   │              │   │   Config()   │   │                  │
   │  Platform    │   │              │   │  Create dirs     │
   │  Build Sys   │──▶│ Language +   │──▶│  Copy base files │
   │  Language    │   │ AI Tool      │   │  Generate minimal│
   │  NDK/C++     │   │ selection    │   │  entry file      │
   │  CodeGraph   │   │ (2 questions)│   │  + AI_INIT_GUIDE │
   └──────────────┘   └──────────────┘   └────────┬─────────┘
                                                   │
                                    Transaction-safe: temp → validate → atomic commit
                                                   │
                                                   ▼
                              Skeleton Created! Now switch to AI Phase ↓

              User opens project in AI tool (Claude Code/Qoder/etc.)
                               │
                    User: "Initialize using SKILL.md"
                               │
                        AI Phase (2-5 minutes)
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
   │  Phase 0-1   │   │  Phase 2     │   │   Phase 3        │
   │              │   │              │   │                  │
   │ Scan project │──▶│ Interactive  │──▶│ Generate custom  │
   │ structure    │   │ config       │   │ content:         │
   │ Read source  │   │ (7-11 Qs)    │   │ - rules/         │
   │ Analyze arch │   │              │   │ - agents/        │
   │              │   │              │   │ - skills/        │
   │              │   │              │   │ - references/    │
   └──────────────┘   └──────────────┘   └────────┬─────────┘
                                                   │
                                            Validation & Done ✅
```

### Quick Start

#### Step 1: CLI Skeleton Creation (10 seconds)

```bash
# Run directly with npx (no install needed)
cd your-project/
npx ai-scaffold-pro

# Follow the minimal prompts:
# 1. Select language (中文 / English)
# 2. Select AI tool (Claude Code / Qoder / Codex / OpenCode)
# 3. Project auto-detected
# 4. Skeleton created!
```

#### Step 2: AI Deep Initialization (2-5 minutes)

```bash
# Open your project in your chosen AI tool:
# - Claude Code
# - Qoder
# - Codex
# - OpenCode

# Then enter this command in the AI chat:
"Initialize using .qoder/skills/project_initialization/SKILL.md"

# Or simply:
"按 project_initialization skill 初始化本项目"
```

The AI will automatically:
1. Scan your project structure
2. Read key source files
3. Ask 7-11 configuration questions
4. Generate customized rules based on actual code
5. Create comprehensive references documentation
6. Set up intelligent agents and hooks

**Total time**: ~3 minutes (10s CLI + 2-5min AI)

### Supported Platforms

| Platform | Build System | Detection File | Rule Templates |
|----------|-------------|----------------|----------------|
| Android | Gradle | `settings.gradle` / `build.gradle.kts` | MVVM, ARouter, Retrofit, ViewBinding, Paging 3 |
| iOS | Xcode / SPM | `*.xcodeproj` / `Package.swift` | SwiftUI/UIKit, ARC memory, Swift concurrency, App Store compliance |
| HarmonyOS | Hvigor | `hvigor-config.json5` | Stage model, ArkUI, ArkTS state management, router |
| Flutter | Dart Pub | `pubspec.yaml` | Widget tree, Provider/Riverpod/BLoC, GoRouter, platform channels |
| React Native | npm/yarn | `package.json` + react-native | TurboModules/JSI bridge, StyleSheet, React Navigation, Hermes |
| Generic | — | — | Fallback for any project |

### Comparison

| | ai_scaffold | Superkit | Superpowers | create-*-app |
|---|---|---|---|---|
| Focus | AI Coding rule skeleton | AI full-stack starter | AI capability plugins | Project scaffolding |
| Value | Multi-tool x multi-platform rule generation | Pre-built AI-integrated templates | Extend AI tool abilities | Standardized project init |
| Best for | Adding AI assistance to existing projects | Starting new projects from scratch | Enhancing AI tool capabilities | New project standardization |

### Project Structure (After AI Initialization)

```
{{ENTRY}}                          ← Entry point (full version, generated by AI)
AI_INIT_GUIDE.md                   ← User-friendly initialization guide
{{DIR}}/
├── CHANGELOG.md                   ← Version tracking
├── settings.json                  ← Hook registration
├── settings.local.json            ← Local permissions
├── hooks/
│   ├── post-edit-tracker.sh       ← Edit tracking
│   └── check-review-needed.sh     ← Review reminder
├── rules/
│   ├── project_rule.md            ← Main project rules (AI-generated)
│   └── conflict_resolution.md     ← Conflict arbitration (AI-generated)
├── skills/
│   ├── plan_mode/SKILL.md         ← Task planning (AI-generated)
│   ├── code_review/SKILL.md       ← Code review (AI-generated)
│   └── project_initialization/    ← **AI initialization manual**
│       └── SKILL.md               ← This is what AI follows!
├── agents/
│   ├── arch-review.md             ← Architecture review (AI-generated)
│   ├── resource-sync.md           ← Resource sync check (AI-generated)
│   ├── proactive-correction.md    ← Proactive error correction (AI-generated)
│   └── cpp-memory-review.md       ← C++ memory safety (NDK only, AI-generated)
├── scripts/
│   └── gen_references.py          ← Structure scanner (--lightweight with CodeGraph)
└── references/
    ├── _scan.json                 ← Scan intermediate data
    ├── dependencies.md            ← Dependency graph (AI-generated from source)
    ├── conventions.md             ← Coding conventions (AI-generated from source)
    └── {module}.md × N            ← Module docs (AI reads source code to generate)
```

> **Note**: Files marked "AI-generated" are created during Phase 2 (AI initialization), not by the CLI.

---

## 中文

### ai_scaffold 是什么？

ai_scaffold v2.0 是一套 **CLI + LLM 协作的脚手架系统**，为你的现有项目生成完整的 AI 辅助开发框架。它采用独特的两阶段方法：

1. **CLI 阶段**（10秒）：自动检测项目类型并创建骨架结构
2. **AI 阶段**（2-5分钟）：扫描源代码、理解架构、生成定制化规则

不同于生成带有占位符的静态模板，ai_scaffold 利用 AI 创建真正匹配你项目实际代码结构的规则。

### 核心特性

- **CLI + LLM 协作**：CLI 瞬间搭建骨架，AI 通过扫描源码填充定制化内容
- **多工具支持**：Claude Code、Qoder、Codex、OpenCode — 内容完全一致，仅"外壳"不同
- **多平台适配**：Android、iOS、鸿蒙、Flutter、React Native（及通用降级）
- **SKILL.md 作为 AI 手册**：全面的初始化指南，AI 遵循它生成项目专属规则
- **跨平台规则模板库**：根据实际项目分析自动注入平台专属规则
- **分包架构**：规则、技能、Agent、Hook、参考资料按需加载，无臃肿单文件
- **冲突裁决**：多规则碰撞时有显式的优先级仲裁机制
- **自动生成 References**：AI 扫描项目结构 + 精读源码，生成准确的模块文档
- **主动纠错**：Agent 主动扫描代码合规性，而非被动审查
- **CodeGraph 集成**（可选）：自动检测 CodeGraph CLI——安装后 `references/` 采用轻量模式，结构探索由 CodeGraph 负责，相比手动扫描代码可减少约 90% 的 AI 工具调用

### 快速开始

#### 步骤 1：CLI 骨架搭建（10秒）

```bash
# 直接用 npx 运行（无需安装）
cd your-project/
npx ai-scaffold-pro

# 按最小化提示操作：
# 1. 选择语言（中文 / English）
# 2. 选择 AI 工具（Claude Code / Qoder / Codex / OpenCode）
# 3. 自动检测项目
# 4. 骨架创建完成！
```

#### 步骤 2：AI 深度初始化（2-5分钟）

```bash
# 在你选择的 AI 工具中打开项目：
# - Claude Code
# - Qoder
# - Codex
# - OpenCode

# 然后在 AI 对话框中输入：
"按 .qoder/skills/project_initialization/SKILL.md 初始化"

# 或者简单说：
"按 project_initialization skill 初始化本项目"
```

AI 将自动执行：
1. 扫描项目结构
2. 读取关键源文件
3. 询问 7-11 个配置问题
4. 基于实际代码生成定制化规则
5. 创建完整的 references 文档
6. 设置智能 Agent 和 Hook

**总耗时**：约3分钟（10秒 CLI + 2-5分钟 AI）

### 项目结构（AI 初始化后）

```
{{ENTRY}}                          ← 入口调度层（完整版，由 AI 生成）
AI_INIT_GUIDE.md                   ← 用户友好的初始化指南
{{DIR}}/
├── CHANGELOG.md                   ← 版本记录
├── settings.json                  ← Hook 注册
├── settings.local.json            ← 本地权限
├── hooks/
│   ├── post-edit-tracker.sh       ← 编辑追踪
│   └── check-review-needed.sh     ← 审查提醒
├── rules/
│   ├── project_rule.md            ← 项目主规则（AI 生成）
│   └── conflict_resolution.md     ← 冲突裁决（AI 生成）
├── skills/
│   ├── plan_mode/SKILL.md         ← 任务规划（AI 生成）
│   ├── code_review/SKILL.md       ← 代码审查（AI 生成）
│   └── project_initialization/    ← **AI 初始化手册**
│       └── SKILL.md               ← AI 就是按照这个执行的！
├── agents/
│   ├── arch-review.md             ← 架构审查（AI 生成）
│   ├── resource-sync.md           ← 资源同步（AI 生成）
│   ├── proactive-correction.md    ← 主动纠错（AI 生成）
│   └── cpp-memory-review.md       ← C++ 内存安全（仅 NDK，AI 生成）
├── scripts/
│   └── gen_references.py          ← 结构扫描器（--lightweight 配合 CodeGraph）
└── references/
    ├── _scan.json                 ← 扫描中间数据
    ├── dependencies.md            ← 依赖关系图（AI 从源码生成）
    ├── conventions.md             ← 编码约定（AI 从源码生成）
    └── {module}.md × N            ← 模块文档（AI 读取源码生成）
```

> **注意**：标记为"AI 生成"的文件是在阶段 2（AI 初始化）中创建的，不是由 CLI 生成的。

### 支持的平台

| 平台 | 构建系统 | 检测文件 | 规则模板 |
|------|---------|---------|---------|
| Android | Gradle | `settings.gradle` / `build.gradle.kts` | MVVM, ARouter路由, Retrofit网络, ViewBinding, Paging3 |
| iOS | Xcode / SPM | `*.xcodeproj` / `Package.swift` | SwiftUI/UIKit, ARC内存, Swift并发, App Store合规 |
| 鸿蒙 | Hvigor | `hvigor-config.json5` | Stage模型, ArkUI组件, ArkTS状态管理, router路由 |
| Flutter | Dart Pub | `pubspec.yaml` | Widget树, Provider/Riverpod/BLoC, GoRouter, Platform Channel |
| React Native | npm/yarn | `package.json` + react-native | TurboModules/JSI桥接, StyleSheet, React Navigation, Hermes |
| 通用 | — | — | 任意项目的兜底方案 |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)

## More Information

- 📖 [REFACTORING.md](REFACTORING.md) - Detailed explanation of v2.0 architecture changes
- 📝 [docs/article2.md](docs/article2.md) - In-depth article about ai_scaffold design philosophy
