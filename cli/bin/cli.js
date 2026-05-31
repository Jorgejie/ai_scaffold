#!/usr/bin/env node

import chalk from 'chalk';
import { detectProject } from '../src/detect.js';
import { promptMinimalConfig } from '../src/prompts.js';
import { createSkeleton } from '../src/render.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_ROOT = path.resolve(__dirname, '../templates');

async function main() {
  console.log(chalk.cyan.bold('\n🤖 AI Coding Skeleton — ai-scaffold\n'));
  console.log(chalk.gray('CLI + LLM 协作架构: CLI搭建骨架 → AI深度初始化\n'));

  const targetDir = process.argv[2] || process.cwd();
  console.log(chalk.gray(`📁 Target directory: ${targetDir}\n`));

  // Phase 1: 项目检测
  console.log(chalk.yellow('🔍 Step 1: Detecting project...'));
  const detection = await detectProject(targetDir);
  console.log(chalk.green(`✓ Platform: ${detection.platform} / ${detection.buildSystem}`));
  console.log(chalk.green(`✓ Language: ${detection.language}`));
  if (detection.hasNdk) {
    console.log(chalk.green('✓ NDK/C++: detected'));
  }
  if (detection.hasCodeGraph) {
    console.log(chalk.green('✓ CodeGraph: installed (will use lightweight mode)'));
  }
  console.log();

  // Phase 2: 最小化配置（仅语言和AI工具选择）
  console.log(chalk.yellow('⚙️  Step 2: Minimal configuration...'));
  const config = await promptMinimalConfig(detection);
  console.log(chalk.green(`✓ AI Tool: ${config.target}`));
  console.log(chalk.green(`✓ Language: ${config.lang === 'zh' ? '中文' : 'English'}\n`));

  // Phase 3: 创建骨架（不渲染具体内容）
  console.log(chalk.yellow('🏗️  Step 3: Creating skeleton...'));
  await createSkeleton(TEMPLATE_ROOT, targetDir, config, detection);

  // 输出完成信息和下一步指引
  const dir = config.dir;
  const entry = config.entry;
  const isZh = config.lang === 'zh';
  
  console.log(chalk.cyan.bold(`\n✅ Skeleton created successfully!\n`));
  console.log(chalk.white(`Entry file: ${entry}`));
  console.log(chalk.white(`Config dir: ${dir}/`));
  console.log(chalk.white(`Language: ${isZh ? '中文' : 'English'}\n`));
  
  console.log(chalk.cyan.bold(isZh ? '📋 下一步操作：' : '📋 Next Steps:\n'));
  console.log(chalk.white(isZh 
    ? '  1. 在 AI 工具中打开本项目' 
    : '  1. Open this project in your AI tool'));
  console.log(chalk.white(isZh 
    ? `  2. 输入指令: "按 ${dir}/skills/project_initialization/SKILL.md 初始化"`
    : `  2. Enter command: "Initialize using ${dir}/skills/project_initialization/SKILL.md"`));
  console.log(chalk.white(isZh 
    ? '  3. AI 将扫描源码、理解架构、生成定制化规则'
    : '  3. AI will scan source code, understand architecture, generate customized rules'));
  console.log();
  
  console.log(chalk.gray(isZh 
    ? '  💡 提示: 查看 AI_INIT_GUIDE.md 了解详细流程'
    : '  💡 Tip: See AI_INIT_GUIDE.md for detailed instructions'));
  console.log(chalk.gray(isZh 
    ? '  ⏱️  预计AI初始化时间: 2-5分钟\n'
    : '  ⏱️  Estimated AI initialization time: 2-5 minutes\n'));
}

main().catch(err => {
  console.error(chalk.red('\n❌ Error:'), err.message);
  console.error(chalk.red('   No files were written to the target directory.'));
  process.exit(1);
});
