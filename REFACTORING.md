# 重构说明 - CLI + LLM 协作架构

## 概述

本次重构将 ai_scaffold 从"CLI独立完成所有工作"转变为"CLI搭建骨架 + AI深度初始化"的协作架构。

## 核心问题

### 重构前的问题
1. **CLI完全独立运行** - detect.js → prompts.js → render.js 全流程本地执行
2. **生成静态模板** - 只是变量替换,没有真正的AI理解和项目适配
3. **SKILL.md未被利用** - 定义了完整的AI初始化流程,但从未被调用
4. **CodeGraph检测形同虚设** - 检测了但没有AI来使用它
5. **References无法生成** - CLI提示用户手动运行脚本,但这步需要AI读源码

### 重构后的解决方案
1. **CLI职责明确** - 仅创建目录结构、复制基础文件、生成极简入口
2. **SKILL.md成为核心** - 作为AI执行的初始化操作手册
3. **AI深度参与** - 扫描源码、理解架构、生成定制化规则
4. **CodeGraph真正有用** - AI在初始化时会主动使用CodeGraph探索代码结构
5. **References自动生成** - AI基于源码生成准确的模块文档

## 架构对比

### 重构前
```
npx ai-scaffold-pro
  ↓ (全部本地执行)
询问11个问题 → 渲染模板 → 生成静态文件
  ↓
用户看到: 充满"Define XXX here"的占位符
  ↓
用户手动修改所有内容 😫
```

### 重构后
```
npx ai-scaffold-pro
  ↓ (仅骨架搭建)
检测项目 → 创建目录 → 生成极简入口
  ↓
提示: "在AI工具中按SKILL.md初始化"
  ↓
用户在Claude Code中: "按SKILL.md初始化"
  ↓ (AI执行)
扫描源码 → 理解架构 → 生成定制内容
  ↓
用户看到: 完全适配项目的规则体系 ✅
```

## 文件变更清单

### 新增文件

1. **cli/templates/skills/project_initialization/SKILL.md**
   - 从 ai_scaffold_skill/SKILL.md 移动过来
   - 重构为AI执行的初始化操作手册
   - 包含Phase 0-3的详细执行步骤
   - 增加执行检查清单

2. **cli/templates/minimal_entry.md**
   - 极简版入口文件模板
   - 包含项目基本信息和待初始化内容清单
   - 指引用户如何在AI工具中触发初始化

3. **cli/templates/AI_INIT_GUIDE.md**
   - 用户友好的初始化指南
   - 详细说明整个初始化流程
   - 包含常见问题解答

4. **cli/scripts/bootstrap.sh**
   - 一键启动脚本
   - 自动执行CLI + 显示AI初始化指引

### 修改文件

1. **cli/bin/cli.js**
   - 简化为主流程 orchestration
   - 移除完整模板渲染逻辑
   - 调用 createSkeleton 而非 renderTemplates
   - 输出清晰的下一步指引

2. **cli/src/prompts.js**
   - 新增 promptMinimalConfig 函数
   - 仅收集语言和AI工具选择(2个问题)
   - 移除原有的11个交互式问题
   - 保留 promptConfig 作为deprecated别名

3. **cli/src/render.js**
   - 新增 createSkeleton 函数替代 renderTemplates
   - 只创建目录结构和基础文件
   - 生成占位符文件提示AI需要生成内容
   - 保留辅助函数(renderContent, writeOutput等)

4. **cli/src/detect.js**
   - 增强检测日志输出
   - 显示更详细的检测过程信息
   - 提供CodeGraph安装建议

5. **cli/package.json**
   - 版本号升级为 2.0.0
   - 添加 files 字段确保所有必要文件被打包
   - 添加 bootstrap 脚本
   - 更新描述反映新架构

### 删除/废弃

