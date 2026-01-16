# Phase4C - API Conversation + LLM Routes

## 目标
实现对话与 LLM 相关 API 路由，确保 LLM 只能被用户显式触发。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- LLM 只读当前编辑板文本，不能修改 Work。
- Conversation 只记录 LLM 返回的评论。
- LLM Gateway 不得接收 JWT 或用户凭证。

## 路由定义（必须按此实现）
- GET `/api/conversation/{work_id}`
  - auth: Bearer token
  - return: [{id, content, created_at}]
- POST `/api/llm/comment`
  - auth: Bearer token
  - body: {work_id, text_snapshot}
  - flow: 调用 LLM Gateway -> 将结果写入 Conversation
  - return: {comment}

## 任务清单
- [ ] 在 `backend/api/conversation/router.py` 添加 list 路由。
- [ ] 在 `backend/api/llm/router.py` 添加 comment 路由。
- [ ] schema 放在各自 `schemas.py`。
- [ ] LLM API 层不得传递 JWT 给 LLM Gateway，仅传递 `text_snapshot`。
- [ ] comment 成功后写入 Conversation 组件。

## 交付物（必须有）
- `backend/api/conversation/router.py`
- `backend/api/conversation/schemas.py`
- `backend/api/llm/router.py`
- `backend/api/llm/schemas.py`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase4C - API Conversation + LLM Routes`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] LLM Gateway 只接收文本快照
- [ ] 所有文件 < 200 行
