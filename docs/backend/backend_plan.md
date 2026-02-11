# After Word - 后端落地方案

## 数据库设计

### 修改现有表

```sql
-- works表加版本号
ALTER TABLE works ADD COLUMN current_version INT DEFAULT 0;
```

### 新表

```sql
-- 版本历史
CREATE TABLE work_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    version_number INT NOT NULL,
    content TEXT NOT NULL,
    is_submitted BOOLEAN DEFAULT false,
    parent_submission_version INT,
    user_reflection TEXT,
    change_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (work_id, version_number)
);
CREATE INDEX ON work_versions(work_id, version_number DESC);
CREATE INDEX ON work_versions(work_id, is_submitted);

-- AI分析结果
CREATE TABLE text_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    version_number INT NOT NULL,
    text_snapshot TEXT NOT NULL,
    fao_comment TEXT NOT NULL,
    sentence_comments JSONB NOT NULL,
    reflection_comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX ON text_analyses(work_id, version_number);

-- 用户对建议的处理
CREATE TABLE suggestion_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES text_analyses(id),
    suggestion_id VARCHAR(255) NOT NULL,
    from_version INT NOT NULL,
    to_version INT NOT NULL,
    user_action VARCHAR(50) NOT NULL,
    user_note TEXT,
    resolution_status VARCHAR(50),
    llm_feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON suggestion_resolutions(work_id, analysis_id);
```

---

## API端点

### 作品管理

```
POST   /api/work/create           创建work
GET    /api/work/list             查询work列表
GET    /api/work/{id}             查询work详情
POST   /api/work/{id}/update      编辑work（自动保存draft）
POST   /api/work/{id}/submit      提交work（创建submitted版本+触发AI评价）
DELETE /api/work/{id}             删除work
```

### 版本管理

```
GET    /api/work/{id}/versions                 查询版本列表
GET    /api/work/{id}/versions/{num}           查询版本详情
POST   /api/work/{id}/revert                   回滚到指定版本
```

### AI评价

```
POST   /api/llm/comment           生成FAO整体评论（已有，保留）
```
注：sentence comments在submit时自动生成，不单独提供API

---

## 核心逻辑

### 1. update（编辑）

```python
def update_work(work_id, user_email, content, device_id, auto_save=False):
    # 锁检查
    acquire_lock(work_id, device_id)

    if auto_save:
        # 自动保存：只更新content，不创建版本
        update_work_content(work_id, content)
    else:
        # 手动保存：创建draft版本
        last_submit = get_last_submitted_version(work_id)
        parent = last_submit["version_number"] if last_submit else None

        new_ver = current_version + 1
        insert_version(work_id, new_ver, content,
                      is_submitted=False,
                      parent_submission_version=parent,
                      change_type="draft_edit")

        update_work_content(work_id, content)
        update_current_version(work_id, new_ver)

    return {"ok": True, "version": new_ver}
```

### 2. submit（提交）

```python
def submit_work(work_id, user_email, content, suggestion_actions,
                fao_reflection, device_id):
    # 锁检查
    acquire_lock(work_id, device_id)

    # 创建submitted版本
    new_ver = current_version + 1
    insert_version(work_id, new_ver, content,
                  is_submitted=True,
                  user_reflection=fao_reflection,
                  change_type="submission")

    # 清理draft版本
    last_submit = get_last_submitted_version(work_id)
    if last_submit:
        delete_draft_versions_after(work_id, last_submit["version_number"])

    # 生成AI评价
    prev_analysis = get_analysis_by_version(work_id, last_submit["version_number"]) if last_submit else None

    analysis = generate_analysis(
        work_id=work_id,
        current_text=content,
        current_version=new_ver,
        previous_text=last_submit["content"] if last_submit else None,
        previous_analysis=prev_analysis,
        user_actions=suggestion_actions,
        user_reflection=fao_reflection
    )

    # 保存分析结果
    save_analysis(work_id, user_email, new_ver, analysis)

    # 处理用户标记的建议
    if suggestion_actions and prev_analysis:
        process_suggestion_resolutions(
            work_id, prev_analysis, suggestion_actions,
            last_submit["version_number"], new_ver
        )

    # 更新主表
    update_work_content(work_id, content)
    update_current_version(work_id, new_ver)

    return {"ok": True, "version": new_ver, "analysis_id": analysis["id"]}
```

### 3. generate_analysis（生成AI评价）

