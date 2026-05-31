import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import os from 'os';
import chalk from 'chalk';

const TODAY = new Date().toISOString().slice(0, 10).replace(/-/g, '.');

/**
 * 创建骨架 - 仅生成基础目录结构和最小化文件
 * 具体内容将由AI在初始化时生成
 */
export async function createSkeleton(templateRoot, targetDir, config, detection) {
  // === Transaction Safety: use temp directory + atomic commit ===
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-scaffold-'));

  try {
    console.log(chalk.gray('  Creating directory structure...'));
    
    // 1. 创建目录结构
    const dirs = [
      `${config.dir}/rules`,
      `${config.dir}/skills/plan_mode`,
      `${config.dir}/skills/code_review`,
      `${config.dir}/skills/project_initialization`,  // 新增
      `${config.dir}/agents`,
      `${config.dir}/hooks`,
      `${config.dir}/scripts`,
      `${config.dir}/references`,
    ];
    
    for (const dir of dirs) {
      const fullPath = path.join(tempDir, dir);
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    console.log(chalk.gray('  Copying template files...'));
    
    // 2. 复制基础配置文件（无需模板渲染）
    copyFile(templateRoot, 'settings.json', tempDir, `${config.dir}/settings.json`);
    copyFile(templateRoot, 'settings.local.json', tempDir, `${config.dir}/settings.local.json`);
    
    // 3. 复制 Hook 脚本
    const scriptRoot = path.resolve(templateRoot, '..');
    copyFile(scriptRoot, 'hooks/post-edit-tracker.sh', tempDir, `${config.dir}/hooks/post-edit-tracker.sh`);
    copyFile(scriptRoot, 'hooks/check-review-needed.sh', tempDir, `${config.dir}/hooks/check-review-needed.sh`);
    
    // 4. 复制 gen_references.py 脚本
    copyFile(scriptRoot, 'scripts/gen_references.py', tempDir, `${config.dir}/scripts/gen_references.py`);
    
    // 5. 复制 SKILL.md (project_initialization)
    copyFile(templateRoot, 'skills/project_initialization/SKILL.md', tempDir, `${config.dir}/skills/project_initialization/SKILL.md`);
    
    // 6. 生成极简入口文件
    const minimalEntry = generateMinimalEntry(config, detection);
    writeOutput(tempDir, config.entry, minimalEntry);
    
    // 7. 生成 AI_INIT_GUIDE.md 到项目根目录
    const initGuide = generateInitGuide(config, detection);
    writeOutput(tempDir, 'AI_INIT_GUIDE.md', initGuide);
    
    // 8. 生成占位符规则文件（提示AI需要生成这些文件）
    createPlaceholderFiles(tempDir, config, detection);
    
    // Phase 3: Validate generated results
    const unreplaced = checkUnreplacedVars(tempDir);
    if (unreplaced.length > 0) {
      console.warn(chalk.yellow(`\n⚠ Warning: Found ${unreplaced.length} unreplaced template variable(s):`));
      unreplaced.forEach(item => console.warn(chalk.yellow(`  - ${item.file}: ${item.vars.join(', ')}`)));
    }
    
    // Phase 4: Atomic commit - copy temp directory contents to target directory
    console.log(chalk.gray('  Committing changes...'));
    copyDirRecursive(tempDir, targetDir);
    
    // Make shell scripts executable
    makeExecutable(targetDir, `${config.dir}/hooks/post-edit-tracker.sh`);
    makeExecutable(targetDir, `${config.dir}/hooks/check-review-needed.sh`);
    makeExecutable(targetDir, `${config.dir}/scripts/gen_references.py`);
    
    // Output success message
    console.log(chalk.green(`\n✓ Generated skeleton with ${countFiles(tempDir)} files.`));
    
  } catch (err) {
    // On failure, clean up temp dir; target directory is not affected
    console.error(chalk.red(`\n✗ Skeleton creation failed: ${err.message}`));
    console.error(chalk.red('  No files were written to the target directory.'));
    throw err;
  } finally {
    // Always clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

/**
 * 复制文件（简单复制，无需模板渲染）
 */
function copyFile(rootDir, relativeSrc, destDir, relativeDest) {
  const srcPath = path.join(rootDir, relativeSrc);
  if (fs.existsSync(srcPath)) {
    const destPath = path.join(destDir, relativeDest);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.copyFileSync(srcPath, destPath);
  }
}

/**
 * 生成极简入口文件
 */
function generateMinimalEntry(config, detection) {
  const vars = {
    ENTRY_VERSION_LINE: `<!-- ${config.dir}-version: v1.0.0 (${TODAY}) -->`,
    ENTRY: config.entry,
    TARGET_DISPLAY: config.targetDisplay || config.target,
    DIR: config.dir,
    PLATFORM: detection.platform,
    BUILD_SYSTEM: detection.buildSystem,
    LANGUAGE: detection.language,
    HAS_NDK: detection.hasNdk,
    HAS_CODEGRAPH: detection.hasCodeGraph,
    PACKAGE_NAME: detectPackageName(detection),
  };
  
  const templatePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../templates/minimal_entry.md');
  let template;
  
  try {
    template = fs.readFileSync(templatePath, 'utf-8');
  } catch (e) {
    // Fallback: 如果找不到模板文件，使用硬编码的简化版本
    template = generateFallbackMinimalEntry(vars);
    return renderContent(template, vars);
  }
  
  return renderContent(template, vars);
}

/**
 * 生成 AI_INIT_GUIDE.md
 */
function generateInitGuide(config, detection) {
  const vars = {
    DIR: config.dir,
  };
  
  const templatePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../templates/AI_INIT_GUIDE.md');
  let template;
  
  try {
    template = fs.readFileSync(templatePath, 'utf-8');
  } catch (e) {
    // Fallback: 如果找不到模板文件，返回简化版本
    return generateFallbackInitGuide(vars);
  }
  
  return renderContent(template, vars);
}

/**
 * 创建占位符文件（提示AI需要生成这些内容）
 */
function createPlaceholderFiles(tempDir, config, detection) {
  const isZh = config.lang === 'zh';
  
  // project_rule.md 占位符
  const projectRuleContent = isZh 
    ? `# 项目主规则\n\n> ⚠️ **此文件尚未初始化**\n> \n> AI将在初始化过程中根据实际项目架构生成以下内容：\n> - 行为准则\n> - 架构约束\n> - 禁止模式\n> - 命名规范\n> - 平台特定规则\n\n*请勿手动编辑此文件，等待AI初始化完成*\n`
    : `# Project Rules\n\n> ⚠️ **This file is not initialized yet**\n> \n> AI will generate the following based on actual project architecture:\n> - Behavior guidelines\n> - Architecture constraints\n> - Forbidden patterns\n> - Naming conventions\n> - Platform-specific rules\n\n*Do not edit manually, wait for AI initialization*\n`;
  
  writeOutput(tempDir, `${config.dir}/rules/project_rule.md`, projectRuleContent);
  
  // conflict_resolution.md 占位符
  const conflictResolutionContent = isZh
    ? `# 冲突裁决框架\n\n> ⚠️ **此文件尚未初始化**\n> \n> AI将在初始化过程中生成多规则冲突时的裁决机制。\n\n*请勿手动编辑此文件，等待AI初始化完成*\n`
    : `# Conflict Resolution\n\n> ⚠️ **This file is not initialized yet**\n> \n> AI will generate arbitration mechanisms for multi-rule conflicts.\n\n*Do not edit manually, wait for AI initialization*\n`;
  
  writeOutput(tempDir, `${config.dir}/rules/conflict_resolution.md`, conflictResolutionContent);
  
  // skills 占位符
  const skillPlaceholder = isZh
    ? `# 技能文档\n\n> ⚠️ **此文件尚未初始化**\n> \n> AI将在初始化过程中生成完整的技能定义。\n\n*请勿手动编辑此文件，等待AI初始化完成*\n`
    : `# Skill Document\n\n> ⚠️ **This file is not initialized yet**\n> \n> AI will generate complete skill definitions during initialization.\n\n*Do not edit manually, wait for AI initialization*\n`;
  
  writeOutput(tempDir, `${config.dir}/skills/plan_mode/SKILL.md`, skillPlaceholder);
  writeOutput(tempDir, `${config.dir}/skills/code_review/SKILL.md`, skillPlaceholder);
  
  // agents 占位符
  const agentPlaceholder = isZh
    ? `# Agent 配置\n\n> ⚠️ **此文件尚未初始化**\n> \n> AI将在初始化过程中生成Agent的详细配置。\n\n*请勿手动编辑此文件，等待AI初始化完成*\n`
    : `# Agent Configuration\n\n> ⚠️ **This file is not initialized yet**\n> \n> AI will generate detailed agent configuration during initialization.\n\n*Do not edit manually, wait for AI initialization*\n`;
  
  writeOutput(tempDir, `${config.dir}/agents/arch-review.md`, agentPlaceholder);
  writeOutput(tempDir, `${config.dir}/agents/resource-sync.md`, agentPlaceholder);
  writeOutput(tempDir, `${config.dir}/agents/proactive-correction.md`, agentPlaceholder);
  
  if (detection.hasNdk) {
    writeOutput(tempDir, `${config.dir}/agents/cpp-memory-review.md`, agentPlaceholder);
  }
}

/**
 * 检测包名（从项目文件中提取）
 */
function detectPackageName(detection) {
  // 这里可以添加更智能的检测逻辑
  // 目前返回一个默认值，AI会在初始化时修正
  return 'com.example.app';
}

/**
 *  fallback 极简入口模板
 */
function generateFallbackMinimalEntry(vars) {
  return `${vars.ENTRY_VERSION_LINE}
# ${vars.ENTRY}

> ⚠️ **本项目尚未完成AI辅助体系初始化**
> 
> ## 🚀 快速开始
> 
> **在${vars.TARGET_DISPLAY}中执行以下指令**:
> \`\`\`
> 阅读 ${vars.DIR}/skills/project_initialization/SKILL.md
> 然后按其中的Phase 0-3完成本项目初始化
> \`\`\`
> 
> 或者直接说: "按 project_initialization skill 初始化本项目"

## 项目基本信息

- **平台**: ${vars.PLATFORM} / ${vars.BUILD_SYSTEM}
- **语言**: ${vars.LANGUAGE}
- **NDK/C++**: ${vars.HAS_NDK ? '是' : '否'}
- **CodeGraph**: ${vars.HAS_CODEGRAPH ? '已安装（轻量模式）' : '未安装（完整模式）'}
- **包名/命名空间**: ${vars.PACKAGE_NAME}

## 待初始化内容

AI将根据实际项目源码生成以下内容：

- [ ] \`${vars.DIR}/rules/project_rule.md\` - 项目主规则（基于实际架构）
- [ ] \`${vars.DIR}/rules/conflict_resolution.md\` - 冲突裁决框架
- [ ] \`${vars.DIR}/skills/plan_mode/SKILL.md\` - 任务规划技能
- [ ] \`${vars.DIR}/skills/code_review/SKILL.md\` - 代码审查技能
- [ ] \`${vars.DIR}/agents/arch-review.md\` - 架构审查Agent
- [ ] \`${vars.DIR}/agents/resource-sync.md\` - 资源同步Agent
- [ ] \`${vars.DIR}/agents/proactive-correction.md\` - 主动纠错Agent
${vars.HAS_NDK ? `- [ ] \`${vars.DIR}/agents/cpp-memory-review.md\` - C++内存安全Agent` : ''}
- [ ] \`${vars.DIR}/references/\` - 模块文档目录（需AI扫描源码生成）

---

*此文件由 ai-scaffold CLI 自动生成，将在AI完成初始化后被替换为完整版本*

*更多信息请查看: \`AI_INIT_GUIDE.md\`*
`;
}

/**
 * fallback AI_INIT_GUIDE.md 模板
 */
function generateFallbackInitGuide(vars) {
  return `# AI 辅助开发体系初始化指南

> 本文档指导您如何完成项目的 AI 辅助开发体系初始化。

## 🚀 快速开始

### 步骤 1: 在 AI 工具中打开本项目

确保您的 AI 编码助手已加载当前项目。

### 步骤 2: 触发初始化流程

在 AI 对话框中输入以下任一指令：

\`\`\`
按 project_initialization skill 初始化本项目
\`\`\`

或

\`\`\`
阅读 ${vars.DIR}/skills/project_initialization/SKILL.md 并执行初始化
\`\`\`

### 步骤 3: 跟随 AI 的引导

AI 将自动执行以下步骤：

1. **检测当前状态** - 检查已有文件和配置
2. **扫描项目结构** - 运行 gen_references.py 生成 _scan.json
3. **深度源码分析** - 读取关键源文件，理解项目架构
4. **交互式配置** - 向您询问 7-11 个关键问题
5. **生成定制化内容** - 基于实际代码生成规则、Agent 和文档
6. **验证与完成** - 检查所有文件是否正确生成

整个过程预计需要 **2-5 分钟**。

---

**祝您使用愉快！** 🎉
`;
}

/**
 * Render Handlebars template content
 */
function renderContent(content, vars) {
  try {
    const template = Handlebars.compile(content);
    return template(vars);
  } catch (e) {
    // If Handlebars fails, do simple variable replacement
    let result = content;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replaceAll(`{{${key}}}`, String(value));
    }
    return result;
  }
}

/**
 * Write output file
 */
function writeOutput(targetDir, relativePath, content) {
  const fullPath = path.join(targetDir, relativePath);
  const dir = path.dirname(fullPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}

/**
 * Make file executable
 */
function makeExecutable(targetDir, relativePath) {
  try {
    const fullPath = path.join(targetDir, relativePath);
    fs.chmodSync(fullPath, '755');
  } catch (e) {
    // Ignore if chmod fails
  }
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

