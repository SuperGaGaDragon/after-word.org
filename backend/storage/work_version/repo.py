from typing import Any, Dict, Optional


def _build_query(sql: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Return a portable SQL contract for the caller to execute."""
    return {"sql": sql, "params": params}


def create_version(
    work_id: str,
    user_email: str,
    version_number: int,
    content: str,
    is_submitted: bool,
    parent_submission_version: Optional[int],
    user_reflection: Optional[str],
    change_type: str,
) -> Dict[str, Any]:
    """Create a new work version record."""
    sql = (
        "INSERT INTO work_versions "
        "(work_id, user_email, version_number, content, is_submitted, "
        "parent_submission_version, user_reflection, change_type, created_at) "
        "VALUES (%(work_id)s, %(user_email)s, %(version_number)s, %(content)s, "
        "%(is_submitted)s, %(parent_submission_version)s, %(user_reflection)s, "
        "%(change_type)s, NOW()) "
        "RETURNING id, version_number, created_at"
    )
    params = {
        "work_id": work_id,
        "user_email": user_email,
        "version_number": version_number,
        "content": content,
        "is_submitted": is_submitted,
        "parent_submission_version": parent_submission_version,
        "user_reflection": user_reflection,
        "change_type": change_type,
    }
    return _build_query(sql, params)


def get_versions_by_work(
    work_id: str,
    is_submitted: Optional[bool] = None,
    parent_submission_version: Optional[int] = None,
) -> Dict[str, Any]:
    """Get version list for a work, optionally filtered by type."""
    conditions = ["work_id = %(work_id)s"]
    params: Dict[str, Any] = {"work_id": work_id}

    if is_submitted is not None:
        conditions.append("is_submitted = %(is_submitted)s")
        params["is_submitted"] = is_submitted

    if parent_submission_version is not None:
        conditions.append("parent_submission_version = %(parent_submission_version)s")
        params["parent_submission_version"] = parent_submission_version

    where_clause = " AND ".join(conditions)

    sql = (
        f"SELECT id, work_id, user_email, version_number, "
        f"LEFT(content, 100) as content_preview, is_submitted, "
        f"parent_submission_version, change_type, created_at "
        f"FROM work_versions "
        f"WHERE {where_clause} "
        f"ORDER BY version_number DESC"
    )
    return _build_query(sql, params)


def get_version(work_id: str, version_number: int) -> Dict[str, Any]:
    """Get a specific version by work_id and version_number."""
    sql = (
        "SELECT id, work_id, user_email, version_number, content, "
        "is_submitted, parent_submission_version, user_reflection, "
        "change_type, created_at "
        "FROM work_versions "
        "WHERE work_id = %(work_id)s AND version_number = %(version_number)s"
    )
    return _build_query(sql, {"work_id": work_id, "version_number": version_number})


def get_latest_submitted_version(work_id: str) -> Dict[str, Any]:
    """Get the most recent submitted version for a work."""
    sql = (
        "SELECT id, work_id, user_email, version_number, content, "
        "is_submitted, parent_submission_version, user_reflection, "
        "change_type, created_at "
        "FROM work_versions "
        "WHERE work_id = %(work_id)s AND is_submitted = true "
        "ORDER BY version_number DESC LIMIT 1"
    )
    return _build_query(sql, {"work_id": work_id})


def delete_draft_versions_after(work_id: str, parent_version: int) -> Dict[str, Any]:
    """Delete all draft versions after a specific parent submission version."""
    sql = (
        "DELETE FROM work_versions "
        "WHERE work_id = %(work_id)s "
        "AND is_submitted = false "
        "AND parent_submission_version = %(parent_version)s"
    )
    return _build_query(sql, {"work_id": work_id, "parent_version": parent_version})


def get_current_version_number(work_id: str) -> Dict[str, Any]:
    """Get the current version number for a work."""
    sql = "SELECT current_version FROM works WHERE id = %(work_id)s"
    return _build_query(sql, {"work_id": work_id})


def update_current_version(work_id: str, version_number: int) -> Dict[str, Any]:
    """Update the current_version field in works table."""
    sql = (
        "UPDATE works SET current_version = %(version_number)s, updated_at = NOW() "
        "WHERE id = %(work_id)s"
    )
    return _build_query(sql, {"work_id": work_id, "version_number": version_number})
