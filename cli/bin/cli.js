#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';
import { detectProject } from '../src/detect.js';
import { promptConfig } from '../src/prompts.js';
import { renderTemplates } from '../src/render.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_ROOT = path.resolve(__dirname, '../templates');

async function main() {
  console.log(chalk.cyan.bold('\n AI Coding Skeleton — ai-scaffold\n'));

  const targetDir = process.argv[2] || process.cwd();
  console.log(chalk.gray(` Target directory: ${targetDir}\n`));

  // Phase 0: Language + AI tool selection
  // Phase 1: Project detection
  console.log(chalk.yellow(' Detecting project...'));
  const detection = await detectProject(targetDir);
  console.log(chalk.green(` Platform: ${detection.platform} / ${detection.buildSystem}`));
  if (detection.hasNdk) {
    console.log(chalk.green(' NDK/C++: detected'));
  }
  console.log();

  // Phase 0 + Phase 2: Interactive configuration
  const config = await promptConfig(detection);

  // Phase 3: Generate files
  console.log(chalk.yellow('\n Generating files...\n'));
  await renderTemplates(TEMPLATE_ROOT, targetDir, config, detection);

  // Summary
  const dir = config.dir;
  const entry = config.entry;
  const isZh = config.lang === 'zh';
  const langLabel = config.lang === 'en' ? 'English' : '中文';
  console.log(chalk.cyan.bold(`\n ${config.target.toUpperCase()} system initialized\n`));
  console.log(chalk.white(` Language: ${langLabel}`));
  console.log(chalk.white(` Entry file: ${entry}`));
  console.log(chalk.white(` Config dir: ${dir}/`));

  console.log('');
  console.log(chalk.cyan(isZh ? '📋 下一步操作：' : '📋 Next Steps:'));
  console.log('');
  if (config.hasCodeGraph) {
    console.log(chalk.white(isZh 
      ? `  1. [必做] 运行 python ${dir}/scripts/gen_references.py --lightweight 生成轻量参考文档`
      : `  1. [Required] Run python ${dir}/scripts/gen_references.py --lightweight to generate lightweight references`));
  } else {
    console.log(chalk.white(isZh 
      ? `  1. [必做] 运行 python ${dir}/scripts/gen_references.py 生成项目参考文档`
      : `  1. [Required] Run python ${dir}/scripts/gen_references.py to generate project references`));
  }
  console.log(chalk.white(isZh
    ? `  2. [必做] 检查 ${dir}/rules/project_rule.md 中的架构约束是否符合项目实际`
    : `  2. [Required] Review ${dir}/rules/project_rule.md to verify architecture constraints match your project`));
  console.log(chalk.white(isZh
    ? `  3. [可选] 调整 ${dir}/agents/ 中各 Agent 的检查规则`
    : `  3. [Optional] Adjust check rules in ${dir}/agents/`));
  console.log(chalk.white(isZh
    ? `  4. [可选] 修改 ${dir}/skills/ 中的审查标准`
    : `  4. [Optional] Modify review standards in ${dir}/skills/`));
  console.log('');
  console.log(chalk.gray(isZh 
    ? '  预计补充时间：5-10 分钟'
    : '  Estimated setup time: 5-10 minutes'));
  console.log(chalk.gray(isZh
    ? '  验证方式：让 AI 阅读生成的规则文件并确认无冲突'
    : '  Verification: Ask the AI to read the generated rules and confirm no conflicts'));
  console.log('');
}

main().catch(err => {
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
});

main().catch(err => {
  console.error(chalk.red('Error:'), err.message);
  process.exit(1);
});
