# Phase2E Stage5A - JWT Contract

## 目标
定义 JWT 生成/解析的输入输出与过期规则。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 契约（必须按此执行）
- create_token(email, username) -> token
- decode_token(token) -> {email, username}

## 规则
- 过期时间固定 60 分钟（JWT_EXPIRE_MINUTES）。
- decode 失败必须抛 BusinessError("UNAUTHORIZED")。

## 任务清单
- [x] 在 `backend/modules/auth/README.md` 追加 JWT 契约与规则。

## 交付物（必须有）
- `backend/modules/auth/README.md`

## 提交要求
- [ ] 完成本 stage 后执行 `git add` 涉及文件。
- [ ] 提交命名必须为：`Phase2E Stage5A - JWT Contract`（当前 stage 编号）。
- [ ] 确认无任何环境变量文件被提交。
## 自检
- [ ] 文件 < 200 行
