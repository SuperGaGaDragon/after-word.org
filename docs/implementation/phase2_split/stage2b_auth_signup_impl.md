# Phase2B Stage2B - Signup Implementation

## 目标
实现注册逻辑：唯一性校验 + 密码 hash + 写入 storage。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 任务清单
- [x] 在 `backend/modules/auth/signup.py` 实现 signup。
- [x] 冲突时抛 BusinessError（例如 EMAIL_TAKEN / USERNAME_TAKEN）。
- [x] 调用 storage/user.create_user 写入。

## 交付物（必须有）
- `backend/modules/auth/signup.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase2B Stage2B - Signup Implementation`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 密码仅存 hash
- [x] 文件 < 200 行
