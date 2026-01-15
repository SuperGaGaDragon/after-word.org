# Phase1 Stage3 - FastAPI App Skeleton + Error Mapping

## 目标
搭建 API 层统一异常映射与路由注册骨架，保证后续只填业务组件调用。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- API 层只负责 HTTP 协议处理、参数校验、JWT 校验与解析、异常映射；禁止业务逻辑。
- 任何业务规则必须在 modules 组件层实现。

## 任务清单
- [x] 在 `backend/api/` 建立统一错误模型（例如 `backend/api/errors.py`），包含：
  - `BusinessError` 基类，含 `code` 与 `message`。
  - FastAPI exception handler：将 `BusinessError` 映射为对应 HTTP 状态码。
- [x] 在 `backend/main.py` 注册路由模块（auth/work/conversation/llm）与全局异常处理。
- [x] 在 `backend/api/` 为每个子路由建立 `router.py`，目前只放空 router 与标签。

## 交付物（必须有）
- `backend/api/errors.py`
- `backend/api/auth/router.py`
- `backend/api/work/router.py`
- `backend/api/conversation/router.py`
- `backend/api/llm/router.py`
- `backend/main.py` 更新

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase1 Stage3 - FastAPI App Skeleton + Error Mapping`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] API 层未写业务逻辑
- [x] 所有文件 < 200 行
