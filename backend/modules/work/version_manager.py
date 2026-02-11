"""
Business logic for work version management.

Handles version creation, submission, and rollback operations.
"""

from typing import Any, Callable, Dict, Optional

from backend.errors import BusinessError
from backend.storage.work_version import repo as version_repo

Query = Dict[str, Any]
QueryExecutor = Callable[[Query], Any]

_EXECUTOR: Optional[QueryExecutor] = None


def set_query_executor(executor: QueryExecutor) -> None:
    """Configure the storage executor used by version operations."""
    global _EXECUTOR
    _EXECUTOR = executor


def _run(query: Query) -> Any:
    if _EXECUTOR is None:
        return None
    return _EXECUTOR(query)


def get_current_version_number(work_id: str) -> int:
    """Get current version number for a work."""
    query = version_repo.get_current_version_number(work_id)
    result = _run(query)
    if result is None:
        return 0
    return result.get("current_version", 0)


def get_latest_submitted_version(work_id: str) -> Optional[Dict[str, Any]]:
    """Get the most recent submitted version for a work."""
    query = version_repo.get_latest_submitted_version(work_id)
    return _run(query)


def create_draft_version(
    work_id: str,
    user_email: str,
    content: str,
    parent_submission_version: Optional[int],
) -> int:
    """
    Create a new draft version.

    Returns the new version number.
    """
    # Get current version and increment
    current_version = get_current_version_number(work_id)
    new_version = current_version + 1

    # Create version record
    query = version_repo.create_version(
        work_id=work_id,
        user_email=user_email,
        version_number=new_version,
        content=content,
        is_submitted=False,
        parent_submission_version=parent_submission_version,
        user_reflection=None,
        change_type="draft_edit",
    )
    _run(query)

    # Update current_version in works table
    update_query = version_repo.update_current_version(work_id, new_version)
    _run(update_query)

    return new_version


def create_submitted_version(
    work_id: str,
    user_email: str,
    content: str,
    user_reflection: Optional[str],
) -> int:
    """
    Create a new submitted version.

    Returns the new version number.
    """
    # Get current version and increment
    current_version = get_current_version_number(work_id)
    new_version = current_version + 1

    # Create version record
    query = version_repo.create_version(
        work_id=work_id,
        user_email=user_email,
        version_number=new_version,
        content=content,
        is_submitted=True,
        parent_submission_version=None,  # Submitted versions don't have parent
        user_reflection=user_reflection,
        change_type="submission",
    )
    _run(query)

    # Update current_version in works table
    update_query = version_repo.update_current_version(work_id, new_version)
    _run(update_query)

    return new_version


def delete_draft_versions_after_submission(
    work_id: str, parent_submission_version: int
) -> None:
    """Delete all draft versions created after a specific submission."""
    query = version_repo.delete_draft_versions_after(work_id, parent_submission_version)
    _run(query)


def get_version_list(
    work_id: str,
    version_type: Optional[str] = None,
    parent_version: Optional[int] = None,
) -> list:
    """
    Get version list for a work.

    Args:
        work_id: Work ID
        version_type: 'submitted', 'draft', or None for all
        parent_version: Filter drafts by parent submission version
    """
    is_submitted = None
    if version_type == "submitted":
        is_submitted = True
    elif version_type == "draft":
        is_submitted = False

    query = version_repo.get_versions_by_work(
        work_id=work_id,
        is_submitted=is_submitted,
        parent_submission_version=parent_version,
    )
    return _run(query) or []


def get_version_detail(work_id: str, version_number: int) -> Optional[Dict[str, Any]]:
    """Get detailed information for a specific version."""
    query = version_repo.get_version(work_id, version_number)
    result = _run(query)
    if result is None:
        raise BusinessError("not_found", "version not found")
    return result


def revert_to_version(
    work_id: str,
    user_email: str,
    target_version: int,
    device_id: str,
) -> int:
    """
    Revert work to a previous version by creating a new draft.

    Returns the new version number.
    """
    # Get target version content
    target = get_version_detail(work_id, target_version)
    if target is None:
        raise BusinessError("not_found", f"version {target_version} not found")

    target_content = target.get("content", "")

    # Get parent submission version
    latest_submission = get_latest_submitted_version(work_id)
    parent_version = (
        latest_submission.get("version_number") if latest_submission else None
    )

    # Create new draft version with reverted content
    new_version = create_draft_version(
        work_id=work_id,
        user_email=user_email,
        content=target_content,
        parent_submission_version=parent_version,
    )

    return new_version
