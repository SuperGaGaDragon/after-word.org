# Phase4D Stage3B - Conversation API Routes

## 目标
实现 Conversation API 路由，仅做 HTTP 层工作。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 路由（必须按此执行）
- GET `/api/conversation/{work_id}`

## 任务清单
- [ ] 在 `backend/api/conversation/router.py` 实现 list 路由。
- [ ] 认证通过后调用 `modules/conversation/manager`。

## 交付物（必须有）
- `backend/api/conversation/router.py`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase4D Stage3B - Conversation API Routes`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] API 未写业务逻辑
- [ ] 文件 < 200 行
