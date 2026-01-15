# Phase3B Stage2A - Work Component Contract

## 目标
明确 Work 组件函数签名、输入输出与锁依赖规则。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 业务契约（必须按此执行）
- create_work(user_email) -> work_id
- list_works(user_email) -> list[work]
- get_work(work_id, user_email) -> work
- update_work(work_id, user_email, content, device_id) -> ok

## 锁规则
- update_work 前必须 acquire_lock
- acquire 失败必须抛 BusinessError("LOCKED")
- update 成功必须 refresh_lock

## 任务清单
- [x] 在 `backend/modules/work/README.md` 写清上述契约与锁规则。
- [x] 标注 Work 只能依赖 Auth(身份) + Storage/Work + Session/Lock。

## 交付物（必须有）
- `backend/modules/work/README.md`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3B Stage2A - Work Component Contract`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 文件 < 200 行
- [x] 规则完整
