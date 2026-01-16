# Phase5C Stage3A - Workspace Auth Gate

## 目标
实现 workspace 页面登录态判断与统一未登录提示逻辑。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 规则
- 未登录点击任何按钮（除用户入口）弹窗："Signup / Login for full experience"。
- 未登录编辑板不可编辑。

## 任务清单
- [x] 在 `frontend/Modules/workspace/events.js` 实现 JWT 检测与 login modal 控制。
- [x] 统一封装 `guardAuth(action)`：未登录弹窗并终止。

## 交付物（必须有）
- `frontend/Modules/workspace/events.js`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase5C Stage3A - Workspace Auth Gate`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 未登录无法触发写操作
- [x] 文件 < 200 行
