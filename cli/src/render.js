import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import { getPlatformVars } from './platforms/index.js';
import { registerI18n } from '../i18n/index.js';

// Register helpers
Handlebars.registerHelper('if', function (conditional, options) {
  if (conditional) {
    return options.fn(this);
  }
  return options.inverse(this);
});

const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

function getSmartDefaults(platform, lang) {
  const defaults = {
    Android: {
      zh: {
        DEPENDENCY_RULES: 'App → Feature → Common → Base（单向依赖，禁止反向引用）',
        COMMUNICATION_MECHANISM: 'ARouter 跨模块路由 + EventBus/LiveData 事件通信',
        INHERITANCE_RULES: 'Activity 继承 BaseActivity，Fragment 继承 BaseFragment，ViewModel 继承 BaseViewModel',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | 硬编码颜色值 | 使用 colors.xml 资源引用 | 主题适配无法统一 |\n| 2 | 直接 Intent 跳转 | 使用 ARouter | 模块解耦 |\n| 3 | 主线程网络请求 | 使用 suspend + Dispatchers.IO | ANR 风险 |\n| 4 | 非 ViewBinding 视图访问 | 使用 ViewBinding | 空指针风险 |',
        CLASS_NAMING: 'Activity: 功能名+Activity (如 LoginActivity)\nFragment: 功能名+Fragment\nViewModel: 功能名+ViewModel\nAdapter: 功能名+Adapter',
        RESOURCE_PREFIX: '模块名_ (如 home_btn_submit, login_tv_title)',
        LAYOUT_NAMING: '类型_模块_描述 (如 activity_login, fragment_home, item_user_list)',
      },
      en: {
        DEPENDENCY_RULES: 'App → Feature → Common → Base (unidirectional, no reverse references)',
        COMMUNICATION_MECHANISM: 'ARouter cross-module routing + EventBus/LiveData event communication',
        INHERITANCE_RULES: 'Activity extends BaseActivity, Fragment extends BaseFragment, ViewModel extends BaseViewModel',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | Hardcoded colors | Use colors.xml resource reference | Cannot unify themes |\n| 2 | Direct Intent navigation | Use ARouter | Module decoupling |\n| 3 | Network requests on main thread | Use suspend + Dispatchers.IO | ANR risk |\n| 4 | Non-ViewBinding view access | Use ViewBinding | Null pointer risk |',
        CLASS_NAMING: 'Activity: FeatureName+Activity (e.g. LoginActivity)\nFragment: FeatureName+Fragment\nViewModel: FeatureName+ViewModel\nAdapter: FeatureName+Adapter',
        RESOURCE_PREFIX: 'module_name_ (e.g. home_btn_submit, login_tv_title)',
        LAYOUT_NAMING: 'type_module_desc (e.g. activity_login, fragment_home, item_user_list)',
      }
    },
    iOS: {
      zh: {
        DEPENDENCY_RULES: 'Feature → Core → Foundation（单向依赖，禁止 Feature 间直接引用）',
        COMMUNICATION_MECHANISM: 'Protocol 抽象接口 + NotificationCenter 事件通知 + Combine Publisher',
        INHERITANCE_RULES: 'ViewController 继承 BaseViewController，View 继承 BaseView',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | 强引用循环 | 使用 [weak self] / [unowned self] | 内存泄漏 |\n| 2 | 主线程阻塞 | 使用 async/await 或 DispatchQueue | UI 卡顿 |\n| 3 | 硬编码字符串 | 使用 Localizable.strings | 国际化支持 |\n| 4 | 直接访问 UserDefaults | 使用封装的 Storage 层 | 数据层解耦 |',
        CLASS_NAMING: 'ViewController: 功能名+ViewController\nView: 功能名+View\nViewModel: 功能名+ViewModel\nService: 功能名+Service',
        RESOURCE_PREFIX: '模块名前缀 (如 Home_, Login_)',
        LAYOUT_NAMING: 'N/A (iOS 使用代码布局或 XIB/Storyboard)',
      },
      en: {
        DEPENDENCY_RULES: 'Feature → Core → Foundation (unidirectional, no direct Feature-to-Feature references)',
        COMMUNICATION_MECHANISM: 'Protocol abstraction + NotificationCenter events + Combine Publisher',
        INHERITANCE_RULES: 'ViewController extends BaseViewController, View extends BaseView',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | Strong reference cycles | Use [weak self] / [unowned self] | Memory leak |\n| 2 | Main thread blocking | Use async/await or DispatchQueue | UI freeze |\n| 3 | Hardcoded strings | Use Localizable.strings | i18n support |\n| 4 | Direct UserDefaults access | Use wrapped Storage layer | Data layer decoupling |',
        CLASS_NAMING: 'ViewController: FeatureName+ViewController\nView: FeatureName+View\nViewModel: FeatureName+ViewModel\nService: FeatureName+Service',
        RESOURCE_PREFIX: 'Module prefix (e.g. Home_, Login_)',
        LAYOUT_NAMING: 'N/A (iOS uses code layout or XIB/Storyboard)',
      }
    },
    Flutter: {
      zh: {
        DEPENDENCY_RULES: 'Feature → Domain → Data → Core（Clean Architecture 分层，禁止反向依赖）',
        COMMUNICATION_MECHANISM: 'Provider/Riverpod 状态管理 + GoRouter 路由导航',
        INHERITANCE_RULES: 'StatefulWidget 使用 mixin 复用逻辑，StatelessWidget 优先',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | BuildContext 跨异步使用 | 异步前检查 mounted | Context 失效崩溃 |\n| 2 | setState 深层嵌套 | 使用状态管理方案 | 性能问题 |\n| 3 | 硬编码尺寸值 | 使用 MediaQuery / LayoutBuilder | 适配问题 |\n| 4 | Widget 树过深 | 拆分为子 Widget | 可维护性 |',
        CLASS_NAMING: 'Page: 功能名+Page\nWidget: 功能名+Widget\nProvider: 功能名+Provider\nRepository: 功能名+Repository',
        RESOURCE_PREFIX: 'N/A (Flutter 使用 assets/ 目录结构)',
        LAYOUT_NAMING: 'N/A (Flutter 使用 Widget 组合)',
      },
      en: {
        DEPENDENCY_RULES: 'Feature → Domain → Data → Core (Clean Architecture layers, no reverse deps)',
        COMMUNICATION_MECHANISM: 'Provider/Riverpod state management + GoRouter navigation',
        INHERITANCE_RULES: 'StatefulWidget uses mixin for logic reuse, prefer StatelessWidget',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | BuildContext across async | Check mounted before async | Context invalidation crash |\n| 2 | Deep setState nesting | Use state management solution | Performance issues |\n| 3 | Hardcoded dimensions | Use MediaQuery / LayoutBuilder | Adaptation issues |\n| 4 | Deep Widget tree | Split into sub-widgets | Maintainability |',
        CLASS_NAMING: 'Page: FeatureName+Page\nWidget: FeatureName+Widget\nProvider: FeatureName+Provider\nRepository: FeatureName+Repository',
        RESOURCE_PREFIX: 'N/A (Flutter uses assets/ directory structure)',
        LAYOUT_NAMING: 'N/A (Flutter uses Widget composition)',
      }
    },
    HarmonyOS: {
      zh: {
        DEPENDENCY_RULES: 'Feature HAP → Common HSP → Base HSP（单向依赖）',
        COMMUNICATION_MECHANISM: 'Router 页面路由 + EventHub 组件通信 + AppStorage 全局状态',
        INHERITANCE_RULES: '页面组件继承基础页面封装，使用 @Component 装饰器',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | 非 @State 状态直接修改 | 使用 @State/@Link/@Prop 装饰器 | UI 不更新 |\n| 2 | 主线程耗时操作 | 使用 TaskPool/Worker | 界面卡顿 |\n| 3 | 硬编码资源引用 | 使用 $r() 资源引用 | 多设备适配失败 |\n| 4 | 直接操作 DOM | 使用声明式 UI | 框架约束 |',
        CLASS_NAMING: 'Page: 功能名+Page\nComponent: 功能名+Comp\nModel: 功能名+Model\nService: 功能名+Service',
        RESOURCE_PREFIX: '模块名_ (如 home_icon_, login_bg_)',
        LAYOUT_NAMING: 'N/A (HarmonyOS 使用 ArkUI 声明式布局)',
      },
      en: {
        DEPENDENCY_RULES: 'Feature HAP → Common HSP → Base HSP (unidirectional)',
        COMMUNICATION_MECHANISM: 'Router page navigation + EventHub component communication + AppStorage global state',
        INHERITANCE_RULES: 'Page components extend base page wrapper, use @Component decorator',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | Direct state mutation without @State | Use @State/@Link/@Prop decorators | UI not updating |\n| 2 | Heavy operations on main thread | Use TaskPool/Worker | UI freeze |\n| 3 | Hardcoded resource references | Use $r() resource reference | Multi-device adaptation failure |\n| 4 | Direct DOM manipulation | Use declarative UI | Framework constraint |',
        CLASS_NAMING: 'Page: FeatureName+Page\nComponent: FeatureName+Comp\nModel: FeatureName+Model\nService: FeatureName+Service',
        RESOURCE_PREFIX: 'module_name_ (e.g. home_icon_, login_bg_)',
        LAYOUT_NAMING: 'N/A (HarmonyOS uses ArkUI declarative layout)',
      }
    },
    'React Native': {
      zh: {
        DEPENDENCY_RULES: 'Screen → Component → Hook → Service（分层依赖，禁止 Service 引用 UI 层）',
        COMMUNICATION_MECHANISM: 'React Navigation 路由 + Context/Redux 状态管理 + EventEmitter 事件',
        INHERITANCE_RULES: '函数组件 + Custom Hooks 复用逻辑，禁止 Class Component',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | 桥接传输大数据 | 使用分页/流式传输 | 性能瓶颈 |\n| 2 | 内联样式 | 使用 StyleSheet.create | 重复创建对象 |\n| 3 | 直接操作 Native 不做错误处理 | try-catch 包裹 Native 调用 | 崩溃风险 |\n| 4 | FlatList 不使用 keyExtractor | 必须提供 keyExtractor | 渲染性能 |',
        CLASS_NAMING: 'Screen: 功能名+Screen\nComponent: 功能名+组件类型\nHook: use+功能名\nService: 功能名+Service',
        RESOURCE_PREFIX: 'N/A (React Native 使用 assets/ 目录)',
        LAYOUT_NAMING: 'N/A (React Native 使用 JSX 组合)',
      },
      en: {
        DEPENDENCY_RULES: 'Screen → Component → Hook → Service (layered deps, Service must not reference UI)',
        COMMUNICATION_MECHANISM: 'React Navigation routing + Context/Redux state management + EventEmitter events',
        INHERITANCE_RULES: 'Function components + Custom Hooks for logic reuse, no Class Components',
        FORBIDDEN_PATTERNS_TABLE: '| 1 | Large data bridge transfer | Use pagination/streaming | Performance bottleneck |\n| 2 | Inline styles | Use StyleSheet.create | Repeated object creation |\n| 3 | Native calls without error handling | Wrap Native calls in try-catch | Crash risk |\n| 4 | FlatList without keyExtractor | Must provide keyExtractor | Render performance |',
        CLASS_NAMING: 'Screen: FeatureName+Screen\nComponent: FeatureName+ComponentType\nHook: use+FeatureName\nService: FeatureName+Service',
        RESOURCE_PREFIX: 'N/A (React Native uses assets/ directory)',
        LAYOUT_NAMING: 'N/A (React Native uses JSX composition)',
      }
    },
  };

  const platformDefaults = defaults[platform];
  if (!platformDefaults) return {};
  return platformDefaults[lang] || platformDefaults.en || {};
}

