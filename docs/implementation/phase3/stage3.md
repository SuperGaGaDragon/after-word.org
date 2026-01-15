# Phase3 Stage3 - Conversation Component

## 目标
实现对话记录组件，管理 LLM 评论存取与与 work 的一致性校验。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- Conversation 只记录对话，不得修改 Work。
- Conversation 允许依赖 Auth、Work（仅校验 project 合法性）、Storage/Conversation。
- 禁止直接调用 LLM（必须通过 LLM Gateway）。

## 任务清单
- [x] 在 `backend/modules/conversation/manager.py` 实现：
  - `add_comment(work_id, user_email, content)`：先用 Work 校验 work 归属，再写 storage/conversation。
  - `list_comments(work_id, user_email)`：校验后读取。
- [x] 仅允许 role='assistant' 的 comment 写入。

## 交付物（必须有）
- `backend/modules/conversation/manager.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3 Stage3 - Conversation Component`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 未对 Work 内容做写操作
- [x] 所有文件 < 200 行
