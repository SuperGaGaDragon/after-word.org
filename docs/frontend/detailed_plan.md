# Frontend Detailed Plan

## Phase 1: 基础架构
1.1 使用 Vite + React + TypeScript 作为前端基础。
1.2 保持 `src/modules` 的 vertical slice 目录结构。
1.3 在 `src/router.tsx` 固定声明 auth/works/why/about 路由。

验收:
1. `/auth/login`、`/auth/signup`、`/works`、`/works/:workId`、`/why`、`/about` 都可访问。
2. 页面间跳转可用且无白屏。
3. `npm run build` 成功产出 `dist`。

## Phase 2: API契约对齐
2.1 统一规定前端 API 请求体使用后端 snake_case 字段。
2.2 `update` 请求统一显式传 `auto_save`，禁止依赖默认值。
2.3 submit 后统一执行“submit + 版本详情二次请求”流程。

验收:
1. `update` 请求体固定为 `{content, device_id, auto_save: true|false}`。
2. `submit` 请求体包含 `content`、`device_id`、`fao_reflection` 和 `suggestion_actions[action,user_note]`。
3. 每次 submit 成功后必定发起 `GET /api/work/{work_id}/versions/{version}` 获取 analysis。
4. Network 面板中不出现 `userAction`、`userNote` 等前端字段名。

当前状态:
1. `update` 请求体固定为 `{content, device_id, auto_save: true|false}`。✅
2. `submit` 请求体包含 `content`、`device_id`、`fao_reflection` 和 `suggestion_actions[action,user_note]`。✅
3. 每次 submit 成功后必定发起 `GET /api/work/{work_id}/versions/{version}` 获取 analysis。✅
4. Network 面板中不出现 `userAction`、`userNote` 等前端字段名。✅

## Phase 3: Works 列表与详情
3.1 在 `/works` 页面接入 list/create/delete 三个 work 接口。
3.2 works 列表无 title 时统一显示 `Untitled Work`。
3.3 在 `/works/:workId` 接入读取、更新、提交和版本接口。

验收:
1. 能创建、进入和删除 work。
2. 刷新详情页后能恢复当前内容和版本信息。
3. 编辑后自动保存与提交流程都可用。

当前状态:
1. 能创建、进入和删除 work。✅
2. 刷新详情页后能恢复当前内容和版本信息。✅
3. 编辑后自动保存与提交流程都可用。✅

## Phase 4: 错误与状态
4.1 对 `unauthorized`、`not_found`、`locked`、`validation_failed`、`llm_failed` 做明确 UI 映射。
4.2 对 `429` 与 `suggestions_not_processed` 先做通用错误兜底并保留扩展位。
4.3 锁冲突时显示不可编辑状态并定时重试刷新数据。

验收:
1. 常见错误都能在页面被稳定展示。
2. 锁冲突不会导致页面崩溃或数据丢失。
3. 提交校验失败时用户知道缺少哪些步骤。

当前状态:
1. 常见错误都能在页面被稳定展示。✅
2. 锁冲突不会导致页面崩溃或数据丢失。✅
3. 提交校验失败时用户知道缺少哪些步骤。✅

## Phase 5: 评论流与版本流
5.1 用户必须先处理所有 sentence comments 才允许下一次 submit。
5.2 用户可选提交 FAO reflection 并在后续版本展示 reflection comment。
5.3 版本列表与回滚统一走 versions/revert 接口并按版本号回显。

验收:
1. submit 后能显示新的 FAO、sentence、reflection（有条件）评论。
2. 能打开指定版本查看对应 analysis 数据。
3. 回滚后当前编辑内容与版本号同步更新。

当前状态:
1. submit 后能显示新的 FAO、sentence、reflection（有条件）评论。✅
2. 能打开指定版本查看对应 analysis 数据。✅
3. 回滚后当前编辑内容与版本号同步更新。✅
补充: 回滚后会强制拉取 `newVersion` 详情并设为当前展示，避免右侧停留旧版本。✅

## Phase 6: 账号与上线
6.1 接入 signup/login 并统一管理会话（httpOnly cookie）。
6.2 未登录访问受保护页面时自动跳到登录页。
6.3 Cloudflare Pages 配置 `Root=frontend`、`Build=npm run build`、`Output=dist`。

验收:
1. 登录态在刷新后可恢复。
2. 鉴权失败时会清本地会话缓存并跳转登录。
3. 线上刷新任意路由都能正确回到 SPA。

当前状态:
1. 登录态在刷新后可恢复。✅
2. 鉴权失败时会清本地会话缓存并跳转登录。✅
3. 线上刷新任意路由都能正确回到 SPA。✅

## Phase 7: 工作流稳定性修复
7.1 初始加载改为并行请求并处理“未提交版本”空态。
7.2 自动保存改为串行队列并只保留最后一次内容。
7.3 submit 失败时不清理本地 marking 与 reflection 草稿。