export async function renderTemplates(templateRoot, targetDir, config, detection) {
  registerI18n(config.lang);

  // Build template variables
  const vars = await buildVars(config, detection);

  // Language-dependent files (i18n handled via t helper)
  const langDependentFiles = [
    { src: 'CHANGELOG.md', dest: `${config.dir}/CHANGELOG.md` },
    { src: 'rules/project_rule.md', dest: `${config.dir}/rules/project_rule.md` },
    { src: 'rules/conflict_resolution.md', dest: `${config.dir}/rules/conflict_resolution.md` },
    { src: 'skills/plan_mode/SKILL.md', dest: `${config.dir}/skills/plan_mode/SKILL.md` },
    { src: 'skills/code_review/SKILL.md', dest: `${config.dir}/skills/code_review/SKILL.md` },
    { src: 'agents/arch-review.md', dest: `${config.dir}/agents/arch-review.md` },
    { src: 'agents/resource-sync.md', dest: `${config.dir}/agents/resource-sync.md` },
    { src: 'agents/proactive-correction.md', dest: `${config.dir}/agents/proactive-correction.md` },
    { src: 'agents/cpp-memory-review.md', dest: `${config.dir}/agents/cpp-memory-review.md` },
  ];

  // Language-independent files (from root template dir)
  const langIndependentFiles = [
    { src: 'settings.json', dest: `${config.dir}/settings.json` },
    { src: 'settings.local.json', dest: `${config.dir}/settings.local.json` },
  ];

  // Script files (from hooks/ and scripts/ relative to cli root)
  const scriptRoot = path.resolve(templateRoot, '..');
  const scriptFiles = [
    { src: path.join(scriptRoot, 'hooks/post-edit-tracker.sh'), dest: `${config.dir}/hooks/post-edit-tracker.sh` },
    { src: path.join(scriptRoot, 'hooks/check-review-needed.sh'), dest: `${config.dir}/hooks/check-review-needed.sh` },
    { src: path.join(scriptRoot, 'scripts/gen_references.py'), dest: `${config.dir}/scripts/gen_references.py` },
  ];

  // === Transaction Safety: use temp directory + atomic commit ===
  // Phase 1: Create temporary directory
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-scaffold-'));

  try {
    // Phase 2: Generate all files to temporary directory
    // Render language-dependent templates
    for (const file of langDependentFiles) {
      const srcPath = path.join(templateRoot, file.src);
      if (fs.existsSync(srcPath)) {
        const content = fs.readFileSync(srcPath, 'utf-8');
        const rendered = renderContent(content, vars);
        writeOutput(tempDir, file.dest, rendered);
      }
    }

    // Copy language-independent files
    for (const file of langIndependentFiles) {
      const srcPath = path.join(templateRoot, file.src);
      if (fs.existsSync(srcPath)) {
        const content = fs.readFileSync(srcPath, 'utf-8');
        const rendered = renderContent(content, vars);
        writeOutput(tempDir, file.dest, rendered);
      }
    }

    // Copy script files
    for (const file of scriptFiles) {
      if (fs.existsSync(file.src)) {
        const content = fs.readFileSync(file.src, 'utf-8');
        const rendered = renderContent(content, vars);
        writeOutput(tempDir, file.dest, rendered);
      }
    }

    // Generate entry file (CLAUDE.md or AGENTS.md)
    const entryContent = generateEntry(vars, config.lang);
    writeOutput(tempDir, config.entry, entryContent);

    // Phase 3: Validate generated results
    const unreplaced = checkUnreplacedVars(tempDir);
    if (unreplaced.length > 0) {
      console.warn(chalk.yellow(`\u26a0 Warning: Found ${unreplaced.length} unreplaced template variable(s):`));
      unreplaced.forEach(item => console.warn(chalk.yellow(`  - ${item.file}: ${item.vars.join(', ')}`)));
    }

    // Phase 4: Atomic commit - copy temp directory contents to target directory
    copyDirRecursive(tempDir, targetDir);

    // Output success message
    console.log(chalk.green(`\n\u2713 Generated ${countFiles(tempDir)} files successfully.`));

  } catch (err) {
    // On failure, clean up temp dir; target directory is not affected
    console.error(chalk.red(`\n\u2717 Generation failed: ${err.message}`));
    console.error(chalk.red('  No files were written to the target directory.'));
    throw err;
  } finally {
    // Always clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function buildVars(config, detection) {
  const platformVars = await getPlatformVars(detection.platform, config.lang);
  const smartDefaults = getSmartDefaults(detection.platform, config.lang);

  // Helper: use user-provided value if it's not empty/placeholder, otherwise use smart default
  const resolve = (userValue, defaultKey) => {
    if (userValue && !userValue.startsWith('Define ') && userValue !== '') {
      return userValue;
    }
    return smartDefaults[defaultKey] || userValue;
  };

  return {
    DIR: config.dir,
    ENTRY: config.entry,
    ENTRY_VERSION_LINE: `<!-- ${config.dir}-version: v1.0.0 (${TODAY}) -->`,
    GENERATION_DATE: TODAY,
    PROJECT_NAME: config.projectName,
    PROJECT_DESCRIPTION: config.projectDescription,
    PACKAGE_NAME: config.packageName,
    AI_NAME: config.aiName,
    PLATFORM: detection.platform,
    BUILD_SYSTEM: detection.buildSystem,
    LANGUAGE: detection.language,
    HAS_NDK: detection.hasNdk,
    HAS_TESTS: config.hasTests,
    BUILD_COMMAND_DEBUG: config.buildDebug,
    BUILD_COMMAND_RELEASE: config.buildRelease,
    REVIEW_FILE_THRESHOLD: config.reviewThreshold,
    ARCH_REVIEW_MODULE_THRESHOLD: config.archThreshold,
    BUILD_ENV_TABLE: `| Language | ${detection.language} |\n| Build System | ${detection.buildSystem} |\n| Platform | ${detection.platform} |`,
    DOMAINS: 'general, code_quality, architecture',
    DEPENDENCY_RULES: resolve('Define module dependency direction rules here', 'DEPENDENCY_RULES'),
    COMMUNICATION_MECHANISM: resolve('Define inter-module communication mechanism here', 'COMMUNICATION_MECHANISM'),
    INHERITANCE_RULES: resolve('Define inheritance hierarchy rules here', 'INHERITANCE_RULES'),
    FORBIDDEN_PATTERNS_TABLE: resolve('| # | Forbidden | Alternative | Reason |\n|---|----------|-------------|--------|\n| 1 | Define patterns | Define alternatives | Define reasons |', 'FORBIDDEN_PATTERNS_TABLE'),
    FORBIDDEN_PATTERNS_COUNT: smartDefaults.FORBIDDEN_PATTERNS_TABLE ? '4' : '0',
    FORBIDDEN_PATTERNS_SEARCH_TABLE: '| Pattern | Search | Replace |\n|---------|--------|---------|',
    RESOURCE_PREFIXES: resolve('Define resource prefixes here', 'RESOURCE_PREFIX'),
    CLASS_NAMING: resolve('Define class naming conventions here', 'CLASS_NAMING'),
    LAYOUT_NAMING: resolve('Define layout naming conventions here', 'LAYOUT_NAMING'),
    PLATFORM_SPECIFIC_RULES: platformVars.PLATFORM_SPECIFIC_RULES || `Add ${detection.platform}-specific rules here`,
    PLATFORM_FATAL_CHECKS: platformVars.PLATFORM_FATAL_CHECKS || '',
    PLATFORM_WARNING_CHECKS: platformVars.PLATFORM_WARNING_CHECKS || '',
    PLATFORM_SUGGESTION_CHECKS: platformVars.PLATFORM_SUGGESTION_CHECKS || '',
    PLATFORM_SELF_CHECK_ITEMS: platformVars.PLATFORM_SELF_CHECK_ITEMS || '',
    PLATFORM_RESOURCE_SYNC_CONTENT: platformVars.PLATFORM_RESOURCE_SYNC_CONTENT || 'Add platform-specific resource sync checks here',
    PLATFORM_SPECIFIC_TASK_TEMPLATES: platformVars.PLATFORM_SPECIFIC_TASK_TEMPLATES || `Add ${detection.platform} task templates here`,
    PLATFORM_RULES_SUMMARY: platformVars.PLATFORM_RULES_SUMMARY || `${detection.platform} specific rules`,
    DEPENDENCY_RULES_SUMMARY: smartDefaults.DEPENDENCY_RULES || 'Define dependency rules',
    NAMING_SUMMARY: smartDefaults.CLASS_NAMING || 'Define naming conventions',
    ARCHITECTURE: 'Define architecture',
    NAVIGATION: 'Define navigation',
    COMMUNICATION_MECHANISM_CHECKS: smartDefaults.COMMUNICATION_MECHANISM || 'Define communication checks',
    INHERITANCE_CHECKS: smartDefaults.INHERITANCE_RULES || 'Define inheritance checks',
  };
}

function renderContent(content, vars) {
  try {
    const template = Handlebars.compile(content);
    return template(vars);
  } catch {
    // If Handlebars fails, do simple variable replacement
    let result = content;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replaceAll(`{{${key}}}`, String(value));
    }
    return result;
  }
}

