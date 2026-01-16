# Phase4B Stage1B - Auth API Routes

## 目标
实现 Auth API 路由，仅做 HTTP 层工作。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 路由（必须按此执行）
- POST `/api/auth/signup`
- POST `/api/auth/login`
- POST `/api/auth/change_password`
- POST `/api/auth/change_username`

## 任务清单
- [x] 在 `backend/api/auth/router.py` 实现上述路由。
- [x] 调用 `modules/auth/*` 完成业务。
- [x] 成功 signup/login 返回 JWT。

## 交付物（必须有）
- `backend/api/auth/router.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase4B Stage1B - Auth API Routes`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] API 未写业务逻辑
- [x] 文件 < 200 行
