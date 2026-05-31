---
name: performance_check
description: Performance and security audit for code quality. Checks memory leaks, OOM risks, startup speed, ANR, lag, and security vulnerabilities. Auto-triggered by proactive-correction agent.
---

# Performance & Security Check — 性能与安全检查

> **触发方式**: 由 `proactive-correction` agent 在维度4中自动调用
>
> **检查范围**: 内存泄漏、OOM风险、启动速度、ANR、卡顿、代码安全

---

## 1. 内存泄漏检测 (Memory Leak Detection)

### 1.1 Android/Java/Kotlin 内存泄漏

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| ML-1 | Context泄漏 | 检查静态字段持有Activity/Context引用 | ❌ 致命 |
| ML-2 | 监听器未移除 | 检查onDestroy中是否移除Listener/Observer | ❌ 致命 |
| ML-3 | Handler泄漏 | 检查Handler是否为静态内部类或使用WeakReference | ❌ 致命 |
| ML-4 | 静态集合未清理 | 检查static List/Map是否无限增长 | ❌ 致命 |
| ML-5 | Bitmap未recycle | 检查Bitmap使用后是否调用recycle() | ️ 警告 |
| ML-6 | Cursor未关闭 | 检查数据库Cursor是否在finally中关闭 | ❌ 致命 |
| ML-7 | WebView泄漏 | 检查WebView是否在onDestroy中销毁 | ❌ 致命 |
| ML-8 | 单例持有Activity引用 | 检查单例模式是否持有Activity/View引用 | ❌ 致命 |

**检测模式**:
```kotlin
//  错误示例
class MyActivity : Activity() {
    companion object {
        var instance: MyActivity? = null  // 静态持有Activity
    }
    
    override fun onCreate() {
        instance = this  // 泄漏！
    }
}

// ✅ 正确示例
class MyActivity : Activity() {
    override fun onDestroy() {
        super.onDestroy()
        // 清理所有引用
        listener?.remove()
        handler?.removeCallbacksAndMessages(null)
    }
}
```

### 1.2 iOS/Swift 内存泄漏

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| ML-iOS1 | 强引用循环 | 检查delegate/closure是否使用weak | ❌ 致命 |
| ML-iOS2 | Block循环引用 | 检查Block中是否使用__weak self |  致命 |
| ML-iOS3 | NotificationCenter未移除 | 检查dealloc中是否removeObserver | ❌ 致命 |
| ML-iOS4 | Timer未invalidate | 检查Timer使用后是否invalidate | ❌ 致命 |
| ML-iOS5 | Delegate强引用 | 检查delegate属性是否为weak | ❌ 致命 |

### 1.3 C++/NDK 内存泄漏

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| ML-NDK1 | malloc/free不匹配 | 检查每个malloc是否有对应的free | ❌ 致命 |
| ML-NDK2 | new/delete不匹配 | 检查每个new是否有对应的delete | ❌ 致命 |
| ML-NDK3 | JNI LocalRef泄漏 | 检查LocalRef使用后是否DeleteLocalRef | ❌ 致命 |
| ML-NDK4 | 异常路径未释放 | 检查goto/error路径是否释放资源 | ❌ 致命 |

---

## 2. OOM风险检测 (Out of Memory Risk)

### 2.1 Bitmap OOM

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| OOM-1 | 大图未压缩 | 检查Bitmap加载是否使用inSampleSize |  致命 |
| OOM-2 | 频繁创建Bitmap | 检查循环中是否创建Bitmap | ❌ 致命 |
| OOM-3 | 未使用图片缓存 | 检查是否使用Glide/Picasso/Fresco | ️ 警告 |
| OOM-4 | 内存泄漏的Bitmap | 检查Bitmap是否被静态引用 | ❌ 致命 |

**检测模式**:
```kotlin
// ❌ 错误示例 - 直接加载大图
val bitmap = BitmapFactory.decodeResource(resources, R.drawable.huge_image)

// ✅ 正确示例 - 采样加载
val options = BitmapFactory.Options().apply {
    inSampleSize = calculateInSampleSize(this, reqWidth, reqHeight)
}
val bitmap = BitmapFactory.decodeResource(resources, R.drawable.huge_image, options)
```

### 2.2 集合OOM

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| OOM-5 | List无限增长 | 检查List是否无限制add | ❌ 致命 |
| OOM-6 | 缓存无上限 | 检查LruCache是否设置maxSize | ❌ 致命 |
| OOM-7 | 字符串拼接 | 检查循环中是否使用+拼接字符串 | ⚠️ 警告 |

### 2.3 线程OOM

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| OOM-8 | 线程池无界 | 检查ThreadPoolExecutor是否设置maxPoolSize | ❌ 致命 |
| OOM-9 | 频繁创建线程 | 检查是否使用Thread而非线程池 | ️ 警告 |

---

## 3. 启动速度优化 (Startup Speed)

