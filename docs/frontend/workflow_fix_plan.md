# Workflow Fix Plan

## P0: 必须先修

### 1) 初始加载 race condition
- 方案: 首屏并行请求 `work` 与 `latest submitted version`，若 submitted 为空则跳过 analysis 请求并渲染空评论态。
- 实现: `Promise.all([getWork(), getSubmittedVersions({limit:1})])`，仅在存在 `version_number` 时调用 `getVersionDetail`。
- 验收: 首次未提交 work 打开不报错且右侧显示 `No analysis yet`。

### 2) Auto-save 并发冲突
- 方案: 保存请求串行队列 + 只保留最后一次待发送内容。
- 实现: 单 work 维护 `saveQueue` 与 `inFlight`，新输入只覆盖 `latestDraftContent`。
- 验收: 快速输入 30 秒后，服务端内容与编辑器最后文本一致。

### 3) Submit 失败状态回滚
- 方案: submit 成功前禁止清空本地 `userMarkings` 和 `faoReflectionDraft`。
- 实现: `onSubmitSuccess` 才执行清理，失败时保留状态并提示重试。
- 验收: 人为断网提交失败后，全部标记和反思文本仍在。

### 4) Draft 历史无限增长
- 方案: slider 默认只拉最近 N 条（建议 50），其余按分页加载。
- 实现: `GET /versions?type=draft&parent=x&limit=50&cursor=...`（后端未支持时前端先本地截断并提示）。
- 验收: 1000+ drafts 时页面可在 1 秒内可交互。

### 5) 句子高亮 index 失效
- 方案: 高亮仅绑定“生成该 analysis 的只读快照文本”，编辑态不强绑定旧 index。
- 实现: 编辑态展示 comment 列表 + 定位按钮降级为“近似查找 original_text”。
- 验收: 文本被改动后不出现明显错误高亮或错位点击。

## P1: 重要修复

### 6) Analysis 状态模型重构
- 方案: 用 `analysesByVersion` 缓存多版本分析，分离当前版本与展示版本。
- 实现: `currentVersionNumber` 与 `displayedVersionNumber` 双指针。
- 验收: 查看历史版本后返回编辑页仍显示最新 analysis。

### 7) sentence comments 与用户标记分离
- 方案: 后端原始 `sentence_comments` 只读，用户动作单独存 `userMarkingsByCommentId`。
- 实现: submit 时再合并生成 `suggestion_actions`。
- 验收: 刷新或切页后原始评论结构保持不变。

### 8) is_dirty 精细化
- 方案: 增加 `last_saved_at`、`last_edited_at`、`pending_save`、`save_error`。
- 实现: 每次输入更新 `last_edited_at`，保存状态驱动顶部提示条。
- 验收: 用户始终能看到“已保存/保存中/保存失败”。

### 9) localStorage 限制与清理
- 方案: 仅缓存最近 K 个 works 草稿（建议 10），每条带 `expires_at`（7天）。
- 实现: 启动时执行 `cleanupDraftCache()`，超限按 LRU 删除。
- 验收: localStorage 占用稳定且不会无限增长。

### 10) 锁机制 UX
- 方案: 锁定时展示占用信息与倒计时，并缩短轮询到 5 秒。
- 实现: 先实现等待重试按钮，`Force Unlock` 待后端支持后开启。
- 验收: 锁释放后 5 秒内可恢复编辑。

### 11) 回滚确认增强
- 方案: 回滚弹窗必须明确提示“会创建新 draft、可能覆盖未保存更改”。
- 实现: 提供三个动作 `Cancel / Save Current First / Revert Anyway`。
- 验收: 用户触发回滚前可清楚理解后果。

### 12) 会话策略
- 方案: 使用 httpOnly cookie，会话状态只保留本地 user 缓存与 401 恢复流程。
- 实现: API 层统一携带 `credentials: include`，拦截 401 后清会话并保留本地草稿再跳登录。
- 验收: 会话过期时不会导致编辑内容直接丢失。

## P2: 体验优化

### 13) 缓存失效策略
- 方案: submit/create/revert/delete 成功后事件驱动失效 works 与 versions 缓存。
- 实现: query key 失效表固定化，避免跨页旧数据。
- 验收: 多 tab 操作后刷新或回焦可看到最新数据。

### 14) optimistic update 可靠性
- 方案: 评论标记使用 `pending/synced/failed` 三态，不再“盲乐观”。
- 实现: submit 前强制校验所有标记状态为 `synced` 或本地可提交态。
- 验收: 不会出现 UI 看似完成但后端拒绝的错觉。

### 15) 移动端保存策略
- 方案: 移动端 debounce 提升到 10-15 秒，并跳过输入法 composing 期间保存。
- 实现: 监听 `compositionstart/end` 与 `visibilitychange` 触发兜底保存。
- 验收: 中文输入不中断且弱网下编辑体验可用。

## API 对齐补充
- submit 后必须二次请求版本详情拿 analysis。
- `suggestion_actions` 字段固定为 `action` 与 `user_note`。
- update 请求必须显式传 `auto_save`。
- works 无 title 时前端统一回退 `Untitled Work`。
