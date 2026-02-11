# LLM 服务迁移指南

## 从自建服务切换到 OpenAI API

### 已完成的代码更改

#### 1. 环境变量配置 (`.env`)
```bash
# 旧配置
LLM_BASE_URL=https://llm.after-word.org/v1

# 新配置
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-your-api-key-here  # ⚠️ 需要替换为真实的 API key
LLM_MODEL=gpt-3.5-turbo            # 可选: gpt-4, gpt-4-turbo-preview 等
```

#### 2. 代码修改
- ✅ `backend/config.py`: 添加了 `LLM_API_KEY` 和 `LLM_MODEL` 配置读取
- ✅ `backend/modules/llm_gateway/client.py`:
  - 添加了 Authorization 头支持
  - 使用可配置的模型名称（不再硬编码）
  - 完全兼容 OpenAI API 格式

### 配置步骤

1. **更新 `.env` 文件中的 API Key**
   ```bash
   cd /Users/alex_1/Desktop/afterword
   # 编辑 .env 文件，将 LLM_API_KEY 替换为你的真实 OpenAI API key
   ```

2. **选择模型**（可选）
   - `gpt-3.5-turbo`: 最快、最便宜，适合大多数场景
   - `gpt-4`: 更强大，更贵
   - `gpt-4-turbo-preview`: GPT-4 的快速版本

3. **重启后端服务**
   ```bash
   # 如果使用 docker
   docker-compose restart backend

   # 或者如果直接运行
   # 停止当前进程然后重新启动
   python -m uvicorn backend.main:app --reload
   ```

### 测试 API

使用以下命令测试 LLM 端点：

```bash
# 1. 登录获取 token
TOKEN=$(curl -X POST https://api.after-word.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_username":"your_email","password":"your_password"}' \
  -s | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. 测试 LLM comment
curl -X POST https://api.after-word.org/api/llm/comment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"work_id":"your_work_id","text_snapshot":"测试文本内容"}'
```

### 成本估算

OpenAI API 按 token 计费：
- **gpt-3.5-turbo**: ~$0.0015/1K tokens (输入) + $0.002/1K tokens (输出)
- **gpt-4**: ~$0.03/1K tokens (输入) + $0.06/1K tokens (输出)

平均每次评论请求约消耗 100-300 tokens。

### 回滚方案

如果需要回退到自建服务：

```bash
# 恢复 .env 配置
LLM_BASE_URL=https://llm.after-word.org/v1
LLM_API_KEY=dummy_key_for_self_hosted
LLM_MODEL=gpt-oss-20b
```

代码已兼容两种方式，只需修改环境变量即可。

### 故障排查

1. **401 Unauthorized**
   - 检查 API key 是否正确
   - 确认 API key 有效且未过期

2. **429 Rate Limit**
   - OpenAI 有速率限制
   - 考虑添加重试逻辑或升级 API 套餐

3. **超时错误**
   - 增加 `LLM_TIMEOUT_SECONDS` 值（当前 60 秒）
   - GPT-4 响应较慢，可能需要更长超时

### 安全注意事项

⚠️ **重要**:
- 不要将 `.env` 文件提交到 git
- 已确认 `.env` 在 `.gitignore` 中
- 生产环境建议使用环境变量或密钥管理服务

### 参考文档

- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [模型定价](https://openai.com/pricing)
