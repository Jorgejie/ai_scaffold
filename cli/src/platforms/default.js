const strings = {
  zh: {
    PLATFORM_SPECIFIC_RULES: '请根据项目实际平台补充专项规则',
    PLATFORM_FATAL_CHECKS: '',
    PLATFORM_WARNING_CHECKS: '',
    PLATFORM_SUGGESTION_CHECKS: '',
    PLATFORM_SELF_CHECK_ITEMS: '',
    PLATFORM_RESOURCE_SYNC_CONTENT: '请根据项目实际平台补充资源同步检查项',
    PLATFORM_SPECIFIC_TASK_TEMPLATES: '请根据项目实际平台补充任务模板',
    PLATFORM_RULES_SUMMARY: '请根据项目实际平台补充规则摘要',
  },
  en: {
    PLATFORM_SPECIFIC_RULES: 'Add platform-specific rules based on your project',
    PLATFORM_FATAL_CHECKS: '',
    PLATFORM_WARNING_CHECKS: '',
    PLATFORM_SUGGESTION_CHECKS: '',
    PLATFORM_SELF_CHECK_ITEMS: '',
    PLATFORM_RESOURCE_SYNC_CONTENT: 'Add platform-specific resource sync checks based on your project',
    PLATFORM_SPECIFIC_TASK_TEMPLATES: 'Add platform-specific task templates based on your project',
    PLATFORM_RULES_SUMMARY: 'Add platform-specific rules summary based on your project',
  },
};

export default function getPlatformVars(lang) {
  return strings[lang] || strings.en;
}
