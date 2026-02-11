
这是设计阶段AI和我的讨论记录。所有AI无需阅读这个文档，如果看到这个文档，请自己跳过！！！！


# 句子级分析 + 版本控制

## 现状

- 有文章级评论：`POST /api/llm/comment`
- 没有句子级分析
- 没有版本历史，每次update直接覆盖

## 要做的事

### 1. 句子级分析

用户点"分析"按钮，返回哪些句子有问题，每个问题给出：
- 原文位置（start/end index）
- 问题类型（语法/表达/风格等）
- 改进建议
- 重写版本

### 2. 版本历史

- 每次update自动存版本
- 能看历史版本列表
- 能回滚到任意版本

---

## API设计

### 新增：句子分析

```
POST /api/llm/analyze

Request:
{
  "work_id": "uuid",
  "text": "完整文本"
}

Response:
{
  "analysis_id": "uuid",
  "suggestions": [
    {
      "id": "uuid",
      "original_text": "这句话不太清楚",
      "start_index": 45,
      "end_index": 55,
      "issue_type": "clarity",  // grammar/clarity/style/tone/logic/conciseness
      "severity": "medium",     // high/medium/low
      "title": "表达不清",
      "description": "问题说明",
      "suggestion": "改进建议",
      "rewrite": "改写版本"
    }
  ]
}
```

### 新增：版本列表

```
GET /api/work/{work_id}/versions

Response:
{
  "current_version": 8,
  "versions": [
    {
      "version_number": 8,
      "content_preview": "前100字...",
      "change_type": "manual_edit",
      "created_at": "..."
    }
  ]
}
```

### 新增：查看某版本

```
GET /api/work/{work_id}/versions/{version_number}

Response:
{
  "version_number": 7,
  "content": "完整内容",
  "change_type": "manual_edit",
  "created_at": "..."
}
```

### 新增：回滚

```
POST /api/work/{work_id}/revert

Request:
{
  "target_version": 5,
  "device_id": "xxx"
}

Response:
{
  "ok": true,
  "new_version": 9  // 回滚不删除，创建新版本
}
```

### 修改：现有update接口

```
POST /api/work/{work_id}/update

Response加上:
{
  "ok": true,
  "version": 9  // 新增：返回版本号
}
```

---

## 数据库

### 新表：text_analyses

```sql
CREATE TABLE text_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    text_snapshot TEXT NOT NULL,
    analysis_result JSONB NOT NULL,  -- 完整的suggestions数组
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_analyses ON text_analyses(work_id, created_at DESC);
```

### 新表：work_versions

```sql
CREATE TABLE work_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    version_number INT NOT NULL,
    content TEXT NOT NULL,
    change_type VARCHAR(50) NOT NULL,  -- manual_edit/apply_suggestion/revert
    change_description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (work_id, version_number)
);

CREATE INDEX idx_work_versions ON work_versions(work_id, version_number DESC);
```

### 修改：works表

```sql
ALTER TABLE works ADD COLUMN current_version INT DEFAULT 0;
```

---

## 核心逻辑

### update_work改造

```python
def update_work(work_id, user_email, content, device_id):
    # 1. 检查锁
    if not session_lock.acquire_lock(work_id, device_id):
        raise BusinessError("locked")

    # 2. 获取当前版本号
    work = get_work(work_id, user_email)
    current_ver = work.get("current_version", 0)
    new_ver = current_ver + 1

    # 3. 写入版本表
    insert_version(work_id, user_email, new_ver, content, "manual_edit")

    # 4. 更新主表
    update_content(work_id, content)
    update_current_version(work_id, new_ver)

    # 5. 刷新锁
    session_lock.refresh_lock(work_id, device_id)

    return {"ok": True, "version": new_ver}
```

### 分析逻辑

```python
def analyze_text(work_id, user_email, text):
    # 1. 调OpenAI
    prompt = build_prompt(text)
    raw_response = openai_call(prompt)

    # 2. 解析
    suggestions = parse_suggestions(raw_response)

    # 3. 存库
    analysis_id = save_analysis(work_id, user_email, text, suggestions)

    return {"analysis_id": analysis_id, "suggestions": suggestions}
```

### 回滚逻辑

```python
def revert(work_id, user_email, target_version, device_id):
    # 1. 检查锁
    if not session_lock.acquire_lock(work_id, device_id):
        raise BusinessError("locked")

    # 2. 读取目标版本内容
    target = get_version(work_id, target_version)

    # 3. 创建新版本（内容=目标版本）
    work = get_work(work_id, user_email)
    new_ver = work["current_version"] + 1
    insert_version(work_id, user_email, new_ver, target["content"], "revert")

    # 4. 更新主表
    update_content(work_id, target["content"])
    update_current_version(work_id, new_ver)

    return {"ok": True, "new_version": new_ver}
```

