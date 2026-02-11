# Frontend Detailed Plan

## Phase 1: 基础架构
1.1 使用 Vite + React + TypeScript 作为前端基础。
1.2 保持 `src/modules` 的 vertical slice 目录结构。
1.3 在 `src/router.tsx` 固定声明四个核心路由。

验收:
1. `/works`、`/works/:workId`、`/why`、`/about` 都可访问。
2. 页面间跳转可用且无白屏。
3. `npm run build` 成功产出 `dist`。

## Phase 2: Works 列表
2.1 在 `/works` 页面接入 `GET /api/work/list`。
2.2 在 `/works` 页面接入 `POST /api/work/create`。
2.3 在 `/works` 页面接入 `DELETE /api/work/{work_id}`。

验收:
1. 能创建 work 并跳转到详情页。
2. 能看到后端返回的 works 列表。
3. 删除后列表立即更新。

## Phase 3: Works 详情编辑
3.1 在 `/works/:workId` 接入 `GET /api/work/{work_id}`。
3.2 实现自动保存并接入 `POST /api/work/{work_id}/update`。
3.3 保存 `device_id` 并用于锁相关请求。

验收:
1. 刷新后仍能拉到最新内容。
2. 编辑后会按规则自动保存。
3. 锁冲突时会显示只读或错误提示。

## Phase 4: 提交与评论
4.1 提交时接入 `POST /api/work/{work_id}/submit`。
4.2 强制用户先处理全部 sentence comments 才允许提交。
4.3 用户可选填写 FAO reflection 并随 submit 一起发送。

验收:
1. 提交后能看到新的 FAO comment 和 sentence comments。
2. 未处理完 comment 时提交按钮不可用。
3. 有 reflection 时能看到对应 reflection comment。

## Phase 5: 版本与回滚
5.1 版本列表接入 `GET /api/work/{work_id}/versions`。
5.2 版本详情接入 `GET /api/work/{work_id}/versions/{version_number}`。
5.3 回滚接入 `POST /api/work/{work_id}/revert`。

验收:
1. 能看到 submitted 与 draft 的版本信息。
2. 能打开任意版本查看内容和评论。
3. 回滚后会生成新 draft 并更新当前内容。

## Phase 6: 账号与上线
6.1 接入 signup/login 并统一管理 token。
6.2 未登录访问受保护页面时自动跳到登录页。
6.3 Cloudflare Pages 配置 `Root=frontend`、`Build=npm run build`、`Output=dist`。

验收:
1. 登录态在刷新后可恢复。
2. 鉴权失败时会清 token 并跳转登录。
3. 线上刷新任意路由都能正确回到 SPA。
