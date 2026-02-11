from typing import Any, Dict


def _build_query(sql: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Return a portable SQL contract for the caller to execute."""
    return {"sql": sql, "params": params}


def create_work(user_email: str) -> Dict[str, Any]:
    sql = (
        "INSERT INTO works (id, user_email, content, updated_at, created_at) "
        "VALUES (gen_random_uuid(), %(user_email)s, '', NOW(), NOW()) "
        "RETURNING id"
    )
    return _build_query(sql, {"user_email": user_email})


def update_work_content(work_id: str, user_email: str, content: str) -> Dict[str, Any]:
    sql = (
        "UPDATE works SET content = %(content)s, updated_at = NOW() "
        "WHERE id = %(work_id)s AND user_email = %(user_email)s"
    )
    params = {
        "content": content,
        "work_id": work_id,
        "user_email": user_email,
    }
    return _build_query(sql, params)


def delete_work(work_id: str, user_email: str) -> Dict[str, Any]:
    """Delete a work (cascade deletes related records)."""
    sql = "DELETE FROM works WHERE id = %(work_id)s AND user_email = %(user_email)s"
    return _build_query(sql, {"work_id": work_id, "user_email": user_email})
