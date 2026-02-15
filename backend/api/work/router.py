from datetime import datetime

from fastapi import APIRouter, Depends

from backend.api.auth.deps import require_user
from backend.api.work.schemas import (
    OkResponse,
    RenameWorkRequest,
    RenameWorkResponse,
    RevertRequest,
    RevertResponse,
    TotalProjectCountResponse,
    TotalWordCountResponse,
    VersionDetailResponse,
    VersionListItem,
    VersionListResponse,
    WorkCreateResponse,
    WorkGetResponse,
    WorkListItem,
    WorkListResponse,
    WorkSubmitRequest,
    WorkSubmitResponse,
    WorkUpdateRequest,
    WorkUpdateResponse,
)
from backend.errors import BusinessError
from backend.modules.work import version_manager
from backend.modules.work.manager import (
    create_work,
    delete_work,
    get_work,
    list_works,
    submit_work,
    update_work,
)
from backend.storage.text_analysis import repo as analysis_repo
from backend.storage.work_retrieve import repo as work_retrieve_repo

router = APIRouter(prefix="/api/work", tags=["work"])


def _format_updated_at(value: object) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    raise BusinessError("validation_failed", "invalid updated_at")


@router.post("/create", response_model=WorkCreateResponse)
def create_work_route(user: dict = Depends(require_user)) -> WorkCreateResponse:
    work_id = create_work(user["email"])
    return WorkCreateResponse(work_id=work_id or "")


@router.get("/list", response_model=WorkListResponse)
def list_works_route(user: dict = Depends(require_user)) -> WorkListResponse:
    works = list_works(user["email"]) or []
    items = [
        WorkListItem(
            work_id=work.get("id", ""),
            title=work.get("title", ""),
            created_at=_format_updated_at(work.get("created_at")),
            updated_at=_format_updated_at(work.get("updated_at")),
            word_count=work.get("word_count", 0)
        )
        for work in works
    ]
    return WorkListResponse(items=items)


@router.get("/total_word_count", response_model=TotalWordCountResponse)
def get_total_word_count_route(user: dict = Depends(require_user)) -> TotalWordCountResponse:
    """Get total word count across all user's works."""
    from backend.storage.db import execute_query

    query = work_retrieve_repo.get_total_word_count(user["email"])
    result = execute_query(query)
    total = result.get("total_word_count", 0) if result else 0

    return TotalWordCountResponse(total_word_count=total)


@router.get("/total_project_count", response_model=TotalProjectCountResponse)
def get_total_project_count_route(user: dict = Depends(require_user)) -> TotalProjectCountResponse:
    """Get total number of projects (works) for the user."""
    from backend.storage.db import execute_query

    query = work_retrieve_repo.get_total_project_count(user["email"])
    result = execute_query(query)
    total = result.get("total_project_count", 0) if result else 0

    return TotalProjectCountResponse(total_project_count=total)


@router.get("/{work_id}", response_model=WorkGetResponse)
def get_work_route(work_id: str, user: dict = Depends(require_user)) -> WorkGetResponse:
    work = get_work(work_id, user["email"])

    # Parse rubric from JSON string if present
    rubric = None
    if work.get("rubric"):
        try:
            import json
            rubric = json.loads(work.get("rubric"))
        except (json.JSONDecodeError, TypeError):
            rubric = None

    return WorkGetResponse(
        work_id=work.get("id", ""),
        title=work.get("title", ""),
        content=work.get("content", ""),
        current_version=work.get("current_version", 0),
        created_at=_format_updated_at(work.get("created_at")),
        updated_at=_format_updated_at(work.get("updated_at")),
        word_count=work.get("word_count", 0),
        essay_prompt=work.get("essay_prompt"),
        rubric=rubric,
    )


@router.post("/{work_id}/update", response_model=WorkUpdateResponse)
def update_work_route(
    work_id: str, payload: WorkUpdateRequest, user: dict = Depends(require_user)
) -> WorkUpdateResponse:
    result = update_work(
        work_id, user["email"], payload.content, payload.device_id, payload.auto_save, payload.essay_prompt
    )
    return WorkUpdateResponse(ok=result["ok"], version=result.get("version"))