function writeOutput(targetDir, relativePath, content) {
  const fullPath = path.join(targetDir, relativePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(chalk.green(`  \u2713 ${relativePath}`));
}

/**
 * Check generated files for unreplaced template variables
 */
function checkUnreplacedVars(dir) {
  const results = [];
  const varPattern = /\{\{(?!#|\/|!|>)([A-Z_][A-Z0-9_]*)\}\}/g;

  function scanDir(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json') || entry.name.endsWith('.sh') || entry.name.endsWith('.py')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const matches = [...content.matchAll(varPattern)];
        if (matches.length > 0) {
          results.push({
            file: path.relative(dir, fullPath),
            vars: [...new Set(matches.map(m => m[1]))]
          });
        }
      }
    }
  }

  scanDir(dir);
  return results;
}

/**
 * Recursively copy directory contents to target
 */
function copyDirRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Count files in a directory recursively
 */
function countFiles(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

function generateEntry(vars, lang) {
  if (lang === 'en') {
    return `${vars.ENTRY_VERSION_LINE}
# ${vars.ENTRY}
Your name is ${vars.AI_NAME}. You are an AI assistant helping me solve problems in this codebase.

## Project Overview

${vars.PROJECT_DESCRIPTION}. Package: \`${vars.PACKAGE_NAME}\`. Built with ${vars.LANGUAGE}, using ${vars.ARCHITECTURE} architecture.

## Build Commands

\`\`\`bash
# Debug build
${vars.BUILD_COMMAND_DEBUG}

# Release build
${vars.BUILD_COMMAND_RELEASE}
\`\`\`

${vars.HAS_TESTS ? 'This project has automated tests.' : 'This project does not have automated tests.'}

## Build Environment

| Item | Value |
|------|-------|
${vars.BUILD_ENV_TABLE}

---

## Rules and Skill Trigger Strategy

### Mandatory Rules

1. **Read rules before modifying**: Before any code modification, read \`${vars.DIR}/rules/project_rule.md\` in full
2. **${vars.REVIEW_FILE_THRESHOLD}+ files triggers review**: After modification, trigger \`code_review\` skill
3. **${vars.ARCH_REVIEW_MODULE_THRESHOLD}+ modules triggers arch review**: Delegate \`arch-review\` agent
4. **Resource changes trigger sync check**: Delegate \`resource-sync\` agent
5. **${vars.DIR} config changes require CHANGELOG**: Update \`${vars.DIR}/CHANGELOG.md\` and bump version
${vars.HAS_CODEGRAPH ? `
### CodeGraph Integration

This project uses CodeGraph. When exploring the codebase, prefer the \`codegraph_explore\` tool for structural search. The \`${vars.DIR}/references/\` directory contains lightweight architecture decisions, business logic summaries, and conventions — use it alongside CodeGraph.
` : ''}
`;
  }

  return `${vars.ENTRY_VERSION_LINE}
# ${vars.ENTRY}
你的名字是${vars.AI_NAME}，你是一个AI助手，你的任务是帮助我解决代码仓库中的问题。

## 项目概述

${vars.PROJECT_DESCRIPTION}。包名：\`${vars.PACKAGE_NAME}\`。采用${vars.LANGUAGE}开发，使用${vars.ARCHITECTURE}架构。

## 构建命令

\`\`\`bash
# Debug 构建
${vars.BUILD_COMMAND_DEBUG}

# Release 构建
${vars.BUILD_COMMAND_RELEASE}
\`\`\`

本项目${vars.HAS_TESTS ? '有' : '无'}自动化测试。

## 构建环境

| 项目 | 值 |
|------|-----|
${vars.BUILD_ENV_TABLE}

---

## 规则与技能触发策略

### 强制执行规则

1. **修改前必读规则**：执行任何代码修改前，必须先阅读 \`${vars.DIR}/rules/project_rule.md\` 全文
2. **${vars.REVIEW_FILE_THRESHOLD}+ 文件修改必触发审查**：修改完成后**必须**触发 \`code_review\` 技能
3. **${vars.ARCH_REVIEW_MODULE_THRESHOLD}+ 模块修改必触发架构审查**：修改完成后**必须**委派 \`arch-review\` agent
4. **资源文件变更必触发同步检查**：**必须**委派 \`resource-sync\` agent
5. **${vars.DIR} 配置变更必更新 CHANGELOG**：凡修改 \`${vars.DIR}/\` 下配置文件，**必须**同步更新 \`${vars.DIR}/CHANGELOG.md\` 并升级版本号
${vars.HAS_CODEGRAPH ? `
### CodeGraph 集成

本项目已集成 CodeGraph。探索代码库时优先使用 \`codegraph_explore\` 工具进行结构化搜索。\`${vars.DIR}/references/\` 目录采用轻量模式，仅包含架构决策、业务逻辑摘要和项目约定——请与 CodeGraph 配合使用。
` : ''}
`;
}

