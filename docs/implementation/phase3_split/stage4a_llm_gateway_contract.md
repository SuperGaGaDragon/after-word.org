# Phase3D Stage4A - LLM Gateway Contract

## 目标
定义 LLM Gateway 组件的输入输出与禁止事项。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 契约（必须按此执行）
- generate_comment(text_snapshot) -> comment_text
- 只接收文本快照，不接收任何用户凭证或 JWT
- 不得访问 Storage，不得修改系统状态

## 任务清单
- [x] 在 `backend/modules/llm_gateway/README.md` 写清上述契约与禁令。

## 交付物（必须有）
- `backend/modules/llm_gateway/README.md`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3D Stage4A - LLM Gateway Contract`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 文件 < 200 行
- [x] 禁令完整
