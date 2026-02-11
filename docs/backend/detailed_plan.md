# After Word - Detailed Implementation Plan

## Phase 1: Database Setup

### 1.1 Modify Existing Tables
- Add `current_version INT DEFAULT 0` to `works` table

### 1.2 Create work_versions Table
- Store all versions (submitted + draft)
- Include `is_submitted`, `parent_submission_version`, `user_reflection` fields

### 1.3 Create text_analyses Table
- Store AI evaluation results
- Include `fao_comment`, `sentence_comments JSONB`, `reflection_comment`

### 1.4 Create suggestion_resolutions Table
- Track user actions on suggestions
- Store resolution status and LLM feedback

### Acceptance:
1. All tables created successfully
2. Can insert/query test data
3. Indexes created on key fields

---

## Phase 2: Version System Backend

### 2.1 Create Storage Layer
- `backend/storage/work_version/repo.py` - CRUD operations
- `backend/storage/text_analysis/repo.py` - CRUD operations
- `backend/storage/suggestion_resolution/repo.py` - CRUD operations

### 2.2 Create Version Manager
- `backend/modules/work/version_manager.py` - version business logic

### 2.3 Modify update_work Logic
- Support `auto_save` parameter
- Create draft versions when `auto_save=false`

### 2.4 Implement submit_work Function
- Create submitted version
- Delete previous draft versions
- Trigger AI evaluation

### 2.5 Add Version Query APIs
- `GET /api/work/{id}/versions` - list versions
- `GET /api/work/{id}/versions/{num}` - get version detail

### 2.6 Add Revert API
- `POST /api/work/{id}/revert` - revert to target version

### 2.7 Add Delete API
- `DELETE /api/work/{id}` - delete work

### Acceptance:
1. Can create draft versions via update
2. Can submit and auto-delete drafts
3. Can query version history
4. Can revert to any version
5. Can delete work

---

## Phase 3: AI Evaluation System

### 3.1 Create Prompts Module
- `backend/modules/llm_gateway/prompts.py` - store prompt templates
- First-time submission prompt
- Iterative submission prompt

### 3.2 Create Analyzer Module
- `backend/modules/llm_gateway/analyzer.py` - generate evaluations
- Parse OpenAI responses
- Handle first vs iterative cases

### 3.3 Integrate with Submit
- Call analyzer in `submit_work`
- Save analysis to `text_analyses` table
- Return analysis in submit response

### 3.4 Update Schemas
- Add submit request/response schemas
- Add analysis response schemas

### Acceptance:
1. First submission generates FAO + sentence comments
2. Second+ submission includes improvement feedback
3. Reflection comment generated when applicable
4. Analysis saved to database

---

## Phase 4: Suggestion Tracking

### 4.1 Parse Suggestion Actions
- Extract user actions from submit request
- Validate all suggestions processed (2nd+ submission)

### 4.2 Save Resolutions
- Store user actions and notes
- Link to analysis and versions

### 4.3 Pass History to LLM
- Include previous analysis in prompt
- Include user actions and notes
- Generate improvement feedback

### Acceptance:
1. User actions saved correctly
2. LLM receives full history
3. Improvement feedback accurate
4. Rejected suggestions not re-flagged

---

## Phase 5: API Layer

### 5.1 Update Work Router
- Add `auto_save` to update endpoint
- Add submit endpoint
- Add delete endpoint

### 5.2 Create Version Router
- Add versions list endpoint
- Add version detail endpoint
- Add revert endpoint

### 5.3 Update Schemas
- Create SubmitRequest schema
- Create VersionListResponse schema
- Create AnalysisResponse schema

### Acceptance:
1. All endpoints documented in API docs
2. Request/response validation working
3. Error handling proper
4. Authentication checked

---

## Phase 6: Testing

### 6.1 Unit Tests
- Test version creation logic
- Test draft deletion logic
- Test AI prompt building

### 6.2 Integration Tests
- Test full submit flow
- Test version history flow
- Test revert flow

### 6.3 End-to-End Test
- Create work
- Submit 3 times with different actions
- Verify all data correct

### Acceptance:
1. All unit tests pass
2. Integration tests pass
3. Can complete full workflow without errors

---

## Phase 7: Deployment

### 7.1 Run Migrations
- Execute DDL on production DB
- Verify tables created

### 7.2 Deploy Backend
- Push to Railway
- Verify deployment success

### 7.3 Smoke Test
- Test signup/login
- Test create/submit work
- Test AI evaluation

### Acceptance:
1. Production DB updated
2. Backend deployed
3. All critical paths working

---

## Implementation Order

**Week 1**: Phase 1, 2 (Database + Version System)
**Week 2**: Phase 3, 4 (AI Evaluation + Tracking)
**Week 3**: Phase 5, 6, 7 (API + Testing + Deploy)

**Total: 3 weeks**

---

## Critical Path

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

Cannot start Phase N+1 without completing Phase N.

---

## Rollback Plan

If deployment fails:
1. Revert Railway deployment
2. Keep DB changes (backwards compatible)
3. Fix issues locally
4. Redeploy

---

## Success Metrics

- [ ] User can submit work multiple times
- [ ] AI provides iterative feedback
- [ ] Version history fully functional
- [ ] No data loss on failures
- [ ] API response time < 3s (AI evaluation < 30s)
