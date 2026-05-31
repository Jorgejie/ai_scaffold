const strings = {
  zh: {
    PLATFORM_RULES_SUMMARY: 'iOS: SwiftUI/UIKit, MVVM, ARC内存, Swift并发, App Store合规',

    PLATFORM_SPECIFIC_RULES: `### 5.1 SwiftUI / UIKit 组件规范

**SwiftUI（推荐新项目使用）**：
- \`body\` 计算属性中禁止执行副作用，仅构建声明式 UI
- 状态绑定规则：
  - \`@State\`：视图内部可变状态
  - \`@Binding\`：父→子双向绑定
  - \`@ObservedObject\`：外部传入的可观察对象（不持有生命周期）
  - \`@StateObject\`：视图拥有生命周期的可观察对象（视图内创建）
  - \`@EnvironmentObject\`：跨视图层级注入
- \`@StateObject\` 与 \`@ObservedObject\` 选择规则：在创建对象的视图中使用 \`@StateObject\`，传递给子视图时使用 \`@ObservedObject\`
- 视图组合优先于继承，通过 \`ViewModifier\` 和 \`View\` 扩展复用样式

**UIKit（维护中的项目）**：
- \`UIViewController\` 生命周期：\`viewDidLoad\` → \`viewWillAppear\` → \`viewDidAppear\` → \`viewWillDisappear\` → \`viewDidDisappear\`
- 禁止在 \`viewDidLoad\` 中依赖视图尺寸（使用 \`viewDidLayoutSubviews\`）
- SwiftUI 与 UIKit 混编使用 \`UIViewRepresentable\` / \`UIViewControllerRepresentable\`

### 5.2 ARC 内存管理

- 闭包中捕获 self 必须使用 \`[weak self]\` 或 \`[unowned self]\`
  - 默认使用 \`[weak self]\`
  - 仅在确定 self 生命周期覆盖闭包时使用 \`[unowned self]\`
- delegate 必须声明为 \`weak\` 引用，禁止强引用委托
- \`deinit\` 中清理通知监听、定时器、KVO 观察者
- 批量对象创建使用 \`autoreleasepool\` 控制峰值内存
- Core Foundation 对象必须手动管理（\`Unmanaged\` / \`takeRetainedValue\` / \`takeUnretainedValue\`）

### 5.3 Swift 并发（Concurrency）

- 异步操作优先使用 \`async/await\`，替代 completion handler
- 线程安全使用 \`actor\` 替代手动锁（\`NSLock\` / \`DispatchQueue\`）
- UI 更新必须在主线程执行：
  - SwiftUI：视图自动在主线程更新
  - UIKit：使用 \`@MainActor\` 标记或 \`MainActor.run\`
- \`Task\` 取消规则：
  - 长时间运行的任务必须检查 \`Task.isCancelled\`
  - 视图消失时取消关联的 \`Task\`（使用 \`task(id:)\` modifier）
- 禁止在 \`actor\` 中使用 \`DispatchQueue.main.sync\`（死锁风险）
- 数据竞争防护：共享可变状态必须通过 \`actor\` 保护

### 5.4 架构模式（MVVM）

- ViewModel 为纯 Swift class，禁止继承 UIViewController
- ViewModel 与 View 的绑定：
  - SwiftUI：使用 \`@Published\` 属性 + \`@StateObject\` / \`@ObservedObject\`
  - UIKit：使用 \`Combine\` 的 \`@Published\` + \`sink\` 或闭包回调
- 依赖注入通过协议（Protocol）实现，禁止在 ViewModel 中直接创建服务实例
- 导航协调使用 Coordinator 模式（UIKit）或 Router 模式（SwiftUI）
- 网络层通过 \`URLSession\` + \`async/await\` + \`Codable\` 实现

### 5.5 App Store 合规

- **隐私清单（Privacy Manifest）**：必须包含 \`PrivacyInfo.xcprivacy\`
  - 声明使用的 Required Reason API（UserDefaults、文件时间戳、磁盘空间等）
  - 声明收集的数据类型和用途
- 禁止使用私有 API（会被 App Store 审核拒绝）
- 敏感数据存储：
  - 凭据使用 Keychain
  - 用户偏好使用 UserDefaults（非敏感数据）
  - 禁止在 UserDefaults 中存储密码、token 等敏感信息
- 权限使用说明必须在 \`Info.plist\` 中配置（NSCameraUsageDescription 等）`,

    PLATFORM_FATAL_CHECKS: `- 闭包中强引用 self 导致循环引用
- UI 操作在后台线程执行
- 强制解包（\`!\`）未做空值检查
- UI 操作缺少 \`@MainActor\` 标记
- 使用私有 API（App Store 审核拒绝）
- delegate 未声明为 \`weak\``,

    PLATFORM_WARNING_CHECKS: `- 使用 \`String(format:)\` 而非 \`LocalizedStringKey\`
- UI 测试缺少 \`accessibilityIdentifier\`
- 使用 \`DispatchQueue.main.async\` 而非 \`@MainActor\`
- 强制类型转换（\`as!\`）未做安全检查
- \`@StateObject\` 与 \`@ObservedObject\` 使用场景错误`,

    PLATFORM_SUGGESTION_CHECKS: `- 闭包中使用 \`weak self\`（即使非必须，也建议预防）
- 使用 \`Result\` 类型替代 optional error 模式
- 使用 \`async/await\` 替代 completion handler
- 新视图优先使用 SwiftUI 而非 UIKit
- 使用 \`ViewModifier\` 复用样式而非复制代码`,

    PLATFORM_SELF_CHECK_ITEMS: `| iOS1 | 闭包中使用 weak/unowned 捕获 self？ |
| iOS2 | UI 更新在主线程（@MainActor）？ |
| iOS3 | 无强制解包（!）或已做空值检查？ |
| iOS4 | 隐私清单 PrivacyInfo.xcprivacy 已配置？ |
| iOS5 | accessibilityIdentifier 已设置（UI 测试需要）？ |
| iOS6 | 异步操作使用 async/await？ |
| iOS7 | delegate 声明为 weak 引用？ |
| iOS8 | Info.plist 权限说明已配置？ |`,

    PLATFORM_RESOURCE_SYNC_CONTENT: `#### iOS 资源同步检查

- \`Assets.xcassets\` 中的图片资源完整性
- \`Localizable.strings\` 覆盖所有支持语言
- Launch Screen 配置正确
- App Icon 尺寸齐全
- 隐私清单 \`PrivacyInfo.xcprivacy\` 配置完整
- Info.plist 权限描述完整`,

    PLATFORM_SPECIFIC_TASK_TEMPLATES: `#### iOS 任务模板

**新增 SwiftUI 页面**：
1. 创建 SwiftUI View
2. 创建对应的 ViewModel（ObservableObject）
3. 配置路由（NavigationLink / Router）
4. 添加必要的状态绑定

**新增网络层**：
1. 定义 API 接口（URLSession + async/await）
2. 创建 Codable 数据模型
3. 实现错误处理（自定义 Error 类型）
4. 在 ViewModel 中集成

**新增 CoreData 实体**：
1. 在 .xcdatamodeld 中定义 Entity
2. 生成 NSManagedObject 子类
3. 创建 Core Data Stack 配置
4. 实现 CRUD 操作`,
  },
  en: {
    PLATFORM_RULES_SUMMARY: 'iOS: SwiftUI/UIKit, MVVM, ARC memory, Swift concurrency (async/await, actors), App Store compliance',

    PLATFORM_SPECIFIC_RULES: `### 5.1 SwiftUI / UIKit Component Standards

**SwiftUI (recommended for new projects)**:
- Do NOT perform side effects in \`body\` computed property; only build declarative UI
- State binding rules:
  - \`@State\`: View-internal mutable state
  - \`@Binding\`: Parent↔Child two-way binding
  - \`@ObservedObject\`: Externally provided observable object (doesn't own lifecycle)
  - \`@StateObject\`: View-owned observable object (created within the view)
  - \`@EnvironmentObject\`: Cross-hierarchy injection
- \`@StateObject\` vs \`@ObservedObject\`: Use \`@StateObject\` where the object is created; use \`@ObservedObject\` when passed to child views
- Prefer view composition over inheritance; reuse styles via \`ViewModifier\` and \`View\` extensions

**UIKit (for maintained projects)**:
- \`UIViewController\` lifecycle: \`viewDidLoad\` → \`viewWillAppear\` → \`viewDidAppear\` → \`viewWillDisappear\` → \`viewDidDisappear\`
- Do NOT rely on view dimensions in \`viewDidLoad\` (use \`viewDidLayoutSubviews\`)
- SwiftUI-UIKit interop uses \`UIViewRepresentable\` / \`UIViewControllerRepresentable\`

### 5.2 ARC Memory Management

- Closures capturing self must use \`[weak self]\` or \`[unowned self]\`
  - Default to \`[weak self]\`
  - Only use \`[unowned self]\` when self lifecycle is guaranteed to cover the closure
- delegate must be declared as \`weak\` reference; strong delegate references are prohibited
- Clean up notification observers, timers, and KVO in \`deinit\`
- Use \`autoreleasepool\` for batch object creation to control peak memory
- Core Foundation objects must be manually managed (\`Unmanaged\` / \`takeRetainedValue\` / \`takeUnretainedValue\`)

### 5.3 Swift Concurrency

- Prefer \`async/await\` for async operations; replace completion handlers
- Thread safety uses \`actor\` instead of manual locks (\`NSLock\` / \`DispatchQueue\`)
- UI updates must execute on main thread:
  - SwiftUI: Views auto-update on main thread
  - UIKit: Use \`@MainActor\` annotation or \`MainActor.run\`
- \`Task\` cancellation rules:
  - Long-running tasks must check \`Task.isCancelled\`
  - Cancel associated \`Task\` when view disappears (use \`task(id:)\` modifier)
- Do NOT use \`DispatchQueue.main.sync\` inside \`actor\` (deadlock risk)
- Data race protection: shared mutable state must be protected via \`actor\`

### 5.4 Architecture (MVVM)

- ViewModel is a plain Swift class; inheriting UIViewController is prohibited
- ViewModel-View binding:
  - SwiftUI: \`@Published\` properties + \`@StateObject\` / \`@ObservedObject\`
  - UIKit: \`Combine\` \`@Published\` + \`sink\` or closure callbacks
- Dependency injection via Protocol; directly creating service instances in ViewModel is prohibited
- Navigation coordination uses Coordinator pattern (UIKit) or Router pattern (SwiftUI)
- Network layer via \`URLSession\` + \`async/await\` + \`Codable\`

### 5.5 App Store Compliance

- **Privacy Manifest**: Must include \`PrivacyInfo.xcprivacy\`
  - Declare Required Reason APIs used (UserDefaults, file timestamps, disk space, etc.)
  - Declare data types collected and purposes
- Private API usage is prohibited (App Store review rejection)
- Sensitive data storage:
  - Credentials use Keychain
  - User preferences use UserDefaults (non-sensitive data only)
  - Storing passwords, tokens, etc. in UserDefaults is prohibited
- Usage descriptions must be configured in \`Info.plist\` (NSCameraUsageDescription, etc.)`,

    PLATFORM_FATAL_CHECKS: `- Strong self reference in closures causing retain cycles
- UI operations executed on background thread
- Force unwrapping (\`!\`) without nil check
- UI operations missing \`@MainActor\` annotation
- Using private APIs (App Store review rejection)
- delegate not declared as \`weak\``,

    PLATFORM_WARNING_CHECKS: `- Using \`String(format:)\` instead of \`LocalizedStringKey\`
- UI tests missing \`accessibilityIdentifier\`
- Using \`DispatchQueue.main.async\` instead of \`@MainActor\`
- Force cast (\`as!\`) without safety check
- \`@StateObject\` vs \`@ObservedObject\` used in wrong context`,

    PLATFORM_SUGGESTION_CHECKS: `- Use \`weak self\` in closures (even when not strictly required)
- Use \`Result\` type instead of optional error patterns
- Use \`async/await\` over completion handlers
- Prefer SwiftUI over UIKit for new views
- Use \`ViewModifier\` for style reuse instead of copying code`,

    PLATFORM_SELF_CHECK_ITEMS: `| iOS1 | Closures capture self with weak/unowned? |
| iOS2 | UI updates on main thread (@MainActor)? |
| iOS3 | No force unwrapping (!) or nil-checked? |
| iOS4 | Privacy manifest PrivacyInfo.xcprivacy configured? |
| iOS5 | accessibilityIdentifier set (for UI testing)? |
| iOS6 | Async operations use async/await? |
| iOS7 | delegate declared as weak reference? |
| iOS8 | Info.plist permission descriptions configured? |`,

    PLATFORM_RESOURCE_SYNC_CONTENT: `#### iOS Resource Sync Checks

- \`Assets.xcassets\` image resource completeness
- \`Localizable.strings\` coverage for all supported languages
- Launch Screen configuration correct
- App Icon sizes complete
- Privacy manifest \`PrivacyInfo.xcprivacy\` fully configured
- Info.plist permission descriptions complete`,

    PLATFORM_SPECIFIC_TASK_TEMPLATES: `#### iOS Task Templates

**Add new SwiftUI screen**:
1. Create SwiftUI View
2. Create corresponding ViewModel (ObservableObject)
3. Configure routing (NavigationLink / Router)
4. Add necessary state bindings

**Add network layer**:
1. Define API interface (URLSession + async/await)
2. Create Codable data models
3. Implement error handling (custom Error type)
4. Integrate in ViewModel

**Add CoreData entity**:
1. Define Entity in .xcdatamodeld
2. Generate NSManagedObject subclass
3. Create Core Data Stack configuration
4. Implement CRUD operations`,
  },
};

export default function getPlatformVars(lang) {
  return strings[lang] || strings.en;
}
