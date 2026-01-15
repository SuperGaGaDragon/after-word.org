from typing import Any, Dict


def _build_query(sql: str) -> Dict[str, Any]:
    """Return a portable SQL contract for the caller to execute."""
    return {"sql": sql, "params": {}}


def list_users_basic() -> Dict[str, Any]:
    sql = "SELECT email, username, created_at FROM users ORDER BY created_at DESC"
    return _build_query(sql)
