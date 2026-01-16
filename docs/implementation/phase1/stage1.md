# Phase1 Stage1 - Repo Structure + Env Contract

## 目标
建立后端/前端基础目录与配置入口，确保后续阶段可对齐文件结构与环境变量。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- 所有文件必须写在 `afterword/docs` 体系下生成计划，但代码文件将落在 `afterword/backend`、`afterword/frontend`。
- 后端使用 FastAPI；API 层只做 HTTP 参数校验、JWT 校验、异常映射，禁止业务逻辑。
- 认证 JWT 过期 60 分钟。
- LLM 直接调用 `https://llm.after-word.org`；禁止 LLM 组件访问任何存储。
- Redis 用于编辑锁；Postgres 用于所有持久化。

## 任务清单
- [x] 在仓库根目录确认存在 `backend/` 与 `frontend/` 目录；若不存在则创建。
- [x] 在 `backend/` 内创建最小 FastAPI 入口文件与配置模块：
  - `backend/main.py`：仅包含 app 实例与路由注册占位，不写业务逻辑。
  - `backend/config.py`：从仓库根目录 `.env` 读取变量（必要时写入 `os.environ`），字段必须包含 `APP_ENV APP_HOST APP_PORT JWT_SECRET_KEY JWT_EXPIRE_MINUTES DATABASE_URL REDIS_URL WORK_LOCK_EXPIRE_SECONDS LLM_BASE_URL LLM_TIMEOUT_SECONDS FRONTEND_BASE_URL`。
- [x] 在仓库根目录创建 `.env`，内容必须完全来自 `docs/general/env_contract.md`。
- [x] 在 `backend/api/` 创建路由分包的空目录结构：`auth/ work/ conversation/ llm/`（只放 `__init__.py` 或占位文件）。
- [x] 在 `backend/modules/` 创建组件分包空目录结构：`auth/ work/ conversation/ session_lock/ llm_gateway/`。
- [x] 在 `backend/storage/` 创建空目录结构：`user/ user_retrieve/ work/ work_retrieve/ conversation/`。
- [x] 在 `frontend/` 下创建三端分离基础文件夹：`Modules/`，并为后续模块预留目录：`login/ signup/ accountSetting/ workspace/`。
- [x] 在 `frontend/Modules/` 下创建必需入口 `index.html`（暂时只放占位文本）。

## 交付物（必须有）
- `backend/main.py`
- `backend/config.py`
- `backend/api/` 目录结构
- `backend/modules/` 目录结构
- `backend/storage/` 目录结构
- `frontend/Modules/index.html`
- `frontend/Modules/login/ signup/ accountSetting/ workspace/` 目录结构

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase1 Stage1 - Repo Structure + Env Contract`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 所有新建代码文件均 < 200 行
- [x] 未在 API 层写任何业务逻辑
