# Phase2 Stage3 - JWT Utility + Auth Guard

## 目标
实现 JWT 生成与解析工具，提供 API 层依赖的统一认证守卫。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- JWT 过期时间 60 分钟。
- API 层只做 JWT 校验与解析，不做业务逻辑。

## 任务清单
- [x] 在 `backend/modules/auth/jwt.py` 创建：
  - `create_token(email, username)`
  - `decode_token(token)`，失败抛 BusinessError（未授权）
- [x] 在 `backend/api/` 创建依赖注入函数 `require_user()`（例如 `backend/api/auth/deps.py`）：
  - 读取 Authorization Bearer token
  - 调用 `modules/auth/jwt.py` 解析
  - 返回用户身份对象（email/username）
- [x] 不要把 JWT 传入 LLM Gateway（该组件禁止接收凭证）。

## 交付物（必须有）
- [x] `backend/modules/auth/jwt.py`
- [x] `backend/api/auth/deps.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase2 Stage3 - JWT Utility + Auth Guard`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] JWT 过期时间 = 60 分钟
- [x] 所有文件 < 200 行
