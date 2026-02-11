# LLM 功能故障排查

## 当前状态
- ✅ Railway API 服务正常运行
- ✅ 认证功能正常
- ✅ Work管理功能正常
- ❌ LLM评论功能返回 502 错误

## 测试结果
```bash
POST /api/llm/comment
响应: {"code":"llm_failed","message":"llm request failed"}
HTTP Status: 502
```

## 可能的原因

### 1. API Key 格式问题（最可能）

**检查步骤：**
1. 打开 Railway 变量页面
2. 检查 `LLM_API_KEY` 的值
3. 确认格式为：`sk-proj-xxxx` 或 `sk-xxxx`（完整的key，不能有空格）

**常见错误：**
- ❌ Key前后有空格
- ❌ Key不完整（复制时被截断）
- ❌ 使用了过期的key

### 2. OpenAI 账户问题

**检查清单：**
- [ ] OpenAI API key 是否有效
- [ ] OpenAI 账户是否有余额
- [ ] API key 是否有 Chat Completions 权限

**验证方法：**
访问 https://platform.openai.com/api-keys 检查你的 API key 状态

### 3. Railway 网络出站限制

Railway 可能限制了对外部 API 的访问（不太可能，但需要排查）

### 4. 环境变量未生效

Railway 环境变量可能没有正确传递到应用

## 详细调试步骤

### Step 1: 查看 Railway 日志

1. 打开你的 Railway 项目
2. 点击 backend 服务
3. 查看 "Logs" 标签
4. 触发一次 LLM comment 请求
5. 查找包含 "llm" 或 "openai" 的错误信息

**期望看到的日志：**
- 如果是 API key 问题：会有 "invalid_api_key" 或 "unauthorized"
- 如果是网络问题：会有 "connection timeout" 或 "network error"
- 如果是格式问题：会有 JSON 解析错误

### Step 2: 增强错误日志（推荐）

修改 `backend/modules/llm_gateway/client.py` 添加详细日志：

```python
def generate_comment(text_snapshot: str) -> str:
    prompt = _build_prompt(text_snapshot)
    payload: Dict[str, Any] = {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": prompt}],
    }
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }

    print(f"🔍 [DEBUG] LLM Request to: {_llm_endpoint()}")  # 添加日志
    print(f"🔍 [DEBUG] Using model: {LLM_MODEL}")  # 添加日志
    print(f"🔍 [DEBUG] API Key starts with: {LLM_API_KEY[:10]}...")  # 添加日志

    try:
        response = httpx.post(
            _llm_endpoint(),
            json=payload,
            headers=headers,
            timeout=LLM_TIMEOUT_SECONDS
        )
        print(f"🔍 [DEBUG] Response status: {response.status_code}")  # 添加日志
        print(f"🔍 [DEBUG] Response body: {response.text[:200]}")  # 添加日志

        response.raise_for_status()
        data = response.json()
    except Exception as exc:
        print(f"❌ [ERROR] LLM request failed: {exc}")  # 添加日志
        raise BusinessError("llm_failed", "llm request failed") from exc
    # ... 其余代码保持不变
```

部署后，在 Railway 日志中会看到详细的调试信息。

### Step 3: 验证 API Key

在本地测试你的 API key：

```bash
# 替换为你在 Railway 中设置的真实 key
export OPENAI_KEY="sk-proj-your-real-key-here"

curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Say hello"}]
  }' \
  -s | jq
```

**期望结果：**
```json
{
  "choices": [
    {
      "message": {
        "content": "Hello! How can I help you today?"
      }
    }
  ]
}
```

**如果返回错误：**
- 401: API key 无效
- 429: 超过速率限制或余额不足
- 500: OpenAI 服务问题

### Step 4: 检查环境变量

在 Railway 中临时添加一个测试端点：

```python
# 在 backend/main.py 中添加
@app.get("/debug/env")
def debug_env():
    """临时调试端点 - 部署后记得删除！"""
    from backend.config import LLM_BASE_URL, LLM_MODEL, LLM_TIMEOUT_SECONDS
    return {
        "LLM_BASE_URL": LLM_BASE_URL,
        "LLM_MODEL": LLM_MODEL,
        "LLM_TIMEOUT_SECONDS": LLM_TIMEOUT_SECONDS,
        "LLM_API_KEY_PREFIX": os.getenv("LLM_API_KEY", "")[:10] + "...",
    }
```

访问 `https://api.after-word.org/debug/env` 查看配置是否正确。

⚠️ **记得测试完后删除这个端点！**

## 快速修复建议

### 方案 1: 重新设置 API Key（最推荐）

1. 访问 https://platform.openai.com/api-keys
2. 创建一个**全新的** API key
3. 在 Railway 中删除 `LLM_API_KEY` 变量
4. 重新添加 `LLM_API_KEY`，粘贴新的key
5. 确保没有多余的空格或换行符
6. 保存并等待重新部署

### 方案 2: 使用 Railway 的 Secret 功能

1. 在 Railway Variables 页面
2. 点击 `LLM_API_KEY` 旁边的眼睛图标
3. 确认显示的值是完整的 API key
4. 如果不完整，重新粘贴

### 方案 3: 检查 OpenAI 余额

1. 访问 https://platform.openai.com/settings/organization/billing
2. 确认有可用余额
3. 如果余额为0，需要充值

## 测试命令

完成修复后，使用以下命令测试：

```bash
# 1. 登录获取 token
curl -X POST https://api.after-word.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email_or_username":"railway_test_1770843169@example.com","password":"testpass123"}' \
  -s | jq -r '.token'

# 2. 测试 LLM comment（替换 TOKEN 和 WORK_ID）
curl -X POST https://api.after-word.org/api/llm/comment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "work_id": "YOUR_WORK_ID",
    "text_snapshot": "这是一段测试文本"
  }' \
  -s | jq
```

**成功响应应该是：**
```json
{
  "comment": "AI生成的评论内容..."
}
```

## 常见错误代码

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 502 | 后端无法连接到 OpenAI | 检查 API key 和网络 |
| 401 | API key 无效 | 重新设置正确的 key |
| 429 | 超过速率限制 | 等待或升级套餐 |
| 500 | OpenAI 服务故障 | 等待 OpenAI 恢复 |

## 需要帮助？

如果以上步骤都无法解决，请提供：
1. Railway 日志的截图（遮盖敏感信息）
2. OpenAI API key 的前10个字符
3. OpenAI 账户余额状态

这样我可以提供更精准的帮助！
