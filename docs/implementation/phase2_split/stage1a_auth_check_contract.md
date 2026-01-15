# Phase2A Stage1A - Auth Check Contract

## 目标
明确 Auth Check 的职责、函数签名与依赖边界。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 契约（必须按此执行）
- is_email_taken(email) -> bool
- is_username_taken(username) -> bool

## 依赖边界
- 只允许依赖 `storage/user` 与 `storage/user_retrieve`。
- 不抛业务异常，只返回布尔值。

## 任务清单
- [x] 在 `backend/modules/auth/README.md` 写清上述契约与边界。

## 交付物（必须有）
- `backend/modules/auth/README.md`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase2A Stage1A - Auth Check Contract`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 文件 < 200 行
- [x] 契约完整
