from typing import List

from pydantic import BaseModel


class CommentItem(BaseModel):
    id: str
    content: str
    created_at: str


class CommentListResponse(BaseModel):
    items: List[CommentItem]