---

## Prompt设计

```python
ANALYZE_PROMPT = """你是中文写作助手。分析下面的文本，找出需要改进的句子。

要求：
1. 每个问题不超过50字
2. 准确标注字符位置
3. 分类：grammar/clarity/style/tone/logic/conciseness
4. 严重程度：high/medium/low
5. 给出标题、说明、建议、重写版本

返回JSON格式：
{
  "suggestions": [
    {
      "original_text": "...",
      "start_index": 0,
      "end_index": 10,
      "issue_type": "clarity",
      "severity": "medium",
      "title": "...",
      "description": "...",
      "suggestion": "...",
      "rewrite": "..."
    }
  ]
}

如果没问题，返回空数组。建议数量不超过10条。

文本：
{text}
"""
```

---

## 实施顺序

### Phase 1: 句子分析

1. 建表：`text_analyses`
2. 新建文件：`backend/modules/llm_gateway/analyzer.py`
3. 新建router：`backend/api/llm/analyze.py`
4. 添加到main.py
5. 写测试

### Phase 2: 版本控制

1. 建表：`work_versions`
2. 改表：`works` 加 `current_version`
3. 改逻辑：`update_work` 自动存版本
4. 新建文件：`backend/modules/work/version_manager.py`
5. 新增API：versions相关的3个端点
6. 写测试

---

## 需要讨论的

### 1. 版本保留策略

- A: 全部保留
- B: 只保留最近30个
- C: 最近30个 + 可标记"重要版本"永久保留

你选哪个？

### 2. 分析缓存

1小时内相同文本不重复调OpenAI，直接返回缓存？

- A: 要（省钱）
- B: 不要（每次都新鲜）
- C: 要缓存，但给用户"强制重新分析"按钮

你选哪个？

### 3. 其他问题

（写在这）

---

## 后续可以做的（不着急）

- 版本diff对比
- 追踪用户接受/拒绝了哪些建议（优化prompt用）
- 分析历史查询
- 旧版本自动清理


同事问题：
1、我希望增添的功能是，用户修改后，可以对建议打上标签：1、拒绝，则删除这个。2、已改完。 然后统一提交。llm可以检测问题的修改情况，比如：“问题解决得很好！”“问题没有解决”“出现了新的问题”。三种情况。如何实现？
2、关于反复修改，你的准备是每次submit都清空llm？新的提交就只查看新的原文，和之前的问题（用户标注已经解决）。
3、会不会有上下文问题？我准备限制上传字数为750. 
4、版本回退。这些所有的ai comment都需要和用户写的essay版本进行对应，用于查看。
5、版本分两种：第一种是用户点击提交的版本。这个版本永远都留着，永不变化；第二种是用户改动的版本。这个改动建议记录到下次提交，下次提交后之前的版本全部回退。类似google doc，前端的效果是一个滚动条拉可以看到所有的打字删除改动等。你觉得应该怎么实现？

codex回答：

### 1. 建议标签 + 修改检测

**理解**：用户看到建议后，可以标记"拒绝"或"已改完"，然后提交新版本。LLM检测改的怎么样。

**实现方案**：

新增两个字段到suggestion：
```json
{
  "id": "uuid",
  "original_text": "...",
  "user_action": null,  // 新增：null/rejected/resolved
  "resolution_status": null  // 新增：LLM检测后填写 good/unsolved/new_issue
}
```

**流程**：
```
1. 用户看到建议列表
2. 用户标记：suggestion_1 -> rejected, suggestion_2 -> resolved
3. 用户修改文本，点"提交"

POST /api/work/{work_id}/submit
{
  "content": "新文本",
  "suggestion_actions": {
    "suggestion_1": "rejected",
    "suggestion_2": "resolved"
  },
  "device_id": "xxx"
}

后端处理：
- 创建新版本（标记为submitted=true）
- 对标记为resolved的建议，调LLM检测：
  - 输入：原问题、原文本、新文本
  - 输出：good/unsolved/new_issue + 说明
- 保存检测结果
- rejected的直接删除/标记为dismissed
```

