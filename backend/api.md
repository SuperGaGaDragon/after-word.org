# After Word API 文档

**API Base URL:** `https://api.after-word.org`
**LLM Base URL:** `https://llm.after-word.org/v1`

## API 端点概览

### 认证相关

| 方法 | 端点 | 描述 | 需要认证 |
|------|------|------|----------|
| POST | `/api/auth/signup` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| POST | `/api/auth/change_password` | 修改密码 | ✅ |
| POST | `/api/auth/change_username` | 修改用户名 | ✅ |

### 作品管理

| 方法 | 端点 | 描述 | 需要认证 |
|------|------|------|----------|
| POST | `/api/work/create` | 创建新作品 | ✅ |
| GET | `/api/work/list` | 获取作品列表 | ✅ |
| GET | `/api/work/{work_id}` | 获取作品详情 | ✅ |
| POST | `/api/work/{work_id}/update` | 更新作品内容 | ✅ |

### 对话/评论

| 方法 | 端点 | 描述 | 需要认证 |
|------|------|------|----------|
| GET | `/api/conversation/{work_id}` | 获取作品评论列表 | ✅ |

### AI 功能

| 方法 | 端点 | 描述 | 需要认证 |
|------|------|------|----------|
| POST | `/api/llm/comment` | 生成 AI 评论 | ✅ |

---

## 认证方式

除了注册和登录接口外，其他所有接口都需要在请求头中携带 JWT token：

```
Authorization: Bearer <token>
```

---

## 详细接口说明

### 认证相关

#### 用户注册

**POST** `/api/auth/signup`

创建新用户账户。

**请求体：**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### 用户登录

**POST** `/api/auth/login`

使用邮箱或用户名登录。

**请求体：**
```json
{
  "email_or_username": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### 修改密码

**POST** `/api/auth/change_password` 🔒

修改当前用户密码。

**请求体：**
```json
{
  "old_password": "oldpassword123",
  "new_password": "newpassword456",
  "new_password_confirm": "newpassword456"
}
```

**响应：**
```json
{
  "ok": true
}
```

#### 修改用户名

**POST** `/api/auth/change_username` 🔒

修改当前用户的用户名。

**请求体：**
```json
{
  "new_username": "new_username"
}
```

**响应：**
```json
{
  "ok": true
}
```

---

### 作品管理

#### 创建作品

**POST** `/api/work/create` 🔒

为当前用户创建一个新的作品。

**请求体：** 无

**响应：**
```json
{
  "work_id": "work_unique_id"
}
```

#### 获取作品列表

**GET** `/api/work/list` 🔒

获取当前用户的所有作品列表。

**响应：**
```json
{
  "items": [
    {
      "work_id": "work_id_1",
      "updated_at": "2025-01-15T10:30:00"
    },
    {
      "work_id": "work_id_2",
      "updated_at": "2025-01-16T14:22:00"
    }
  ]
}
```

#### 获取作品详情

**GET** `/api/work/{work_id}` 🔒

获取指定作品的完整内容。

**路径参数：**
- `work_id`: 作品ID

**响应：**
```json
{
  "work_id": "work_id",
  "content": "作品的文本内容..."
}
```

#### 更新作品内容

**POST** `/api/work/{work_id}/update` 🔒

更新指定作品的内容。支持多设备同步锁机制。

**路径参数：**
- `work_id`: 作品ID

**请求体：**
```json
{
  "content": "更新后的作品内容...",
  "device_id": "device_unique_id"
}
```

**响应：**
```json
{
  "ok": true
}
```

---

### 对话/评论

#### 获取评论列表

**GET** `/api/conversation/{work_id}` 🔒

获取指定作品的所有评论。

**路径参数：**
- `work_id`: 作品ID

**响应：**
```json
{
  "items": [
    {
      "id": "comment_id_1",
      "content": "这是一条评论内容",
      "created_at": "2025-01-15T10:30:00"
    },
    {
      "id": "comment_id_2",
      "content": "这是另一条评论",
      "created_at": "2025-01-15T11:45:00"
    }
  ]
}
```

---

### AI 功能

#### 生成 AI 评论

**POST** `/api/llm/comment` 🔒

基于文本片段生成 AI 评论，并自动保存到对应作品。

**请求体：**
```json
{
  "work_id": "work_id",
  "text_snapshot": "需要评论的文本片段..."
}
```

**响应：**
```json
{
  "comment": "AI 生成的评论内容..."
}
```

---

## 错误处理

所有接口在发生错误时会返回相应的 HTTP 状态码和错误信息：

**示例错误响应：**
```json
{
  "detail": {
    "code": "error_code",
    "message": "错误描述信息"
  }
}
```

**常见错误码：**
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证或 token 无效
- `403 Forbidden`: 无权限访问
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

---

## LLM 服务

系统使用独立的 LLM 服务来生成 AI 评论。该服务采用 OpenAI 兼容的 API 格式。

**LLM Base URL:** `https://llm.after-word.org/v1`

### Chat Completions

**POST** `/v1/chat/completions`

生成文本补全（后端内部调用）。

**请求体：**
```json
{
  "model": "gpt-oss-20b",
  "messages": [
    {
      "role": "user",
      "content": "Read the text and provide a concise assistant comment. Do not include user identities.\n\n[文本内容]"
    }
  ]
}
```

**响应：**
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "AI 生成的评论内容..."
      }
    }
  ]
}
```

**说明：**
- LLM 服务由后端的 `/api/llm/comment` 端点内部调用
- 前端无需直接访问 LLM 服务
- 使用模型: `gpt-oss-20b`
- 超时时间: 可配置（通过 `LLM_TIMEOUT_SECONDS` 环境变量）

---

## 技术栈

- **框架**: FastAPI
- **认证**: JWT (JSON Web Tokens)
- **CORS**: 已配置跨域支持
- **LLM**: 独立的 OpenAI 兼容 API 服务
