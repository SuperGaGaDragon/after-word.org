from typing import Any, Dict, Optional


def _build_query(sql: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Return a portable SQL contract for the caller to execute."""
    return {"sql": sql, "params": params}


def create_resolution(
    work_id: str,
    analysis_id: str,
    suggestion_id: str,
    from_version: int,
    to_version: int,
    user_action: str,
    user_note: Optional[str],
    resolution_status: Optional[str],
    llm_feedback: Optional[str],
) -> Dict[str, Any]:
    """Create a new suggestion resolution record."""
    sql = (
        "INSERT INTO suggestion_resolutions "
        "(work_id, analysis_id, suggestion_id, from_version, to_version, "
        "user_action, user_note, resolution_status, llm_feedback, created_at) "
        "VALUES (%(work_id)s, %(analysis_id)s, %(suggestion_id)s, %(from_version)s, "
        "%(to_version)s, %(user_action)s, %(user_note)s, %(resolution_status)s, "
        "%(llm_feedback)s, NOW()) "
        "RETURNING id, created_at"
    )
    params = {
        "work_id": work_id,
        "analysis_id": analysis_id,
        "suggestion_id": suggestion_id,
        "from_version": from_version,
        "to_version": to_version,
        "user_action": user_action,
        "user_note": user_note,
        "resolution_status": resolution_status,
        "llm_feedback": llm_feedback,
    }
    return _build_query(sql, params)


def get_resolutions_by_analysis(analysis_id: str) -> Dict[str, Any]:
    """Get all resolutions for a specific analysis."""
    sql = (
        "SELECT id, work_id, analysis_id, suggestion_id, from_version, to_version, "
        "user_action, user_note, resolution_status, llm_feedback, created_at "
        "FROM suggestion_resolutions "
        "WHERE analysis_id = %(analysis_id)s "
        "ORDER BY created_at"
    )
    return _build_query(sql, {"analysis_id": analysis_id})


def get_resolutions_by_work(work_id: str) -> Dict[str, Any]:
    """Get all resolutions for a specific work."""
    sql = (
        "SELECT id, work_id, analysis_id, suggestion_id, from_version, to_version, "
        "user_action, user_note, resolution_status, llm_feedback, created_at "
        "FROM suggestion_resolutions "
        "WHERE work_id = %(work_id)s "
        "ORDER BY from_version, created_at"
    )
    return _build_query(sql, {"work_id": work_id})


def get_resolutions_between_versions(
    work_id: str, from_version: int, to_version: int
) -> Dict[str, Any]:
    """Get resolutions between two specific versions."""
    sql = (
        "SELECT id, work_id, analysis_id, suggestion_id, from_version, to_version, "
        "user_action, user_note, resolution_status, llm_feedback, created_at "
        "FROM suggestion_resolutions "
        "WHERE work_id = %(work_id)s "
        "AND from_version = %(from_version)s "
        "AND to_version = %(to_version)s "
        "ORDER BY created_at"
    )
    params = {
        "work_id": work_id,
        "from_version": from_version,
        "to_version": to_version,
    }
    return _build_query(sql, params)