**新表**：
```sql
CREATE TABLE suggestion_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES text_analyses(id),
    suggestion_id VARCHAR(255) NOT NULL,
    user_action VARCHAR(50),  -- rejected/resolved
    original_text TEXT,
    new_text TEXT,
    resolution_status VARCHAR(50),  -- good/unsolved/new_issue
    llm_feedback TEXT,  -- LLM的评价
    created_at TIMESTAMP DEFAULT NOW()
);
```

**检测Prompt**：
```python
RESOLUTION_CHECK_PROMPT = """用户修改了文本，请检查问题是否解决。

原问题：{issue_description}
原文本：{original_text}
新文本：{new_text}

判断结果（只返回JSON）：
{
  "status": "good",  // good/unsolved/new_issue
  "feedback": "问题解决得很好，表达更清晰了"
}
"""
```

---

### 2. 反复修改处理

**理解**：每次submit清不清空之前的建议？

**建议方案**：**不清空，累积管理**

```
submit_1:
  - 问题A（用户标记resolved，LLM检测good）
  - 问题B（用户标记rejected）
  - 问题C（未处理）

submit_2（再次分析）:
  - 问题A：已解决，不再显示
  - 问题B：已拒绝，不再显示
  - 问题C：如果还在就继续显示（或重新检测）
  - 问题D（新发现）
```

**实现**：
- 每个suggestion关联到analysis_id
- 每个analysis关联到某个version
- 用户submit时记录suggestion_actions
- 下次分析时，过滤掉已resolved（good）和rejected的问题
- 但保留历史记录（可以查看"这个问题之前解决过"）

**API调整**：
```
POST /api/llm/analyze
Request: {
  "work_id": "uuid",
  "text": "新文本",
  "exclude_resolved": true  // 不重复显示已解决的问题
}

后端逻辑：
1. 调OpenAI分析新文本
2. 查询该work已resolved的问题位置
3. 过滤掉重叠的问题
4. 返回净新问题
```

---

### 3. 750字限制

**会有问题吗**？

- 750字对GPT-3.5-turbo来说没问题（约1000 tokens）
- prompt + 文本 + 输出 总共约3000 tokens，完全够用
- 但是：**句子的上下文可能不够**

**问题场景**：
```
第1段：介绍了概念A
第5段：使用了概念A，但没说清楚

如果只看第5段（750字以内），LLM可能不知道概念A是啥
```

**建议**：
- 如果全文<750字：直接全部分析
- 如果全文>750字：
  - 方案A：让用户选择要分析的段落（750字内）
  - 方案B：分段分析，但保留前文摘要作为上下文
  - 方案C：全文分析，但要求LLM只标注最重要的问题

**我倾向方案A**：让用户自己选择要分析哪部分。这样更可控，也更省钱。

---

### 4. 版本与AI comment对应

**理解**：查看历史版本时，也要看到当时的AI建议。

**实现**：已经有了！

```sql
-- text_analyses表已经有work_id和text_snapshot
-- 可以通过text_snapshot匹配版本

SELECT * FROM text_analyses
WHERE work_id = 'xxx'
AND text_snapshot = (
  SELECT content FROM work_versions
  WHERE work_id = 'xxx' AND version_number = 5
);
```

**但更好的方式**：直接关联

```sql
-- 给text_analyses加version_number
ALTER TABLE text_analyses
ADD COLUMN version_number INT;

-- 创建时记录
INSERT INTO text_analyses (work_id, version_number, text_snapshot, ...)
VALUES ('xxx', 5, '...', ...);
```

**API**：
```
GET /api/work/{work_id}/versions/{version_number}
Response: {
  "version_number": 5,
  "content": "...",
  "analysis": {  // 新增：当时的分析结果
    "analysis_id": "uuid",
    "suggestions": [...]
  }
}
```

---

### 5. 两种版本：提交版本 vs 编辑历史

**理解**：
- 提交版本（submitted）：用户点"提交"产生，永久保留
- 编辑版本（draft）：用户每次改动产生，下次提交后清空

**这是Google Doc风格的编辑历史！**

**实现方案**：

#### 修改work_versions表
```sql
ALTER TABLE work_versions
ADD COLUMN is_submitted BOOLEAN DEFAULT false,
ADD COLUMN parent_submission_version INT;  -- 属于哪个提交版本

-- 索引
CREATE INDEX idx_submitted_versions
ON work_versions(work_id, is_submitted, version_number DESC);
```

#### 版本类型
```
版本1 (submitted=true) - 用户点"提交"
  版本2 (submitted=false, parent=1) - 用户改了点东西
  版本3 (submitted=false, parent=1) - 又改了
  版本4 (submitted=false, parent=1) - 再改
版本5 (submitted=true) - 用户再次点"提交"
  [版本2,3,4被清理]
  版本6 (submitted=false, parent=5) - 新的编辑
```