### 3.1 Application初始化

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| ST-1 | Application.onCreate耗时 | 检查onCreate中是否有耗时操作 |  致命 |
| ST-2 | 同步初始化过多 | 检查是否所有SDK都在主线程初始化 | ❌ 致命 |
| ST-3 | 未使用懒加载 | 检查是否可以延迟初始化的组件 | ️ 警告 |
| ST-4 | ContentProvider阻塞 | 检查自定义ContentProvider的onCreate | ❌ 致命 |

**优化建议**:
```kotlin
//  错误示例 - 所有初始化在Application
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        SDK1.init(this)  // 耗时100ms
        SDK2.init(this)  // 耗时200ms
        SDK3.init(this)  // 耗时150ms
        // 总耗时450ms，严重拖慢启动！
    }
}

// ✅ 正确示例 - 延迟初始化
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // 只初始化必需的SDK
        EssentialSDK.init(this)
        
        // 其他SDK延迟到首页展示后
        lifecycle.addObserver(object : DefaultLifecycleObserver {
            override fun onResume(owner: LifecycleOwner) {
                // 延迟初始化非必需SDK
                thread { OptionalSDK.init(this@MyApplication) }
            }
        })
    }
}
```

### 3.2 首屏加载

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| ST-5 | 首屏同步网络请求 | 检查onCreate中是否有网络请求 | ❌ 致命 |
| ST-6 | 布局层级过深 | 检查XML布局嵌套层级(>5层) | ⚠️ 警告 |
| ST-7 | 首屏加载大图 | 检查首屏是否加载未压缩图片 | ❌ 致命 |
| ST-8 | 未使用异步加载 | 检查数据加载是否在主线程 | ❌ 致命 |

---

## 4. ANR检测 (Application Not Responding)

### 4.1 主线程耗时操作

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| ANR-1 | 主线程网络请求 | 检查是否在主线程执行HTTP请求 | ❌ 致命 |
| ANR-2 | 主线程数据库操作 | 检查是否在主线程执行SQL查询 |  致命 |
| ANR-3 | 主线程文件IO | 检查是否在主线程读写文件 | ❌ 致命 |
| ANR-4 | 主线程复杂计算 | 检查是否在主线程执行耗时计算 | ❌ 致命 |
| ANR-5 | 主线程sleep | 检查是否有Thread.sleep在主线程 | ❌ 致命 |
| ANR-6 | 锁竞争阻塞 | 检查synchronized块是否耗时>5s | ❌ 致命 |

**检测模式**:
```kotlin
// ❌ 错误示例 - 主线程网络请求
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val response = httpClient.execute(request)  // ANR风险！
        updateUI(response)
    }
}

// ✅ 正确示例 - 异步网络请求
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        lifecycleScope.launch {
            val response = withContext(Dispatchers.IO) {
                httpClient.execute(request)
            }
            updateUI(response)
        }
    }
}
```

### 4.2 Broadcast/Service阻塞

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| ANR-7 | BroadcastReceiver耗时 | 检查onReceive中是否有耗时操作 | ❌ 致命 |
| ANR-8 | Service onStartCommand耗时 | 检查Service是否在主线程执行耗时任务 | ❌ 致命 |

---

## 5. 卡顿检测 (UI Lag/Jank)

### 5.1 RecyclerView卡顿

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| LAG-1 | onBindViewHolder耗时 | 检查是否在主线程执行复杂操作 | ❌ 致命 |
| LAG-2 | 未使用ViewHolder复用 | 检查onCreateViewHolder频率 | ❌ 致命 |
| LAG-3 | 嵌套RecyclerView | 检查是否有多层RecyclerView嵌套 | ⚠️ 警告 |
| LAG-4 | 图片未异步加载 | 检查是否在onBind中同步加载图片 | ❌ 致命 |
| LAG-5 | 频繁notifyDataSetChanged | 检查是否使用notifyItemInserted等精确更新 | ⚠️ 警告 |

### 5.2 动画卡顿

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| LAG-6 | 属性动画复杂 | 检查是否同时执行多个属性动画 | ️ 警告 |
| LAG-7 | 未使用硬件加速 | 检查View是否设置setLayerType | 💡 建议 |
| LAG-8 | 过度绘制 | 检查布局是否有过多背景叠加 | ⚠️ 警告 |

### 5.3 绘制卡顿

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| LAG-9 | onDraw耗时 | 检查自定义View的onDraw是否耗时>16ms | ❌ 致命 |
| LAG-10 | invalidate频繁 | 检查是否过度调用invalidate | ️ 警告 |
| LAG-11 | 布局测量耗时 | 检查onMeasure/onLayout是否复杂 | ❌ 致命 |

---

## 6. 代码安全检测 (Security)

