# Phase5D Stage4B - Auth Events JS

## 目标
实现 login/signup/accountSetting 事件逻辑，与 API 对接。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 任务清单
- [ ] `frontend/Modules/login/events.js`：调用 `/api/auth/login`，保存 JWT。
- [ ] `frontend/Modules/signup/events.js`：调用 `/api/auth/signup`，保存 JWT。
- [ ] `frontend/Modules/accountSetting/events.js`：调用 `/api/auth/change_password` 与 `/api/auth/change_username`。

## 交付物（必须有）
- `frontend/Modules/login/events.js`
- `frontend/Modules/signup/events.js`
- `frontend/Modules/accountSetting/events.js`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase5D Stage4B - Auth Events JS`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] email 不可修改入口
- [ ] 文件 < 200 行