#### 逻辑调整

**正常update（编辑）**：
```python
def update_work(work_id, user_email, content, device_id):
    work = get_work(work_id)

    # 找到最近的submitted版本
    last_submission = get_last_submitted_version(work_id)

    new_ver = work["current_version"] + 1
    insert_version(
        work_id,
        new_ver,
        content,
        is_submitted=False,
        parent_submission_version=last_submission["version_number"]
    )

    update_content(work_id, content)
    update_current_version(work_id, new_ver)
```

**提交（submit）**：
```python
def submit_work(work_id, user_email, content, device_id):
    work = get_work(work_id)
    new_ver = work["current_version"] + 1

    # 创建submitted版本
    insert_version(
        work_id,
        new_ver,
        content,
        is_submitted=True,
        parent_submission_version=None
    )

    # 清理上次提交后的所有draft版本
    last_submission = get_last_submitted_version(work_id)
    if last_submission:
        delete_draft_versions_after(work_id, last_submission["version_number"])

    update_content(work_id, content)
    update_current_version(work_id, new_ver)
```

#### 新API端点
```
POST /api/work/{work_id}/submit
Request: {
  "content": "提交的内容",
  "suggestion_actions": {...},  // 问题1的功能
  "device_id": "xxx"
}
Response: {
  "ok": true,
  "version": 10,
  "is_submitted": true
}
```

#### 查询版本
```
GET /api/work/{work_id}/versions?type=submitted
// 只返回提交版本

GET /api/work/{work_id}/versions?type=draft&parent=5
// 返回版本5之后的所有编辑历史

GET /api/work/{work_id}/versions?type=all
// 返回全部（前端可以做时间轴展示）
```

---

## 总结调整

基于你的需求，需要：

1. **新表**：`suggestion_resolutions`（记录用户对建议的操作）
2. **改表**：
   - `text_analyses` 加 `version_number`
   - `work_versions` 加 `is_submitted` 和 `parent_submission_version`
3. **新API**：
   - `POST /api/work/{work_id}/submit` （提交版本，不同于update）
   - `POST /api/llm/check-resolution` （检测问题是否解决）
4. **改API**：
   - `POST /api/llm/analyze` 加过滤已解决问题的逻辑
   - `GET /api/work/{work_id}/versions` 加type参数

**实施顺序调整**：
1. 先做版本系统（区分submitted/draft）
2. 再做分析功能
3. 最后做问题追踪和解决检测

你觉得这个方案怎么样？有问题随时说。


同事回答：
llm回传的json问题。针对细节修改，json估计需要一个"完成的很好"，"完全没有解决"，"解决了部分"，"新问题"，这种category，对应前端ui设计。同时，prompt要让ai非常非常严厉，strict。你觉得呢？
然后你可不可以写一个简明（但是完整）-只声明逻辑的落地计划给我，就在这个文档里先给我看。
先给我写功能集成，画个表格。然后告诉我落地方式（都要语言简单点哈，但是完整）

---

codex：

同意，改成4个状态：

```json
{
  "status": "excellent",  // excellent/partial/unsolved/new_issue
  "feedback": "一句话评价"
}
```

Prompt加严格标准，见下面。

---

## 功能集成表

| 功能模块 | API端点 | 说明 | 依赖 |
|---------|---------|------|------|
| **版本系统** | | | |
| 编辑保存 | `POST /api/work/{id}/update` | 保存draft版本，不提交 | - |
| 正式提交 | `POST /api/work/{id}/submit` | 提交版本，清理之前的draft | 版本表 |
| 版本列表 | `GET /api/work/{id}/versions` | 查询submitted或draft版本 | 版本表 |
| 版本详情 | `GET /api/work/{id}/versions/{num}` | 查看某版本+对应的AI分析 | 版本表+分析表 |
| 版本回滚 | `POST /api/work/{id}/revert` | 回滚到某版本（创建新draft） | 版本表 |
| **AI分析** | | | |
| 句子分析 | `POST /api/llm/analyze` | 分析文本，返回问题列表 | OpenAI API |
| 问题检测 | 内部调用 | submit时检测问题解决情况 | OpenAI API |
| **问题追踪** | | | |
| 标记问题 | submit时传参 | 用户标记rejected/resolved | 分析表 |
| 保存检测 | submit后自动 | 保存LLM检测结果 | 检测表 |

---

## 数据库表

