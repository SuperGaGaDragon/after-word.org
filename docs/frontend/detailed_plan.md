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
1. `suggestion_actions` 发送字段是 `action` 和 `user_note`。
2. 自动保存与手动保存行为和版本结果符合预期。
3. submit 后右侧评论来自 `versions/{version}` 响应而非 submit 响应。

## Phase 3: Works 列表与详情
3.1 在 `/works` 页面接入 list/create/delete 三个 work 接口。
3.2 works 列表无 title 时统一显示 `Untitled Work`。
3.3 在 `/works/:workId` 接入读取、更新、提交和版本接口。

验收:
1. 能创建、进入和删除 work。
2. 刷新详情页后能恢复当前内容和版本信息。
3. 编辑后自动保存与提交流程都可用。

## Phase 4: 错误与状态
4.1 对 `unauthorized`、`not_found`、`locked`、`validation_failed`、`llm_failed` 做明确 UI 映射。
4.2 对 `429` 与 `suggestions_not_processed` 先做通用错误兜底并保留扩展位。
4.3 锁冲突时显示不可编辑状态并定时重试刷新数据。

验收:
1. 常见错误都能在页面被稳定展示。
2. 锁冲突不会导致页面崩溃或数据丢失。
3. 提交校验失败时用户知道缺少哪些步骤。

## Phase 5: 评论流与版本流
5.1 用户必须先处理所有 sentence comments 才允许下一次 submit。
5.2 用户可选提交 FAO reflection 并在后续版本展示 reflection comment。
5.3 版本列表与回滚统一走 versions/revert 接口并按版本号回显。

验收:
1. submit 后能显示新的 FAO、sentence、reflection（有条件）评论。
2. 能打开指定版本查看对应 analysis 数据。
3. 回滚后当前编辑内容与版本号同步更新。

## Phase 6: 账号与上线
6.1 接入 signup/login 并统一管理 token。
6.2 未登录访问受保护页面时自动跳到登录页。
6.3 Cloudflare Pages 配置 `Root=frontend`、`Build=npm run build`、`Output=dist`。

验收:
1. 登录态在刷新后可恢复。
2. 鉴权失败时会清 token 并跳转登录。
3. 线上刷新任意路由都能正确回到 SPA。
