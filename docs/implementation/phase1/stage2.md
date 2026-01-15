# Phase1 Stage2 - Postgres Schema + Storage Contracts

## 目标
定义 Postgres 表结构与 storage 层 CRUD 合约，后续组件只能按合约调用。

## 强约束（必须执行）
- 任何代码文件不得超过 200 行。
- 每完成一个 checkbox 就立刻打勾。
- 必须严格遵守本文件指令。

## 背景信息（来自总计划，必须遵守）
- Storage 是事实源，只提供 CRUD，不得实现业务规则。
- Auth 只管身份；Work 只管作品内容与编辑规则；Conversation 只管对话记录。
- email 全局唯一，作为用户 id 使用，禁止更改。

## 表结构定义（必须按此执行）
### 1) users
- 字段：id (uuid, pk), email (text, unique, not null), username (text, unique, not null), password_hash (text, not null), created_at (timestamptz)

### 2) works
- 字段：id (uuid, pk), user_email (text, not null), content (text, default ''), updated_at (timestamptz), created_at (timestamptz)
- 说明：user_email 外键逻辑约束到 users.email（可不显式建外键，但 retrieval 必须按 email 过滤）

### 3) conversations
- 字段：id (uuid, pk), work_id (uuid, not null), user_email (text, not null), role (text, not null, 固定为 'assistant'), content (text, not null), created_at (timestamptz)

## Storage 合约（必须实现为函数接口）
### storage/user
- create_user(email, username, password_hash)
- get_user_by_email(email)
- get_user_by_username(username)

### storage/user_retrieve
- list_users_basic()

### storage/work
- create_work(user_email) -> work_id
- update_work_content(work_id, user_email, content)

### storage/work_retrieve
- get_work(work_id, user_email)
- list_works(user_email) (按 updated_at DESC)

### storage/conversation
- create_comment(work_id, user_email, content)
- list_comments(work_id, user_email)

## 任务清单
- [x] 在 `backend/storage/` 为上述每个 storage 子目录创建 `repo.py`（或同名模块），只写 SQL/ORM 与 CRUD，不写业务判断。
- [x] 确保所有 retrieval 都需要 `user_email` 作为过滤条件。
- [x] 建立单元测试占位（可空）或 README 说明接口，不得超 200 行。

## 交付物（必须有）
- `backend/storage/user/repo.py`
- `backend/storage/user_retrieve/repo.py`
- `backend/storage/work/repo.py`
- `backend/storage/work_retrieve/repo.py`
- `backend/storage/conversation/repo.py`

## 提交要求
- [x] 完成本 stage 后执行 `git add` 涉及文件。
- [x] 提交命名必须为：`Phase1 Stage2 - Postgres Schema + Storage Contracts`（当前 stage 编号）。
- [x] 确认无任何环境变量文件被提交。
## 自检
- [x] 仅实现 CRUD，无业务逻辑
- [x] 所有文件 < 200 行
