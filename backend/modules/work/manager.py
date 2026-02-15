import json
from typing import Any, Callable, Dict, Optional

from backend.errors import BusinessError
from backend.modules.llm_gateway import analyzer
from backend.modules.session_lock import lock as session_lock
from backend.modules.work import version_manager
from backend.modules.work.utils import count_words
from backend.storage.suggestion_resolution import repo as resolution_repo
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
    essay_prompt: Optional[str] = None,
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
        essay_prompt: Essay prompt/requirements (optional)

    Returns:
        Dict with 'ok' and 'version' (if created)
    """
    _ = get_work(work_id, user_email)
    if not session_lock.acquire_lock(work_id, device_id):
        raise BusinessError("locked", "work locked")

    # Calculate word count
    word_count = count_words(content)

    # Update content and word count in works table
    query = work_repo.update_work_content(work_id, user_email, content, word_count)
    _run(query)

    # Update essay prompt if provided
    if essay_prompt is not None:
        prompt_query = work_repo.update_essay_prompt(work_id, user_email, essay_prompt)
        _run(prompt_query)

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
    suggestion_actions: Optional[Dict[str, Dict[str, Any]]] = None,
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
        suggestion_actions: User's actions on previous suggestions
            Format: {"suggestion_id": {"action": "resolved|rejected", "user_note": "..."}}

    Returns:
        Dict with 'ok', 'version', and 'analysis_id'

    Raises:
        BusinessError: If validation fails (e.g., unprocessed suggestions)
    """
    work = get_work(work_id, user_email)
    essay_prompt = work.get("essay_prompt")  # Get essay prompt for LLM analysis

    if not session_lock.acquire_lock(work_id, device_id):
        raise BusinessError("locked", "work locked")

    # Get latest submission to clean up drafts
    latest_submission = version_manager.get_latest_submitted_version(work_id)

    # Validate suggestion actions (2nd+ submission)
    if latest_submission:
        _validate_suggestion_actions(work_id, latest_submission, suggestion_actions)

    # Create submitted version
    new_version = version_manager.create_submitted_version(
        work_id=work_id,
        user_email=user_email,
        content=content,
        user_reflection=user_reflection,
    )

    # Calculate word count
    word_count = count_words(content)

    # Update content and word count in works table
    query = work_repo.update_work_content(work_id, user_email, content, word_count)
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
        suggestion_actions=suggestion_actions,
        essay_prompt=essay_prompt,
    )

    return {
        "ok": True,
        "version": new_version,
        "analysis_id": analysis_id,
    }


def _validate_suggestion_actions(
    work_id: str,
    previous_submission: Dict[str, Any],
    suggestion_actions: Optional[Dict[str, Dict[str, Any]]],
) -> None:
    """
    Validate that all previous suggestions have been processed.

    For 2nd+ submissions, all sentence comments must be marked as resolved/rejected.

    Args:
        work_id: Work ID
        previous_submission: Previous submitted version
        suggestion_actions: User's actions on suggestions

    Raises:
        BusinessError: If any suggestions are unprocessed
    """
    prev_version_num = previous_submission.get("version_number")

    # Get previous analysis
    prev_analysis_query = analysis_repo.get_analysis_by_version(work_id, prev_version_num)
    prev_analysis_result = _run(prev_analysis_query)

    if not prev_analysis_result:
        # No previous analysis means no suggestions to validate
        return

    previous_sentence_comments = prev_analysis_result.get("sentence_comments", [])

    if not previous_sentence_comments:
        # No suggestions to validate
        return

    # Check if all suggestions are marked
    if not suggestion_actions:
        raise BusinessError(
            "suggestions_not_processed",
            f"You must process all {len(previous_sentence_comments)} suggestions before resubmitting. "
            f"Mark each as 'resolved' or 'rejected'."
        )

    # Get all suggestion IDs from previous analysis
    previous_suggestion_ids = {c.get("id") for c in previous_sentence_comments if c.get("id")}

    # Get marked suggestion IDs from user actions
    marked_suggestion_ids = set(suggestion_actions.keys())

    # Find unprocessed suggestions
    unprocessed = previous_suggestion_ids - marked_suggestion_ids

    if unprocessed:
        raise BusinessError(
            "suggestions_not_processed",
            f"You must process all suggestions before resubmitting. "
            f"Unprocessed suggestions: {len(unprocessed)} out of {len(previous_suggestion_ids)}. "
            f"Mark each as 'resolved' or 'rejected'."
        )

    print(f"[WORK MANAGER] All {len(previous_suggestion_ids)} suggestions processed")


