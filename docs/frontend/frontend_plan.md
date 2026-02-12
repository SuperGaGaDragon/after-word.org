# Frontend Plan

## 1. 目标
- 先把前端路由跑通。
- 用最小页面把流程接起来。
- 再一块一块接后端 API。

## 2. 页面范围
- `/works`
- `/works/:workId`
- `/why`
- `/about`

## 3. 目录规则
- 用 vertical slice。
- 业务代码放在 `src/modules`。
- 当前模块：
- `src/modules/works`
- `src/modules/why`
- `src/modules/about`
- 公共测试跳转按钮放在 `src/modules/navigation`。

## 4. 开发顺序
1. 路由阶段
- 保证 4 个页面都可访问。
- 保证页面之间可跳转。

2. Works 列表阶段
- 接 `GET /api/work/list`。
- 接 `POST /api/work/create`。
- 接 `DELETE /api/work/{work_id}`。

3. Works 详情阶段
- 接 `GET /api/work/{work_id}`。
- 接 `POST /api/work/{work_id}/update`（自动保存）。
- 接 `POST /api/work/{work_id}/submit`（提交）。

4. 版本阶段
- 接 `GET /api/work/{work_id}/versions`。
- 接 `GET /api/work/{work_id}/versions/{version_number}`。
- 接 `POST /api/work/{work_id}/revert`。

5. 账号阶段
- 接注册、登录。
- 使用 httpOnly cookie 会话。
- 处理未登录跳转。

## 5. API契约修正（以后端代码为准）
- `POST /api/work/{work_id}/update` 的 `auto_save` 默认值是 `true`，前端必须显式传值。
- 自动保存请求必须传 `auto_save: true`，手动存草稿必须传 `auto_save: false`。
- `POST /api/work/{work_id}/submit` 只返回 `analysis_id` 和 `version`，不会直接返回 analysis 内容。
- 提交后必须再请求 `GET /api/work/{work_id}/versions/{version}` 拉取 analysis。
- `suggestion_actions` 内字段统一用后端 snake_case：`action`、`user_note`。
- 前端内部可用 camelCase，但在 API 层必须完成 snake_case 转换。
- `versions?type=draft&parent=` 的 `parent` 由前端按数字管理，发请求时按 query 参数传递。

## 6. API空缺与前端策略
- works 列表暂不依赖 `title`，无标题时显示 `Untitled Work`。
- 错误码先实现 `unauthorized`、`not_found`、`locked`、`validation_failed`、`llm_failed`。
- `429` 和 `suggestions_not_processed` 先按通用错误 UI 兜底，等待后端文档补齐。
- `POST /api/llm/comment` 在主流程不使用，主流程只走 submit 自动分析。

## 7. UI规则（当前阶段）
- 允许测试 UI。
- 测试代码必须写清楚 `TEST ONLY`。
- 不做复杂视觉，先保证流程对。

## 8. 数据规则
- 前端界面文字用英文。
- API 字段名用英文。
- 错误统一显示用户可理解的信息。

## 9. 提交规则
- 一次提交只做一件事。
- 每次改动都可运行。
- 提交前至少检查：
- 路由能打开。
- 页面跳转正常。
- 基础构建通过。

## 10. 完成标准
- 用户能创建 work。
- 用户能进入 `/works/:workId` 编辑。
- 用户能提交并通过二次请求看到评论结果。
- 用户能查看版本并回滚。