| 表名 | 作用 | 关键字段 |
|------|------|---------|
| `works` | 主表 | +current_version |
| `work_versions` | 版本历史 | version_number, is_submitted, parent_submission_version, content |
| `text_analyses` | 分析结果 | work_id, version_number, analysis_result(JSONB) |
| `suggestion_resolutions` | 问题检测 | suggestion_id, user_action, resolution_status, llm_feedback |

---

## 落地方式

### 1. 建表（DDL）

```sql
-- works表加字段
ALTER TABLE works ADD COLUMN current_version INT DEFAULT 0;

-- 版本表
CREATE TABLE work_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    version_number INT NOT NULL,
    content TEXT NOT NULL,
    is_submitted BOOLEAN DEFAULT false,           -- 是否提交版本
    parent_submission_version INT,                -- 属于哪次提交
    change_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (work_id, version_number)
);
CREATE INDEX ON work_versions(work_id, version_number DESC);
CREATE INDEX ON work_versions(work_id, is_submitted);

-- 分析表
CREATE TABLE text_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    version_number INT,                            -- 关联版本号
    text_snapshot TEXT NOT NULL,
    analysis_result JSONB NOT NULL,                -- {suggestions: [...]}
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ON text_analyses(work_id, version_number);

-- 检测表
CREATE TABLE suggestion_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES text_analyses(id),
    suggestion_id VARCHAR(255) NOT NULL,
    from_version INT NOT NULL,                     -- 问题出现的版本
    to_version INT NOT NULL,                       -- 修改后的版本
    user_action VARCHAR(50) NOT NULL,              -- rejected/resolved
    original_text TEXT NOT NULL,
    new_text TEXT NOT NULL,
    resolution_status VARCHAR(50),                 -- excellent/partial/unsolved/new_issue
    llm_feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON suggestion_resolutions(work_id, analysis_id);
```

### 2. 文件结构

新增/修改这些文件：

```
backend/
├── storage/
│   ├── work_version/repo.py           [新增] 版本增删查
│   ├── text_analysis/repo.py          [新增] 分析增删查
│   └── suggestion_resolution/repo.py  [新增] 检测增删查
├── modules/
│   ├── work/
│   │   ├── manager.py                 [修改] update改造
│   │   └── version_manager.py         [新增] 版本管理逻辑
│   └── llm_gateway/
│       ├── analyzer.py                [新增] 调OpenAI分析
│       └── resolver.py                [新增] 调OpenAI检测
└── api/
    ├── work/
    │   ├── router.py                  [修改] 加submit
    │   └── schemas.py                 [修改] 加submit相关
    └── llm/
        ├── router.py                  [修改] 加analyze
        └── schemas.py                 [新增] analyze相关
```

### 3. 核心逻辑

#### update（编辑）

```python
def update_work(work_id, user_email, content, device_id):
    # 1. 检查锁
    # 2. 找最近的submitted版本作为parent
    # 3. 创建draft版本（is_submitted=false）
    # 4. 更新works表的content和current_version
    # 返回：{ok, version, is_submitted: false}
```

#### submit（提交）

```python
def submit_work(work_id, user_email, content, suggestion_actions, device_id):
    # 1. 检查锁
    # 2. 创建submitted版本（is_submitted=true）
    # 3. 删除上次提交后的所有draft版本
    # 4. 处理suggestion_actions：
    #    - rejected：忽略
    #    - resolved：调LLM检测，保存结果
    # 5. 更新works表
    # 返回：{ok, version, is_submitted: true}
```

#### analyze（分析）

```python
def analyze_text(work_id, user_email, text):
    # 1. 调OpenAI（用严格prompt）
    # 2. 解析suggestions
    # 3. 过滤掉已解决（excellent）的问题
    # 4. 保存到text_analyses（关联version_number）
    # 返回：{analysis_id, suggestions}
```

#### check_resolution（检测）

```python
def check_resolution(suggestion, original_text, new_text):
    # 1. 构造检测prompt
    # 2. 调OpenAI
    # 3. 解析返回：{status: excellent/partial/unsolved/new_issue, feedback}
    # 返回结果
```

### 4. Prompt

#### 分析（严格）

```python
ANALYZE_PROMPT = """你是严格的中文写作导师。找出真正有问题的地方。

标准：
- 只标注确实有问题的
- 每个问题<50字
- 准确位置（start_index, end_index）
- 分类：grammar/clarity/style/tone/logic/conciseness
- 程度：high必须改/medium建议改/low可选

返回JSON：
{
  "suggestions": [
    {
      "original_text": "...",
      "start_index": 0,
      "end_index": 10,
      "issue_type": "clarity",
      "severity": "medium",
      "title": "...",
      "description": "...",
      "suggestion": "...",
      "rewrite": "..."
    }
  ]
}

没问题返回[]。最多10条。

文本：{text}
"""
```