def _generate_and_save_analysis(
    work_id: str,
    user_email: str,
    current_version: int,
    current_content: str,
    previous_submission: Optional[Dict[str, Any]],
    user_reflection: Optional[str],
    suggestion_actions: Optional[Dict[str, Dict[str, Any]]],
    essay_prompt: Optional[str],
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
        essay_prompt: Essay prompt/requirements provided by user

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

            # Get rubric from work table (not from text_analyses)
            work_data = get_work(work_id, user_email)
            if work_data.get("rubric"):
                try:
                    previous_analysis["rubric"] = json.loads(work_data.get("rubric"))
                    print(f"[WORK MANAGER] Loaded rubric from work for iterative analysis")
                except (json.JSONDecodeError, TypeError) as e:
                    print(f"[WORK MANAGER] Failed to parse rubric from work: {e}")
                    previous_analysis["rubric"] = None

    # Generate analysis using AI
    analysis = analyzer.generate_analysis(
        work_id=work_id,
        current_text=current_content,
        current_version=current_version,
        previous_text=previous_text,
        previous_analysis=previous_analysis,
        user_actions=suggestion_actions,
        user_reflection=user_reflection,
        essay_prompt=essay_prompt,
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
        rubric_evaluation=json.dumps(analysis["rubric_evaluation"]) if "rubric_evaluation" in analysis else None,
    )

    result = _run(save_query)
    if not result or not result.get("id"):
        raise BusinessError("analysis_save_failed", "Failed to save analysis to database")

    analysis_id = result["id"]
    print(f"[WORK MANAGER] Analysis saved: {analysis_id}")

    # Save rubric to works table (first submission only)
    if not previous_submission and "rubric" in analysis:
        rubric_json = json.dumps(analysis["rubric"])
        rubric_query = work_repo.update_rubric(work_id, rubric_json)
        _run(rubric_query)
        print(f"[WORK MANAGER] Rubric saved to work {work_id}")

    # Save suggestion resolutions (if this is 2nd+ submission)
    if previous_submission and suggestion_actions:
        _save_suggestion_resolutions(
            work_id=work_id,
            analysis_id=analysis_id,
            from_version=previous_submission.get("version_number"),
            to_version=current_version,
            suggestion_actions=suggestion_actions,
        )

    return analysis_id


def _save_suggestion_resolutions(
    work_id: str,
    analysis_id: str,
    from_version: int,
    to_version: int,
    suggestion_actions: Dict[str, Dict[str, Any]],
) -> None:
    """
    Save user's actions on suggestions to suggestion_resolutions table.

    Args:
        work_id: Work ID
        analysis_id: Previous analysis ID
        from_version: Previous version number
        to_version: Current version number
        suggestion_actions: User's actions on suggestions
    """
    for suggestion_id, action_data in suggestion_actions.items():
        action = action_data.get("action", "")
        user_note = action_data.get("user_note")

        # Validate action
        if action not in ["resolved", "rejected"]:
            print(f"[WORK MANAGER] Warning: Invalid action '{action}' for suggestion {suggestion_id}")
            continue

        # Save resolution
        save_query = resolution_repo.create_resolution(
            work_id=work_id,
            analysis_id=analysis_id,
            suggestion_id=suggestion_id,
            from_version=from_version,
            to_version=to_version,
            user_action=action,
            user_note=user_note,
            resolution_status=None,  # Will be evaluated by LLM in improvement_feedback
            llm_feedback=None,
        )

        _run(save_query)

    print(f"[WORK MANAGER] Saved {len(suggestion_actions)} suggestion resolutions")


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
