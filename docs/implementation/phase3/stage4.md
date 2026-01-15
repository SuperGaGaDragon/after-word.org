# Phase3 Stage4 - LLM Gateway Component

## 目标
实现 LLM Gateway：构建 prompt，调用 `https://llm.after-word.org` 服务，返回评论文本。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- LLM Gateway 不得访问任何 Storage。
- LLM Gateway 不得接收 JWT 或用户凭证。
- LLM 仅读取当前编辑板文本，返回 comment，不得修改任何系统状态。

## 任务清单
- [x] 在 `backend/modules/llm_gateway/client.py` 实现：
  - `generate_comment(text_snapshot)`：构建 prompt，并调用 `LLM_BASE_URL`。
  - 超时使用 `LLM_TIMEOUT_SECONDS`。
- [x] prompt 只包含当前文本与固定指令，不包含用户信息。
- [x] 出错时抛 BusinessError（LLM 失败）。

## 交付物（必须有）
- `backend/modules/llm_gateway/client.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3 Stage4 - LLM Gateway Component`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 未读写任何 Storage
- [x] 未接收 JWT 或 email
- [x] 所有文件 < 200 行
