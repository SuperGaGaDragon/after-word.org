# Phase5D - Auth Pages Events

## 目标
实现 login/signup/accountSetting 页面事件逻辑，与后端 API 对接。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- 登录成功后前端保存 JWT，后续调用带 Bearer。
- 修改密码：新密码两次一致且不同于旧密码。
- email 禁止修改。

## 任务清单
- [x] 在 `frontend/Modules/login/events.js` 实现登录提交：调用 `/api/auth/login`，保存 JWT，成功跳转到 workspace。
- [x] 在 `frontend/Modules/signup/events.js` 实现注册提交：调用 `/api/auth/signup`，保存 JWT，成功跳转到 workspace。
- [x] 在 `frontend/Modules/accountSetting/events.js` 实现：
  - 改密码（调用 `/api/auth/change_password`）
  - 改用户名（调用 `/api/auth/change_username`）
  - 所有提示信息在前端显示

## 交付物（必须有）
- `frontend/Modules/login/events.js`
- `frontend/Modules/signup/events.js`
- `frontend/Modules/accountSetting/events.js`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase5D - Auth Pages Events`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] email 无修改入口
- [x] 所有文件 < 200 行
