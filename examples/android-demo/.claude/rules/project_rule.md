<!--
id: project_rule
domains: [general, code_quality, architecture, android]
priority: 100
triggers: [code_generation, code_modification, code_review, refactoring, bug_fix, feature_development]
mandatory: true
-->
# ShopApp 开发规则

> **适用范围**：代码生成、修改、审查、重构操作。
> **跳过条件**：纯闲聊、通用知识问答、非代码相关讨论、否定语境。

### 否定词保护

| 否定模式 | 示例 | 原因 |
|---------|------|------|
| 通用概念讨论 | "X 和 Y 在原理上有什么区别？" | 通用知识问答 |
| 类比/对比 | "类似项目中这个机制怎么做的？" | 讨论外部项目 |
| 明确排除 | "帮我看看代码逻辑，不需要检查规范" | 用户显式排除 |
| 已关闭语境 | "之前那个问题已经解决了" | 问题已关闭 |

---

## 1 行为准则

- **先查后写**：生成代码前，先查阅 `.claude/references/` 目录下目标模块文档，确认类名、方法名、路径真实存在
- **禁止虚构**：不得使用项目中不存在的类/方法/常量/路径；不确定时必须用搜索工具验证
- **禁止引入新依赖**：仅使用 `.claude/references/dependencies.md` 中已列出的第三方库和模块依赖
- **优先复用工具类**：项目中已有封装必须优先使用，禁止绕过封装重新实现
- **不确定即确认**：遇到灰色地带必须向用户确认，禁止自行决策

### 1.N 主动纠错准则

- **主动扫描不被动等待**：在接触任何源码文件或规则文件时，必须主动检查合规性和合理性，而非仅等待审查触发
- **发现即纠正而非仅报告**：发现规则自洽性缺陷、代码合规性违规、实现合理性偏差时，不仅列出问题，还必须提供具体修正方案并推动闭环
- **规则自洽性不可盲信**：规则文件本身也可能有缺陷（内部矛盾、遗漏、过时），发现时必须主动指出并提出修正
- **纠错闭环不遗忘**：发现的致命问题必须追踪至修复完成，禁止"报告即遗忘"
- **纠错需用户确认**：执行修正前必须告知用户，由用户决定是否执行；禁止未经确认自动修改
- **同一轮纠错限 5 文件**：防止过度修改失控，每轮纠错最多修改 5 个文件

---

## 2 架构约束

### 2.1 模块依赖方向

```
app (主应用)
 ├── feature-home       (首页模块)
 ├── feature-product     (商品模块)
 ├── feature-cart        (购物车模块)
 ├── feature-order       (订单模块)
 ├── feature-user        (用户模块)
 ├── common-ui           (公共UI组件)
 ├── common-network      (网络层)
 ├── common-utils        (工具类)
 └── common-data         (数据模型)
```

依赖规则：
- `app` 可依赖所有模块
- `feature-*` 模块可依赖 `common-*` 模块，**不可**依赖其他 `feature-*` 模块
- `common-*` 模块之间不可互相依赖（`common-data` 除外，可被所有 `common-*` 依赖）
- **禁止反向依赖**：`common-*` 不得依赖任何 `feature-*` 模块

### 2.2 模块间通信

通过 ARouter + EventBus 进行跨模块通信。禁止业务模块间直接 import。

### 2.3 继承体系

- 所有 Activity 必须继承 `BaseActivity`（位于 `common-ui`）
- 所有 Fragment 必须继承 `BaseFragment`（位于 `common-ui`）
- 所有 ViewModel 必须继承 `BaseViewModel`（位于 `common-data`）
- 禁止多重继承

---

## 3 禁止模式

以下模式在项目代码中**严格禁止**：

| # | 禁止模式 | 正确替代 | 原因 |
|---|---------|---------|------|
| 1 | `Intent` 直接启动 Activity | `ARouter.getInstance().build("/path").navigation()` | 跨模块耦合 |
| 2 | 硬编码字符串（中文/英文） | `R.string.xxx` 资源引用 | 国际化不可维护 |
| 3 | 硬编码颜色值 `#XXXXXX` | `R.color.xxx` 或 `ContextCompat.getColor()` | 主题切换失效 |
| 4 | 硬编码尺寸 `XXdp` / `XXsp` | `R.dimen.xxx` 资源引用 | 适配不同屏幕 |
| 5 | `Log.d()` / `Log.e()` 直接调用 | 项目统一日志工具 `XLog` | 日志无法统一管控 |
| 6 | `SharedPreferences` 直接调用 | `SPManager` 封装类 | 加密和多进程安全 |
| 7 | `HttpURLConnection` / `OkHttp` 直接调用 | `Retrofit` + 项目封装的 `ApiService` | 统一拦截器和错误处理 |
| 8 | 在 `onCreate()` 中执行网络请求 | 在 `ViewModel` 中发起，`LiveData` 观察 | 生命周期安全 |
| 9 | `runOnUiThread` 直接调用 | `LiveData` + `observe()` | 违背 MVVM 分层 |
| 10 | `findViewById` 手动调用 | `ViewBinding` / `DataBinding` | 类型安全和空安全 |

