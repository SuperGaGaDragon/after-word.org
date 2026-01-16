from datetime import datetime

from fastapi import APIRouter, Depends

from backend.api.auth.deps import require_user
from backend.api.work.schemas import (
    OkResponse,
    WorkCreateResponse,
    WorkGetResponse,
    WorkListItem,
    WorkListResponse,
    WorkUpdateRequest,
)
from backend.modules.work.manager import (
    create_work,
    get_work,
    list_works,
    update_work,
)

router = APIRouter(prefix="/api/work", tags=["work"])


def _format_updated_at(value: object) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


@router.post("/create", response_model=WorkCreateResponse)
def create_work_route(user: dict = Depends(require_user)) -> WorkCreateResponse:
    work_id = create_work(user["email"])
    return WorkCreateResponse(work_id=work_id or "")


@router.get("/list", response_model=WorkListResponse)
def list_works_route(user: dict = Depends(require_user)) -> WorkListResponse:
    works = list_works(user["email"]) or []
    items = [
        WorkListItem(
            work_id=work.get("id", ""), updated_at=_format_updated_at(work.get("updated_at"))
        )
        for work in works
    ]
    return WorkListResponse(items=items)


@router.get("/{work_id}", response_model=WorkGetResponse)
def get_work_route(work_id: str, user: dict = Depends(require_user)) -> WorkGetResponse:
    work = get_work(work_id, user["email"])
    return WorkGetResponse(work_id=work.get("id", ""), content=work.get("content", ""))


@router.post("/{work_id}/update", response_model=OkResponse)
def update_work_route(
    work_id: str, payload: WorkUpdateRequest, user: dict = Depends(require_user)
) -> OkResponse:
    update_work(work_id, user["email"], payload.content, payload.device_id)
    return OkResponse(ok=True)
