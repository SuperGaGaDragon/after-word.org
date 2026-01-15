# Phase3A Stage1A - Session Lock Contract + Keying

## 目标
只定义锁 key、value、过期策略与函数签名，作为后续实现的硬约束。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 锁契约（必须按此执行）
- key: `work_lock:{work_id}`
- value: `device_id`
- expire: `WORK_LOCK_EXPIRE_SECONDS`

## 必须提供的函数签名
- acquire_lock(work_id, device_id) -> bool
- refresh_lock(work_id, device_id) -> bool
- release_lock(work_id, device_id) -> bool
- get_lock_holder(work_id) -> device_id | None

## 任务清单
- [x] 在 `backend/modules/session_lock/` 创建 `README.md`，写清上述契约与签名。
- [x] 明确 Session/Lock 只处理锁，不关心 user/work 业务语义。

## 交付物（必须有）
- `backend/modules/session_lock/README.md`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3A Stage1A - Session Lock Contract + Keying`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 文件 < 200 行
- [x] 契约完整