@router.post("/{work_id}/submit", response_model=WorkSubmitResponse)
def submit_work_route(
    work_id: str, payload: WorkSubmitRequest, user: dict = Depends(require_user)
) -> WorkSubmitResponse:
    result = submit_work(
        work_id,
        user["email"],
        payload.content,
        payload.device_id,
        payload.fao_reflection,
        payload.suggestion_actions,
    )
    return WorkSubmitResponse(
        ok=result["ok"],
        version=result["version"],
        analysis_id=result.get("analysis_id"),
    )


@router.post("/{work_id}/rename", response_model=RenameWorkResponse)
def rename_work_route(
    work_id: str, payload: RenameWorkRequest, user: dict = Depends(require_user)
) -> RenameWorkResponse:
    """Rename a work."""
    from backend.storage.db import execute_query
    from backend.storage.work import repo as work_repo

    # Verify ownership
    _ = get_work(work_id, user["email"])

    # Update title
    query = work_repo.update_title(work_id, user["email"], payload.title)
    execute_query(query)

    return RenameWorkResponse(ok=True)


@router.delete("/{work_id}", response_model=OkResponse)
def delete_work_route(work_id: str, user: dict = Depends(require_user)) -> OkResponse:
    delete_work(work_id, user["email"])
    return OkResponse(ok=True)


@router.get("/{work_id}/versions", response_model=VersionListResponse)
def get_versions_route(
    work_id: str,
    user: dict = Depends(require_user),
    type: str = "all",
    parent: int = None,
) -> VersionListResponse:
    # Verify ownership
    _ = get_work(work_id, user["email"])

    # Get current version
    current_version = version_manager.get_current_version_number(work_id)

    # Get version list
    version_type = None if type == "all" else type
    versions = version_manager.get_version_list(work_id, version_type, parent)

    items = [
        VersionListItem(
            version_number=v.get("version_number", 0),
            content_preview=v.get("content_preview", ""),
            is_submitted=v.get("is_submitted", False),
            change_type=v.get("change_type", ""),
            created_at=_format_updated_at(v.get("created_at")),
        )
        for v in versions
    ]

    return VersionListResponse(current_version=current_version, versions=items)


@router.get("/{work_id}/versions/{version_number}", response_model=VersionDetailResponse)
def get_version_detail_route(
    work_id: str, version_number: int, user: dict = Depends(require_user)
) -> VersionDetailResponse:
    # Verify ownership
    _ = get_work(work_id, user["email"])

    # Get version detail
    version = version_manager.get_version_detail(work_id, version_number)

    # Get analysis if submitted
    analysis = None
    if version.get("is_submitted"):
        from backend.storage.db import execute_query

        analysis_query = analysis_repo.get_analysis_by_version(work_id, version_number)
        analysis_result = execute_query(analysis_query)
        if analysis_result:
            analysis = {
                "analysis_id": analysis_result.get("id"),
                "fao_comment": analysis_result.get("fao_comment"),
                "sentence_comments": analysis_result.get("sentence_comments"),
                "reflection_comment": analysis_result.get("reflection_comment"),
                "rubric_evaluation": analysis_result.get("rubric_evaluation"),
            }

    return VersionDetailResponse(
        version_number=version.get("version_number", 0),
        content=version.get("content", ""),
        is_submitted=version.get("is_submitted", False),
        user_reflection=version.get("user_reflection"),
        change_type=version.get("change_type", ""),
        created_at=_format_updated_at(version.get("created_at")),
        analysis=analysis,
    )


@router.post("/{work_id}/revert", response_model=RevertResponse)
def revert_work_route(
    work_id: str, payload: RevertRequest, user: dict = Depends(require_user)
) -> RevertResponse:
    # Verify ownership
    _ = get_work(work_id, user["email"])

    new_version = version_manager.revert_to_version(
        work_id, user["email"], payload.target_version, payload.device_id
    )

    return RevertResponse(ok=True, new_version=new_version)
