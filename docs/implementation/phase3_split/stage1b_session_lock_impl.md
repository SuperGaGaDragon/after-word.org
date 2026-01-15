# Phase3A Stage1B - Session Lock Implementation

## 目标
实现 Redis 锁的具体逻辑，不含业务判断。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 任务清单
- [x] 在 `backend/modules/session_lock/lock.py` 实现 acquire/refresh/release/get 函数。
- [x] acquire 使用 setnx；refresh/release 需要校验 value 匹配 device_id。
- [x] 过期时间使用 `WORK_LOCK_EXPIRE_SECONDS`。

## 交付物（必须有）
- `backend/modules/session_lock/lock.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3A Stage1B - Session Lock Implementation`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 所有文件 < 200 行
