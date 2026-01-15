# Phase2 Stage2 - Auth Signup/Login/Change

## 目标
实现注册、登录、修改凭证的业务逻辑组件（非 API 层）。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- signup：调用 check，若 email 或 username 重复则禁止注册。
- login：校验密码正确性。
- change：允许改用户名与密码；email 禁止修改。
- change 密码规则：新密码输入两次一致且不同于旧密码。

## 任务清单
- [x] 在 `backend/modules/auth/signup.py` 实现 `signup(email, username, password)`：
  - 调用 `check.py` 检查唯一性。
  - 密码做 hash（算法由你选，但必须可验证）。
  - 调用 storage/user.create_user。
- [x] 在 `backend/modules/auth/login.py` 实现 `login(email_or_username, password)`：
  - 支持 email 或 username 登录。
  - 密码校验通过才返回用户基础信息。
- [x] 在 `backend/modules/auth/change.py` 实现：
  - `change_password(email, old_password, new_password, new_password_confirm)`。
  - `change_username(email, new_username)`，仅当与旧名不同且不冲突。
- [x] 所有业务异常使用统一 BusinessError（但不在 API 层处理）。

## 交付物（必须有）
- `backend/modules/auth/signup.py`
- `backend/modules/auth/login.py`
- `backend/modules/auth/change.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase2 Stage2 - Auth Signup/Login/Change`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] email 绝对不可修改
- [x] 所有文件 < 200 行
