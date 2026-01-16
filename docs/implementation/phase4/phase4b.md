# Phase4B - API Work Routes

## 目标
实现 Work API 路由（创建/列表/获取/更新），仅做 HTTP 层工作。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- 未登录用户不得触发任何写操作。
- Work 组件必须通过 Session/Lock 控制编辑。

## 路由定义（必须按此实现）
- POST `/api/work/create`
  - auth: Bearer token
  - return: {work_id}
- GET `/api/work/list`
  - auth: Bearer token
  - return: [{work_id, updated_at}]
- GET `/api/work/{work_id}`
  - auth: Bearer token
  - return: {work_id, content}
- POST `/api/work/{work_id}/update`
  - auth: Bearer token
  - body: {content, device_id}
  - return: {ok: true}

## 任务清单
- [x] 在 `backend/api/work/router.py` 添加上述路由。
- [x] 请求/响应 schema 放在 `backend/api/work/schemas.py`。
- [x] 所有业务调用必须转到 `modules/work/manager.py`。

## 交付物（必须有）
- `backend/api/work/router.py`
- `backend/api/work/schemas.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase4B - API Work Routes`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] API 未写业务逻辑
- [x] 所有文件 < 200 行
