# Railway 环境变量配置清单

**Railway 项目链接**: [打开变量设置](https://railway.com/project/e13eb46b-fb0f-40b7-bd6f-87bad34c31cc/service/19ccbaf3-0ee7-4c68-8a44-80394c84cb14/variables?environmentId=f2b4c4a1-e174-4da3-bfa2-de816581821a)

## 必需的环境变量

### Application
```
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=8000
```

### Auth / JWT
```
JWT_SECRET_KEY=your-secure-random-secret-key-here
JWT_EXPIRE_MINUTES=60
```

### Database (Postgres)
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
💡 如果你在Railway添加了Postgres服务，可以使用 `${{Postgres.DATABASE_URL}}` 引用

### Redis (Work Lock)
```
REDIS_URL=${{Redis.REDIS_URL}}
```
💡 如果你在Railway添加了Redis服务，可以使用 `${{Redis.REDIS_URL}}` 引用

### LLM (OpenAI API)
```
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-proj-your-openai-api-key-here
LLM_MODEL=gpt-3.5-turbo
LLM_TIMEOUT_SECONDS=60
```
⚠️ **重要**: 将 `LLM_API_KEY` 替换为你的真实 OpenAI API key

### Frontend
```
FRONTEND_BASE_URL=https://after-word.org
```

---

## 配置步骤

### 1. 打开 Railway 变量设置
点击上面的链接，或者在 Railway 项目中：
- 进入你的服务 (backend)
- 点击 "Variables" 标签
- 点击 "Raw Editor" 切换到批量编辑模式

### 2. 批量添加变量（推荐）

在 Raw Editor 中，粘贴以下内容：

```env
APP_ENV=production
APP_HOST=0.0.0.0
APP_PORT=8000

JWT_SECRET_KEY=OnceUPONatimeIloveyouyoufeiohiaaauifhaiuhfahfaih
JWT_EXPIRE_MINUTES=60

DATABASE_URL=${{Postgres.DATABASE_URL}}

REDIS_URL=${{Redis.REDIS_URL}}

LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-proj-YOUR_REAL_API_KEY_HERE
LLM_MODEL=gpt-3.5-turbo
LLM_TIMEOUT_SECONDS=60

FRONTEND_BASE_URL=https://after-word.org
```

⚠️ **记得替换**:
- `LLM_API_KEY`: 你的 OpenAI API key
- `JWT_SECRET_KEY`: 建议生成新的安全密钥（可选）

### 3. 保存并重新部署

- 点击 "Save" 保存变量
- Railway 会自动触发重新部署
- 等待部署完成（通常1-3分钟）

### 4. 验证配置

部署完成后，使用以下命令测试：

```bash
# 测试 API 是否正常
curl https://api.after-word.org/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"testpass123"}'

# 如果返回 token 和 user，说明配置成功！
```

---

## Railway 环境变量优先级说明

你的代码 (`backend/config.py`) 已经正确处理了优先级：

```python
if key and key not in os.environ:  # 👈 关键逻辑
    os.environ[key] = value
```

**优先级顺序**:
1. 🥇 Railway 环境变量（最高优先级）
2. 🥈 本地 `.env` 文件（仅当 Railway 变量不存在时）

所以你**不需要修改任何代码**，只需在 Railway 设置环境变量即可！

---

## 常见问题

### Q: 如何生成安全的 JWT_SECRET_KEY？
```bash
# 在本地运行
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### Q: Railway 自动部署了吗？
是的，保存环境变量后会自动触发部署。查看 "Deployments" 标签查看进度。

### Q: 如何查看 Railway 服务日志？
在 Railway 项目中，点击你的服务，然后查看 "Logs" 标签。

### Q: DATABASE_URL 和 REDIS_URL 如何获取？
如果你在 Railway 项目中添加了 Postgres 和 Redis 服务：
- 使用 `${{Postgres.DATABASE_URL}}`
- 使用 `${{Redis.REDIS_URL}}`
- Railway 会自动替换为实际的连接字符串

### Q: 本地开发时怎么办？
本地开发时，`.env` 文件依然有效，因为本地没有 Railway 环境变量。

---

## 验证清单

在 Railway 配置完成后，验证以下内容：

- [ ] 所有必需的环境变量都已设置
- [ ] LLM_API_KEY 已替换为真实的 OpenAI key
- [ ] 服务已自动重新部署
- [ ] 部署状态显示为 "Active"
- [ ] API 端点可以正常访问
- [ ] LLM comment 功能正常工作

---

## 安全建议

⚠️ **重要安全提示**:
- ✅ Railway 环境变量是加密存储的
- ✅ 不要在代码中硬编码敏感信息
- ✅ 不要将 `.env` 提交到 git
- ✅ 定期轮换 API keys 和密钥
- ✅ 生产环境使用强随机密钥

---

## 故障排查

### 服务启动失败
1. 查看 Railway Logs
2. 检查是否所有必需变量都已设置
3. 验证 DATABASE_URL 和 REDIS_URL 格式正确

### LLM 功能不工作
1. 验证 `LLM_API_KEY` 是否正确
2. 检查 OpenAI API 余额是否充足
3. 查看后端日志中的错误信息

### 数据库连接失败
1. 确认 Postgres 服务在 Railway 中已启动
2. 检查 `DATABASE_URL` 格式
3. 验证数据库迁移是否已运行
