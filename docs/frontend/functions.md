# Frontend Functions 前端功能说明

## 目录
- [应用架构](#应用架构)
- [路由系统](#路由系统)
- [页面流程](#页面流程)
- [功能详解](#功能详解)
- [状态管理](#状态管理)

---

## 应用架构

### 技术栈
- **框架**: React 18 + TypeScript
- **路由**: React Router v6
- **构建工具**: Vite
- **状态管理**: React Context + Hooks

### 目录结构
```
frontend/src/
├── main.tsx                          # 应用入口
├── router.tsx                        # 路由配置
├── styles.css                        # 全局样式
└── modules/
    ├── auth/                         # 认证模块
    │   ├── LoginPage.tsx             # 登录页面
    │   ├── SignupPage.tsx            # 注册页面
    │   ├── AuthShell.tsx             # 认证页面外壳
    │   ├── api/authApi.ts            # 认证API
    │   ├── session/                  # 会话管理
    │   │   ├── AuthSessionContext.tsx
    │   │   └── tokenStore.ts
    │   └── components/
    │       └── AuthGuards.tsx        # 路由守卫
    ├── works/                        # 作品模块
    │   ├── WorksPage.tsx             # 作品列表页
    │   ├── WorkDetailPage.tsx        # 作品详情页
    │   ├── api/workApi.ts            # 作品API
    │   ├── hooks/                    # 自定义Hooks
    │   │   ├── useWorksList.ts
    │   │   └── useWorkDetail.ts
    │   └── components/
    │       ├── WorksListPanel.tsx
    │       └── WorkDetailPanel.tsx
    ├── navigation/
    │   └── TestRouteSwitches.tsx     # 测试导航组件
    ├── why/
    │   └── WhyPage.tsx               # Why页面（待开发）
    └── about/
        └── AboutPage.tsx             # About页面（待开发）
```

---

## 路由系统

### 路由表

| 路径 | 组件 | 守卫 | 说明 |
|------|------|------|------|
| `/auth` | - | - | 自动重定向到 `/auth/login` |
| `/auth/login` | `LoginPage` | `PublicOnlyRoute` | 登录页，已登录用户访问会重定向到 `/works` |
| `/auth/signup` | `SignupPage` | `PublicOnlyRoute` | 注册页，已登录用户访问会重定向到 `/works` |
| `/works` | `WorksPage` | `ProtectedRoute` | 作品列表页，需要登录 |
| `/works/:workId` | `WorkDetailPage` | `ProtectedRoute` | 作品详情页，需要登录 |
| `/why` | `WhyPage` | - | Why页面（公开访问） |
| `/about` | `AboutPage` | - | About页面（公开访问） |
| `*` | - | - | 其他所有路径重定向到 `/auth/login` |

### 路由守卫

#### ProtectedRoute（受保护路由）
- **作用**: 保护需要登录才能访问的页面
- **逻辑**:
  - 检查用户是否已认证（`isAuthenticated`）
  - 如果未认证，重定向到 `/auth/login?return=<当前路径>` （保存返回地址）
  - 如果已认证，渲染子路由组件

#### PublicOnlyRoute（仅公开路由）
- **作用**: 防止已登录用户访问登录/注册页
- **逻辑**:
  - 检查用户是否已认证
  - 如果已认证，重定向到 `/works`
  - 如果未认证，渲染子路由组件

---

## 页面流程

### 1. 首次访问流程

```
用户访问网站
    ↓
访问根路径 (/)
    ↓
重定向到 /auth/login
    ↓
显示登录页面
```

### 2. 登录流程

```
登录页面 (/auth/login)
    ↓
用户输入: Email/Username + Password
    ↓
点击 "Sign In" 按钮
    ↓
调用 POST /api/auth/login
    ↓
成功: 保存token和用户信息 → 重定向到 /works（或return参数指定的页面）
失败: 显示错误信息
```

**登录页面功能**:
- 输入框：
  - Email或Username（必填，type=text）
  - Password（必填，type=password）
- 按钮：
  - "Sign In"：提交登录表单
    - 加载中显示 "Signing In..."
    - 禁用状态：loading=true时
- 链接：
  - "Create account"：跳转到 `/auth/signup`
- 错误显示：登录失败时显示错误信息

### 3. 注册流程

```
注册页面 (/auth/signup)
    ↓
用户输入: Email + Username + Password
    ↓
点击 "Create Account" 按钮
    ↓
调用 POST /api/auth/signup
    ↓
成功: 保存token和用户信息 → 重定向到 /works
失败: 显示错误信息
```

**注册页面功能**:
- 输入框：
  - Email（必填，type=email）
  - Username（必填，type=text）
  - Password（必填，type=password）
- 按钮：
  - "Create Account"：提交注册表单
    - 加载中显示 "Creating..."
    - 禁用状态：loading=true时
- 链接：
  - "Sign in"：跳转到 `/auth/login`
- 错误显示：注册失败时显示错误信息

### 4. 作品列表页面流程

```
登录成功 → /works
    ↓
自动加载作品列表 (GET /api/work/list)
    ↓
显示用户的所有作品
```

**Works页面功能** (`/works`):

**页面头部**:
- 标题：Works
- 说明：Manage your works and open one to continue editing.
- 用户信息显示：Signed in as **[username/email]**
- 按钮：
  - "Sign Out"：登出
    - 点击后清除会话，重定向到 `/auth/login`

**作品列表面板**:
- 标题：Your Works
- 按钮：
  - "New Work"：创建新作品
    - 调用 POST /api/work/create
    - 成功后自动跳转到新作品详情页 `/works/[新workId]`
- 作品列表：
  - 每个作品显示：
    - 标题：Untitled Work（链接，点击跳转到 `/works/[workId]`）
    - 更新时间：格式化的日期时间
    - 按钮：
      - "Delete"：删除该作品
        - 调用 DELETE /api/work/[workId]
        - 成功后自动刷新列表
- 状态显示：
  - Loading: "Loading works..."
  - Empty: "No works yet."
  - Error: 显示错误信息

**导航组件** (TestRouteSwitches):
- "Works" 按钮：跳转到 `/works`
- "Why" 按钮：跳转到 `/why`
- "About" 按钮：跳转到 `/about`

### 5. 作品详情页面流程

```
点击作品 → /works/:workId
    ↓
并发加载三个数据：
1. 作品详情 (GET /api/work/:workId)
2. 所有版本列表 (GET /api/work/:workId/versions?type=all)
3. 已提交版本列表 (GET /api/work/:workId/versions?type=submitted)
    ↓
显示编辑器和版本历史
```

**Work Detail页面功能** (`/works/:workId`):

#### 页面头部
- 标题：Work Detail
- 说明：Read, save, submit, inspect versions, and revert.
- 当前Work ID显示

#### 编辑器区域

**内容编辑器**:
- Label: "Content"
- 大文本框（textarea，10行）
- 功能：
  - 实时编辑作品内容
  - 自动保存（3秒延迟）
  - 本地草稿缓存（防止数据丢失）
- 只读模式：当作品被其他设备锁定时

**保存按钮**:
1. "Auto Save"：手动触发自动保存
   - 调用 POST /api/work/:workId/update (auto_save=true)
   - 不创建新版本
   - 禁用条件：无workId、正在保存、锁定状态

2. "Save Draft Version"：保存草稿版本
   - 调用 POST /api/work/:workId/update (auto_save=false)
   - 创建新的draft版本
   - 禁用条件：无workId、正在保存、锁定状态
   - 成功后显示新版本号

#### 当前提交审阅队列

显示最新已提交版本的AI分析结果：

**首次提交前**:
- 显示："No prior submitted analysis. First submit can proceed directly."

**有分析结果后**:
- 显示未处理的评论数量
- 句子评论列表（Sentence Comments）：
  - 每条评论显示：
    - 标题（title）
    - 描述（description）
    - 建议（suggestion）
  - 操作按钮：
    - "Mark Resolved" / "Resolved ✓"：标记为已解决
      - 点击后标记状态切换
      - 已标记时显示勾号
    - "Reject" / "Rejected ✓"：拒绝建议
      - 点击后标记状态切换
      - 已标记时显示勾号
  - 用户备注输入框：
    - 仅在标记为"resolved"时启用
    - 占位符："Optional note when resolved"
    - 可输入处理该建议的说明

#### 提交区域

**表单字段**:
- Label: "FAO Reflection"
- 文本框（textarea，3行）
- 占位符："optional reflection"
- 用于输入对本次提交的反思

**提交按钮**:
- "Submit + Fetch Analysis"：提交并获取AI分析
- 功能：
  - 先检查是否所有句子评论都已处理（标记为resolved或rejected）
  - 如果有未处理的评论，阻止提交并显示错误
  - 调用 POST /api/work/:workId/submit
  - 提交内容：当前content + fao_reflection + suggestion_actions
  - 自动获取新版本的AI分析
  - 成功后：
    - 清空suggestionMarkings
    - 清空faoReflectionDraft
    - 显示新分析结果
- 禁用条件：无workId、正在提交、锁定状态

#### 版本历史区域

**版本列表显示**:
- 标题：Versions
- 默认显示最新50个版本
- 如果有更多版本：
  - 显示提示：`Showing latest X versions. Y older versions hidden.`
  - 按钮："Load Older Versions"
    - 点击加载更多50个版本
- 每个版本显示：
  - 版本号：v{number}
  - 变更类型：draft / submitted
  - 操作按钮：
    - "Open"：查看版本详情
      - 调用 GET /api/work/:workId/versions/{versionNumber}
      - 在页面下方显示版本详细信息
    - "Revert"：恢复到该版本
      - 点击后弹出确认对话框
      - 禁用条件：正在恢复、锁定状态

**版本详情显示**（选中版本后）:
- 版本号：v{number}
- 变更类型
- 内容预览（前300字符）
- AI分析（如果有）：
  - FAO Comment
  - Reflection Comment（如果有）
  - 句子评论列表（显示数量）
    - 每条评论：标题、描述、建议、改进反馈（如果有）

**恢复确认对话框**:
触发条件：点击某个版本的"Revert"按钮

显示内容：
- 标题：Revert to Version {number}?
- 说明：
  - "This will create a new draft using content from version {number}."
  - "Your current unsaved changes may be lost."
  - "You can undo this by reverting back to version {current}."
- 操作按钮：
  1. "Cancel"：取消恢复
  2. "Save Current First"：先保存当前内容，再恢复
     - 先调用保存草稿
     - 再调用 POST /api/work/:workId/revert
  3. "Revert Anyway"：直接恢复（不保存当前内容）
     - 调用 POST /api/work/:workId/revert
     - 创建新的draft版本，内容为指定版本的内容

#### 状态显示

**加载状态**:
- "Loading work detail..."

**锁定状态横幅**:
- "Locked by another device. Read-only mode active. Retrying refresh in {N}s."
- 每秒倒计时
- 5秒后自动尝试重新加载

**错误提示**:
- 显示API错误信息
- 颜色：红色

**信息提示**:
- 显示操作成功信息
- 例如：
  - "Auto-saved successfully"
  - "Saved with new version {N}"
  - "Submitted version {N} and loaded analysis"
  - "Loaded version {N}"
  - "Reverted successfully. New draft version {N}"
  - "Recovered an unsynced local draft."
  - "Server state refreshed, local unsaved text preserved."

**导航组件**:
- 同作品列表页的TestRouteSwitches

---

## 功能详解

### 认证系统

#### AuthSessionContext（认证会话上下文）

**提供的状态和方法**:
```typescript
{
  user: AuthUser | null;              // 当前用户信息
  token: string | null;               // 认证token
  isAuthenticated: boolean;           // 是否已认证
  login: (emailOrUsername, password) => Promise<void>;
  signup: (email, username, password) => Promise<void>;
  logout: () => void;
}
```

**存储机制**:
- 使用localStorage存储token和user信息
- Key: `afterword_auth_token`, `afterword_auth_user`
- 自动监听会话过期事件（AUTH_SESSION_EXPIRED_EVENT）

#### 认证API

**登录**: `POST /api/auth/login`
- 请求体：`{ email_or_username, password }`
- 响应：`{ token, user }`

**注册**: `POST /api/auth/signup`
- 请求体：`{ email, username, password }`
- 响应：`{ token, user }`

### 作品管理系统

#### useWorksList Hook

**状态**:
```typescript
{
  items: WorkSummary[];    // 作品列表
  loading: boolean;         // 是否加载中
  error: string | null;     // 错误信息
}
```

**方法**:
- `reload()`: 重新加载作品列表
- `runCreate()`: 创建新作品，返回workId
- `runDelete(workId)`: 删除指定作品

#### useWorkDetail Hook

**核心状态**:
```typescript
{
  work: WorkDetail | null;                  // 作品详情
  content: string;                          // 当前编辑内容
  faoReflectionDraft: string;              // 提交反思草稿
  allVersions: WorkVersionSummary[];       // 所有版本
  versions: WorkVersionSummary[];          // 显示的版本（分页）
  hiddenVersionCount: number;              // 隐藏的版本数
  selectedVersion: WorkVersionDetail | null;  // 选中的版本详情
  baselineSubmittedVersion: WorkVersionDetail | null; // 最新提交版本
  suggestionMarkings: Record<string, {     // 建议标记状态
    action: 'resolved' | 'rejected';
    userNote?: string;
  }>;
  loading: boolean;
  saving: boolean;
  submitting: boolean;
  reverting: boolean;
  locked: boolean;                         // 是否被其他设备锁定
  lockRetryInSec: number;                 // 锁定重试倒计时
  error: string | null;
  info: string | null;
}
```

**核心功能**:

1. **自动保存机制**:
   - 监听content变化
   - 3秒延迟后自动触发保存
   - 使用防抖处理连续编辑
   - 保存时不创建新版本

2. **本地草稿缓存**:
   - 使用localStorage缓存未保存的内容
   - Key: `afterword_draft_{workId}`
   - 在服务器状态刷新时保留本地未保存内容
   - 保存成功后清除缓存

3. **设备锁机制**:
   - 同一作品同时只能被一个设备编辑
   - 被锁定时进入只读模式
   - 每5秒自动尝试重新获取锁

4. **版本管理**:
   - 支持分页加载（每页50个）
   - 可查看任意版本的详情和分析
   - 可恢复到任意历史版本

5. **建议处理流程**:
   - 查看最新提交版本的sentence comments
   - 逐条标记为resolved或rejected
   - 可为resolved的建议添加用户备注
   - 下次提交时必须处理所有未处理的建议

**方法**:
- `setContent(value)`: 更新编辑内容
- `setFaoReflectionDraft(value)`: 更新反思草稿
- `save(autoSave)`: 保存作品
  - `autoSave=true`: 不创建新版本
  - `autoSave=false`: 创建新draft版本
- `submit()`: 提交并获取AI分析
- `openVersion(versionNumber)`: 查看版本详情
- `revert(versionNumber)`: 恢复到指定版本
- `loadMoreVersions()`: 加载更多历史版本
- `markSuggestionAction(commentId, action)`: 标记建议处理状态
- `setSuggestionNote(commentId, note)`: 设置建议处理备注

#### 作品API

**核心接口**:
- `POST /api/work/create`: 创建作品
- `GET /api/work/list`: 获取作品列表
- `GET /api/work/:workId`: 获取作品详情
- `POST /api/work/:workId/update`: 更新作品内容
- `POST /api/work/:workId/submit`: 提交并获取分析
- `DELETE /api/work/:workId`: 删除作品
- `GET /api/work/:workId/versions`: 获取版本列表
  - 查询参数：`type=all|submitted|draft`, `parent={number}`
- `GET /api/work/:workId/versions/:versionNumber`: 获取版本详情
- `POST /api/work/:workId/revert`: 恢复到指定版本

**请求头**:
- `Authorization: Bearer {token}`: 所有受保护接口需要
- `Content-Type: application/json`
- `If-None-Match: {etag}`: GET请求支持ETag缓存

**错误处理**:
- 401: 会话过期，触发重新登录
- 404: 作品不存在
- 423: 作品被锁定
- 429: 请求频率过高
- validation_failed: 验证失败
- suggestions_not_processed: 有未处理的建议
- llm_failed: AI分析失败

---

## 状态管理

### 全局状态

**AuthSessionContext（认证状态）**:
- 作用域：整个应用
- 提供：用户信息、token、认证方法
- 持久化：localStorage

### 页面级状态

**WorksPage（作品列表状态）**:
- useWorksList hook管理
- 自动加载和刷新

**WorkDetailPage（作品详情状态）**:
- useWorkDetail hook管理
- 复杂的多状态协调：
  - 编辑状态
  - 保存状态
  - 提交状态
  - 版本管理状态
  - 锁定状态
  - 建议处理状态

### 本地缓存

**认证信息**:
- `afterword_auth_token`: JWT token
- `afterword_auth_user`: 用户信息JSON

**草稿缓存**:
- `afterword_draft_{workId}`: 未保存的内容
- 格式：`{ content: string, timestamp: number }`

**API缓存**:
- 使用Map在内存中缓存GET请求
- 支持ETag验证
- 写操作后自动invalidate相关缓存

---

## 用户交互流程总结

### 典型工作流程

1. **开始使用**:
   ```
   访问网站 → 注册账号 → 自动登录 → 进入作品列表
   ```

2. **创建和编辑作品**:
   ```
   点击"New Work" → 跳转到详情页 → 编辑内容 → 自动保存
   ```

3. **保存草稿版本**:
   ```
   编辑内容 → 点击"Save Draft Version" → 创建新版本 → 继续编辑
   ```

4. **首次提交**:
   ```
   编辑完成 → (可选)填写FAO Reflection → 点击"Submit + Fetch Analysis"
   → 等待分析 → 查看AI反馈
   ```

5. **处理反馈并再次提交**:
   ```
   查看sentence comments → 逐条标记resolved/rejected → 添加备注
   → 修改内容 → 填写reflection → 提交 → 获取新分析
   ```

6. **版本管理**:
   ```
   点击"Open"查看历史版本 → 查看该版本的分析
   → (如需要)点击"Revert"恢复到该版本
   ```

7. **多设备协作**:
   ```
   设备A编辑 → 设备B尝试编辑 → 被锁定提示
   → 进入只读模式 → 等待或在设备A完成
   ```

### 按钮快速参考

| 按钮/链接 | 位置 | 功能 | 跳转/结果 |
|-----------|------|------|-----------|
| Sign In | 登录页 | 提交登录 | 成功→/works |
| Create account | 登录页 | 链接 | 跳转→/auth/signup |
| Create Account | 注册页 | 提交注册 | 成功→/works |
| Sign in | 注册页 | 链接 | 跳转→/auth/login |
| Sign Out | Works页 | 登出 | 跳转→/auth/login |
| New Work | Works页 | 创建作品 | 跳转→/works/[newId] |
| Delete | Works页列表项 | 删除作品 | 刷新列表 |
| Untitled Work | Works页列表项 | 链接 | 跳转→/works/[workId] |
| Auto Save | 详情页 | 手动自动保存 | 保存当前内容 |
| Save Draft Version | 详情页 | 保存草稿版本 | 创建新版本 |
| Mark Resolved | 详情页评论 | 标记已解决 | 状态切换 |
| Reject | 详情页评论 | 拒绝建议 | 状态切换 |
| Submit + Fetch Analysis | 详情页 | 提交获取分析 | 创建提交版本+获取AI分析 |
| Open | 版本列表项 | 查看版本 | 显示版本详情 |
| Revert | 版本列表项 | 恢复版本 | 弹出确认对话框 |
| Load Older Versions | 版本历史 | 加载更多 | 显示更多版本 |
| Cancel | 恢复确认 | 取消恢复 | 关闭对话框 |
| Save Current First | 恢复确认 | 先保存再恢复 | 保存→恢复→新版本 |
| Revert Anyway | 恢复确认 | 直接恢复 | 恢复→新版本 |
| Works | 导航 | 链接 | 跳转→/works |
| Why | 导航 | 链接 | 跳转→/why |
| About | 导航 | 链接 | 跳转→/about |

---

## 特殊场景处理

### 会话过期
- 触发：API返回401
- 处理：
  1. 清除本地认证信息
  2. 触发AUTH_SESSION_EXPIRED_EVENT
  3. AuthSessionContext更新状态
  4. 路由守卫自动重定向到登录页

### 设备锁定冲突
- 触发：API返回423（locked）
- 处理：
  1. 进入只读模式
  2. 显示锁定横幅
  3. 每5秒自动尝试重新获取
  4. 获取成功后自动解除锁定

### 本地草稿恢复
- 场景：页面刷新或异常关闭
- 处理：
  1. 检查localStorage中的草稿缓存
  2. 如果有且与服务器内容不同
  3. 自动恢复本地内容
  4. 显示提示："Recovered an unsynced local draft."

### 未处理建议阻止提交
- 场景：有未处理的sentence comments时提交
- 处理：
  1. 前端先检查所有comment是否已标记
  2. 如果有未标记的，显示错误
  3. 不发送提交请求
  4. 后端也会进行同样的检查（双重保障）

---

## 技术特性

### 性能优化

1. **API缓存**:
   - GET请求使用内存缓存
   - 支持ETag条件请求
   - 写操作后智能invalidate

2. **自动保存防抖**:
   - 3秒延迟
   - 避免频繁API调用
   - 队列处理连续变更

3. **版本分页加载**:
   - 默认50条
   - 按需加载更多
   - 减少初始加载时间

### 用户体验

1. **加载状态反馈**:
   - 所有异步操作都有loading状态
   - 按钮显示加载文本
   - 页面显示加载提示

2. **错误处理**:
   - 友好的错误信息
   - 区分不同错误类型
   - 自动重试机制（锁定场景）

3. **数据持久化**:
   - 认证信息localStorage持久化
   - 草稿内容实时缓存
   - 防止意外数据丢失

4. **返回地址保留**:
   - 未登录访问受保护页面
   - 登录后自动返回原页面
   - 使用`?return=`参数实现

---

## API通信规范

### 请求格式

**通用请求头**:
```
Content-Type: application/json
Authorization: Bearer {token}
```

**基础URL**:
- 环境变量：`VITE_API_BASE_URL`
- 生产域名：`https://api.after-word.org`（当hostname包含after-word.org时）
- 开发默认：空字符串（相对路径）

### 响应格式

**成功响应**:
```json
{
  "ok": true,
  ...其他数据字段
}
```

**错误响应**:
```json
{
  "code": "error_code",
  "message": "Human readable error message"
}
```

### 错误码

| Code | HTTP Status | 说明 | 前端处理 |
|------|-------------|------|----------|
| unauthorized | 401 | 未认证或会话过期 | 清除会话，跳转登录 |
| not_found | 404 | 资源不存在 | 显示错误信息 |
| locked | 423 | 资源被锁定 | 进入只读模式，自动重试 |
| validation_failed | 400 | 验证失败 | 显示错误信息 |
| suggestions_not_processed | 400 | 有未处理的建议 | 显示未处理数量，阻止提交 |
| llm_failed | 500 | AI分析失败 | 提示稍后重试 |
| rate_limit_exceeded | 429 | 请求过于频繁 | 提示等待后重试 |

---

## 未来扩展点

### 待实现页面
- `/why` - 产品介绍页
- `/about` - 关于页面

### 可能的功能增强
- 作品标题编辑
- 作品标签/分类
- 搜索和过滤
- 分享功能
- 协作编辑
- 评论功能
- 富文本编辑器
- 导出功能（PDF, DOCX等）
- 暗色主题

---

## 开发调试

### 环境变量
```
VITE_API_BASE_URL=http://localhost:8000  # 本地后端API地址
```

### 本地开发
```bash
cd frontend
npm install
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 调试技巧
1. 查看localStorage: 检查认证token和草稿缓存
2. 网络面板: 查看API请求和响应
3. React DevTools: 查看组件状态和props
4. Console: 查看错误日志和调试信息

---

文档版本: 1.0
最后更新: 2025-02-12
