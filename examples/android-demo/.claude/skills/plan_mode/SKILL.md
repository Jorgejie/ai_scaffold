---
name: plan_mode
description: 复杂开发任务的结构化拆分技能。当任务涉及多模块协作、多步骤操作时，在执行前先输出分步计划。
---

# Plan Mode — 任务结构化拆分

> **触发条件**（满足任一即加载）：
> 1. 涉及 2 个及以上模块的协作
> 2. 需要修改 3 个及以上文件
> 3. 涉及路由注册、资源同步等多步流程
> 4. 用户明确要求"先规划/plan/拆分任务"
>
> **跳过条件**：单文件简单修改、用户说"直接改"、纯问答。

---

## 1 计划输出格式

```
## 执行计划

**任务**：[一句话描述]
**涉及模块**：[模块列表]
**预计修改文件数**：[N]
**需加载规则/技能**：[列出]

### 步骤拆分

| # | 操作 | 目标文件/位置 | 依赖 | 检查点 |
|---|------|-------------|------|--------|
| 1 | ... | ... | 无 | ... |

### 风险点

### 完成标准
```

---

## 2 高频任务模板

### 2.1 新增页面

```
## 执行计划

**任务**：新增 {功能} 页面
**涉及模块**：feature-{模块}
**预计修改文件数**：4-6
**需加载规则/技能**：project_rule + code_review

### 步骤拆分

| # | 操作 | 目标文件/位置 | 依赖 | 检查点 |
|---|------|-------------|------|--------|
| 1 | 创建 Fragment + ViewModel | `feature-{module}/src/.../{Name}Fragment.kt` | 无 | 继承 BaseFragment |
| 2 | 创建布局文件 | `res/layout/activity_shop_{name}.xml` | 无 | shop_ 前缀 |
| 3 | 添加 ARouter 注解 | `@Route(path = "/{module}/{page}")` | 步骤1 | 路径格式正确 |
| 4 | 注册到模块 navigation | `nav_graph_{module}.xml` | 步骤1+3 | 可导航到达 |
| 5 | 如需列表，创建 Adapter | `res/layout/item_shop_{name}.xml` + Adapter 类 | 无 | 使用 ListAdapter + DiffUtil |

### 风险点
- ARouter 路径未注册导致跳转失败
- 布局文件未加 shop_ 前缀导致资源冲突
- Fragment 中 LiveData 观察未使用 viewLifecycleOwner

### 完成标准
- 页面可正常跳转和展示
- 布局遵循命名规范（shop_ 前缀）
- 代码通过 code_review 审查
```

### 2.2 新增模块

```
## 执行计划

**任务**：新增 feature-{name} 模块
**涉及模块**：app + feature-{name} + common-*
**预计修改文件数**：8-12
**需加载规则/技能**：project_rule + code_review + arch-review

### 步骤拆分

| # | 操作 | 目标文件/位置 | 依赖 | 检查点 |
|---|------|-------------|------|--------|
| 1 | 创建模块目录和 build.gradle.kts | `feature-{name}/build.gradle.kts` | 无 | 依赖方向正确 |
| 2 | 在 settings.gradle.kts 中注册模块 | `settings.gradle.kts` | 无 | include 正确 |
| 3 | 在 app/build.gradle.kts 中添加依赖 | `app/build.gradle.kts` | 步骤2 | implementation project |
| 4 | 创建模块入口 Activity/Fragment | `feature-{name}/src/...` | 步骤1 | 继承 Base 类 |
| 5 | 添加 ARouter 路由注解 | 入口文件 | 步骤4 | @Route 注解 |
| 6 | 创建模块 AndroidManifest.xml | `feature-{name}/src/main/AndroidManifest.xml` | 步骤1 | 声明 Activity |

### 风险点
- 模块依赖方向违规（common 依赖 feature）
- settings.gradle 未注册导致编译失败
- AndroidManifest 未声明 Activity 导致无法启动

### 完成标准
- 模块可独立编译
- app 模块可正常跳转到新模块
- arch-review 审查通过
```

### 2.3 新增 API 接口

```
## 执行计划

**任务**：新增 {功能} API 接口
**涉及模块**：common-network + feature-{module}
**预计修改文件数**：3-4
**需加载规则/技能**：project_rule + code_review

### 步骤拆分

| # | 操作 | 目标文件/位置 | 依赖 | 检查点 |
|---|------|-------------|------|--------|
| 1 | 在 ApiService 中添加接口方法 | `common-network/.../{Module}ApiService.kt` | 无 | suspend 函数 |
| 2 | 在 common-data 中创建请求/响应数据类 | `common-data/.../dto/{Name}Dto.kt` | 无 | data class |
| 3 | 在 Repository 中封装调用 | `feature-{module}/.../{Name}Repository.kt` | 步骤1+2 | 统一 ApiResponse 封装 |
| 4 | 在 ViewModel 中调用 Repository | `feature-{module}/.../{Name}ViewModel.kt` | 步骤3 | viewModelScope |

### 风险点
- 网络请求未在协程中执行
- ApiResponse 未统一错误处理
- Repository 直接依赖 ApiService 而非通过依赖注入

### 完成标准
- API 调用正常返回数据
- 错误场景有统一处理
- 代码通过 code_review 审查
```

---

## 3 执行原则

1. **先输出计划，等用户确认后再执行**（除非用户说"直接做"）
2. **步骤间有依赖时严格顺序执行**，无依赖时可并行
3. **每步完成后对照检查点**，不通过则停下说明
4. **每步完成后触发纠错检查点** — 委派 `proactive-correction` agent 对已修改文件执行维度 2（代码合规性）扫描，发现致命违规时立即暂停并修正
5. **遇到灰色地带时暂停并询问**
6. **计划可迭代**：执行中发现新情况可更新计划并告知用户
7. **纠错闭环**：所有步骤完成后，最终触发 `proactive-correction` 对全量变更执行维度 2+维度 3 扫描，确保无遗留问题

---

## 4 与其他规则/技能的协作

| 任务场景 | 需叠加加载 |
|---------|-----------|
| 新增页面 | `project_rule` + `proactive-correction` |
| 新增模块 | `project_rule` + `arch-review` + `proactive-correction` |
| 新增 API | `project_rule` + `proactive-correction` |
| 跨模块通信 | `project_rule`（重点关注依赖方向） + `proactive-correction` |
| 代码生成后 | 自动触发 `code_review`（含前置纠错检查） |

**纠错检查点说明**：plan_mode 的每个步骤执行完成后，检查点处增加一项**主动纠错检查**——委派 `proactive-correction` agent 执行维度 2 扫描已修改文件，确保每步产出都符合项目规则。