### 6.1 敏感数据泄露

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| SEC-1 | 硬编码密钥 | 检查代码中是否有API Key/Secret | ❌ 致命 |
| SEC-2 | 明文存储密码 | 检查SharedPreferences是否明文存密码 | ❌ 致命 |
| SEC-3 | Log泄露敏感信息 | 检查Log中是否打印Token/密码 | ❌ 致命 |
| SEC-4 | WebView明文传参 | 检查WebView URL是否包含敏感参数 | ❌ 致命 |
| SEC-5 | Clipboard敏感数据 | 检查是否复制密码到剪贴板 | ❌ 致命 |

**检测模式**:
```kotlin
//  错误示例 - 硬编码密钥
object Config {
    const val API_KEY = "sk-123456789abcdef"  // 危险！
    const val API_SECRET = "secret_key_here"  // 危险！
}

// ✅ 正确示例 - 从安全位置读取
object Config {
    val API_KEY: String
        get() = BuildConfig.API_KEY  // 从BuildConfig读取
}
```

### 6.2 加密与传输安全

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| SEC-6 | HTTP明文传输 | 检查是否使用HTTPS | ❌ 致命 |
| SEC-7 | 弱加密算法 | 检查是否使用MD5/DES等弱加密 |  致命 |
| SEC-8 | 证书校验跳过 | 检查是否trustAllCertificates | ❌ 致命 |
| SEC-9 | 随机数不安全 | 检查是否使用Random而非SecureRandom | ⚠️ 警告 |

### 6.3 权限安全

| # | 检查项 | 检测方法 | 严重度 |
|---|--------|---------|--------|
| SEC-10 | 过度权限申请 | 检查是否申请不必要的危险权限 | ️ 警告 |
| SEC-11 | 运行时权限未检查 | 检查使用前是否检查权限 | ❌ 致命 |
| SEC-12 | Exported组件未保护 | 检查Activity/Service是否误设exported=true | ❌ 致命 |

---

## 7. 检查执行流程

### 7.1 触发条件

由 `proactive-correction` agent 在以下场景自动调用：

1. **代码修改完成后** - 扫描修改的文件是否存在性能问题
2. **plan_mode每步完成后** - 纠错检查点扫描
3. **用户明确要求** - "检查性能问题" / "性能审查"
4. **定期全量扫描** - proactive-correction维度4扫描

### 7.2 检查流程

```
1. 收集待检查文件列表
   ├─ 从 git diff 获取变更文件
   ├─ 或从 proactive-correction 传入文件列表
   
2. 按优先级逐项检查
   ├─ 第一优先级: ❌ 致命问题 (内存泄漏、ANR、OOM)
   ├─ 第二优先级: ⚠️ 警告问题 (启动速度、卡顿)
   └─ 第三优先级: 💡 建议优化 (代码安全、最佳实践)
   
3. 输出检查报告
   ├─ 按严重度分类
   ├─ 每个问题包含: 位置、原因、修复方案
   └─ 统计问题数量
```

### 7.3 输出格式

```markdown
## 🔍 Performance & Security Check

**检查范围**: [文件列表]
**检查结果**: ✅ 通过 / ⚠️ N 警告 /  N 致命问题

### ❌ 致命问题

**问题 1**: [问题标题]
- **位置**: `file:line`
- **类型**: [内存泄漏/ANR/OOM/安全]
- **原因**: [问题原因说明]
- **当前代码**:
  ```kotlin
  // 问题代码
  ```
- **修复方案**:
  ```kotlin
  // 修复后代码
  ```

### ⚠️ 警告

### 💡 建议优化

### ✅ 通过检查项
```

---

## 8. 平台特定检查

### 8.1 Android 平台

- **StrictMode检测**: 使用StrictMode检测主线程IO和网络
- **LeakCanary集成**: 建议集成LeakCanary自动检测内存泄漏
- **Method Profiling**: 使用Android Profiler分析耗时方法
- **Layout Inspector**: 检查布局层级和过度绘制

### 8.2 iOS 平台

- **Instruments检测**: 使用Leaks/Allocations工具检测内存
- **Time Profiler**: 分析耗时方法调用
- **Main Thread Checker**: 检测主线程违规操作

### 8.3 Flutter 平台

- **DevTools检测**: 使用Flutter DevTools分析性能
- **Widget重建**: 检查不必要的Widget重建
- **Isolate使用**: 检查耗时操作是否使用Isolate

---

## 9. 修复验证

### 9.1 修复后验证

修复性能问题后，必须：

1. **重新扫描**: 运行performance_check验证问题已解决
2. **性能测试**: 使用工具验证性能指标改善
3. **回归检查**: 确认修复未引入新问题

### 9.2 性能指标要求

| 指标 | 要求 | 检测方法 |
|------|------|---------|
| 冷启动时间 | < 2秒 | adb shell am start -W |
| 首屏渲染 | < 1秒 | 手动计时或工具 |
| 内存占用 | < 应用限制 | Android Studio Profiler |
| 帧率 | ≥ 55 FPS | GPU渲染模式分析 |
| ANR率 | < 0.1% | Firebase/友盟统计 |

---

**版本**: v1.0.0  
**最后更新**: 2026-05-31  
**维护者**: ai_scaffold 团队
