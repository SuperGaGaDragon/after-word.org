# Phase5C Stage3B - Workspace Work Flow

## 目标
实现 New Work、历史切换、自动保存逻辑。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 任务清单
- [ ] 在 `frontend/Modules/workspace/events.js` 实现 New Work 事件：创建 work -> 清空编辑板 -> 隐藏 LLM 区。
- [ ] 实现历史列表点击：加载内容 -> 设置为当前 work -> 隐藏 LLM 区。
- [ ] 实现 30 秒自动保存（仅登录且当前 work 有效）。

## 交付物（必须有）
- `frontend/Modules/workspace/events.js`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase5C Stage3B - Workspace Work Flow`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] 自动保存不影响未登录用户
- [ ] 文件 < 200 行
