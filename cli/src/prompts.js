import inquirer from 'inquirer';

/**
 * 最小化配置 - 仅收集语言和AI工具选择
 * 其他所有配置将由AI在初始化时通过交互式问答收集
 */
export async function promptMinimalConfig(detection) {
  const answers = {};

  // Phase 0: Language selection
  const { lang } = await inquirer.prompt([
    {
      type: 'list',
      name: 'lang',
      message: 'Generated files language / 生成文件使用哪种语言？',
      choices: [
        { name: '中文 (Chinese)', value: 'zh' },
        { name: 'English', value: 'en' },
      ],
    },
  ]);
  answers.lang = lang;

  const isZh = lang === 'zh';

  // Phase 0: AI tool selection
  const toolChoices = [
    { name: 'Claude Code', value: 'claude' },
    { name: 'Qoder', value: 'qoder' },
    { name: 'Codex', value: 'codex' },
    { name: 'OpenCode', value: 'opencode' },
  ];

  if (detection.existingTool) {
    const { useDetected } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useDetected',
        message: isZh
          ? `检测到已有 ${detection.existingTool.target} 体系，使用它吗？`
          : `Detected existing ${detection.existingTool.target} setup. Use it?`,
        default: true,
      },
    ]);
    if (useDetected) {
      answers.target = detection.existingTool.target;
      answers.dir = detection.existingTool.dir;
      answers.entry = detection.existingTool.entry;
    }
  }

  if (!answers.target) {
    const { target } = await inquirer.prompt([
      {
        type: 'list',
        name: 'target',
        message: isZh ? '选择 AI 工具' : 'Select AI tool',
        choices: toolChoices,
      },
    ]);
    answers.target = target;
    answers.dir = target === 'claude' ? '.claude' : `.${target}`;
    answers.entry = 'AGENTS.md';
  }

  // 设置显示名称
  answers.targetDisplay = {
    'claude': 'Claude Code',
    'qoder': 'Qoder',
    'codex': 'Codex',
    'opencode': 'OpenCode'
  }[answers.target];

  return answers;
}

/**
 * 原有的完整配置函数（已废弃，保留供参考）
 * @deprecated 使用 promptMinimalConfig 代替
 */
export async function promptConfig(detection) {
  console.warn('⚠️  Warning: promptConfig is deprecated, use promptMinimalConfig instead');
  return await promptMinimalConfig(detection);
}
