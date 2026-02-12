# Phase 10 Integration Testing

## 🎯 Purpose

Comprehensive integration tests validating Phase 1-9 implementations:
- ✅ Database schema (Phase 1)
- ✅ Storage layer (Phase 2)
- ✅ Business layer (Phase 3)
- ✅ API layer (Phase 4)
- ✅ AI prompts (Phase 5)
- ✅ AI analyzer (Phase 6)
- ✅ AI integration (Phase 7)
- ✅ Suggestion tracking (Phase 8)
- ✅ Schema validation (Phase 9)

## 🚀 Running Tests

### Local Testing

```bash
# Ensure server is running
# In one terminal:
uvicorn backend.main:app --reload

# In another terminal:
python backend/test_integration.py
```

### Production Testing

```bash
# Test against deployed API
BASE_URL=https://api.after-word.org python backend/test_integration.py
```

## 📋 Test Coverage

### Test 01: User Signup
- Creates unique test user
- Validates token generation
- Validates user data return

### Test 02: User Login
- Tests login with email
- Validates token return

### Test 03-04: Work CRUD
- Creates new work
- Gets work details
- Validates initial state (empty content, version 0)

### Test 05: Auto-Save
- Updates content with `auto_save=true`
- Validates NO version created
- Content should be saved

### Test 06: Manual Save
- Updates content with `auto_save=false`
- Validates draft version created (version 1)

### Test 07: First Submission
- Submits work for AI evaluation
- Validates analysis_id returned
- Waits for AI processing

### Test 08: Get Analysis
- Retrieves version detail with analysis
- Validates FAO comment presence
- Validates sentence_comments structure
- Stores comment IDs for later use

### Test 09: Submit Without Marking (Should Fail)
- Attempts second submission without marking suggestions
- Validates rejection with `suggestions_not_processed` error

### Test 10: Submit With Marking
- Marks all suggestions (resolved/rejected)
- Provides FAO reflection
- Submits successfully
- Validates improvement_feedback in new analysis
- Validates reflection_comment presence

### Test 11: Version List
- Gets all versions
- Validates submitted vs draft versions
- Checks version count

### Test 12: Version Revert
- Reverts to first version
- Validates new draft created with old content

### Test 13: Delete Work
- Deletes work
- Validates cascade deletion (versions, analyses)
- Validates 404 on subsequent GET

### Test 14: Work List
- Gets user's work list
- Validates response structure

## ✅ Success Criteria

All 14 tests must pass with output:
```
✅ Tests completed: 14 passed, 0 failed
```

## 🔧 Troubleshooting

### Test Fails: "Connection refused"
- Ensure backend server is running
- Check `BASE_URL` is correct

### Test Fails: "LLM API error"
- Check OpenAI API key is valid
- Check account has sufficient credits
- Check network connectivity

### Test Fails: "suggestions_not_processed"
This is expected for Test 09 (negative test)
If Test 10 fails with this error, check:
- All sentence comment IDs are being marked
- suggestion_actions format is correct

### Test Fails: Database errors
- Ensure Phase 1 migration ran successfully
- Check all tables exist: works, work_versions, text_analyses, suggestion_resolutions

## 🧹 Cleanup

After successful deployment verification:

1. **Remove test code from main.py:**
   ```python
   # Delete lines 1-XX in main.py (marked with warning boxes)
   ```

2. **Remove test files:**
   ```bash
   git rm backend/test_integration.py
   git rm backend/TEST_PHASE10.md
   ```

3. **Commit:**
   ```bash
   git commit -m "Phase 10 completed - Remove integration test code"
   ```

## 📊 Expected Output

```
================================================================================
🧪 Starting Backend Integration Tests
================================================================================

🧪 Testing user signup...
✅ User created: test_abc123@test.com

🧪 Testing user login...
✅ Login successful

🧪 Testing work creation...
✅ Work created: 550e8400-e29b-41d4-a716-446655440000

🧪 Testing get work...
✅ Work details retrieved

🧪 Testing auto-save...
✅ Auto-save successful (no version created)

🧪 Testing manual save (draft version)...
✅ Draft version 1 created

🧪 Testing first submission with AI evaluation...
✅ First submission successful: version 2

🧪 Testing get analysis...
✅ Analysis retrieved: 3 sentence comments
✅ Sentence comment structure validated

🧪 Testing submit without marking suggestions (should fail)...
✅ Correctly rejected submit without marking

🧪 Testing second submission with suggestion actions...
✅ Second submission successful: version 3
✅ Reflection comment received
✅ Improvement feedback received

🧪 Testing version list...
✅ Version list retrieved: 4 total versions

🧪 Testing version revert...
✅ Reverted to version 2, created new version 4

🧪 Testing work deletion...
✅ Work deleted successfully

🧪 Testing work list...
✅ Work list retrieved: 0 works

================================================================================
Tests completed: 14 passed, 0 failed
================================================================================
```

## 🎯 Acceptance Criteria

Phase 10 is complete when:
- ✅ All 14 tests pass locally
- ✅ All 14 tests pass on Railway deployment
- ✅ No LLM API errors
- ✅ No database errors
- ✅ Test data is cleaned up
- ✅ Test code is removed from main.py
