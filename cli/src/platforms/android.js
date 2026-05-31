const strings = {
  zh: {
    PLATFORM_RULES_SUMMARY: 'Android: MVVM架构, ARouter路由, Retrofit网络, ViewBinding, Paging3',

    PLATFORM_SPECIFIC_RULES: `### 5.1 生命周期

- 禁止在 \`onCreate()\` / \`onViewCreated()\` 中直接执行耗时操作
- \`LiveData\` 观察必须使用 \`viewLifecycleOwner\`（Fragment 中）
- \`onDestroy()\` / \`onDestroyView()\` 必须清理所有注册的监听器和回调
- ViewModel 中禁止持有 Activity/Fragment 引用
- 使用 \`ViewModelProvider\` 或 Hilt 注入获取 ViewModel，禁止手动 new

### 5.2 路由（ARouter）

- 所有可跳转页面必须使用 \`@Route(path = "/模块/页面")\` 注解
- 路由路径格式：\`/{feature-module}/{page}\`，如 \`/home/main\`, \`/product/detail\`
- 跨模块传参使用 \`ARouter\` 的 \`withXxx()\` 方法，禁止 \`Bundle\` 直接传递自定义对象
- 路由拦截器使用 \`IInterceptor\`，统一处理鉴权、埋点等逻辑
- 禁止使用 \`Intent\` 直接启动跨模块 Activity

### 5.3 网络请求

- 所有网络请求通过 \`Retrofit\` + \`suspend\` 协程执行
- 请求必须在 \`ViewModel.viewModelScope\` 中发起
- 响应必须经过统一的 \`ApiResponse<T>\` 封装处理
- 禁止在 View 层直接发起网络请求
- 错误处理统一在 Repository 层捕获，通过 sealed class 传递状态
- 禁止使用 \`HttpURLConnection\` / \`OkHttp\` 直接调用

### 5.4 RecyclerView

- 使用 \`ListAdapter\` + \`DiffUtil\` 实现列表，禁止 \`notifyDataSetChanged()\`
- ViewHolder 必须使用 \`ViewBinding\`
- 列表数据使用 \`Paging 3\` 分页加载
- 列表项点击事件通过接口回调传递，禁止在 Adapter 中直接处理业务逻辑

### 5.5 多语言

- 所有用户可见字符串必须放入 \`strings.xml\`，支持中/英双语
- 禁止在代码中直接拼接 UI 字符串
- 日期/数字格式化使用 \`DateFormat\` / \`NumberFormat\`
- 布局文件中的硬编码字符串也必须替换为 \`@string/xxx\``,

    PLATFORM_FATAL_CHECKS: `- 在主线程执行网络请求或数据库查询
- 跨模块使用 \`Intent\` 直接启动 Activity（应使用 ARouter）
- Activity/Fragment 未继承正确的 Base 类
- 缺少 \`@Route\` 注解的可跳转页面
- Fragment 中 LiveData 观察未使用 \`viewLifecycleOwner\`
- ViewModel 持有 Activity/Fragment 引用`,

    PLATFORM_WARNING_CHECKS: `- 硬编码颜色值（应使用 \`R.color.xxx\`）
- 硬编码尺寸 \`XXdp\` / \`XXsp\`（应使用 \`R.dimen.xxx\`）
- 使用 \`notifyDataSetChanged()\`（应使用 \`DiffUtil\`）
- 硬编码字符串（应使用 \`R.string.xxx\`）
- LiveData 观察使用 \`this\` 而非 \`viewLifecycleOwner\`（Fragment 中）
- 使用 \`Log.d()\` / \`Log.e()\` 直接调用（应使用统一日志工具）`,

    PLATFORM_SUGGESTION_CHECKS: `- 使用 \`ListAdapter\` + \`DiffUtil\` 替代 BaseAdapter
- ViewHolder 使用 ViewBinding 替代 findViewById
- 列表使用 Paging 3 分页加载
- 使用 weak reference 处理回调
- 使用统一的日志工具类`,

    PLATFORM_SELF_CHECK_ITEMS: `| A1 | Activity/Fragment 继承正确的 Base 类？ |
| A2 | ARouter 路径已添加 @Route 注解？ |
| A3 | 资源命名前缀符合规范？ |
| A4 | LiveData 观察使用 viewLifecycleOwner？ |
| A5 | 网络请求在 ViewModelScope 中发起？ |
| A6 | 无硬编码字符串/颜色/尺寸？ |
| A7 | RecyclerView 使用 ListAdapter + DiffUtil？ |
| A8 | 日志使用统一工具类？ |`,

    PLATFORM_RESOURCE_SYNC_CONTENT: `#### Android 资源同步检查

- drawable 密度变体齐全（mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi）
- 布局限定词目录一致（layout-land, layout-sw600dp 等）
- values 语言目录一致（values-zh, values-en 等）
- mipmap 密度变体齐全（启动图标）
- 资源命名前缀符合项目规范`,

    PLATFORM_SPECIFIC_TASK_TEMPLATES: `#### Android 任务模板

**新增页面**：
1. 创建 Activity/Fragment（继承 Base 类）
2. 创建对应 ViewModel（继承 BaseViewModel）
3. 创建布局文件（命名: activity_xxx.xml / fragment_xxx.xml）
4. 添加 @Route 注解
5. 创建对应的 ApiService 和 Repository（如需网络请求）

**新增 API 接口**：
1. 在 ApiService 中定义接口方法
2. 创建 Repository 封装调用逻辑
3. 在 ViewModel 中通过 suspend 调用
4. 通过 LiveData 暴露结果

**新增 RecyclerView 列表**：
1. 创建数据模型
2. 创建 ViewHolder（使用 ViewBinding）
3. 创建 ListAdapter + DiffUtil.ItemCallback
4. 配置 Paging 3（如需分页）`,
  },
  en: {
    PLATFORM_RULES_SUMMARY: 'Android: MVVM, ARouter navigation, Retrofit networking, ViewBinding, Paging 3',

    PLATFORM_SPECIFIC_RULES: `### 5.1 Lifecycle

- Do NOT perform heavy operations directly in \`onCreate()\` / \`viewCreated()\`
- LiveData observation must use \`viewLifecycleOwner\` (in Fragments)
- \`onDestroy()\` / \`onDestroyView()\` must clean up all registered listeners and callbacks
- ViewModel must NOT hold Activity/Fragment references
- Obtain ViewModel via \`ViewModelProvider\` or Hilt injection; creating with \`new\` is prohibited

### 5.2 Routing (ARouter)

- All navigable pages must use \`@Route(path = "/module/page")\` annotation
- Route path format: \`/{feature-module}/{page}\`, e.g., \`/home/main\`, \`/product/detail\`
- Cross-module parameters pass via \`ARouter\` \`withXxx()\` methods; direct \`Bundle\` for custom objects is prohibited
- Route interceptors use \`IInterceptor\` for unified auth, analytics, etc.
- Using \`Intent\` to directly launch cross-module Activities is prohibited

### 5.3 Network Requests

- All network requests use \`Retrofit\` + \`suspend\` coroutines
- Requests must execute within \`ViewModel.viewModelScope\`
- Responses must be wrapped in unified \`ApiResponse<T>\`
- Network requests directly in View layer are prohibited
- Error handling unified at Repository layer via sealed class
- Direct \`HttpURLConnection\` / \`OkHttp\` usage is prohibited

### 5.4 RecyclerView

- Use \`ListAdapter\` + \`DiffUtil\` for lists; \`notifyDataSetChanged()\` is prohibited
- ViewHolder must use \`ViewBinding\`
- List data uses \`Paging 3\` for pagination
- List item click events pass via interface callback; direct business logic in Adapter is prohibited

### 5.5 Internationalization

- All user-visible strings must go into \`strings.xml\`, supporting Chinese/English
- Direct string concatenation in code for UI is prohibited
- Date/number formatting uses \`DateFormat\` / \`NumberFormat\`
- Hardcoded strings in layout files must be replaced with \`@string/xxx\``,

    PLATFORM_FATAL_CHECKS: `- Network request or database query on main thread
- Cross-module Activity launch via \`Intent\` (should use ARouter)
- Activity/Fragment not inheriting correct Base class
- Navigable pages missing \`@Route\` annotation
- LiveData observation in Fragment not using \`viewLifecycleOwner\`
- ViewModel holding Activity/Fragment reference`,

    PLATFORM_WARNING_CHECKS: `- Hardcoded color values (should use \`R.color.xxx\`)
- Hardcoded dimensions \`XXdp\` / \`XXsp\` (should use \`R.dimen.xxx\`)
- Using \`notifyDataSetChanged()\` (should use \`DiffUtil\`)
- Hardcoded strings (should use \`R.string.xxx\`)
- LiveData observation using \`this\` instead of \`viewLifecycleOwner\` (in Fragment)
- Direct \`Log.d()\` / \`Log.e()\` calls (should use unified logging tool)`,

    PLATFORM_SUGGESTION_CHECKS: `- Use \`ListAdapter\` + \`DiffUtil\` instead of BaseAdapter
- ViewHolder uses ViewBinding instead of findViewById
- Lists use Paging 3 for pagination
- Use weak reference for callbacks
- Use unified logging utility class`,

    PLATFORM_SELF_CHECK_ITEMS: `| A1 | Activity/Fragment inherits correct Base class? |
| A2 | @Route annotation added for navigable pages? |
| A3 | Resource naming prefix compliant? |
| A4 | LiveData observation uses viewLifecycleOwner? |
| A5 | Network requests execute in ViewModelScope? |
| A6 | No hardcoded strings/colors/dimensions? |
| A7 | RecyclerView uses ListAdapter + DiffUtil? |
| A8 | Logging uses unified utility class? |`,

    PLATFORM_RESOURCE_SYNC_CONTENT: `#### Android Resource Sync Checks

- Drawable density variants complete (mdpi/hdpi/xhdpi/xxhdpi/xxxhdpi)
- Layout qualifier directories consistent (layout-land, layout-sw600dp, etc.)
- Values language directories consistent (values-zh, values-en, etc.)
- Mipmap density variants complete (launcher icons)
- Resource naming prefix compliant with project standards`,

    PLATFORM_SPECIFIC_TASK_TEMPLATES: `#### Android Task Templates

**Add new page**:
1. Create Activity/Fragment (inheriting Base class)
2. Create corresponding ViewModel (inheriting BaseViewModel)
3. Create layout file (naming: activity_xxx.xml / fragment_xxx.xml)
4. Add @Route annotation
5. Create ApiService and Repository (if network needed)

**Add API endpoint**:
1. Define method in ApiService
2. Create Repository wrapper
3. Call via suspend in ViewModel
4. Expose result via LiveData

**Add RecyclerView list**:
1. Create data model
2. Create ViewHolder (with ViewBinding)
3. Create ListAdapter + DiffUtil.ItemCallback
4. Configure Paging 3 (if pagination needed)`,
  },
};

export default function getPlatformVars(lang) {
  return strings[lang] || strings.en;
}
