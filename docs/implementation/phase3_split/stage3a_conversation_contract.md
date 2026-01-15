# Phase3C Stage3A - Conversation Contract

## 目标
明确 Conversation 组件的函数签名、校验规则与依赖边界。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 业务契约（必须按此执行）
- add_comment(work_id, user_email, content) -> comment_id
- list_comments(work_id, user_email) -> list[comment]

## 校验规则
- 调用 Work 组件校验 work 归属合法性。
- 只写 role='assistant'。

## 任务清单
- [x] 在 `backend/modules/conversation/README.md` 写清契约与规则。

## 交付物（必须有）
- `backend/modules/conversation/README.md`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3C Stage3A - Conversation Contract`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 文件 < 200 行
