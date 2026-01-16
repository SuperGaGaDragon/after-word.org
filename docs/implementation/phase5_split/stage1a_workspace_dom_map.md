# Phase5A Stage1A - Workspace DOM Map

## 目标
先定义 workspace 页面 DOM 结构的 ID 与 data- 属性规范，便于事件层挂载。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 说明
- `layout.html` 的意义：这是 workspace 的纯结构文件（对应 project_intro.md 中的 modules/workspace/layout/layout.html 描述），只负责页面布局与 DOM 占位，不包含事件或样式。

## DOM 规范（必须按此执行）
- New Work 按钮：`data-action="new-work"`
- Work 列表容器：`data-role="work-list"`
- Work 列表项：`data-work-id="..."`
- 编辑板 textarea：`data-role="editor"`
- LLM 按钮：`data-action="llm-comment"`
- LLM 浮窗：`data-role="llm-panel"`（默认隐藏）
- 用户区：`data-role="user-entry"`
- 登录提示弹窗：`data-role="login-modal"`

## 任务清单
- [x] 在 `frontend/Modules/workspace/layout.html` 按上述规范补齐 DOM 标识。
- [x] 确保所有交互节点可被 events.js 选择到。

## 交付物（必须有）
- `frontend/Modules/workspace/layout.html`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase5A Stage1A - Workspace DOM Map`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] 文件 < 200 行
- [ ] DOM 标识完整
