import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// AI 工具检测配置
const AI_TOOLS = {
  '.qoder': { target: 'qoder', dir: '.qoder', entry: 'AGENTS.md' },
  'CLAUDE.md': { target: 'claude', dir: '.claude', entry: 'CLAUDE.md' },
  '.codex': { target: 'codex', dir: '.codex', entry: 'AGENTS.md' },
  '.opencode': { target: 'opencode', dir: '.opencode', entry: 'AGENTS.md' },
};

// 平台指标优先级配置（priority 越高越优先）
const PLATFORM_INDICATORS = [
  { file: 'hvigor-config.json5', platform: 'HarmonyOS', build: 'Hvigor', priority: 100 },
  { file: 'settings.gradle.kts', platform: 'Android', build: 'Gradle Kotlin DSL', priority: 90 },
  { file: 'settings.gradle', platform: 'Android', build: 'Gradle', priority: 89 },
  { file: 'pubspec.yaml', platform: 'Flutter', build: 'Flutter', priority: 85 },
  { file: 'Podfile', platform: 'iOS', build: 'CocoaPods', priority: 80 },
  { file: 'Package.swift', platform: 'iOS', build: 'SPM', priority: 80 },
  { file: 'Cargo.toml', platform: 'Rust', build: 'Cargo', priority: 70 },
  { file: 'go.mod', platform: 'Go', build: 'Go Modules', priority: 70 },
  { file: 'pyproject.toml', platform: 'Python', build: 'Poetry/pip', priority: 61 },
  { file: 'requirements.txt', platform: 'Python', build: 'pip', priority: 60 },
  { file: 'package.json', platform: null, build: null, priority: 10 },
];

/**
 * 检测项目平台、构建系统、NDK、语言和已有 AI 工具
 */
export async function detectProject(targetDir) {
  const result = {
    platform: 'Unknown',
    buildSystem: 'Unknown',
    hasNdk: false,
    hasCodeGraph: false,
    existingTool: null,
    language: 'Unknown',
    allDetected: [],
  };

  // 1. 检测已有 AI 工具
  for (const [indicator, tool] of Object.entries(AI_TOOLS)) {
    if (fs.existsSync(path.join(targetDir, indicator))) {
      result.existingTool = tool;
      break;
    }
  }

  // 2. 收集所有匹配的平台指标
  const matched = [];
  for (const indicator of PLATFORM_INDICATORS) {
    if (fs.existsSync(path.join(targetDir, indicator.file))) {
      matched.push(indicator);
    }
  }

  // 按优先级降序排序
  matched.sort((a, b) => b.priority - a.priority);

  // 输出检测日志
  if (matched.length > 0) {
    console.log(chalk.gray('  检测到以下项目指标:'));
    for (const m of matched) {
      const label = m.platform || 'package.json';
      console.log(chalk.gray(`    • ${m.file} → ${label} (priority: ${m.priority})`));
    }
  }

  // 3. 确定平台
  if (matched.length > 0) {
    const top = matched[0];

    if (top.platform === 'Android') {
      // 区分 Android 和纯 JVM Gradle
      const isAndroid = verifyAndroidProject(targetDir);
      if (isAndroid) {
        result.platform = 'Android';
        result.buildSystem = top.build;
      } else {
        result.platform = 'JVM';
        result.buildSystem = top.build;
      }
    } else if (top.platform === null && top.file === 'package.json') {
      // package.json 深度检测
      const detected = detectFromPackageJson(targetDir);
      result.platform = detected.platform;
      result.buildSystem = detected.build;
    } else {
      result.platform = top.platform;
      result.buildSystem = top.build;
    }

    // 记录所有检测到的平台
    result.allDetected = matched.map(m => ({
      platform: m.platform,
      build: m.build,
      priority: m.priority,
    }));

    // 混合项目日志
    if (matched.length > 1) {
      console.log(chalk.yellow(`  ⚠ 检测到多个平台指标，已选择最高优先级: ${result.platform} (${result.buildSystem})`));
    }
  }

  // 4. 检测 NDK/C++
  result.hasNdk = detectNdk(targetDir);

  // 5. 检测语言
  result.language = detectLanguage(targetDir, result.platform, result.buildSystem);

  // 6. 检测 CodeGraph
  result.hasCodeGraph = detectCodeGraph();
  if (result.hasCodeGraph) {
    console.log(chalk.gray('  CodeGraph: detected'));
  }

  return result;
}

/**
 * 验证是否为 Android 项目（区别于纯 JVM Gradle 项目）
 */
function verifyAndroidProject(targetDir) {
  // 检查 AndroidManifest.xml
  if (fs.existsSync(path.join(targetDir, 'app/src/main/AndroidManifest.xml'))) {
    return true;
  }

  // 检查根 build.gradle(.kts) 中是否包含 com.android 插件
  const buildFiles = ['build.gradle.kts', 'build.gradle'];
  for (const file of buildFiles) {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('com.android')) {
          return true;
        }
      } catch {}
    }
  }

  // 检查 app/build.gradle(.kts) 中是否包含 com.android 插件
  const appBuildFiles = ['app/build.gradle.kts', 'app/build.gradle'];
  for (const file of appBuildFiles) {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('com.android')) {
          return true;
        }
      } catch {}
    }
  }

  return false;
}

/**
 * package.json 深度检测：基于依赖推断具体前端/Node 框架
 */
