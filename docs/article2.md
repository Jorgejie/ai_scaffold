# ai_scaffold：一个为 AI 编码助手设计项目运行环境的骨架——架构、对比与选型指南

> 本文是「AI 辅助开发实践」专栏的第二篇。前不久我分享了在一个 Android 组件化项目中搭建规则体系的经验。那篇文章发布后，不少朋友问同一个问题：**"这套东西能不能直接搬到我的项目里？"** 答案是能，但需要工具化。这篇文章介绍我们把这套方法论做成的开源工具——ai_scaffold，以及它和同类方案相比到底适合什么场景。

---

## 1. 从"我项目里的规则"到"能给别人用的骨架"

回顾一下上一篇的核心结论：**AI 编码助手的效果，上限不是模型能力，而是你喂给它的上下文质量。** 规则要按需加载，References 要准确可查，触发条件要有否定词保护——这些是那个 Android 项目踩了半年坑总结出来的。

但问题也在这里。那套规则体系是**为特定项目量身定制的**：
- 类名、包名、路径全部硬编码
- 只适配 Qoder 一种工具
- 平台约束全部为 Android 服务
- 每次开新项目，整件事情从头再来一遍

如果你想在自己项目里复制这套体系，要么手写——面对一个 20+ 模块的项目，光写 References 就要搭进去好几天；要么 fork 我们的仓库改——但改到能适配你的 Flutter 或鸿蒙项目，工作量不比自己写少多少。

**所以根本问题不是"规则体系有没有用"，而是"创建规则体系的成本有多高"。** 如果初始化成本是零——一个命令，几分钟交互，自动适配你的技术栈——那这件事的门槛就完全不一样了。

这就是 ai_scaffold 要解决的事。

---

## 2. 整体架构：三个引擎驱动一套骨架

ai_scaffold 不是一个"规则模板仓库"——它是把规则体系的创建过程**工程化**成了一个 CLI 工具。你运行 `npx ai-scaffold`，它在背后跑了三个引擎：

```
                     npx ai-scaffold
                          │
     ┌────────────────────┼────────────────────┐
     ▼                    ▼                    ▼
┌──────────┐       ┌──────────┐       ┌──────────────┐
│ 检测引擎  │       │ 交互引擎  │       │  渲染引擎     │
│          │       │          │       │              │
│ 平台类型  │──────▶│ AI 工具   │──────▶│ Handlebars   │
│ 构建系统  │       │ 项目配置  │       │ 模板编译     │
│ 开发语言  │       │ 架构约束  │       │ i18n 双语    │
│ NDK/C++  │       │ CodeGraph │       │ 平台变量注入  │
│ CodeGraph│       │ (可选安装)│       │ 事务安全输出  │
└──────────┘       └──────────┘       └──────────────┘
```

**检测引擎**做的事情很纯粹——读你的项目根目录，通过特征文件反推项目类型。`settings.gradle` → Android，`pubspec.yaml` → Flutter，`hvigor-config.json5` → 鸿蒙，`*.xcodeproj` → iOS，`package.json`+react-native 依赖 → React Native。支持到什么程度？一个纯 `package.json` 项目，它能区分出是 Next.js、React、Vue 还是 Node.js 后端，不需要你手动指定。

**交互引擎**是"把隐性知识显性化"的过程。11 个问题（NDK 项目追加 4 个）涵盖了从项目名称、构建命令到架构约束、禁止模式的所有信息。这些问题本身就是在做一件事：**把你脑袋里关于这个项目该怎么做的东西，翻译成 AI 能理解的规则。**

**渲染引擎**也许是最被低估的一层。它用 Handlebars 做模板编译，关键设计是**事务安全**——先把所有文件渲染到 `/tmp/ai-scaffold-xxxxx/` 临时目录，验证没有残留的 `{{VARIABLE}}` 占位符，全部通过后才整体拷贝到目标目录。出错了不会在你的项目里留下一地垃圾。

---

## 3. CodeGraph 集成：分工比单干更聪明

