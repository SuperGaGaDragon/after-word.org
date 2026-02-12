# Backend Implementation Plan

## 1. 目标
- 实现版本系统（提交版本 + 草稿版本）
- 实现AI迭代评价（FAO + Sentence + Reflection）
- 实现建议追踪（用户标记 + LLM检测）

## 2. 技术栈
- FastAPI
- PostgreSQL
- OpenAI API (gpt-3.5-turbo)
- Railway 部署。github推送后，railway会自动部署。

## 3. 开发顺序

### Phase 1: 数据库

**任务：**
1. 修改 `works` 表，加 `current_version` 字段
2. 创建 `work_versions` 表（版本历史）
3. 创建 `text_analyses` 表（AI评价结果）
4. 创建 `suggestion_resolutions` 表（建议处理记录）

**验收：**
- [x] 所有表创建成功
- [x] 能插入测试数据
- [x] 索引已创建

---

### Phase 2: 版本系统 - Storage层

**任务：**
1. 创建 `backend/storage/work_version/repo.py`
2. 创建 `backend/storage/text_analysis/repo.py`
3. 创建 `backend/storage/suggestion_resolution/repo.py`
4. 实现基础CRUD操作

**验收：**
- [x] 能创建版本记录
- [x] 能查询版本列表
- [x] 能查询单个版本
- [x] 能删除draft版本

---

### Phase 3: 版本系统 - Business层

**任务：**
1. 创建 `backend/modules/work/version_manager.py`
2. 修改 `backend/modules/work/manager.py` 的 `update_work`
3. 实现 `submit_work` 函数
4. 实现版本回滚逻辑

**验收：**
- [x] update支持auto_save参数
- [x] auto_save=true时不创建版本
- [x] auto_save=false时创建draft版本
- [x] submit时创建submitted版本
- [x] submit时清理旧draft版本
- [x] 能回滚到任意版本

---

### Phase 4: 版本系统 - API层

**任务：**
1. 修改 `backend/api/work/router.py`
   - update端点加auto_save参数
   - 新增submit端点
   - 新增delete端点
2. 新增版本相关端点：
   - `GET /api/work/{id}/versions`
   - `GET /api/work/{id}/versions/{num}`
   - `POST /api/work/{id}/revert`
3. 更新 `backend/api/work/schemas.py`

**验收：**
- [x] 能通过API创建draft版本
- [x] 能通过API提交
- [x] 能通过API查询版本列表
- [x] 能通过API查看版本详情
- [x] 能通过API回滚
- [x] 能通过API删除work

---

### Phase 5: AI评价 - Prompts

**任务：**
1. 创建 `backend/modules/llm_gateway/prompts.py`
2. 实现第一次提交的prompt模板
3. 实现迭代提交的prompt模板
4. 加入严厉招生官persona

**验收：**
- [x] 第一次prompt包含：分析要求
- [x] 迭代prompt包含：历史对比要求
- [x] Prompt是英文
- [x] Persona正确

---

### Phase 6: AI评价 - Analyzer

**任务：**
1. 创建 `backend/modules/llm_gateway/analyzer.py`
2. 实现 `generate_analysis` 函数
3. 处理第一次 vs 迭代两种情况
4. 解析OpenAI响应

**验收：**
- [x] 第一次生成FAO + sentence comments
- [x] 迭代生成带improvement_feedback
- [x] 有reflection时生成reflection_comment
- [x] 解析JSON正确
- [x] 错误处理完善

---

### Phase 7: AI评价 - 集成

**任务：**
1. 在 `submit_work` 中调用analyzer
2. 保存分析结果到数据库
3. 返回analysis_id

**验收：**
- [x] Submit自动触发AI评价
- [x] 分析结果正确保存
- [x] 关联到正确的版本号
- [x] API返回analysis数据

---

### Phase 8: 建议追踪

**任务：**
1. 解析submit请求中的suggestion_actions
2. 验证第二次+提交时所有建议已处理
3. 保存用户处理记录
4. 在迭代prompt中包含历史

**验收：**
- [x] 能解析用户标记
- [x] 未处理完会拒绝提交（第二次+）
- [x] 用户标记正确保存
- [x] LLM收到完整历史
- [x] improvement_feedback准确

---

### Phase 9: Schema更新

**任务：**
1. 创建SubmitRequest schema
2. 创建AnalysisResponse schema
3. 创建VersionListResponse schema
4. 更新所有相关schema

**验收：**
- [ ] 请求验证正确
- [ ] 响应格式正确
- [ ] 文档字符串清晰

---

### Phase 10: 测试

**任务：**
1. 写单元测试（版本逻辑）
2. 写集成测试（完整流程）
3. 手动测试完整用户流程

**验收：**
- [ ] 单元测试全过
- [ ] 集成测试全过
- [ ] 能完成：创建→提交→改进→再提交→查看版本

---

### Phase 11: 部署

**任务：**
1. 在Railway执行DDL
2. 推送代码
3. 验证部署
4. Smoke test

**验收：**
- [ ] 数据库表已创建
- [ ] 代码部署成功
- [ ] 能注册/登录
- [ ] 能创建work
- [ ] 能提交并收到AI评价
- [ ] 能查看版本历史

---

## 4. 完成标准

- [ ] 用户能提交work多次
- [ ] AI给出迭代式反馈
- [ ] 版本历史完整可查
- [ ] 能回滚到任意版本
