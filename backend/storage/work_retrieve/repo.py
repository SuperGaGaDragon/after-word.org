from typing import Any, Dict


def _build_query(sql: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Return a portable SQL contract for the caller to execute."""
    return {"sql": sql, "params": params}


def get_work(work_id: str, user_email: str) -> Dict[str, Any]:
    sql = (
        "SELECT id, user_email, content, updated_at, created_at "
        "FROM works WHERE id = %(work_id)s AND user_email = %(user_email)s"
    )
    params = {"work_id": work_id, "user_email": user_email}
    return _build_query(sql, params)


def list_works(user_email: str) -> Dict[str, Any]:
    sql = (
        "SELECT id, user_email, content, updated_at, created_at "
        "FROM works WHERE user_email = %(user_email)s "
        "ORDER BY updated_at DESC"
    )
    return _build_query(sql, {"user_email": user_email})
