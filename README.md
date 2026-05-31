# ai_scaffold

> AI Coding Skeleton — Generate structured rules, skills, agents, and hooks for your project.
>
> AI Coding 骨架 — 为你的项目生成结构化的规则、技能、Agent 和 Hook 体系。

[English](#english) | [中文](#中文)

---

## English

### What is ai_scaffold?

ai_scaffold is a template-based scaffolding system that generates a complete AI coding assistance framework for your existing project. It supports **4 AI tools x 5 platforms** with a single, unified architecture.

Instead of hand-writing CLAUDE.md and rule files for each project, ai_scaffold auto-detects your project type and generates everything with one command.

### Key Features

- **Multi-tool support**: Works with Claude Code, Qoder, Codex, and OpenCode — same content, different "shell"
- **Multi-platform**: Android, iOS, HarmonyOS, Flutter, React Native (and generic fallback)
- **Cross-platform rule templates**: Platform-specific rules auto-injected based on project type — lifecycle, state management, navigation, build conventions, code review checks, and self-check items
- **Split-file architecture**: Rules, skills, agents, hooks, and references are loaded on-demand — no bloated single file
- **Conflict resolution**: Explicit priority-based arbitration when multiple rules collide
- **Auto-generated references**: Script scans project structure + AI reads source code to generate accurate module documentation
- **Proactive error correction**: An agent that actively scans code compliance, not just passively reviews
- **CodeGraph integration** (optional): Dynamically detects CodeGraph CLI — when present, `references/` operates in lightweight mode (architecture + conventions only) while CodeGraph handles structural exploration, reducing AI tool calls by ~90% compared to manual code scanning

### Architecture

```
                       npx ai-scaffold-pro
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
   │  CodeGraph   │   │  (optional)  │   │                  │
   └──────────────┘   └──────────────┘   └────────┬─────────┘
                                                   │
        ┌──────────────────────────────────────────┘
        │  Transaction-safe: temp → validate → atomic commit
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
         │          │          │          │          │
         └──────────┴──────────┴──────────┴──────────┘
                            │
              Platform-specific rules injected
              into templates at render time
```

### Quick Start

#### Option A: CLI (Recommended)

```bash
# Run directly with npx (no install needed)
cd your-project/
npx ai-scaffold-pro

# Follow the interactive prompts:
# 1. Select language (中文 / English)
# 2. Select AI tool (Claude Code / Qoder / Codex / OpenCode)
# 3. Project auto-detected
# 4. Answer configuration questions
# 5. Files generated into your project's config directory
```

#### Option B: Manual (via SKILL.md)

```bash
# 1. Clone into your project's parent directory
git clone https://github.com/Jorgejie/ai_scaffold.git

# 2. In Claude Code, reference the SKILL.md to bootstrap your project

# 3. Follow the interactive prompts
```

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

### Project Structure (Generated)

```
{{ENTRY}}                          ← Entry point (CLAUDE.md / AGENTS.md)
{{DIR}}/
├── CHANGELOG.md                   ← Version tracking
├── settings.json                  ← Hook registration
├── settings.local.json            ← Local permissions
├── hooks/
│   ├── post-edit-tracker.sh       ← Edit tracking
│   └── check-review-needed.sh     ← Review reminder
├── rules/
│   ├── project_rule.md            ← Main project rules
│   └── conflict_resolution.md     ← Conflict arbitration
├── skills/
│   ├── plan_mode/SKILL.md         ← Task planning
│   └── code_review/SKILL.md       ← Code review
├── agents/
│   ├── arch-review.md             ← Architecture review
│   ├── resource-sync.md           ← Resource sync check
│   ├── proactive-correction.md    ← Proactive error correction
│   └── cpp-memory-review.md       ← C++ memory safety (NDK only)
├── scripts/
│   └── gen_references.py          ← Structure scanner (--lightweight with CodeGraph)
└── references/
    ├── _scan.json                 ← Scan intermediate data
    ├── dependencies.md            ← Dependency graph (AI-generated)
    ├── conventions.md             ← Coding conventions (AI-generated)
    └── {module}.md × N            ← Module docs (AI-generated)
```

---

## 中文

### ai_scaffold 是什么？

ai_scaffold 是一套基于模板的脚手架系统，为你的现有项目生成完整的 AI 辅助开发框架。它通过**一套统一架构**支持 **4 种 AI 工具 × 5 种平台**。

你不再需要为每个项目手写 CLAUDE.md 和规则文件——ai_scaffold 自动检测项目类型，一键生成所有内容。

### 核心特性

- **多工具支持**：Claude Code、Qoder、Codex、OpenCode — 内容完全一致，仅"外壳"不同
- **多平台适配**：Android、iOS、鸿蒙、Flutter、React Native（及通用降级）
- **跨平台规则模板库**：根据项目类型自动注入平台专属规则——生命周期、状态管理、路由导航、构建约定、代码审查项和自检清单
- **分包架构**：规则、技能、Agent、Hook、参考资料按需加载，无臃肿单文件
- **冲突裁决**：多规则碰撞时有显式的优先级仲裁机制
- **自动生成 References**：脚本扫描项目结构 + AI 精读源码，生成准确的模块文档
- **主动纠错**：Agent 主动扫描代码合规性，而非被动审查
- **CodeGraph 集成**（可选）：自动检测 CodeGraph CLI——安装后 `references/` 采用轻量模式（仅架构决策+约定），结构探索由 CodeGraph 负责，相比手动扫描代码可减少约 90% 的 AI 工具调用

### 快速开始

#### 方式 A：CLI（推荐）

```bash
# 直接用 npx 运行（无需安装）
cd your-project/
npx ai-scaffold-pro

# 按交互提示操作：
# 1. 选择语言（中文 / English）
# 2. 选择 AI 工具（Claude Code / Qoder / Codex / OpenCode）
# 3. 自动检测项目
# 4. 回答配置问题
# 5. 文件生成到项目的配置目录
```

#### 方式 B：手动（通过 SKILL.md）

```bash
# 1. 克隆到项目同级目录
git clone https://github.com/Jorgejie/ai_scaffold.git

# 2. 在 Claude Code 中引用 SKILL.md 启动初始化

# 3. 按交互提示操作
```

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
