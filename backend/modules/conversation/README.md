# Conversation Component Contract

## Functions
- add_comment(work_id, user_email, content) -> comment_id
- list_comments(work_id, user_email) -> list[comment]

## Rules
- Validate work ownership using Work component.
- Only write role='assistant' comments.

## Boundaries
- Depends on Auth, Work (validation only), Storage/Conversation.
- Does not call LLM directly.
