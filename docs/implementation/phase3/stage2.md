# Phase3 Stage2 - Work Component

## 目标
实现 Work 组件：创建/读取/更新作品内容，并强制单设备编辑。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- Work 组件是内容事实的守门人，必须经过 Session/Lock。
- Work 组件允许依赖 Auth（仅获取用户身份）、Storage/Work、Session/Lock。
- 未认证用户不得触发写操作。

## 业务规则（必须执行）
- create_work(user_email): 生成新 work_id，写入 storage/work。
- list_works(user_email): 只返回该用户的 work 列表，按更新时间倒序。
- get_work(work_id, user_email): 只能读取自己的。
- update_work(work_id, user_email, content, device_id):
  - 必须先获取锁：若锁存在且不属于当前 device，拒绝更新。
  - 更新成功后刷新锁过期时间。

## 任务清单
- [x] 在 `backend/modules/work/manager.py` 实现上述函数。
- [x] Work 组件内不得调用 LLM，不得写 Conversation。
- [x] 所有异常使用 BusinessError 抛出（例如无权限、锁被占用）。

## 交付物（必须有）
- `backend/modules/work/manager.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3 Stage2 - Work Component`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] update_work 必须经过 Session/Lock
- [x] 所有文件 < 200 行
