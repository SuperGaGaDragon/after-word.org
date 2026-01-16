from pydantic import BaseModel


class CommentRequest(BaseModel):
    work_id: str
    text_snapshot: str


class CommentResponse(BaseModel):
    comment: str