function detectFromPackageJson(targetDir) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf-8'));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (allDeps['react-native']) return { platform: 'React Native', build: 'Metro' };
    if (allDeps['next']) return { platform: 'Next.js', build: 'Next.js' };
    if (allDeps['nuxt']) return { platform: 'Nuxt', build: 'Nuxt' };
    if (allDeps['react']) return { platform: 'React', build: 'Webpack/Vite' };
    if (allDeps['vue']) return { platform: 'Vue', build: 'Vite' };
    return { platform: 'Node', build: 'npm' };
  } catch {
    return { platform: 'Node', build: 'npm' };
  }
}

/**
 * 增强 NDK 检测：检查根目录和 Gradle 模块子目录
 */
function detectNdk(targetDir) {
  // 根目录检测
  const rootIndicators = [
    'jni',
    'CMakeLists.txt',
    'Android.mk',
    'app/src/main/cpp',
    'app/src/main/jni',
  ];

  if (rootIndicators.some(f => fs.existsSync(path.join(targetDir, f)))) {
    return true;
  }

  // 检查 .cpp/.c/.h 文件是否存在于根目录
  if (hasFileWithExt(targetDir, ['.cpp', '.c', '.h'])) {
    return true;
  }

  // 检查 Gradle 模块子目录中的 NDK 文件
  try {
    const modules = getGradleModules(targetDir);
    for (const mod of modules) {
      const modDir = path.join(targetDir, mod.replace(/:/g, '/'));
      const modIndicators = ['src/main/cpp', 'src/main/jni', 'CMakeLists.txt', 'Android.mk'];
      if (modIndicators.some(f => fs.existsSync(path.join(modDir, f)))) {
        return true;
      }
    }
  } catch {}

  return false;
}

/**
 * 解析 settings.gradle(.kts) 获取模块列表
 */
function getGradleModules(targetDir) {
  const files = ['settings.gradle.kts', 'settings.gradle'];
  for (const file of files) {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const modules = [];
      // 匹配 include(":module") 和 include ':module' 和 includeFlat 'module'
      const includeRegex = /include\s*\(?["':]+([^"')]+)["']\)?/g;
      const flatRegex = /includeFlat\s*\(?["']([^"']+)["']\)?/g;
      let match;
      while ((match = includeRegex.exec(content))) modules.push(match[1]);
      while ((match = flatRegex.exec(content))) modules.push(match[1]);
      return modules;
    }
  }
  return [];
}

/**
 * 语言检测：基于构建文件推断主要开发语言
 */
function detectLanguage(targetDir, platform, buildSystem) {
  // 基于已知平台的快速推断
  if (platform === 'Flutter') return 'Dart';
  if (platform === 'Rust') return 'Rust';
  if (platform === 'Go') return 'Go';
  if (platform === 'Python') return 'Python';
  if (platform === 'HarmonyOS') return 'ArkTS';
  if (platform === 'iOS') return 'Swift';
  if (platform === 'React Native' || platform === 'Next.js' || platform === 'Nuxt' ||
      platform === 'React' || platform === 'Vue' || platform === 'Node') {
    return 'TypeScript/JavaScript';
  }

  // Android / JVM 项目的语言检测
  if (platform === 'Android' || platform === 'JVM') {
    if (fs.existsSync(path.join(targetDir, 'build.gradle.kts'))) {
      return 'Kotlin';
    }
    if (fs.existsSync(path.join(targetDir, 'app/build.gradle.kts'))) {
      return 'Kotlin';
    }
    // 检查 build.gradle 中是否应用了 kotlin 插件
    const buildGradlePath = path.join(targetDir, 'build.gradle');
    if (fs.existsSync(buildGradlePath)) {
      try {
        const content = fs.readFileSync(buildGradlePath, 'utf-8');
        if (content.includes('kotlin') || content.includes('org.jetbrains.kotlin')) {
          return 'Kotlin';
        }
      } catch {}
    }
    return 'Java/Kotlin';
  }

  // 兜底：通过文件存在性推断
  if (fs.existsSync(path.join(targetDir, 'build.gradle.kts'))) return 'Kotlin';
  if (fs.existsSync(path.join(targetDir, 'build.gradle'))) return 'Java/Kotlin';
  if (fs.existsSync(path.join(targetDir, 'pubspec.yaml'))) return 'Dart';
  if (fs.existsSync(path.join(targetDir, 'Package.swift'))) return 'Swift';
  if (fs.existsSync(path.join(targetDir, 'package.json'))) return 'TypeScript/JavaScript';
  if (fs.existsSync(path.join(targetDir, 'Cargo.toml'))) return 'Rust';
  if (fs.existsSync(path.join(targetDir, 'go.mod'))) return 'Go';
  if (fs.existsSync(path.join(targetDir, 'pyproject.toml')) || fs.existsSync(path.join(targetDir, 'requirements.txt'))) return 'Python';

  return 'Unknown';
}

/**
 * 递归检查目录中是否有指定扩展名的文件
 */
function hasFileWithExt(dir, extensions, maxDepth = 3) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        return true;
      }
      if (entry.isDirectory() && maxDepth > 0) {
        if (hasFileWithExt(fullPath, extensions, maxDepth - 1)) return true;
      }
    }
  } catch {}
  return false;
}

/**
 * 检测 CodeGraph CLI 是否已全局安装
 */
function detectCodeGraph() {
  try {
    execSync('codegraph --version', { stdio: 'pipe', timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
