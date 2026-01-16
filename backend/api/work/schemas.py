from typing import List

from pydantic import BaseModel


class WorkCreateResponse(BaseModel):
    work_id: str


class WorkListItem(BaseModel):
    work_id: str
    updated_at: str


class WorkListResponse(BaseModel):
    items: List[WorkListItem]


class WorkGetResponse(BaseModel):
    work_id: str
    content: str


class WorkUpdateRequest(BaseModel):
    content: str
    device_id: str


class OkResponse(BaseModel):
    ok: bool
