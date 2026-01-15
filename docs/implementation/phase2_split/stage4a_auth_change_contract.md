# Phase2D Stage4A - Change Credentials Contract

## 目标
明确修改用户名/密码的契约与规则。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 契约（必须按此执行）
- change_password(email, old_password, new_password, new_password_confirm) -> ok
- change_username(email, new_username) -> ok

## 规则
- email 禁止修改。
- 新密码两次一致且不同于旧密码。
- 新用户名必须与旧名不同且不冲突。

## 依赖边界
- 允许依赖 `modules/auth/check` 与 `storage/user`。
- 不访问 Work/Conversation/LLM。

## 任务清单
- [x] 在 `backend/modules/auth/README.md` 追加 change 契约与规则。

## 交付物（必须有）
- `backend/modules/auth/README.md`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase2D Stage4A - Change Credentials Contract`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 文件 < 200 行
