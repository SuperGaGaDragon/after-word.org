# Work Component Contract

## Functions
- create_work(user_email) -> work_id
- list_works(user_email) -> list[work]
- get_work(work_id, user_email) -> work
- update_work(work_id, user_email, content, device_id) -> ok

## Lock rules
- update_work must acquire_lock before update.
- If acquire fails, raise BusinessError("LOCKED").
- After update, refresh_lock.

## Boundaries
- Depends on Auth (identity only), Storage/Work, Session/Lock.
- Does not call LLM or write Conversation.