---

## 4 命名规范

### 4.1 资源前缀

所有资源必须以 `shop_` 为前缀，避免跨模块资源冲突：

| 资源类型 | 前缀格式 | 示例 |
|---------|---------|------|
| 布局文件 | `activity_shop_` / `fragment_shop_` / `item_shop_` | `activity_shop_home.xml` |
| Drawable | `shop_ic_` / `shop_bg_` / `shop_selector_` | `shop_ic_cart.png` |
| String | `shop_` | `shop_cart_title` |
| Color | `shop_` | `shop_primary` |
| Dimen | `shop_` | `shop_margin_medium` |
| Style | `shop_` | `shop_Theme_Day` |

### 4.2 类/文件命名

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| Activity | `{功能}Activity` | `HomeActivity`, `ProductDetailActivity` |
| Fragment | `{功能}Fragment` | `CartFragment`, `OrderListFragment` |
| ViewModel | `{功能}ViewModel` | `HomeViewModel`, `CartViewModel` |
| Adapter | `{功能}Adapter` | `ProductListAdapter` |
| Repository | `{功能}Repository` | `ProductRepository` |
| ApiService | `{模块}ApiService` | `ProductApiService` |

### 4.3 布局命名

| 页面类型 | 命名规则 | 示例 |
|---------|---------|------|
| Activity 布局 | `activity_shop_{功能}.xml` | `activity_shop_home.xml` |
| Fragment 布局 | `fragment_shop_{功能}.xml` | `fragment_shop_cart.xml` |
| 列表项布局 | `item_shop_{功能}.xml` | `item_shop_product.xml` |
| 弹窗布局 | `dialog_shop_{功能}.xml` | `dialog_shop_confirm.xml` |
| 自定义控件布局 | `layout_shop_{控件}.xml` | `layout_shop_header.xml` |

---

## 5 Android 专项规则

### 5.1 生命周期

- 禁止在 `onCreate()` / `onViewCreated()` 中直接执行耗时操作
- `LiveData` 观察必须使用 `viewLifecycleOwner`（Fragment 中）
- `onDestroy()` / `onDestroyView()` 必须清理所有注册的监听器和回调

### 5.2 ARouter 路由

- 所有可跳转页面必须使用 `@Route(path = "/模块/页面")` 注解
- 路由路径格式：`/{feature-module}/{page}`，如 `/home/main`, `/product/detail`
- 跨模块传参使用 `ARouter` 的 `withXxx()` 方法，禁止 `Bundle` 直接传递自定义对象

### 5.3 网络请求

- 所有网络请求通过 `Retrofit` + `suspend` 协程执行
- 请求必须在 `ViewModel.viewModelScope` 中发起
- 响应必须经过统一的 `ApiResponse<T>` 封装处理

### 5.4 RecyclerView

- 使用 `ListAdapter` + `DiffUtil` 实现列表，禁止 `notifyDataSetChanged()`
- ViewHolder 必须使用 `ViewBinding`
- 列表数据使用 `Paging 3` 分页加载

### 5.5 多语言

- 所有用户可见字符串必须放入 `strings.xml`，支持中/英双语
- 禁止在代码中直接拼接 UI 字符串
- 日期/数字格式化使用 `DateFormat` / `NumberFormat`

---

## 6 代码实现质量规则

- 同一模块内 3 次及以上相同/相似代码块，必须抽取为公共方法
- 禁止 Copy-Paste 式编码
- 优先复用现有类
- 单例模式统一使用 `lazy(SYNCHRONIZED)`

---

## 7 代码自查清单

每次代码变更后逐项检查：

| # | 检查项 |
|---|--------|
| 1 | 引用的类/方法在项目中真实存在？ |
| 2 | 模块依赖方向正确？ |
| 3 | 无禁止模式使用？ |
| 4 | 无硬编码路由路径/SP Key/颜色/尺寸/中文字符串？ |
| 5 | 日志工具使用 XLog 而非 Log？ |
| 6 | 无重复代码块？ |
| 7 | Activity/Fragment 继承正确的 Base 类？ |
| 8 | ARouter 路径已添加 @Route 注解？ |
| 9 | 资源文件命名以 shop_ 为前缀？ |
| 10 | LiveData 观察使用 viewLifecycleOwner？ |
| C1 | 主动纠错扫描已执行？（委派 `proactive-correction` agent） |
| C2 | 发现的致命违规已修正闭环？ |
| C3 | 规则自洽性无缺陷？（接触规则文件时必查） |

---

## 8 .claude 配置变更管理

凡修改 `.claude/` 目录下的任何配置文件，**必须**：

1. 更新 `.claude/CHANGELOG.md`（Keep a Changelog 格式）
2. 升级 `CLAUDE.md` 首行版本号

| 变更类型 | 版本递增 |
|---------|---------|
| 架构级重构 | X |
| 功能变更（新增规则/技能/hooks/文档） | Y |
| 修补（修正/补充） | Z |
