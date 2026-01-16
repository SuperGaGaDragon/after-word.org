# Phase5C - Workspace Events

## 目标
实现 workspace 的事件逻辑：登录态判断、new work、历史切换、自动保存、LLM 评论。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- 未登录用户点击任何按钮（除方块6）统一弹窗：“Signup / Login for full experience”。
- LLM 仅由用户点击触发；LLM comment 与当前 work 绑定，只读。
- 编辑板未登录时锁死，禁止编辑。
- work 创建与切换均在当前页面完成，不整页跳转。

## 任务清单
- [ ] 在 `frontend/Modules/workspace/events.js` 实现登录态检测（基于 localStorage JWT）。
- [ ] New Work 点击：未登录弹窗；已登录则调用 `/api/work/create`，清空编辑板并隐藏 LLM 区。
- [ ] 历史列表点击：未登录弹窗；已登录则调用 `/api/work/{id}` 加载内容并隐藏 LLM 区。
- [ ] 编辑板输入：若未登录，阻止输入；若登录，每 30 秒自动调用 `/api/work/{id}/update`。
- [ ] LLM Comment：点击按钮后显示可拖动浮窗，调用 `/api/llm/comment`，并展示历史评论（GET `/api/conversation/{id}`）。

## 交付物（必须有）
- `frontend/Modules/workspace/events.js`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase5C - Workspace Events`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] 未登录永远无法触发写操作
- [ ] LLM 仅在点击时触发
- [ ] 所有文件 < 200 行