#### 检测（严厉）

```python
RESOLUTION_CHECK_PROMPT = """严格评判问题是否解决。

原问题：{issue_type} - {description}
原文："{original_text}"
新文："{new_text}"

标准（严格）：
- excellent: 完全解决，无可挑剔
- partial: 有改进但不够
- unsolved: 没改或没解决
- new_issue: 出现新错误

返回JSON：
{
  "status": "excellent",
  "feedback": "一句话"
}

不轻易给excellent。
"""
```

### 5. 实施步骤

**Week 1（3天）：版本系统**
- Day 1: 建表，写repo层
- Day 2: 改update逻辑，写submit逻辑
- Day 3: 版本查询API，测试

**Week 2（2天）：AI分析**
- Day 1: 写analyzer，调OpenAI，写analyze API
- Day 2: 过滤逻辑，关联版本，测试

**Week 3（2天）：问题追踪**
- Day 1: 写resolver，调OpenAI检测
- Day 2: 集成到submit，测试完整流程

**总计：7天**

---

清楚了吗？


同事：

版本要分两个，一个是1、每次submit的版本。一个是draft版本。draft版本前端的逻辑是，通过回滚进度条可以查看每一步。每打一个字没删除一个都会有。现在好像后端平台没有接。（回答就好，不用写计划书）

---

codex：

对，当前设计的draft版本是用户主动调update时才记录，不是每个字符变化。

要做到"每打一个字都记录"，有两个方案：

**方案A：前端高频调用update**
- 前端每隔2-3秒自动调一次`POST /api/work/{id}/update`
- 或者用户每打10个字调一次
- 优点：实现简单，后端不用改
- 缺点：请求量大，可能有性能问题

**方案B：前端本地缓存，提交时上传**
- 前端本地记录每个编辑操作（打字/删除/粘贴）
- 用户点submit时，把整个编辑历史一次性传给后端
- 后端批量写入draft版本
- 优点：减少请求，性能更好
- 缺点：前端逻辑复杂，本地存储可能丢失

**推荐方案A + 优化**：
```
1. 前端设置自动保存：
   - 用户停止输入3秒后，自动调update
   - 或者每输入50个字符调一次

2. 后端优化：
   - update接口加个参数 auto_save: true
   - 自动保存的版本不产生新version_number
   - 而是直接覆盖最新的draft版本
   - 只有用户主动"保存"或"提交"时才真正创建新版本

3. 结果：
   - 前端可以控制保存频率
   - 后端不会产生太多版本
   - 用户体验流畅
```

具体实现：
```python
def update_work(work_id, content, device_id, auto_save=False):
    if auto_save:
        # 自动保存：直接更新content，不创建新版本
        update_work_content(work_id, content)
    else:
        # 手动保存：创建新draft版本
        new_ver = current_version + 1
        insert_version(work_id, new_ver, content, is_submitted=False)
        update_current_version(work_id, new_ver)
```

这样可以吗？还是你想要真正的"每个字符都是一个版本"？

方案A可以的。我现在给你一个功能集成表，你看看是不是全部都落地了：

1、版本：版本分成两个 - 每次“submit”的版本永远存储（前端逻辑：查看第一次submit的版本，查看第二次submit的版本）。第二个是当前draft版本（submit后，之前draft版本全部删除。draft用你说的，三秒一次）
2、LLM：LLM要做两件事 - 1、生成总体FAO评论。这一个整体的评论现在已经有了，他的逻辑：用户修改之后，准备提交以前，可以选择写一段话：这次修改的思路、想法，针对他的建议做了哪些修改。（前端会做强提示，只针对fao的问题，不用写关于sentence comment的）2、精确到句子的给出句子的改进建议。（但是要有强约束：不给任何的修改后版本，只是建议）。用户直接进行修改，修改后，用户选择点击“拒绝”“修改完成”。如果点击修改完成，可以选择写100词以内的修改思路。有强约束：用户必须选择拒绝/修改完成，才能进行下一次提交。

第二次提交后，打开新的llm 窗口，只做如下事情：1、查看当前版本和上一个版本以及上一个版本的全部sentence comment，fao评论，用户自己写的修改思路。然后再做一次评价，但是要结合上一个版本和他的思考思路的评价。

