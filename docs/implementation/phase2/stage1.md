# Phase2 Stage1 - Auth Check Component

## 目标
实现 Auth 组件中的唯一性检查逻辑，为注册/改名提供基础校验。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- email 全局唯一，作为用户 id。
- Auth 组件只定义“人是谁”，不定义“人能干什么”。
- Auth 只能依赖 Storage/User 与 Storage/User_Retrieve。

## 任务清单
- [x] 在 `backend/modules/auth/` 创建 `check.py`：
  - `is_email_taken(email)` 调用 storage/user。
  - `is_username_taken(username)` 调用 storage/user。
- [x] 检查函数只返回布尔，不抛出业务异常（异常由调用方处理）。
- [x] 为 `check.py` 添加最小单元测试占位或 docstring 示例（<200 行）。

## 交付物（必须有）
- `backend/modules/auth/check.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase2 Stage1 - Auth Check Component`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 只依赖 storage 层
- [x] 所有文件 < 200 行
