# Phase4A - API Auth Routes

## 目标
实现 Auth API 路由（注册/登录/改名/改密），仅做 HTTP 层工作。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- API 层禁止业务逻辑，只负责参数校验、JWT 校验、异常映射。
- Auth 组件已有业务逻辑。

## 路由定义（必须按此实现）
- POST `/api/auth/signup`
  - body: {email, username, password}
  - return: {token, user}
- POST `/api/auth/login`
  - body: {email_or_username, password}
  - return: {token, user}
- POST `/api/auth/change_password`
  - auth: Bearer token
  - body: {old_password, new_password, new_password_confirm}
- POST `/api/auth/change_username`
  - auth: Bearer token
  - body: {new_username}

## 任务清单
- [ ] 在 `backend/api/auth/router.py` 添加上述路由。
- [ ] 请求/响应使用 Pydantic schema，放在 `backend/api/auth/schemas.py`。
- [ ] 调用 `modules/auth/*` 完成业务，API 只做参数校验与异常映射。
- [ ] 成功登录/注册时返回 JWT（调用 `modules/auth/jwt.py`）。

## 交付物（必须有）
- `backend/api/auth/router.py`
- `backend/api/auth/schemas.py`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase4A - API Auth Routes`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] API 未写业务逻辑
- [ ] 所有文件 < 200 行
