# Phase4A Stage0A - API Auth Deps Contract

## 目标
定义 API 层认证依赖的输入输出与边界。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 契约（必须按此执行）
- require_user() -> {email, username}

## 规则
- 读取 Authorization: Bearer token
- 只做 JWT 解析与校验
- 不触发任何业务逻辑

## 任务清单
- [x] 在 `backend/api/auth/README.md` 写清 require_user 契约与规则。

## 交付物（必须有）
- `backend/api/auth/README.md`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase4A Stage0A - API Auth Deps Contract`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 文件 < 200 行
