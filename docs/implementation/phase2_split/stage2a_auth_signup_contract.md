# Phase2B Stage2A - Signup Contract

## 目标
明确注册逻辑的输入输出、校验规则与依赖边界。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 契约（必须按此执行）
- signup(email, username, password) -> user

## 规则
- email/username 唯一性由 check 组件判断。
- 密码必须 hash 存储。

## 依赖边界
- 允许依赖 `modules/auth/check` 与 `storage/user`。
- 不调用 API 层，不访问 Work/Conversation/LLM。

## 任务清单
- [x] 在 `backend/modules/auth/README.md` 追加 signup 契约与规则。

## 交付物（必须有）
- `backend/modules/auth/README.md`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase2B Stage2A - Signup Contract`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 文件 < 200 行