- **ai_scaffold_skill/** 目录可以删除或保留作为文档参考
- **renderTemplates** 函数已废弃(保留在代码中但不再调用)
- **promptConfig** 函数已废弃(改为调用 promptMinimalConfig)

## 工作流程

### 用户使用流程

```bash
# Step 1: 在项目根目录执行
cd my-project/
npx ai-scaffold-pro

# CLI输出:
✅ Skeleton created successfully!

Next Steps:
1. Open this project in your AI tool
2. Enter command: "Initialize using .qoder/skills/project_initialization/SKILL.md"
3. AI will scan source code, understand architecture, generate customized rules

💡 Tip: See AI_INIT_GUIDE.md for detailed instructions
⏱️  Estimated AI initialization time: 2-5 minutes

# Step 2: 在AI工具中(Claude Code/Qoder等)
用户: "按 project_initialization skill 初始化本项目"

AI将自动执行:
- Phase 0: 检测当前状态
- Phase 1: 项目深度分析(运行gen_references.py,扫描源码)
- Phase 2: 交互式配置(7-11个问题)
- Phase 3: 生成定制化内容(rules/agents/skills/references)
- Phase 4: 验证与完成

# Step 3: 完成
✅ 初始化完成!现在可以开始使用AI辅助开发了。
```

### 可选: 使用bootstrap脚本

```bash
# 克隆仓库后
cd ai_scaffold/cli
bash scripts/bootstrap.sh

# 或在任何项目中
curl -sL https://raw.githubusercontent.com/Jorgejie/ai_scaffold/main/cli/scripts/bootstrap.sh | bash
```

## SKILL.md的关键改进

### 1. 明确身份定位
```markdown
> **重要**: 本文件不是给人类阅读的文档,而是AI执行初始化的操作手册。
> 当用户说"按SKILL.md初始化"时,AI应严格按以下Phase 0-3执行。
```

### 2. Phase 1增强 - 详细源码扫描步骤
- 运行 gen_references.py 获取 _scan.json
- 解析模块列表、依赖关系、文件树
- 对每个核心模块读取源文件
- 识别核心类、接口、数据模型
- 提取路由表、公共API
- 推断实际架构模式

### 3. Phase 3增强 - AI生成内容的具体要求
- **禁止直接复制模板**,必须基于实际项目
- project_rule.md 中的依赖方向从build.gradle实际提取
- 禁止模式表中列出项目中真实存在的问题
- 命名规范基于源码统计(80%以上使用的风格)
- References文档必须逐模块读取源码生成

### 4. 增加执行检查清单
```markdown
## 初始化完成检查清单

- [ ] project_rule.md中的依赖方向与实际build文件一致
- [ ] 禁止模式表中列出的都是项目中真实存在的问题
- [ ] 至少扫描了3个核心模块的源码并生成了references文档
- [ ] 如果安装了CodeGraph,已在入口文件中说明使用方法
- [ ] 所有{{VARIABLE}}占位符已被实际值替换
```

### 5. CodeGraph集成说明
- 当CodeGraph可用时,优先使用 `codegraph_explore` 工具
- references采用轻量模式(不包含文件列表)
- 当CodeGraph不可用时,references采用完整模式
- 在project_rule.md中明确说明使用方式

## 优势总结

### 1. 真正的项目理解
- ❌ 旧方案: `DEPENDENCY_RULES = "Define dependency rules here"`
- ✅ 新方案: `:app → :feature-home → :lib-core (单向依赖,禁止反向)`

### 2. SKILL.md价值最大化
- 从"摆设"变为"AI执行手册"
- 随CLI自动分发到用户项目
- 放置在skills目录可重复调用

### 3. CodeGraph真正有用
- CLI检测是否安装
- AI在初始化时主动使用
- 减少约90%的token消耗

### 4. References自动生成
- AI基于实际源码生成文档
- 包含类详情、API、设计模式
- 不再是空的占位符

### 5. 用户体验提升
- CLI快速搭建(10秒)
- AI智能填充(2-5分钟)
- 各司其职,发挥各自优势

## 测试建议

### 1. 基本功能测试
```bash
# 创建测试项目
mkdir test-project && cd test-project
git init

# 执行CLI
npx ai-scaffold-pro

# 验证生成的文件
ls -la .qoder/
cat .qoder/skills/project_initialization/SKILL.md
cat AGENTS.md
cat AI_INIT_GUIDE.md
```

### 2. AI初始化测试
```
在Claude Code/Qoder中打开test-project

输入: "按 project_initialization skill 初始化本项目"

观察AI是否:
- 正确读取SKILL.md
- 执行Phase 0-3的所有步骤
- 生成定制化的rules/agents/references
- 通过所有检查清单
```

### 3. 多平台测试
分别在以下类型的项目中测试:
- Android (Gradle)
- iOS (Xcode)
- Flutter
- HarmonyOS
- React Native
- Node.js

### 4. CodeGraph集成测试
```bash
# 安装CodeGraph
npx @colbymchenry/codegraph

# 重新运行CLI
npx ai-scaffold-pro

# 验证:
# - CLI检测到CodeGraph
# - SKILL.md中使用轻量模式
# - AI在初始化时使用codegraph_explore
```

## 后续优化方向

1. **增加进度提示** - AI在初始化过程中显示当前阶段
2. **支持增量更新** - 检测已有配置,只更新变化的部分
3. **可视化报告** - 生成初始化完成的HTML报告
4. **模板优化** - 根据实际使用反馈持续优化SKILL.md
5. **更多平台支持** - 扩展detect.js支持更多项目类型

## 迁移指南

### 对于已有用户

如果你之前使用过 ai_scaffold v1.x:

1. **卸载旧版本**
   ```bash
   npm uninstall -g ai-scaffold-pro
   ```

2. **使用新版本**
   ```bash
   npx ai-scaffold-pro@latest
   ```

3. **在AI工具中重新初始化**
   - 打开项目
   - 执行: "按 project_initialization skill 初始化"
   - AI将生成完整的定制化内容

### 对于新项目

直接使用新版本,按照上述工作流程操作即可。

## 总结

这次重构彻底解决了"CLI独立完成所有工作导致生成静态模板"的问题,实现了真正的CLI + LLM协作架构:

- **CLI**: 快速搭建骨架,检测项目类型,创建目录结构
- **SKILL.md**: 作为AI的执行手册,指导AI完成深度初始化
- **AI**: 扫描源码,理解架构,生成真正适配项目的规则体系

这种分工充分发挥了CLI的速度优势和AI的智能优势,为用户提供最佳的初始化体验。

---

**版本**: v2.0.0  
**更新日期**: 2026-05-31  
**作者**: ai_scaffold 团队
