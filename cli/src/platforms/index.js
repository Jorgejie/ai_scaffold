import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLATFORM_MAP = {
  'Android': 'android',
  'iOS': 'ios',
  'HarmonyOS': 'harmonyos',
  'Flutter': 'flutter',
  'React Native': 'react-native',
};

const EMPTY_VARS = {
  PLATFORM_SPECIFIC_RULES: '',
  PLATFORM_FATAL_CHECKS: '',
  PLATFORM_WARNING_CHECKS: '',
  PLATFORM_SUGGESTION_CHECKS: '',
  PLATFORM_SELF_CHECK_ITEMS: '',
  PLATFORM_RESOURCE_SYNC_CONTENT: '',
  PLATFORM_SPECIFIC_TASK_TEMPLATES: '',
  PLATFORM_RULES_SUMMARY: '',
};

export async function getPlatformVars(platform, lang) {
  const key = PLATFORM_MAP[platform] || 'default';

  try {
    const mod = await import(path.join(__dirname, `${key}.js`));
    return { ...EMPTY_VARS, ...mod.default(lang) };
  } catch {
    try {
      const fallback = await import(path.join(__dirname, `default.js`));
      return { ...EMPTY_VARS, ...fallback.default(lang) };
    } catch {
      return EMPTY_VARS;
    }
  }
}
