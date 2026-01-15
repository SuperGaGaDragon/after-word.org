# Phase3 Stage1 - Session/Lock Component

## 目标
实现单设备编辑锁（Redis），确保同一时间仅允许一个设备编辑同一用户的 work。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- Work 组件必须通过 Session/Lock 组件来控制编辑占用。
- Session/Lock 不能访问业务数据内容，不依赖 Auth/Work/Conversation。
- Redis key 过期时间使用 `WORK_LOCK_EXPIRE_SECONDS`。

## 锁规则（必须按此实现）
- key 形态：`work_lock:{work_id}`
- value：`device_id`（前端生成或请求时提供）
- 允许操作：acquire_lock, refresh_lock, release_lock, get_lock_holder

## 任务清单
- [x] 在 `backend/modules/session_lock/lock.py` 实现 Redis 连接与锁操作：
  - `acquire_lock(work_id, device_id)`：不存在时 setnx + expire
  - `refresh_lock(work_id, device_id)`：仅当前 device 持有时续期
  - `release_lock(work_id, device_id)`：仅当前 device 持有时删除
  - `get_lock_holder(work_id)`：读取当前持有者 device_id
- [x] 所有函数只处理锁逻辑，不能判断业务合法性。

## 交付物（必须有）
- `backend/modules/session_lock/lock.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3 Stage1 - Session/Lock Component`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] Redis 过期时间来自 `WORK_LOCK_EXPIRE_SECONDS`
- [x] 所有文件 < 200 行