3、prompt。prompt必须包含：你是非常有原则的招生官，非常非常非常严厉，同学们都很害怕你，但是并不讨厌你，因为你绝对客观，在学生做得好的时候真的会给出克制但是明确的表扬。这种东西

4、语言。你和我交流用中文，comment用中文，但是网站上全部英语。

5、到时候前端会有一个works页面，就是展示所有的works，用户点进一个works前端url就是after-word.org/works/work_id。然后还需要删除works的api端点。

---

codex功能层面的想法：

### 1. 版本逻辑
清楚了。submit版本永久存，draft版本submit时清空。这个已经设计好了。

### 2. LLM功能调整

**现有功能（保留）**：
- `/api/llm/comment` - 生成FAO整体评论

**调整点**：
- 去掉sentence comment的`rewrite`字段，只保留`suggestion`
- submit时必须强制处理所有未处理的suggestions（前端强制）

**新增功能**：
- submit时可以附带用户的reflection（修改思路）
- 第二次submit后的评价要看：
  - 上一版本内容
  - 上一版本的所有comments（FAO + sentence）
  - 用户的reflection
  - 当前版本内容
  - 然后生成**对比评价**

**数据结构调整**：

sentence suggestion去掉rewrite：
```json
{
  "id": "uuid",
  "original_text": "...",
  "start_index": 0,
  "end_index": 10,
  "issue_type": "clarity",
  "severity": "medium",
  "title": "表达不清",
  "description": "问题说明",
  "suggestion": "改进建议"
  // 不再有rewrite字段
}
```

submit时的reflection：
```json
POST /api/work/{id}/submit
{
  "content": "...",
  "suggestion_actions": {...},
  "user_reflection": "我这次主要改进了...",  // 新增，可选，100字内
  "device_id": "xxx"
}
```

第二次submit后的对比评价：
```json
POST /api/llm/compare-versions  // 新API
{
  "work_id": "uuid",
  "previous_version": 5,  // 上次submit的版本号
  "current_version": 10   // 当前版本号
}

Response:
{
  "comparison": {
    "overall_improvement": "good/partial/poor",
    "feedback": "这次修改...",
    "previous_issues_resolved": ["issue1解决得很好", "issue2还有问题"],
    "new_strengths": ["新的亮点1", "新的亮点2"],
    "remaining_issues": ["仍需改进的地方"]
  }
}
```

### 3. Prompt persona

好，加入严厉招生官persona。所有LLM相关的prompt都要加这个前缀：

```
你是一位非常有原则的大学招生官。你以严格著称，学生们都很敬畏你。
但他们并不讨厌你，因为你绝对客观、公正。
当学生确实做得好时，你会给出克制但明确的表扬。
你的标准很高，不轻易满意，但当学生达到标准时，你会真诚地认可。
```

然后接具体任务指令。

### 4. 语言

明白：
- comment内容：中文（因为是给中国学生看的）
- API字段名、前端UI：英文
- 我们讨论：中文

### 5. 删除works

新增API：
```
DELETE /api/work/{work_id}
```

逻辑：
- 检查权限（只能删自己的）
- 级联删除：work_versions, text_analyses, suggestion_resolutions
- 或者数据库已经设置了ON DELETE CASCADE

---

**功能上的疑问**：

1. **强制处理suggestions**：前端强制，后端要不要也检查？如果用户没处理完就submit，后端要不要拒绝？

2. **对比评价的触发时机**：是每次submit后自动生成，还是用户主动点"查看对比"？自动的话，第一次submit没有对比对象，要特殊处理。

3. **reflection的存储**：用户写的修改思路存在哪？建议加到work_versions表：
   ```sql
   ALTER TABLE work_versions ADD COLUMN user_reflection TEXT;
   ```

4. **FAO评论的时机**：现在是用户"修改后，准备提交前"可以写reflection并生成FAO评论。那FAO评论是在提交前还是提交时生成？还是用户手动点"生成FAO评论"？

这些点确认下？


1、comment也要英文，世界学生用的，就我们讲话用中文
2、对比评价是放在comment一起的。就是正常生成，放在comment一起。
3、可以
4、不是，fao和sentence comment是一起的。。。每次submit都是生成一次整体的评价，一次sentence。用户修改，然后写修改意见。我给一个例子：



这里我用x代表 essay正文，一行一句话（当然不需要一行一句，我这里只是为了方便展示）
1、提交后：

xxxxxxxxxxxxxxxxxx sentence comment
xxxxxx sentence comment
xxxxxx sentence comment
xxxxxxxx sentence comment
FAO comment


