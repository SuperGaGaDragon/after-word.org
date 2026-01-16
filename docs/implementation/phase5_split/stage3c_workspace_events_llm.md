# Phase5C Stage3C - Workspace LLM Events

## 目标
实现 LLM 评论按钮与评论历史展示。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 规则
- LLM 只能在用户点击后触发。
- LLM 只读当前文本，不修改编辑板。

## 任务清单
- [ ] 在 `frontend/Modules/workspace/events.js` 实现 LLM Comment 点击：
  - 显示浮窗
  - 调用 `/api/llm/comment`
  - 调用 `/api/conversation/{work_id}` 展示历史
- [ ] 评论区只读展示

## 交付物（必须有）
- `frontend/Modules/workspace/events.js`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase5C Stage3C - Workspace LLM Events`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] LLM 仅在点击触发
- [ ] 文件 < 200 行
