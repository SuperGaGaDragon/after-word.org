from fastapi import APIRouter, Depends

from backend.api.auth.deps import require_user
from backend.api.llm.schemas import CommentRequest, CommentResponse
from backend.modules.conversation.manager import add_comment
from backend.modules.llm_gateway.client import generate_comment

router = APIRouter(prefix="/api/llm", tags=["llm"])


@router.post("/comment", response_model=CommentResponse)
def create_comment_route(
    payload: CommentRequest, user: dict = Depends(require_user)
) -> CommentResponse:
    comment = generate_comment(payload.text_snapshot)
    add_comment(payload.work_id, user["email"], comment)
    return CommentResponse(comment=comment)
