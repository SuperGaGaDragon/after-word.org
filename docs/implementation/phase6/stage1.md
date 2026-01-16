# Phase6 Stage1 - Backend Tests

## 目标
建立后端测试覆盖关键业务路径与约束。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 测试范围（必须覆盖）
- Auth：注册、登录、改名、改密；重复 email/username 拒绝。
- Work：创建、列表、读取、更新；锁冲突拒绝。
- Conversation：写入/读取评论；work 归属校验。
- LLM：comment API 成功与失败场景（mock LLM）。

## 任务清单
- [x] 在 `backend/tests/` 新建测试文件，按模块拆分（auth/work/conversation/llm）。
- [x] 使用 mock 隔离外部服务（Redis/LLM/Postgres）或使用测试容器。
- [x] 每个测试文件 < 200 行，如超过必须拆分。

## 交付物（必须有）
- `backend/tests/test_auth.py`
- `backend/tests/test_work.py`
- `backend/tests/test_conversation.py`
- `backend/tests/test_llm.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase6 Stage1 - Backend Tests`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 覆盖所有关键规则
- [x] 所有文件 < 200 行
