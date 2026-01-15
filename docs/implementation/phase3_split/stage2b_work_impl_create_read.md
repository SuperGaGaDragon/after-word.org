# Phase3B Stage2B - Work Implementation (Create/List/Get)

## 目标
实现 Work 组件的创建与读取路径，不涉及更新锁逻辑。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 任务清单
- [x] 在 `backend/modules/work/manager.py` 实现 create_work/list_works/get_work。
- [x] 所有读取必须按 user_email 过滤。
- [x] 任何业务异常使用 BusinessError。

## 交付物（必须有）
- `backend/modules/work/manager.py`（仅包含 create/list/get 部分）

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase3B Stage2B - Work Implementation (Create/List/Get)`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 未实现 update_work
- [x] 所有文件 < 200 行