ai_scaffold 最新迭代里最大的变化，是和 [CodeGraph](https://github.com/colbymchenry/codegraph) 的深度集成。理解这个集成需要先理解一个前提：

**AI 编码助手的上下文窗口是有限资源。** 你把 40 个模块的完整目录结构和文件列表全塞进去，token 消耗直奔十万级，但 AI 实际用到这些结构信息来"找东西"的时刻并不多。大部分时候，AI 需要的是**精准的语义信息**——这个模块是干什么的、架构决策是什么、命名约定是什么——而不是"第 3 层目录下有 47 个 .kt 文件"。

CodeGraph 解决的正是这个问题。它是一个预索引的代码关系图工具，能让你用 `codegraph_explore` 工具做结构化的代码搜索（查类定义、方法签名、调用关系）。当它可用时，ai_scaffold 的 References 切换到**轻量模式**：

| | 不带 CodeGraph | 带 CodeGraph |
|---|---|---|
| References 包含 | 完整文件列表 + 目录树 + 架构 + 约定 | 架构决策 + 业务逻辑摘要 + 约定 |
| 结构探索 | AI 读 _scan.json 查文件 | `codegraph_explore` 工具 |
| _scan.json 大小 | ~970 字节（最小项目） | ~600 字节（同项目） |
| AI 工具调用 | 每次找文件都消耗 token | 结构探索零 token 消耗 |

这不仅是数据量的差别。更重要的变化是**职责分离**：
- CodeGraph 管结构——"这个类在哪、谁调用了它、它有哪些方法"
- References 管语义——"这个模块为什么这样设计、应该怎么用它、踩过什么坑"

ai_scaffold 的 CLI 在初始化时会自动检测 CodeGraph 是否已安装。如果未安装，会问你"要不要装？"——选是，自动执行 `npx @colbymchenry/codegraph` 完成安装和项目初始化。选否，References 切回完整模式，一切照常。

这个设计的核心哲学是：**不要假装一个工具能做所有事。** 让擅长查结构的工具管结构，让擅长写文档的 AI 管语义，让擅长做骨架的脚手架管规则——各自做最擅长的那部分，配合起来才是最优解。

---

## 4. 生成出来的体系长什么样

ai_scaffold 生成的文件结构如下。这不是"一个模板生成 14 个文件"——是**同一个骨架，根据你的回答和检测结果，生成的 14 个文件内容完全不同**：

```
AGENTS.md / CLAUDE.md              ← 入口调度层（含 CodeGraph 集成说明）
{{DIR}}/                           ← .qoder / .claude / .codex / .opencode
├── CHANGELOG.md                   ← 版本记录
├── settings.json                  ← Hook 注册
├── settings.local.json            ← 本地权限
├── hooks/
│   ├── post-edit-tracker.sh       ← 编辑追踪（会话级）
│   └── check-review-needed.sh     ← 审查提醒（阈值触发）
├── rules/
│   ├── project_rule.md            ← 主规则（含 CodeGraph/NDK 条件分支）
│   └── conflict_resolution.md     ← 多规则冲突裁决
├── skills/
│   ├── plan_mode/SKILL.md         ← 任务结构化拆分
│   └── code_review/SKILL.md       ← 三级审查（致命/警告/建议）
├── agents/
│   ├── arch-review.md             ← 架构合规审查
│   ├── resource-sync.md           ← 资源一致性检查
│   ├── proactive-correction.md    ← 主动纠错（可执行修正）
│   └── cpp-memory-review.md       ← C++ 内存安全（NDK 项目专属）
├── scripts/
│   └── gen_references.py          ← 项目结构扫描器
└── references/
    ├── _scan.json                 ← 扫描中间数据
    ├── dependencies.md            ← 依赖关系图（AI 生成）
    ├── conventions.md             ← 编码约定（AI 生成）
    └── {module}.md × N            ← 模块文档（AI 逐源码精读生成）
```

说一下里面最花设计精力的几个模块：

**project_rule.md** 是整个体系的心脏。它不是一份静态文档，而是一个**条件编译的规则生成器**。根据项目是否包含 NDK 代码，它决定要不要插入 C++ 内存安全章节和 JNI 引用管理表格。根据是否安装了 CodeGraph，它决定行为准则的措辞——是"先查 references/ 目录"还是"优先用 codegraph_explore 查结构"。一个模板，多种产出。

**proactive-correction** Agent 是上一版"自查清单"的升级形态。自查清单是被动的——AI 生成代码后逐项对照。这个 Agent 是主动的——在你碰任何源码文件时都会顺便扫一遍合规性。它和其他三个 Agent（arch-review、resource-sync、cpp-memory-review）的互补关系经过了精心设计：proactive-correction 扫全量 + 可执行修正；其他三个只扫变更 + 只读报告。

**gen_references.py** 是 AI 和传统脚本的分工标杆——脚本负责项目结构扫描（依赖解析、文件树构建），AI 负责语义理解（读源码、推断设计意图、写文档）。两者都不跨界。脚本不懂源码语义，AI 也不需要写正则去解析 build 文件。

---

## 5. 同类方案对比：ai_scaffold 的定位在哪

### Continue.dev

Continue 是一个 IDE 插件，提供代码补全、聊天、内联编辑等功能。它有一套规则系统（Rules），但规则的定位是**"给聊天和补全提供系统级指令"**——类似于一段自定义 system prompt。

核心区别在于粒度和自动化程度：
- Continue 的规则是**手动编写的全局指令**，你需要自己写、自己维护
- ai_scaffold 是**自动生成的完整规则体系**，包含触发策略、否定词保护、条件分支、跨规则冲突裁决

Continue 适合"我只想在 IDE 里加几条规则约束"的轻量场景，ai_scaffold 适合"我要一整套 AI 编码协作体系"的重度场景。

### Aider / Cline / OpenHands

这类工具的核心场景是**"AI 直接帮你改代码"**——交互式结对编程，AI 在对话中逐步修改文件。它们的优势是交互体验好、改代码快，劣势是一般不提供系统化的规则管理——规则通常就是一段 prompt 或一个 system message。

ai_scaffold 和它们不在同一层上工作。它不参与代码修改过程，而是在**项目初始化阶段**建立规则基础设施。你完全可以把 ai_scaffold 生成的规则文件拿给 Aider 或 Cline 用——它们的规则加载机制通常是读本地文件。

### create-*-app 系列

`create-react-app`、`create-next-app` 这类工具的职责是**生成项目骨架**——给你一套目录结构、配置文件、示例代码。它们的输入是"我要一个 React 项目"，输出是"一个能跑起来的 React 空项目"。

ai_scaffold 的职责是**给已有项目加 AI 规则骨架**。输入是"我有一个 Android 组件化项目"，输出是"一套 AI 编码助手能理解和遵守的规则体系"。它不管你项目本身怎么组织——你的源码目录、build 文件、依赖关系，ai_scaffold 全部按原样保留。

### 总览

| | ai_scaffold | Continue | create-*-app |
|---|---|---|---|
| 核心场景 | 生成 AI 规则基础设施 | IDE 内代码辅助 | 生成项目模板 |
| 规则生成 | 自动检测 → 模板生成 | 手动编写规则 | 无 |
| 多工具支持 | 4 种（Qoder/Claude Code/Codex/OpenCode）| 多模型通用 | 无 |
| 多平台模板 | 5 种（Android/iOS/Harmony/Flutter/RN） | 无 | 取决于具体工具 |
| CodeGraph 集成 | 自动检测 + 轻量/完整双模式 | 无 | 无 |
| Agent 体系 | 4 个 Agent + 主动纠错 | 无 | 无 |
| Hook 体系 | 编辑追踪 + 审查提醒 | 无 | 无 |
| 初始化方式 | `npx ai-scaffold` | IDE 设置 | `npx create-*-app` |
| 适用阶段 | 已有项目的 AI 化改造 | 日常编码 | 新项目创建 |

---

## 6. 已用了 openspec + superpowers，这个框架还有存在的必要吗

这是最常被问到的问题，也是最应该认真回答的问题。我自己也在项目里同时用这些工具，所以这个判断不是纸上谈兵。

先说结论：**看你的项目类型。** 如果你在做一个纯 Web 前端项目，答案大概率是"没必要"。如果你在做移动端或多平台开发，答案大概率是"值得加"。

### 三者各自解决什么问题

openspec 和 superpowers 都是优秀的工具——但它们和 ai_scaffold 工作在不同的层面上：

| | openspec | superpowers | ai_scaffold |
|---|---|---|---|
| 解决的问题 | 规范驱动开发（定义**做什么**） | 工程能力增强（提供**怎么做的能力**） | 项目规则基础设施（定义**制作的边界**） |
| 类比 | 施工图纸 | 瑞士军刀 | 入场前的全套环境准备 |
| 运作阶段 | 开发中 | 开发中 | **进项目第一天** |
| 项目感知 | 零——需要在 config.yaml 手写 context | 零——靠交互式问答推断 | **自动扫描**：检测 14 种平台指标 |
| 规则质量 | 通用占位模板（"包含回滚方案"） | 不生成项目规则 | 平台特化（"Fragment 用 viewLifecycleOwner"） |
| 多工具支持 | 25+（slash command 适配） | 主要为 Claude Code | 4 工具同构输出 |

openspec 和 superpowers 做的事情，用一句话概括是"**让 AI 变得更强**"——前者用 spec 驱动保证方向正确，后者用 TDD 和 multi-agent 保证执行质量。它们都假设 AI 已经知道你的项目是什么。

ai_scaffold 做的事情是"**让 AI 先认识你的项目**"——它告诉 AI 这个项目是 Android 的不是 iOS 的、是 Gradle 8.0 不是 Maven、NDK 版本是 25、路由必须走 ARouter、数据层必须走 Repository 模式。

### 它们的缺口在哪里

openspec 生成的 `config.yaml` 里有一段 rules 配置，但它长这样：

```yaml
rules:
  proposals:
    - "Include rollback plan for risky changes"
  specs:
    - "Use Given/When/Then format for scenarios"
```

这是**通用规则**，适用于任何项目。它不会告诉你"这个 Android 项目的模块依赖方向是 libcore → libapi → 业务模块，不可反向依赖"。

superpowers 不生成规则。它的代码审查能力基于通用的 OWASP Top 10、性能、安全 checklist。它不会告诉你"这个项目禁止 `new Intent()` 直接跳转，必须走 ARouter 注册"。

**这不是 openspec 或 superpowers 的缺陷——这是它们合理的设计边界。** 通用工具不该内嵌平台特定知识。但这也意味着，如果你的项目有大量平台特定的隐性知识，这些工具无能为力。

### 什么情况下值得加 ai_scaffold

如果你符合以下场景，ai_scaffold 的增量价值是明确的：

**移动端原生开发（Android / iOS / 鸿蒙）。** openspec 帮你管理 spec，superpowers 帮你跑 TDD 和 multi-agent review——但你的 AI 仍然不知道"RecyclerView 的 Adapter 要用 ViewBinding"、"iOS 的 retain cycle 要用 weak self"、"鸿蒙的 ArkUI 状态管理要区分 @State 和 @Link"。这些知识在 ai_scaffold 的平台模板里是预写的，初始化就灌进去。你不是在"再配置一套工具"，而是在所有工具启动之前，先把项目的地基打清楚。

**多平台项目（Android + iOS 双端，或从 Android 扩展到鸿蒙）。** 一个项目可能同时有 Android 和 iOS 代码。openspec 和 superpowers 对两个平台一视同仁——它们不知道该给哪个文件用什么约束。ai_scaffold 的 detect.js 会同时检测出所有平台，并在生成的规则中联动——跨平台通信约定、共享资源命名规范、多端一致性检查。

**有 C++ / NDK 代码的移动项目。** JNI 引用泄漏、线程安全、签名一致性——这是常规 AI 编码助手的重灾区。openspec 不会管你的 JNI 实现是否安全，superpowers 的代码审查也覆盖不到 JNI 的 `DeleteLocalRef` 时机。ai_scaffold 检测到 NDK 后会自动注入 JNI 专项规则和 `cpp-memory-review` Agent——这是少有的"专属领域知识"。

**同时使用多个 AI 工具。** openspec 支持 25+ 工具，但它不给你生成每个工具的专属规则文件——它提供的是 slash command 适配。ai_scaffold 做的是**四体同构**：同一套规则体系，同时生成 Claude Code、Qoder、Codex、OpenCode 的格式。团队里有人用 Claude Code、有人用 Cursor，大家读到的约束完全一致，不需要各自维护各自的配置。

### 什么情况下不需要加

**纯 Web 项目（React / Vue / Next.js / Node）。** Web 项目的平台特定规则密度远低于移动端。openspec 的 context 字段 + superpowers 的 TDD 流程对这个场景足够。ai_scaffold 的 Android 生命周期规则在 Web 项目里毫无用处，生成的 14 个文件一大半是冗余的。

**已有成熟的 CLAUDE.md 体系且团队满意。** 如果你的团队已经花时间打磨了一套规则文件，且实际效果不错，保持现状更好。ai_scaffold 更适合"从零搭建"或"想系统化但不知道怎么写"的场景。

**小型单人项目。** 2-3 个模块的 Web 服务端，架构约束少，手写一个 CLAUDE.md 十分钟搞定。完整的规则体系在这种规模下就是 overengineering。

### 三者一起用的真实场景

我自己在项目里的实际组合是：**ai_scaffold 做初始化，之后 openspec + superpowers 并行使用。** 它们不冲突——ai_scaffold 只在项目第一天上场，生成完规则体系后就退场。之后 openspec 管理 spec 生命周期、superpowers 提供 TDD 和 code review 能力。它们是上下游，不是替代关系。

如果你刚接手一个 Android 多模块项目，理想的流程是这样的：

1. `npx ai-scaffold`——5 分钟交互，生成包含 ARouter 规范、MVVM 分层、JNI 安全规则的完整骨架
2. `openspec init`——建立 spec 管理流程
3. `/superpowers:brainstorm`——开始第一个需求的规范设计和 TDD 开发

**第一步定义的约束，会在后续每一步里被 AI 遵守。** 这就是 ai_scaffold 的定位——不是在 openspec 和 superpowers 旁边再加一个竞争者，而是在它们之前加一个"环境setup"层。

---

## 7. 什么项目适合用 ai_scaffold

不是所有项目都需要一套完整的 AI 规则体系。我给一个判断框架：

### 强烈推荐使用的场景

**多模块/多仓库的大型项目。** 模块数超过 5 个，依赖关系有明确的方向约束，存在跨模块通信的约定——这种项目的隐性知识密度很高。AI 如果不理解"Feature 模块不能直接 import Common 模块以外的模块""跨模块数据必须通过 ARouter 传递"这类约束，产生的代码八成要返工。ai_scaffold 能把这些约束从人脑里搬到 AI 的上下文里，且按需加载不浪费 token。

**多平台团队。** 团队里同时有 Android、iOS 和 Flutter 项目，或者正在从 Android 扩展到鸿蒙。ai_scaffold 一套骨架出 5 种平台输出，共用冲突裁决、Agent、Hook 体系，团队学一次规则结构就能在所有项目间复用。

**切换 AI 工具中或同时使用多个工具。** 团队里有人在用 Claude Code、有人在用 Qoder——两边的规则应该完全一致。ai_scaffold 的"四体同构"设计保证你改一次规则配置，重新生成就能在所有工具上保持一致。

**有 C++ / NDK 代码的移动项目。** JNI 引用泄漏、内存安全、签名一致性——这些领域 AI 如果不被明确约束，出错的概率远高于纯 Kotlin/Java 代码。ai_scaffold 的 NDK 条件分支会在检测到 C++ 代码后自动追加 JNI 专项规则和 cpp-memory-review Agent。

### 可以考虑的场景

**中型团队（5-15 人）的单一平台项目。** 维护一套规则体系的收益是有的，但如果项目结构清晰且团队编码习惯一致性高，手动维护 CLAUDE.md 也许就够了。可以先用 CLI 生成一版，根据实际效果调整。

**已经有一套规则文件但想规范化管理的项目。** ai_scaffold 支持覆盖/补充/取消三种策略。你可以用它生成标准骨架，再把你现有的自定义规则合并进去。

### 可能不需要的场景

**单人项目或小型原型。** 项目模块数 ≤2，没有复杂的架构约束，团队就你一个人——手写一个 CLAUDE.md 的投入产出比更高。一套完整的规则体系在这种规模下是 overengineering。

**纯通用编程场景。** 如果你的项目就是几个脚本文件，没有"模块依赖方向""资源前缀规范""路由注册流程"这类约束，ai_scaffold 生成的大部分内容会变成冗余信息。

**已经有成熟的 AI 规则管理方案的团队。** 如果你的团队已经建立了一套自己维护的 CLAUDE.md + 规则文件，且运行良好——保持现状可能比迁移成本更低。ai_scaffold 更适合"从零搭建"或"体系化改造"的场景。

---

## 8. 几个有意思的技术决策

说几个在实现过程中不那么明显的设计选择，它们各自解决了一个具体问题：

### 事务安全渲染

模板系统常见的问题是：渲染到一半失败了，项目目录里留下一堆半成品文件。ai_scaffold 的做法是**全部渲染到 `/tmp` 目录，验证通过后整体拷贝**。验证逻辑包括检查所有 `.md`、`.json`、`.sh`、`.py` 文件中是否有残留的 `{{VARIABLE}}` 占位符——如果有任何一个没被替换，说明模板变量传递出了问题，整体回滚。

### 平台变量注入用动态 import

ai_scaffold 不把 5 个平台的规则写死在 render.js 里。每个平台的规则模块是一个独立的 JS 文件（`platforms/android.js`、`platforms/ios.js` 等），导出 `getPlatformVars(lang)` 函数。渲染引擎根据检测到的平台名**动态 import** 对应的模块。这意味着一件事：**加一个新平台只需要加一个 JS 文件，不改任何现有代码。** 目前支持 5 个平台，扩展到 10 个不需要重构。

### 否定词保护：关键词匹配 + 语义二次判断

上一篇文章花了很大篇幅讲否定词保护。ai_scaffold 把它做成了入口文件（AGENTS.md / CLAUDE.md）中的标准配置——5 种否定模式（已关闭/类比/通用概念/明确排除/间接引用），每一种都有具体的过滤逻辑。AI 工具在加载模块前，必须先过这层语义判断，不是碰了关键词就触发。

### gen_references.py 的增量 diff

首次扫描全量没问题。但你改了一个文件就要扫全量 40 个模块——每次操作翻倍的 token 消耗，时间一长就劝退了。`--diff` 模式在做的事是**对比上一次的 `_scan.json` 和当前结构，只输出变化的部分**。模块新增/删除/重命名（基于文件相似度判断）/ 文件变更——四种场景，只触发差异部分的 AI 重新生成。对 30+ 模块的项目，token 节省是数量级的。

---

## 9. 还不够好的地方

坦诚列出当前明显的短板：

**平台模板的覆盖度不均。** Android 和 iOS 的规则模板最完善（因为这两个平台的项目经验最多），HarmonyOS、Flutter、React Native 的模板相对薄弱。这不是技术问题，是项目经验积累问题——没有在这些平台上踩过足够的坑，就写不出好的规则。

**冲突裁决表的覆盖有限。** 目前 conflict_resolution.md 中的裁决表主要覆盖了 proactive-correction 与其他 Agent 的冲突场景。随着规则数量增长，不同规则之间的交叉冲突需要持续补充裁决条目。这个机制本身是对的，但内容还需要增长。

**AI 生成的 References 没有质量校验。** "脚本扫描 + AI 精读"的方案比纯手写好，但 AI 读源码生成文档时仍然可能遗漏 KDoc 注释中没写但代码逻辑中实际存在的设计意图。需要一个独立的验证步骤——比如对比生成的文档中的类数量与实际源码中的类数量，或者抽查关键类的文档信息完整性。

**没有效果度量仪表盘。** 目前只有 Hook 做的文件修改计数和审查提醒。理想情况下应该有一个面板告诉你：每个 Agent 的触发频率、审查发现问题的严重程度分布、规则修改后的影响面。这套东西是"规则体系的规则体系"——知道哪些规则有效、哪些规则形同虚设，才能持续优化。但目前还缺。

---

## 10. 总结

回到一个核心问题：**为什么需要 ai_scaffold？**

因为**把项目知识喂给 AI 这件事，目前的工具支持还处在非常原始的阶段。** 现有的方案要么是手写 CLAUDE.md（投入大、维护难），要么是 IDE 插件里写几条规则指令（粒度粗、无体系），要么是 spec 管理工具（管"做什么"不管"制作的边界"），要么是工程能力工具（管"能力"不管"规则"）。

ai_scaffold 做的事是**把这整个流程系统化**——自动检测项目类型，交互式收集约束，模板化生成规则文件，在生成的规则里内置触发策略、否定词保护、冲突裁决、Agent 委派逻辑。你的角色从"写规则的人"变成了"确认规则的人"——CLI 生成初版，你审查调整。

CodeGraph 的集成让这件事多了一个维度：**不是把所有信息都往 AI 的上下文里塞，而是让合适的信息待在合适的地方。** 结构信息放 CodeGraph，语义信息放 References——各司其职，合用不冗余。

最后，如果你在评估要不要用这套东西，我的建议是：**看你的项目隐性知识的密度。** 密度越高（模块多、约束多、约定多、平台特定字段多），ai_scaffold 的投入产出比越高。如果项目结构简单、团队配置一致、且已经有一套运行良好的规则体系——保持现状就好。工具是为场景服务的，不要为了用工具而用工具。

如果你已经在用 openspec 和 superpowers，ai_scaffold 不是来替代它们的。它做的事恰恰是这两个工具都没做的——**在一切开始之前，让 AI 真正认识你的项目。**

---

> 项目地址：[https://github.com/Jorgejie/ai_scaffold](https://github.com/YOUR_USERNAME/ai_scaffold)（即将开源，欢迎提前关注）
>
> 如果你也在做 AI Coding 的项目落地，或者有更好的规则管理实践，欢迎交流。