```python
def generate_analysis(work_id, current_text, current_version,
                     previous_text, previous_analysis,
                     user_actions, user_reflection):
    if not previous_text:
        # 第一次提交
        prompt = build_first_time_prompt(current_text)
    else:
        # 第二次及以后
        prompt = build_iterative_prompt(
            current_text, previous_text,
            previous_analysis, user_actions, user_reflection
        )

    response = call_openai(prompt)

    return {
        "fao_comment": response["fao_comment"],
        "sentence_comments": response["sentence_comments"],
        "reflection_comment": response.get("reflection_comment")
    }
```

### 4. process_suggestion_resolutions（处理建议标记）

```python
def process_suggestion_resolutions(work_id, prev_analysis, user_actions,
                                   from_version, to_version):
    for suggestion_id, action_data in user_actions.items():
        suggestion = find_suggestion(prev_analysis, suggestion_id)

        save_resolution(
            work_id=work_id,
            analysis_id=prev_analysis["id"],
            suggestion_id=suggestion_id,
            from_version=from_version,
            to_version=to_version,
            user_action=action_data["action"],
            user_note=action_data.get("note"),
            resolution_status=None,  # 在新分析中会有评价
            llm_feedback=None
        )
```

---

## LLM Prompts

### 第一次提交

```python
FIRST_TIME_PROMPT = """You are a strict but fair college admissions officer.
Students respect and fear you because of your high standards, but they don't
hate you because you are absolutely objective. When students truly excel,
you give restrained but clear praise.

Evaluate this essay:

{text}

Requirements:
1. Sentence-level comments (max 10):
   - Identify specific issues (grammar/clarity/style/tone/logic/conciseness)
   - Mark exact positions (start_index, end_index)
   - Rate severity (high/medium/low)
   - Provide improvement suggestions (NO rewrite)

2. Overall FAO comment:
   - Assess structure, logic, theme
   - Point out main strengths and weaknesses

Return JSON:
{{
  "sentence_comments": [
    {{
      "id": "uuid",
      "original_text": "...",
      "start_index": 0,
      "end_index": 10,
      "issue_type": "clarity",
      "severity": "medium",
      "title": "...",
      "description": "...",
      "suggestion": "..."
    }}
  ],
  "fao_comment": "..."
}}
"""
```

### 第二次及以后提交

```python
ITERATIVE_PROMPT = """You are a strict but fair college admissions officer...

Previous version:
{previous_text}

Previous evaluation:
- FAO comment: {prev_fao}
- Sentence comments: {prev_sentences}

Student's actions:
{user_actions}

Student's reflection on FAO comment:
{user_reflection}

Current version:
{current_text}

Task:
1. For each previous sentence comment marked as "resolved":
   - Check if truly improved
   - Rate: excellent/partial/unsolved/new_issue
   - Provide feedback

2. Identify new issues in current version

3. Generate new FAO comment

4. If student wrote reflection, evaluate it:
   - Was their thinking correct?
   - Did they actually follow through?
   - Any blind spots?

Return JSON:
{{
  "sentence_comments": [
    {{
      "id": "uuid",
      "original_text": "...",
      "start_index": 0,
      "end_index": 10,
      "issue_type": "clarity",
      "severity": "medium",
      "title": "...",
      "description": "...",
      "suggestion": "...",
      "improvement_feedback": "Excellent improvement! Much clearer now."
    }}
  ],
  "fao_comment": "...",
  "reflection_comment": "Your approach to shorten the example was correct..."
}}
"""
```

---

## 文件结构

```
backend/
├── storage/
│   ├── work/repo.py
│   ├── work_version/repo.py          [新增]
│   ├── text_analysis/repo.py         [新增]
│   └── suggestion_resolution/repo.py [新增]
├── modules/
│   ├── work/
│   │   ├── manager.py                [修改]
│   │   └── version_manager.py        [新增]
│   └── llm_gateway/
│       ├── client.py
│       ├── analyzer.py               [新增]
│       └── prompts.py                [新增]
└── api/
    ├── work/
    │   ├── router.py                 [修改]
    │   └── schemas.py                [修改]
    └── llm/
        ├── router.py
        └── schemas.py
```

---

## 实施步骤

### Week 1: 版本系统
1. 建表
2. 实现version_manager
3. 修改update逻辑（支持auto_save）
4. 实现submit逻辑（创建版本+清理draft）
5. 版本查询API
6. 测试

### Week 2: AI评价
1. 设计prompts（第一次+迭代）
2. 实现analyzer
3. 集成到submit
4. 保存分析结果
5. 测试

### Week 3: 建议追踪
1. 实现resolution保存
2. 在iterative prompt中包含历史
3. 测试完整流程
4. 优化prompt

**总计：3周**
