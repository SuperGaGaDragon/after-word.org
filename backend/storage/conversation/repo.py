from typing import Any, Dict


def _build_query(sql: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Return a portable SQL contract for the caller to execute."""
    return {"sql": sql, "params": params}


def create_comment(work_id: str, user_email: str, content: str) -> Dict[str, Any]:
    sql = (
        "INSERT INTO conversations (id, work_id, user_email, role, content, created_at) "
        "VALUES (gen_random_uuid(), %(work_id)s, %(user_email)s, 'assistant', %(content)s, NOW()) "
        "RETURNING id"
    )
    params = {
        "work_id": work_id,
        "user_email": user_email,
        "content": content,
    }
    return _build_query(sql, params)


def list_comments(work_id: str, user_email: str) -> Dict[str, Any]:
    sql = (
        "SELECT id, work_id, user_email, role, content, created_at "
        "FROM conversations "
        "WHERE work_id = %(work_id)s AND user_email = %(user_email)s "
        "ORDER BY created_at ASC"
    )
    params = {"work_id": work_id, "user_email": user_email}
    return _build_query(sql, params)
