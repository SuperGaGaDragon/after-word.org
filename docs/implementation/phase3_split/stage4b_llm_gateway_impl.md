# Phase3D Stage4B - LLM Gateway Implementation

## 目标
实现 LLM Gateway 调用逻辑（HTTP 调用 + prompt 构建）。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 任务清单
- [x] 在 `backend/modules/llm_gateway/client.py` 实现 generate_comment。
- [x] prompt 只包含当前文本与固定指令，不包含用户身份。
- [x] 超时使用 `LLM_TIMEOUT_SECONDS`。

## 交付物（必须有）
- `backend/modules/llm_gateway/client.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3D Stage4B - LLM Gateway Implementation`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 未读写任何 Storage
- [x] 所有文件 < 200 行
