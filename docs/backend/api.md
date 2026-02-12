# After Word API Documentation

**Base URL:** `https://api.after-word.org`

---

## Authentication

All endpoints except signup/login require JWT authentication:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth

#### POST /api/auth/signup
Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

---

#### POST /api/auth/login
Login with email or username.

**Request:**
```json
{
  "email_or_username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

---

#### POST /api/auth/change_password
Change user password (requires auth).

**Request:**
```json
{
  "old_password": "old",
  "new_password": "new",
  "new_password_confirm": "new"
}
```

**Response:**
```json
{
  "ok": true
}
```

---

#### POST /api/auth/change_username
Change username (requires auth).

**Request:**
```json
{
  "new_username": "new_name"
}
```

**Response:**
```json
{
  "ok": true
}
```

---

### Works

#### POST /api/work/create
Create new work.

**Request:** Empty body

**Response:**
```json
{
  "work_id": "uuid"
}
```

---

#### GET /api/work/list
Get all works for current user.

**Response:**
```json
{
  "items": [
    {
      "work_id": "uuid",
      "created_at": "2026-02-11T09:00:00Z",
      "updated_at": "2026-02-11T10:00:00Z",
      "word_count": 1247
    }
  ]
}
```

---

#### GET /api/work/total_word_count
Get total word count across all user's works.

**Response:**
```json
{
  "total_word_count": 3542
}
```

---

#### GET /api/work/total_project_count
Get total number of projects (works) for the user.

**Response:**
```json
{
  "total_project_count": 5
}
```

---

#### GET /api/work/{work_id}
Get work details.

**Response:**
```json
{
  "work_id": "uuid",
  "content": "essay content...",
  "current_version": 5,
  "created_at": "2026-02-11T09:00:00Z",
  "updated_at": "2026-02-11T10:00:00Z",
  "word_count": 1247,
  "essay_prompt": "Describe a time when you overcame a challenge"
}
```

---

#### POST /api/work/{work_id}/update
Update work content (auto-save draft).

**Request:**
```json
{
  "content": "updated content",
  "device_id": "device_uuid",
  "auto_save": false
}
```

**Response:**
```json
{
  "ok": true,
  "version": 6
}
```

**auto_save**:
- `false` (default): Create new draft version
- `true`: Update content only, no new version

---

#### POST /api/work/{work_id}/submit
Submit work (create submitted version + trigger AI evaluation).

**Request:**
```json
{
  "content": "final content",
  "suggestion_actions": {
    "suggestion_uuid_1": {
      "action": "resolved",
      "user_note": "I shortened the example as suggested"
    },
    "suggestion_uuid_2": {
      "action": "rejected"
    }
  },
  "fao_reflection": "I focused on making the logic clearer...",
  "device_id": "device_uuid"
}
```

**Response:**
```json
{
  "ok": true,
  "version": 10,
  "analysis_id": "uuid"
}
```

**suggestion_actions**: Required from 2nd submission onwards. Each unresolved suggestion must be marked.

**fao_reflection**: Optional. User's reflection on FAO comment.

---

#### DELETE /api/work/{work_id}
Delete work.

**Response:**
```json
{
  "ok": true
}
```

---

### Versions

#### GET /api/work/{work_id}/versions
Get version history.

**Query params:**
- `type`: `all` (default), `submitted`, `draft`
- `parent`: If type=draft, specify parent submission version

**Response:**
```json
{
  "current_version": 10,
  "versions": [
    {
      "version_number": 10,
      "content_preview": "First 100 characters...",
      "is_submitted": true,
      "change_type": "submission",
      "created_at": "2026-02-11T10:00:00Z"
    },
    {
      "version_number": 9,
      "is_submitted": false,
      "change_type": "draft_edit",
      "created_at": "2026-02-11T09:58:00Z"
    }
  ]
}
```

---

#### GET /api/work/{work_id}/versions/{version_number}
Get specific version details.

**Response:**
```json
{
  "version_number": 5,
  "content": "full content...",
  "is_submitted": true,
  "user_reflection": "I improved the structure...",
  "change_type": "submission",
  "created_at": "2026-02-11T10:00:00Z",
  "analysis": {
    "analysis_id": "uuid",
    "fao_comment": "Overall assessment...",
    "sentence_comments": [...],
    "reflection_comment": "Your approach was correct..."
  }
}
```

**analysis**: Only present for submitted versions.

---

#### POST /api/work/{work_id}/revert
Revert to specific version.

**Request:**
```json
{
  "target_version": 5,
  "device_id": "device_uuid"
}
```

**Response:**
```json
{
  "ok": true,
  "new_version": 11
}
```

Note: Creates new draft version with target version's content.

---

### AI Evaluation

#### POST /api/llm/comment
Generate overall FAO comment (kept for backward compatibility).

**Request:**
```json
{
  "work_id": "uuid",
  "text_snapshot": "essay content..."
}
```

**Response:**
```json
{
  "comment": "Overall assessment..."
}
```

Note: In new workflow, FAO comment is generated automatically on submit.

---

## Data Structures

### Sentence Comment

```json
{
  "id": "uuid",
  "original_text": "The problematic text",
  "start_index": 45,
  "end_index": 65,
  "issue_type": "clarity",
  "severity": "medium",
  "title": "Unclear expression",
  "description": "The meaning is ambiguous...",
  "suggestion": "Be more specific about...",
  "improvement_feedback": "Excellent improvement! Much clearer now."
}
```

**issue_type**: `grammar`, `clarity`, `style`, `tone`, `logic`, `conciseness`

**severity**: `high`, `medium`, `low`

**improvement_feedback**: Only present from 2nd submission onwards, for previously marked suggestions.

### Analysis

```json
{
  "analysis_id": "uuid",
  "work_id": "uuid",
  "version_number": 5,
  "fao_comment": "Overall assessment...",
  "sentence_comments": [
    // Array of Sentence Comment objects
  ],
  "reflection_comment": "Your modification approach...",
  "created_at": "2026-02-11T10:00:00Z"
}
```

**reflection_comment**: Only present if user wrote reflection in previous submission.

---

## Error Responses

All errors follow this format:

```json
{
  "code": "error_code",
  "message": "Human readable message"
}
```

**Common error codes:**
- `unauthorized` - Invalid or missing token
- `not_found` - Resource not found
- `locked` - Work is being edited by another device
- `validation_failed` - Invalid input
- `llm_failed` - LLM API error

---

## Rate Limits

- Analysis generation: 10 requests/hour per user
- Other endpoints: No strict limits (fair use policy)
