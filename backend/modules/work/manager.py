import json
from typing import Any, Callable, Dict, Optional

from backend.errors import BusinessError
from backend.modules.llm_gateway import analyzer
from backend.modules.session_lock import lock as session_lock
from backend.modules.work import version_manager
from backend.storage.text_analysis import repo as analysis_repo
from backend.storage.work import repo as work_repo
from backend.storage.work_retrieve import repo as work_retrieve_repo

Query = Dict[str, Any]
QueryExecutor = Callable[[Query], Any]

_EXECUTOR: Optional[QueryExecutor] = None


def set_query_executor(executor: QueryExecutor) -> None:
    """Configure the storage executor used by Work operations."""
    global _EXECUTOR
    _EXECUTOR = executor
    # Also configure version_manager
    version_manager.set_query_executor(executor)


def _run(query: Query) -> Any:
    if _EXECUTOR is None:
        return None
    return _EXECUTOR(query)


def create_work(user_email: str) -> Optional[str]:
    query = work_repo.create_work(user_email)
    result = _run(query) or {}
    return result.get("id")


def list_works(user_email: str) -> Any:
    query = work_retrieve_repo.list_works(user_email)
    return _run(query) or []


def get_work(work_id: str, user_email: str) -> Any:
    query = work_retrieve_repo.get_work(work_id, user_email)
    result = _run(query)
    if result is None:
        raise BusinessError("not_found", "work not found")
    return result


def update_work(
    work_id: str,
    user_email: str,
    content: str,
    device_id: str,
    auto_save: bool = True,
) -> Dict[str, Any]:
    """
    Update work content.

    Args:
        work_id: Work ID
        user_email: User email
        content: Updated content
        device_id: Device ID for locking
        auto_save: If True, only update content without creating version.
                   If False, create a new draft version.

    Returns:
        Dict with 'ok' and 'version' (if created)
    """
    _ = get_work(work_id, user_email)
    if not session_lock.acquire_lock(work_id, device_id):
        raise BusinessError("locked", "work locked")

    # Update content in works table
    query = work_repo.update_work_content(work_id, user_email, content)
    _run(query)

    result = {"ok": True}

    # Create version if not auto_save
    if not auto_save:
        # Get latest submitted version to determine parent
        latest_submission = version_manager.get_latest_submitted_version(work_id)
        parent_version = (
            latest_submission.get("version_number") if latest_submission else None
        )

        # Create draft version
        new_version = version_manager.create_draft_version(
            work_id=work_id,
            user_email=user_email,
            content=content,
            parent_submission_version=parent_version,
        )
        result["version"] = new_version

    session_lock.refresh_lock(work_id, device_id)
    return result


def submit_work(
    work_id: str,
    user_email: str,
    content: str,
    device_id: str,
    user_reflection: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Submit work for evaluation.

    Creates a submitted version and cleans up draft versions.

    Args:
        work_id: Work ID
        user_email: User email
        content: Final content to submit
        device_id: Device ID for locking
        user_reflection: Optional user's reflection on FAO comment

    Returns:
        Dict with 'ok', 'version', and eventually 'analysis_id'
    """
    _ = get_work(work_id, user_email)
    if not session_lock.acquire_lock(work_id, device_id):
        raise BusinessError("locked", "work locked")

    # Get latest submission to clean up drafts
    latest_submission = version_manager.get_latest_submitted_version(work_id)

    # Create submitted version
    new_version = version_manager.create_submitted_version(
        work_id=work_id,
        user_email=user_email,
        content=content,
        user_reflection=user_reflection,
    )

    # Update content in works table
    query = work_repo.update_work_content(work_id, user_email, content)
    _run(query)

    # Clean up draft versions after previous submission
    if latest_submission:
        parent_version = latest_submission.get("version_number")
        version_manager.delete_draft_versions_after_submission(work_id, parent_version)

    session_lock.refresh_lock(work_id, device_id)

    # Generate AI analysis
    analysis_id = _generate_and_save_analysis(
        work_id=work_id,
        user_email=user_email,
        current_version=new_version,
        current_content=content,
        previous_submission=latest_submission,
        user_reflection=user_reflection,
    )

    return {
        "ok": True,
        "version": new_version,
        "analysis_id": analysis_id,
    }


def _generate_and_save_analysis(
    work_id: str,
    user_email: str,
    current_version: int,
    current_content: str,
    previous_submission: Optional[Dict[str, Any]],
    user_reflection: Optional[str],
) -> str:
    """
    Generate AI analysis and save to database.

    Args:
        work_id: Work ID
        user_email: User email
        current_version: Current version number
        current_content: Current essay content
        previous_submission: Previous submitted version (None for first time)
        user_reflection: User's reflection on previous FAO comment

    Returns:
        analysis_id: ID of created analysis record

    Raises:
        BusinessError: If analysis generation or saving fails
    """
    # Get previous analysis if this is not first submission
    previous_text = None
    previous_analysis = None

    if previous_submission:
        prev_version_num = previous_submission.get("version_number")
        previous_text = previous_submission.get("content")

        # Get previous analysis
        prev_analysis_query = analysis_repo.get_analysis_by_version(work_id, prev_version_num)
        prev_analysis_result = _run(prev_analysis_query)

        if prev_analysis_result:
            previous_analysis = {
                "fao_comment": prev_analysis_result.get("fao_comment"),
                "sentence_comments": prev_analysis_result.get("sentence_comments"),
            }

    # Generate analysis using AI
    analysis = analyzer.generate_analysis(
        work_id=work_id,
        current_text=current_content,
        current_version=current_version,
        previous_text=previous_text,
        previous_analysis=previous_analysis,
        user_actions=None,  # TODO: Phase 8 - Parse from request
        user_reflection=user_reflection,
    )

    # Save analysis to database
    sentence_comments_json = json.dumps(analysis["sentence_comments"])

    save_query = analysis_repo.create_analysis(
        work_id=work_id,
        user_email=user_email,
        version_number=current_version,
        text_snapshot=current_content,
        fao_comment=analysis["fao_comment"],
        sentence_comments=sentence_comments_json,
        reflection_comment=analysis.get("reflection_comment"),
    )

    result = _run(save_query)
    if not result or not result.get("id"):
        raise BusinessError("analysis_save_failed", "Failed to save analysis to database")

    analysis_id = result["id"]
    print(f"[WORK MANAGER] Analysis saved: {analysis_id}")

    return analysis_id


def delete_work(work_id: str, user_email: str) -> bool:
    """
    Delete a work (cascade deletes versions, analyses, resolutions).

    Args:
        work_id: Work ID
        user_email: User email for authorization

    Returns:
        True if successful
    """
    # Verify ownership
    _ = get_work(work_id, user_email)

    # Delete work (cascade will handle related tables)
    query = work_repo.delete_work(work_id, user_email)
    _run(query)

    return True
