# Phase5A - Frontend Layout (HTML)

## 目标
搭建前端页面结构：workspace 主页面与 login/signup/accountSetting 页面，符合交互结构。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- 入口页面：用户访问 `after-word.org` 进入主页 workspace。
- `layout.html` 的意义：这是 workspace 的纯结构文件（对应 project_intro.md 中的 modules/workspace/layout/layout.html 描述），只负责页面布局与 DOM 占位，不包含事件或样式。
- 页面区块：
  - 方块1: New Work 按钮
  - 方块2: Work 历史列表
  - 方块3: 编辑板
  - 方块4: LLM Comment 入口与浮窗（默认隐藏）
  - 方块6: 右上角用户区域（登录态显示用户名，否则 login/signup）
  - 方块7: About us
- 方块5 已删除。
- 前端三端分离：HTML 仅放结构，事件在 events.js，样式在 style.css。

## 任务清单
- [x] 在 `frontend/Modules/workspace/` 创建 `layout.html`，按左右 1/6 + 5/6 切分布局，包含方块1/2/3/4/6/7的 DOM 占位。
- [x] 在 `frontend/Modules/login/` 创建 `layout.html`，包含邮箱/用户名、密码输入与提交按钮。
- [x] 在 `frontend/Modules/signup/` 创建 `layout.html`，包含邮箱、用户名、密码输入与提交按钮。
- [x] 在 `frontend/Modules/accountSetting/` 创建 `layout.html`，包含改用户名、改密码表单区域。
- [x] 所有 layout 仅包含结构与 data- 属性，不绑定事件。

## 交付物（必须有）
- `frontend/Modules/workspace/layout.html`
- `frontend/Modules/login/layout.html`
- `frontend/Modules/signup/layout.html`
- `frontend/Modules/accountSetting/layout.html`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase5A - Frontend Layout (HTML)`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 所有文件 < 200 行
- [x] HTML 只包含结构，不包含业务逻辑
