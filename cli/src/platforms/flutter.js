const strings = {
  zh: {
    PLATFORM_RULES_SUMMARY: 'Flutter: Widget树, Provider/Riverpod状态, GoRouter路由, Platform Channel',

    PLATFORM_SPECIFIC_RULES: `### 5.1 Widget 树与组件约束

- \`StatelessWidget\` 必须使用 \`const\` 构造函数，除非依赖非 const 数据
- \`StatefulWidget\` 生命周期严格遵循：\`initState\` → \`didChangeDependencies\` → \`build\` → \`dispose\`
- 禁止在 \`build()\` 方法中执行副作用（网络请求、文件 IO），副作用应在 \`initState\` 或 \`StateNotifier\` 中处理
- \`BuildContext\` 安全规则：
  - 禁止在 \`async\` 间隙后使用 \`BuildContext\`（widget 可能已卸载）
  - 使用 \`context\` 前必须检查 \`mounted\` 状态
  - 跨异步操作后使用 Navigator/Theme 等依赖 context 的 API 前必须检查 mounted
- 列表项必须提供 \`Key\`（\`ValueKey\` 或 \`ObjectKey\`），禁止省略 Key
- 超过 3 层嵌套的 Widget 树必须提取为独立子组件
- \`const\` Widget 构造函数优先，有利于框架优化重建

### 5.2 状态管理

**项目必须选择一种状态管理方案并统一使用，禁止混用**：

| 方案 | 适用场景 | 核心 API |
|------|---------|---------|
| Provider | 中小型项目 | \`context.watch\` / \`context.read\`, \`ChangeNotifier\` |
| Riverpod | 中大型项目 | \`ref.watch\` / \`ref.read\`, \`StateNotifierProvider\` |
| BLoC | 事件驱动场景 | \`BlocBuilder\`, \`BlocListener\`, \`BlocProvider\` |

**通用规则**：
- \`ChangeNotifier\` / \`StateNotifier\` 中禁止直接持有 \`BuildContext\`
- 状态变更通知必须在数据实际变更后触发，禁止无变更的空通知
- Provider 的创建位置必须合理（\`main.dart\` 顶层或页面级），禁止在 \`build\` 中创建新 Provider
- 异步状态使用 \`AsyncValue\` / \`FutureProvider\` / \`StreamProvider\`，禁止手动管理 loading/error 状态

### 5.3 布局规范

- 间距优先使用 \`SizedBox\`，禁止使用 \`Container\` 仅做间距
- 内边距使用 \`const EdgeInsets.all/symmetric/only\`，禁止魔法数字
- 响应式布局：
  - 整体页面尺寸使用 \`MediaQuery.of(context)\`
  - 组件自适应使用 \`LayoutBuilder\`
- 避免过度嵌套 Column/Row，超过 5 层应提取子组件
- 使用 \`Flexible\` / \`Expanded\` 正确分配剩余空间

### 5.4 路由导航

- 使用 GoRouter 进行路由管理，禁止使用 \`Navigator.push\` 直接跳转
- 路由配置集中定义在 \`lib/routes/app_router.dart\`
- 页面跳转：
  - \`context.go('/path')\` 替换当前路由
  - \`context.push('/path')\` 压入新路由
  - \`context.pop()\` 返回上一页
- 路由守卫通过 GoRouter 的 \`redirect\` 实现
- 深度链接在 GoRouter 的 \`routes\` 中配置
- 路由参数通过 \`pathParameters\` 和 \`queryParameters\` 传递

### 5.5 Platform Channel

- 原生通信使用 \`MethodChannel\`（同步请求-响应）或 \`EventChannel\`（流式数据）
- Channel 名称使用反向域名格式：\`'com.example.app/channel_name'\`
- 平台端代码放在 \`android/app/src/main/kotlin/\` 和 \`ios/Runner/\`
- 所有 \`PlatformException\` 必须捕获并处理，禁止未处理的平台异常
- 原生方法调用必须在主线程外执行（使用 \`compute\` 或 \`Isolate\`）

### 5.6 代码组织

\`\`\`
lib/
├── main.dart                 # 入口 + Provider 配置
├── routes/                   # 路由配置
│   └── app_router.dart
├── models/                   # 数据模型
├── providers/ (或 blocs/)    # 状态管理
├── screens/                  # 页面
├── widgets/                  # 可复用组件
├── services/                 # API/业务逻辑
└── utils/                    # 工具类
\`\`\`

- 每个功能模块使用 barrel file（\`index.dart\`）统一导出
- 禁止在 \`main.dart\` 中编写业务逻辑
- 模型类使用 \`freezed\` + \`json_serializable\` 生成，禁止手写 \`fromJson\` / \`toJson\``,

    PLATFORM_FATAL_CHECKS: `- \`BuildContext\` 在 \`async\` 间隙后使用（未检查 mounted）
- \`setState()\` 在 \`dispose()\` 后调用
- 缺少 \`super.dispose()\` 调用
- 未处理的 \`PlatformException\`
- Provider 在 \`build\` 方法中创建新实例
- 混用多种状态管理方案（如同时使用 Provider 和 BLoC）`,

    PLATFORM_WARNING_CHECKS: `- \`StatelessWidget\` 缺少 \`const\` 构造函数
- 使用 \`Container\` 仅做间距（应用 \`SizedBox\`）
- Widget 树嵌套超过 5 层未拆分
- 使用 \`print()\` 调试输出（应用 logging 框架）
- 列表项缺少 \`Key\` 参数
- 硬编码字符串/颜色/尺寸（应用主题或常量）`,

    PLATFORM_SUGGESTION_CHECKS: `- 检查所有可优化的 \`const\` 构造函数
- 列表项添加 \`Key\` 以支持高效重建
- 页面转场使用 \`Hero\` 动画
- 长列表使用 \`ListView.builder\` 懒加载
- 提取重复 Widget 为独立组件`,

    PLATFORM_SELF_CHECK_ITEMS: `| F1 | const 构造函数已应用于所有 StatelessWidget？ |
| F2 | BuildContext 未在 async 间隙后使用（或已检查 mounted）？ |
| F3 | 状态管理方案统一（未混用 Provider/BLoC/Riverpod）？ |
| F4 | dispose() 正确重写且调用了 super.dispose()？ |
| F5 | PlatformException 已全部捕获处理？ |
| F6 | pubspec.yaml 依赖版本已锁定？ |
| F7 | 路由使用 GoRouter，无 Navigator.push 直接调用？ |
| F8 | 代码组织符合 feature-based 目录结构？ |`,

    PLATFORM_RESOURCE_SYNC_CONTENT: `#### Flutter 资源同步检查

- \`pubspec.yaml\` 中声明的 assets 与实际文件一致
- 国际化文件（\`l10n.yaml\` / \`.arb\` 文件）覆盖所有支持语言
- App 图标和启动屏资源齐全（iOS + Android）
- 图片资源 @2x/@3x 变体齐全（如使用）`,

    PLATFORM_SPECIFIC_TASK_TEMPLATES: `#### Flutter 任务模板

**新增页面**：
1. 创建 Screen Widget（StatelessWidget 或 StatefulWidget）
2. 在 \`app_router.dart\` 中添加路由配置
3. 创建对应的 Provider/StateNotifier
4. 如需数据模型，在 \`models/\` 中添加

**新增数据模型**：
1. 创建 Model class（使用 freezed + json_serializable）
2. 运行 \`build_runner\` 生成代码
3. 在对应的 Provider 中使用

**添加 Platform Channel**：
1. 定义 MethodChannel 名称
2. 创建 Dart 端封装类
3. 实现 Android 端（Kotlin/Java）和 iOS 端（Swift/ObjC）
4. 处理 PlatformException`,
  },
  en: {
    PLATFORM_RULES_SUMMARY: 'Flutter: Widget tree, Provider/Riverpod state, GoRouter navigation, platform channels',

    PLATFORM_SPECIFIC_RULES: `### 5.1 Widget Tree & Component Constraints

- \`StatelessWidget\` must use \`const\` constructors unless depending on non-const data
- \`StatefulWidget\` lifecycle must follow: \`initState\` → \`didChangeDependencies\` → \`build\` → \`dispose\`
- Do NOT perform side effects (network, file IO) in \`build()\`; side effects go in \`initState\` or \`StateNotifier\`
- \`BuildContext\` safety rules:
  - Do NOT use \`BuildContext\` across async gaps (widget may be unmounted)
  - Check \`mounted\` state before using \`context\`
  - After async operations, check mounted before using Navigator/Theme or other context-dependent APIs
- List items must provide a \`Key\` (\`ValueKey\` or \`ObjectKey\`); omitting Key is prohibited
- Widget trees with >3 levels of nesting must be extracted into independent sub-components
- Prefer \`const\` widget constructors for framework rebuild optimization

### 5.2 State Management

**Projects must choose ONE state management solution and use it consistently; mixing is prohibited**:

| Solution | Best For | Core API |
|----------|----------|----------|
| Provider | Small-medium projects | \`context.watch\` / \`context.read\`, \`ChangeNotifier\` |
| Riverpod | Medium-large projects | \`ref.watch\` / \`ref.read\`, \`StateNotifierProvider\` |
| BLoC | Event-driven scenarios | \`BlocBuilder\`, \`BlocListener\`, \`BlocProvider\` |

**General rules**:
- \`ChangeNotifier\` / \`StateNotifier\` must NOT hold \`BuildContext\` directly
- State change notifications must only fire after actual data changes; empty notifications are prohibited
- Provider creation location must be reasonable (top-level in \`main.dart\` or page-level); creating new Providers in \`build\` is prohibited
- Async state uses \`AsyncValue\` / \`FutureProvider\` / \`StreamProvider\`; manually managing loading/error states is prohibited

### 5.3 Layout Standards

- Prefer \`SizedBox\` for spacing; using \`Container\` only for spacing is prohibited
- Use \`const EdgeInsets.all/symmetric/only\` for padding; magic numbers are prohibited
- Responsive layout:
  - Use \`MediaQuery.of(context)\` for overall page dimensions
  - Use \`LayoutBuilder\` for component-level adaptation
- Avoid excessive Column/Row nesting; >5 levels should be extracted into sub-components
- Use \`Flexible\` / \`Expanded\` to correctly distribute remaining space

### 5.4 Router Navigation

- Use GoRouter for routing; direct \`Navigator.push\` is prohibited
- Route configuration centralized in \`lib/routes/app_router.dart\`
- Page navigation:
  - \`context.go('/path')\` replaces current route
  - \`context.push('/path')\` pushes new route
  - \`context.pop()\` goes back
- Route guards implemented via GoRouter's \`redirect\`
- Deep linking configured in GoRouter's \`routes\`
- Route parameters pass via \`pathParameters\` and \`queryParameters\`

### 5.5 Platform Channel

- Native communication uses \`MethodChannel\` (sync request-response) or \`EventChannel\` (streaming data)
- Channel names use reverse domain format: \`'com.example.app/channel_name'\`
- Platform code goes in \`android/app/src/main/kotlin/\` and \`ios/Runner/\`
- All \`PlatformException\` must be caught and handled; unhandled platform exceptions are prohibited
- Native method calls must execute off the main thread (use \`compute\` or \`Isolate\`)

### 5.6 Code Organization

\`\`\`
lib/
├── main.dart                 # Entry + Provider config
├── routes/                   # Route configuration
│   └── app_router.dart
├── models/                   # Data models
├── providers/ (or blocs/)    # State management
├── screens/                  # Pages
├── widgets/                  # Reusable components
├── services/                 # API/business logic
└── utils/                    # Utilities
\`\`\`

- Each feature module uses a barrel file (\`index.dart\`) for unified exports
- Business logic in \`main.dart\` is prohibited
- Model classes use \`freezed\` + \`json_serializable\` for generation; hand-written \`fromJson\` / \`toJson\` is prohibited`,

    PLATFORM_FATAL_CHECKS: `- \`BuildContext\` used across async gaps (without checking mounted)
- \`setState()\` called after \`dispose()\`
- Missing \`super.dispose()\` call
- Unhandled \`PlatformException\`
- New Provider instance created in \`build\` method
- Multiple state management solutions mixed (e.g., Provider + BLoC together)`,

    PLATFORM_WARNING_CHECKS: `- \`StatelessWidget\` missing \`const\` constructor
- \`Container\` used only for spacing (should use \`SizedBox\`)
- Widget tree nesting >5 levels without extraction
- Using \`print()\` for debug output (should use logging framework)
- List items missing \`Key\` parameter
- Hardcoded strings/colors/dimensions (should use theme or constants)`,

    PLATFORM_SUGGESTION_CHECKS: `- Check all optimizable \`const\` constructors
- Add \`Key\` to list items for efficient rebuilding
- Use \`Hero\` animations for page transitions
- Use \`ListView.builder\` for lazy loading long lists
- Extract repeated Widgets into independent components`,

    PLATFORM_SELF_CHECK_ITEMS: `| F1 | const constructors applied to all StatelessWidgets? |
| F2 | BuildContext not used across async gaps (or mounted checked)? |
| F3 | State management solution consistent (not mixing Provider/BLoC/Riverpod)? |
| F4 | dispose() correctly overridden with super.dispose() called? |
| F5 | All PlatformExceptions caught and handled? |
| F6 | pubspec.yaml dependency versions locked? |
| F7 | Routing uses GoRouter, no direct Navigator.push calls? |
| F8 | Code organization follows feature-based directory structure? |`,

    PLATFORM_RESOURCE_SYNC_CONTENT: `#### Flutter Resource Sync Checks

- Assets declared in \`pubspec.yaml\` match actual files
- i18n files (\`l10n.yaml\` / \`.arb\` files) cover all supported languages
- App icon and splash screen resources complete (iOS + Android)
- Image resource @2x/@3x variants complete (if used)`,

    PLATFORM_SPECIFIC_TASK_TEMPLATES: `#### Flutter Task Templates

**Add new screen**:
1. Create Screen Widget (StatelessWidget or StatefulWidget)
2. Add route configuration in \`app_router.dart\`
3. Create corresponding Provider/StateNotifier
4. Add data model in \`models/\` if needed

**Add data model**:
1. Create Model class (using freezed + json_serializable)
2. Run \`build_runner\` to generate code
3. Use in corresponding Provider

**Add Platform Channel**:
1. Define MethodChannel name
2. Create Dart-side wrapper class
3. Implement Android side (Kotlin/Java) and iOS side (Swift/ObjC)
4. Handle PlatformException`,
  },
};

export default function getPlatformVars(lang) {
  return strings[lang] || strings.en;
}