2、学生：
xxxxxx sentence comment 改进完成
xxxxx sentence comment 拒绝
xxxxx sentence comment 改进完成
xxxxx sentence comment 改进完成 （我觉得你的看法不对，但是有道理，我希望的逻辑是xxxx
FAO comment
改进：你说xxxx例子冗余，我不同意，但是你确实说得对，太占篇幅了，我缩短了。

3、第二次提交
xxxxxx sentence comment（你改进的非常非常好）
xxxx sentence comment （完全没有改进！你这个和之前没任何提升！，甚至更毁坏了文章结构）
xxxx sentence comment （可以，确实好了一些，你的逻辑可以。但是，按照你的逻辑看，这段太过于xxx）
fao comment：
**这里新加一个reflection comment**，只有当用户针对fao comment写了reflection之后才会出现。
reflection comment：你这次改动xxxxxx

---

codex理解：

明白了，完整流程是这样：

### 第一次submit
```
用户提交 → 后端生成：
- sentence comments (纯建议，无历史对比)
- FAO comment (整体评价)
```

### 用户改进阶段
用户必须处理所有sentence comments：
- 点"改进完成" (可选写100字想法)
- 点"拒绝"

用户可以对FAO comment写reflection (修改思路)

### 第二次submit
```
用户提交 → 后端生成：
- sentence comments (带历史对比！评价改的怎么样)
  - excellent: "改进非常好"
  - partial: "可以，好了一些，但还可以更xxx"
  - unsolved: "完全没改进！甚至更糟了！"
  - new_issue: "出现了新问题"

- FAO comment (新的整体评价)

- reflection comment (如果上次有reflection才出现)
  - 评价用户的修改思路和实际改进的匹配度
```

---

**功能关键点**：

1. **每次submit = 一次完整评价**
   - FAO comment (必有)
   - sentence comments (必有)
   - reflection comment (只有上次有reflection才有)

2. **sentence comment的进化**
   - 第1次：纯建议
   - 第2次起：建议 + 对上次改进的评价

3. **数据关联**
   ```
   version_5 (第1次submit)
     ├─ text_analysis_1
     │   ├─ sentence comments
     │   └─ FAO comment
     └─ user_reflection: null

   [用户改进，标记suggestions]

   version_10 (第2次submit)
     ├─ text_analysis_2
     │   ├─ sentence comments (含对version_5改进的评价)
     │   ├─ FAO comment
     │   └─ reflection comment (评价version_5的reflection)
     └─ user_reflection: "我改了xxx"
   ```

4. **API调整**
   ```
   POST /api/work/{id}/submit
   Request: {
     content: "...",
     suggestion_actions: {
       "suggestion_1": {
         action: "resolved",
         user_note: "我觉得你说得有道理，改成了xxx"  // 可选
       },
       "suggestion_2": {
         action: "rejected"
       }
     },
     fao_reflection: "你说例子冗余，我缩短了...",  // 可选
     device_id: "xxx"
   }

   后端逻辑：
   1. 创建submitted版本，存user_reflection
   2. 获取上次submit版本和它的分析结果
   3. 调LLM生成新评价：
      - 传入：当前文本、上次文本、上次comments、用户的actions、用户的reflection
      - 返回：新sentence comments、新FAO comment、reflection comment(如果有)
   4. 保存新的text_analysis
   ```

5. **LLM Prompt结构**
   ```python
   # 第一次submit（无历史）
   prompt = f"""
   {PERSONA}  # 严厉招生官

   评价这篇essay:
   {text}

   返回JSON:
   {{
     "sentence_comments": [...],
     "fao_comment": "..."
   }}
   """

   # 第二次及以后submit（有历史）
   prompt = f"""
   {PERSONA}

   上次版本：{prev_text}
   上次评价：{prev_comments}
   用户的修改说明：{user_actions + user_reflection}

   当前版本：{current_text}

   评价要求：
   1. 对每个上次的sentence comment，检查是否改进
   2. 生成新的sentence comments（包含改进评价）
   3. 生成新的FAO comment
   4. 评价用户的reflection（如果有）

   返回JSON:
   {{
     "sentence_comments": [
       {{
         "original_text": "...",
         "suggestion": "...",
         "improvement_feedback": "你改进得很好/没改/更糟了"  // 如果对应上次的comment
       }}
     ],
     "fao_comment": "...",
     "reflection_comment": "你这次的修改思路..."  // 如果上次有reflection
   }}
   """
   ```

对吗？

