from typing import Any, Dict


def _build_query(sql: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Return a portable SQL contract for the caller to execute."""
    return {"sql": sql, "params": params}


def get_work(work_id: str, user_email: str) -> Dict[str, Any]:
    sql = (
        "SELECT id, user_email, content, updated_at, created_at, current_version, word_count, essay_prompt, title "
        "FROM works WHERE id = %(work_id)s AND user_email = %(user_email)s"
    )
    params = {"work_id": work_id, "user_email": user_email}
    return _build_query(sql, params)


def list_works(user_email: str) -> Dict[str, Any]:
    sql = (
        "SELECT id, user_email, content, updated_at, created_at, word_count, title "
        "FROM works WHERE user_email = %(user_email)s "
        "ORDER BY updated_at DESC"
    )
    return _build_query(sql, {"user_email": user_email})


def get_total_word_count(user_email: str) -> Dict[str, Any]:
    """Get total word count across all works for a user."""
    sql = (
        "SELECT COALESCE(SUM(word_count), 0) as total_word_count "
        "FROM works WHERE user_email = %(user_email)s"
    )
    return _build_query(sql, {"user_email": user_email})


def get_total_project_count(user_email: str) -> Dict[str, Any]:
    """Get total number of projects (works) for a user."""
    sql = (
        "SELECT COUNT(*) as total_project_count "
        "FROM works WHERE user_email = %(user_email)s"
    )
    return _build_query(sql, {"user_email": user_email})
