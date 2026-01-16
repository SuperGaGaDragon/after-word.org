# Phase4C Stage2B - Work API Routes

## 目标
实现 Work API 路由，仅做 HTTP 层工作。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 路由（必须按此执行）
- POST `/api/work/create`
- GET `/api/work/list`
- GET `/api/work/{work_id}`
- POST `/api/work/{work_id}/update`

## 任务清单
- [x] 在 `backend/api/work/router.py` 实现上述路由。
- [x] 认证通过后调用 `modules/work/manager`。

## 交付物（必须有）
- `backend/api/work/router.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase4C Stage2B - Work API Routes`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] API 未写业务逻辑
- [x] 文件 < 200 行
