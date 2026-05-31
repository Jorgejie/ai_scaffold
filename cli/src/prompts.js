import inquirer from 'inquirer';

export async function promptConfig(detection) {
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

  // Phase 1.5: CodeGraph detection and prompt
  if (detection.hasCodeGraph) {
    answers.hasCodeGraph = true;
  } else {
    const { installCodeGraph } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'installCodeGraph',
        message: isZh
          ? '检测到项目未安装 CodeGraph（代码关系图工具，可提升 AI 对代码库的理解能力）。是否安装？'
          : 'CodeGraph (code relationship graph tool for improved AI codebase understanding) is not installed. Install it?',
        default: true,
      },
    ]);
    answers.installCodeGraph = installCodeGraph;
    answers.hasCodeGraph = false;
  }

  // Phase 2: Configuration questions
  const configPrompts = [
    {
      type: 'input',
      name: 'projectName',
      message: isZh ? '项目名称' : 'Project name',
      default: 'MyProject',
      validate: v => {
        if (!v || v.trim().length === 0) {
          return isZh ? '项目名不能为空' : 'Project name cannot be empty';
        }
        if (v.length > 50) {
          return isZh ? '项目名不能超过 50 个字符' : 'Project name cannot exceed 50 characters';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'projectDescription',
      message: isZh ? '项目描述（一句话）' : 'Project description (one sentence)',
      default: isZh ? '一个项目' : 'A project',
    },
    {
      type: 'input',
      name: 'packageName',
      message: isZh ? '主包名' : 'Main package name',
      default: 'com.example.app',
      validate: v => {
        if (!v) return true;
        if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(v)) {
          return isZh ? '请输入有效的包名格式 (如 com.example.app)' : 'Please enter a valid package name (e.g. com.example.app)';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'aiName',
      message: isZh ? 'AI 助手名称' : 'AI assistant name',
      default: 'AI Assistant',
    },
    {
      type: 'input',
      name: 'buildDebug',
      message: isZh ? 'Debug 构建命令' : 'Debug build command',
      default: detection.platform === 'Android' ? './gradlew assembleDebug' : 'npm run build',
    },
    {
      type: 'input',
      name: 'buildRelease',
      message: isZh ? 'Release 构建命令' : 'Release build command',
      default: detection.platform === 'Android' ? './gradlew assembleRelease' : 'npm run build:prod',
    },
    {
      type: 'confirm',
      name: 'hasTests',
      message: isZh ? '项目有自动化测试吗？' : 'Does the project have automated tests?',
      default: true,
    },
    {
      type: 'input',
      name: 'reviewThreshold',
      message: isZh ? '修改几个文件触发代码审查？' : 'How many files modified triggers code review?',
      default: '2',
      validate: v => {
        const n = parseInt(v);
        if (isNaN(n) || n < 1 || n > 100) {
          return isZh ? '请输入 1-100 之间的数字' : 'Please enter a number between 1 and 100';
        }
        return true;
      },
      filter: v => parseInt(v),
    },
    {
      type: 'input',
      name: 'archThreshold',
      message: isZh ? '修改几个模块触发架构审查？' : 'How many modules modified triggers architecture review?',
      default: '3',
      validate: v => !isNaN(v) || 'Please enter a number',
    },
  ];

  const config = await inquirer.prompt(configPrompts);
  Object.assign(answers, config);

  // NDK questions
  if (detection.hasNdk) {
    const ndkConfig = await inquirer.prompt([
      {
        type: 'list',
        name: 'ndkBuildSystem',
        message: isZh ? 'NDK 构建系统' : 'NDK build system',
        choices: ['ndk-build', 'CMake'],
        default: 'ndk-build',
      },
      {
        type: 'list',
        name: 'jniMethod',
        message: isZh ? 'JNI native 方法注册方式' : 'JNI native method registration',
        choices: [
          { name: isZh ? '动态注册 (RegisterNatives)' : 'Dynamic (RegisterNatives)', value: 'dynamic' },
          { name: isZh ? '静态绑定' : 'Static binding', value: 'static' },
        ],
        default: 'dynamic',
      },
    ]);
    Object.assign(answers, ndkConfig);
  }

  return answers;
}
