from datetime import datetime

from fastapi import APIRouter, Depends

from backend.api.auth.deps import require_user
from backend.api.conversation.schemas import CommentItem, CommentListResponse
from backend.errors import BusinessError
from backend.modules.conversation.manager import list_comments

router = APIRouter(prefix="/api/conversation", tags=["conversation"])


def _format_created_at(value: object) -> str:
    if isinstance(value, datetime):
        return value.isoformat()
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    raise BusinessError("validation_failed", "invalid created_at")


@router.get("/{work_id}", response_model=CommentListResponse)
def list_comments_route(
    work_id: str, user: dict = Depends(require_user)
) -> CommentListResponse:
    comments = list_comments(work_id, user["email"]) or []
    items = [
        CommentItem(
            id=comment.get("id", ""),
            content=comment.get("content", ""),
            created_at=_format_created_at(comment.get("created_at")),
        )
        for comment in comments
    ]
    return CommentListResponse(items=items)
