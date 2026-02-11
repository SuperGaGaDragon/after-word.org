# After Word - Frontend Product Design & API Usage

## Page Structure

```
/                          Landing page
/auth/signup               Sign up
/auth/login                Login
/works                     Works list
/works/{work_id}           Work editor
/works/{work_id}/versions  Version history
```

---

## 1. Landing Page

**Path:** `/`

**Purpose:** Marketing page, introduce product

**API Calls:** None

---

## 2. Sign Up

**Path:** `/auth/signup`

**UI Elements:**
- Email input
- Username input
- Password input
- Submit button

**Flow:**
1. User fills form
2. Click submit
3. Call API
4. On success: Redirect to `/works`

**API Call:**
```javascript
POST /api/auth/signup
{
  email, username, password
}
→ Store token in localStorage
→ Navigate to /works
```

---

## 3. Login

**Path:** `/auth/login`

**UI Elements:**
- Email/Username input
- Password input
- Submit button

**Flow:**
1. User fills form
2. Click submit
3. Call API
4. On success: Redirect to `/works`

**API Call:**
```javascript
POST /api/auth/login
{
  email_or_username, password
}
→ Store token in localStorage
→ Navigate to /works
```

---

## 4. Works List

**Path:** `/works`

**UI Elements:**
- "New Work" button
- List of works (title, last updated)
- Delete button for each work

**On Load:**
```javascript
GET /api/work/list
→ Display list
```

**Create New Work:**
```javascript
POST /api/work/create
→ Navigate to /works/{work_id}
```

**Delete Work:**
```javascript
DELETE /api/work/{work_id}
→ Refresh list
```

---

## 5. Work Editor (Main Page)

**Path:** `/works/{work_id}`

**Layout:**
```
+----------------------------------+----------------------------------+
|                                  |                                  |
|         Essay Editor             |       AI Evaluation Panel        |
|         (Left Panel)             |       (Right Panel)              |
|                                  |                                  |
|  - Text editor                   |  - FAO Comment                   |
|  - Word count                    |  - Sentence Comments             |
|  - Submit button                 |  - Reflection Comment            |
|  - Version slider                |  - Action buttons                |
|                                  |                                  |
+----------------------------------+----------------------------------+
```

### 5.1 Initial Load

```javascript
// Get work content
GET /api/work/{work_id}
→ Display in editor
→ Show current_version

// Get latest submitted version's analysis
GET /api/work/{work_id}/versions?type=submitted
→ Get latest submitted version number

GET /api/work/{work_id}/versions/{version_number}
→ Display analysis in right panel
```

### 5.2 Auto-Save (Every 3 seconds)

```javascript
// User types...
// After 3 seconds of no input:

POST /api/work/{work_id}/update
{
  content: editor.content,
  device_id: getDeviceId(),
  auto_save: true
}
→ Silent save, no UI feedback
```

### 5.3 Manual Save (Optional)

```javascript
// User clicks "Save Draft"

POST /api/work/{work_id}/update
{
  content: editor.content,
  device_id: getDeviceId(),
  auto_save: false
}
→ Show "Draft version X created"
```

### 5.4 Submit Work

**First Submission:**

UI Flow:
1. User clicks "Submit"
2. Show confirmation dialog
3. Optional: Write FAO reflection
4. Confirm

```javascript
POST /api/work/{work_id}/submit
{
  content: editor.content,
  suggestion_actions: null,  // First time, no previous suggestions
  fao_reflection: reflection_text || null,
  device_id: getDeviceId()
}
→ Show loading
→ On response: Display analysis in right panel
```

**Second+ Submission:**

UI Flow:
1. Check all sentence comments are marked (resolved/rejected)
2. If not all marked: Show warning, block submit
3. User clicks "Submit"
4. Show dialog with optional FAO reflection
5. Confirm

```javascript
// Validate: All suggestions must be marked
const unprocessed = sentenceComments.filter(c => !c.userAction)
if (unprocessed.length > 0) {
  alert("Please process all sentence comments")
  return
}

POST /api/work/{work_id}/submit
{
  content: editor.content,
  suggestion_actions: {
    "uuid1": { action: "resolved", user_note: "..." },
    "uuid2": { action: "rejected" }
  },
  fao_reflection: reflection_text || null,
  device_id: getDeviceId()
}
→ Show loading
→ On response: Display new analysis
→ Clear all previous markings
```

### 5.5 Sentence Comments UI

**Display:**
- Highlight text in editor based on start_index/end_index
- Different colors by severity (red=high, orange=medium, blue=low)
- Click highlighted text → Show comment detail in right panel

**Action Buttons (per comment):**
- "Mark as Resolved" button
  - On click: Show modal for optional note (100 words max)
  - Save marking locally (not sent to API yet)
