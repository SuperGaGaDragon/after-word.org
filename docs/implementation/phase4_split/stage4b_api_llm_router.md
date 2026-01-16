# Phase4E Stage4B - LLM API Routes

## 目标
实现 LLM comment API 路由，仅做 HTTP 层工作。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 路由（必须按此执行）
- POST `/api/llm/comment`

## 任务清单
- [ ] 在 `backend/api/llm/router.py` 实现 comment 路由。
- [ ] 仅传 `text_snapshot` 给 LLM Gateway，绝不传 JWT。
- [ ] comment 成功后写入 Conversation 组件。

## 交付物（必须有）
- `backend/api/llm/router.py`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase4E Stage4B - LLM API Routes`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] LLM Gateway 只接收文本
- [ ] 文件 < 200 行
