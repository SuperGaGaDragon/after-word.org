from typing import Any, Dict, Optional


def _build_query(sql: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Return a portable SQL contract for the caller to execute."""
    return {"sql": sql, "params": params}


def create_analysis(
    work_id: str,
    user_email: str,
    version_number: int,
    text_snapshot: str,
    fao_comment: str,
    sentence_comments: str,  # JSON string
    reflection_comment: Optional[str],
) -> Dict[str, Any]:
    """Create a new text analysis record."""
    sql = (
        "INSERT INTO text_analyses "
        "(work_id, user_email, version_number, text_snapshot, "
        "fao_comment, sentence_comments, reflection_comment, created_at) "
        "VALUES (%(work_id)s, %(user_email)s, %(version_number)s, %(text_snapshot)s, "
        "%(fao_comment)s, %(sentence_comments)s::jsonb, %(reflection_comment)s, NOW()) "
        "RETURNING id, created_at"
    )
    params = {
        "work_id": work_id,
        "user_email": user_email,
        "version_number": version_number,
        "text_snapshot": text_snapshot,
        "fao_comment": fao_comment,
        "sentence_comments": sentence_comments,
        "reflection_comment": reflection_comment,
    }
    return _build_query(sql, params)


def get_analysis_by_version(work_id: str, version_number: int) -> Dict[str, Any]:
    """Get analysis for a specific version."""
    sql = (
        "SELECT id, work_id, user_email, version_number, text_snapshot, "
        "fao_comment, sentence_comments, reflection_comment, created_at "
        "FROM text_analyses "
        "WHERE work_id = %(work_id)s AND version_number = %(version_number)s"
    )
    return _build_query(sql, {"work_id": work_id, "version_number": version_number})


def get_analysis_by_id(analysis_id: str) -> Dict[str, Any]:
    """Get analysis by ID."""
    sql = (
        "SELECT id, work_id, user_email, version_number, text_snapshot, "
        "fao_comment, sentence_comments, reflection_comment, created_at "
        "FROM text_analyses "
        "WHERE id = %(analysis_id)s"
    )
    return _build_query(sql, {"analysis_id": analysis_id})


def get_latest_analysis(work_id: str) -> Dict[str, Any]:
    """Get the most recent analysis for a work."""
    sql = (
        "SELECT id, work_id, user_email, version_number, text_snapshot, "
        "fao_comment, sentence_comments, reflection_comment, created_at "
        "FROM text_analyses "
        "WHERE work_id = %(work_id)s "
        "ORDER BY version_number DESC LIMIT 1"
    )
    return _build_query(sql, {"work_id": work_id})