验收:
1. 首次 work 打开不会触发 `versions/undefined` 请求。
2. 连续输入场景下不会出现旧保存覆盖新内容。
3. 提交失败后用户标记和文本不会丢失。

当前状态:
1. 首次 work 打开不会触发 `versions/undefined` 请求。✅
2. 连续输入场景下不会出现旧保存覆盖新内容。✅
3. 提交失败后用户标记和文本不会丢失。✅

不做（留到 Phase 10）:
1. Draft 分页后端 API（当前先本地截断）。
2. 文本高亮 diff 算法（当前先近似查找）。
3. 基于版本号的 optimistic locking。

## Phase 8: 状态与性能修复
8.1 analysis 状态改为按版本缓存并分离当前版本与展示版本。
8.2 draft history 默认限制数量并支持分页或截断策略。
8.3 本地草稿缓存增加过期与容量清理策略。

验收:
1. 查看历史版本后返回编辑页仍保留最新 analysis。
2. drafts 量级很大时页面仍可交互。
3. localStorage 不会无限增长。

当前状态:
1. 查看历史版本后返回编辑页仍保留最新 analysis。✅
2. drafts 量级很大时页面仍可交互。✅
3. localStorage 不会无限增长。✅

不做（留到 Phase 10）:
1. ETag/304 缓存协商。
2. 后端批量 analysis 读取端点。
3. 进度统计 dashboard 端点与页面。

## Phase 9: 体验与安全基线
9.1 锁冲突界面展示倒计时并缩短重试周期。
9.2 回滚弹窗明确说明版本后果和丢失风险。
9.3 会话过期统一拦截并在跳转前保护本地草稿。

验收:
1. 锁释放后可在短时间内自动恢复编辑。
2. 用户回滚前能明确理解影响范围。
3. 401 发生时不会直接丢失当前编辑内容。

当前状态:
1. 锁释放后可在短时间内自动恢复编辑。✅
2. 用户回滚前能明确理解影响范围。✅
3. 401 发生时不会直接丢失当前编辑内容。✅

不做（留到 Phase 10）:
1. Force Unlock（待后端锁详情与解锁 API 支持）。
2. httpOnly cookie 会话改造。
3. Sentry 与生产监控接入。

## Phase 10: 产品化收尾
10.1 接入 Draft 分页后端 API（`versions?type=draft&parent=&limit=&cursor=`），替换本地截断策略。
10.2 实现文本高亮 diff 算法，降低历史评论定位误差。
10.3 接入基于版本号的 optimistic locking，提交与保存增加冲突检测与用户提示。
10.4 加入 ETag/304 缓存协商，降低重复拉取版本与 analysis 的流量。
10.5 接入后端批量 analysis 读取端点，优化历史版本批量浏览体验。
10.6 接入进度统计 dashboard 端点与页面，展示改进轮次与问题处理进度。
10.7 接入 Force Unlock（在后端提供锁详情与解锁 API 后开放）。
10.8 会话改造为 httpOnly cookie（替代 localStorage token），统一 CSRF 防护策略。
10.9 接入 Sentry 与生产监控告警（错误率、接口耗时、关键交互失败率）。
10.10 建立前端测试与发布门禁：单测、集成测试、E2E、构建体积与性能预算检查。
10.11 补齐产品级体验基线：A11y（键盘/读屏）、移动端细节、弱网与离线降级。

验收:
1. drafts 数量 1000+ 时，历史浏览无明显卡顿且支持继续翻页加载。
2. 历史评论在文本多次改写后仍能稳定定位，误定位率显著下降。
3. 并发编辑冲突可被稳定拦截并给出明确恢复路径，不会静默覆盖内容。
4. 线上会话过期、接口异常、前端崩溃都可被监控系统捕获并告警。
5. CI 未通过测试或性能预算时禁止发布，主流程具备自动化回归保障。
6. 关键页面满足基础无障碍与移动端可用性要求。

Phase 10 完成结论（前端范围）:
1. Draft 历史前端分页（Load Older）与大列表可交互能力已落地（含后端 `limit/cursor` 接入）。✅
2. 轻量冲突防护（version conflict pre-check）已落地。✅
3. ETag/304 前端协商缓存与写操作后缓存失效已落地。✅
4. 测试与发布门禁（typecheck + vitest + build + bundle budget + GitHub Actions gate）已落地。✅
5. A11y 与移动端基线（aria-live、focus-visible、移动端布局收敛）已落地。✅

阻塞项（需后端/运维配合）:
1. Draft cursor 分页 API 正式接入（`limit/cursor`）。✅
2. 文本高亮 diff 算法（需要稳定文本锚点策略）。⏳
3. 批量 analysis 读取端点接入。⏳
4. 进度统计 dashboard 端点与页面联调。⏳
5. Force Unlock（依赖后端锁详情与解锁 API）。⏳
6. httpOnly cookie 会话改造（前端适配完成，依赖后端/网关联调验证）。✅
7. Sentry 与生产监控告警接入（依赖运维配置）。⏳