- "Reject" button
  - On click: Mark as rejected locally

**Data Structure:**
```javascript
{
  sentenceComments: [
    {
      ...comment_data,
      userAction: null | "resolved" | "rejected",
      userNote: null | "text"
    }
  ]
}
```

### 5.6 FAO Comment UI

**Display:**
- Full text of FAO comment
- "Write Reflection" button

**Reflection Dialog:**
- Textarea (no word limit shown, but recommend <200 words)
- Save button (stores locally, sent on submit)

### 5.7 Reflection Comment UI

**Display:**
- Only shown if present in analysis
- Styled differently (e.g., blue background)
- Shows AI's evaluation of user's previous reflection

---

## 6. Version History

**Path:** `/works/{work_id}/versions`

**UI Elements:**
- Timeline/list of all submitted versions
- Each version shows:
  - Version number
  - Date
  - Content preview
  - "View" button
  - "Revert to this" button

**On Load:**
```javascript
GET /api/work/{work_id}/versions?type=submitted
→ Display timeline
```

**View Version:**
```javascript
GET /api/work/{work_id}/versions/{version_number}
→ Show modal with:
  - Full content
  - Analysis (FAO + Sentence comments + Reflection comment)
```

**Revert:**
```javascript
// User clicks "Revert to version X"
// Show confirmation

POST /api/work/{work_id}/revert
{
  target_version: X,
  device_id: getDeviceId()
}
→ Navigate back to /works/{work_id}
→ Editor shows reverted content
```

---

## 7. Draft History Slider (In Editor)

**UI:** Slider at bottom of editor

**Purpose:** Show edit history within current submission cycle

**On Load:**
```javascript
// Get current submission
GET /api/work/{work_id}/versions?type=submitted
→ Get latest submitted version number as parent

// Get drafts after this submission
GET /api/work/{work_id}/versions?type=draft&parent={parent_version}
→ Populate slider with draft versions
```

**Slider Interaction:**
```javascript
// User drags slider to version Y
GET /api/work/{work_id}/versions/{Y}
→ Show content in editor (read-only mode)
→ User can revert if desired
```

---

## 8. Settings Page (Future)

**Path:** `/settings`

**Features:**
- Change password: `POST /api/auth/change_password`
- Change username: `POST /api/auth/change_username`
- Delete account (future)

---

## State Management

### Global State

```javascript
{
  user: {
    id, email, username, token
  },
  currentWork: {
    work_id,
    content,
    current_version,
    is_dirty: false  // Has unsaved changes
  },
  currentAnalysis: {
    analysis_id,
    fao_comment,
    sentence_comments: [
      {
        ...comment,
        userAction: null | "resolved" | "rejected",
        userNote: null | "text"
      }
    ],
    reflection_comment
  },
  faoReflection: null | "text"
}
```

### Local Storage

```javascript
{
  token: "jwt_token",
  device_id: "uuid",  // Generated once, persisted
  draft_work_{work_id}: {  // Auto-save draft before submitting
    content,
    timestamp
  }
}
```

---

## Error Handling

### 401 Unauthorized
- Clear token
- Redirect to `/auth/login`

### 423 Locked (Work being edited elsewhere)
- Show banner: "This work is being edited on another device"
- Switch to read-only mode
- Retry acquiring lock every 30 seconds

### 429 Rate Limit (Analysis)
- Show message: "You've reached analysis limit. Try again in X minutes"
- Disable submit button temporarily

### 500 Server Error
- Show error message
- Retry button

---

## Performance Optimizations

### Debouncing
- Auto-save: 3 seconds after last keystroke
- Search (future): 300ms debounce

### Caching
- Cache work list for 1 minute
- Cache version history until user submits

### Optimistic Updates
- Update UI immediately for:
  - Marking sentence comments
  - Writing reflection
- If API fails, rollback

---

## Keyboard Shortcuts

- `Cmd/Ctrl + S`: Manual save draft
- `Cmd/Ctrl + Enter`: Submit (if all comments processed)
- `Cmd/Ctrl + Z`: Undo in editor
- `Cmd/Ctrl + Shift + Z`: Redo in editor

---

## Mobile Considerations

### Responsive Design
- Stack editor and analysis panel vertically on mobile
- Collapsible analysis panel
- Touch-friendly buttons

### Auto-Save Frequency
- Increase to 5 seconds on mobile (save battery)

---

## Future Enhancements

### Collaboration (Not in V1)
- Share work with others
- Real-time co-editing
- Comments from human reviewers

### Export (Not in V1)
- Export as PDF
- Export as DOCX
- Email submission

### Analytics (Not in V1)
- Track improvement over time
- Visualize common issues
- Progress dashboard
