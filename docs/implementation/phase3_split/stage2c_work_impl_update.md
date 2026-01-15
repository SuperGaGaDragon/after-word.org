# Phase3B Stage2C - Work Implementation (Update + Lock)

## 目标
实现 Work 更新逻辑与锁控制。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 任务清单
- [x] 在 `backend/modules/work/manager.py` 补齐 update_work。
- [x] update_work 必须：acquire -> update -> refresh；若锁冲突抛 BusinessError("LOCKED")。
- [x] update 后调用 storage/work.update_work_content。

## 交付物（必须有）
- `backend/modules/work/manager.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3B Stage2C - Work Implementation (Update + Lock)`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] update_work 必须经过 Session/Lock
- [x] 所有文件 < 200 行
