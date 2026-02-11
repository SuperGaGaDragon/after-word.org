from typing import Any, Dict, List, Optional

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
    current_version: int = 0


class WorkUpdateRequest(BaseModel):
    content: str
    device_id: str
    auto_save: bool = True


class WorkUpdateResponse(BaseModel):
    ok: bool
    version: Optional[int] = None


class WorkSubmitRequest(BaseModel):
    content: str
    device_id: str
    fao_reflection: Optional[str] = None
    suggestion_actions: Optional[Dict[str, Any]] = None


class WorkSubmitResponse(BaseModel):
    ok: bool
    version: int
    analysis_id: Optional[str] = None


class VersionListItem(BaseModel):
    version_number: int
    content_preview: str
    is_submitted: bool
    change_type: str
    created_at: str


class VersionListResponse(BaseModel):
    current_version: int
    versions: List[VersionListItem]


class VersionDetailResponse(BaseModel):
    version_number: int
    content: str
    is_submitted: bool
    user_reflection: Optional[str] = None
    change_type: str
    created_at: str
    analysis: Optional[Dict[str, Any]] = None


class RevertRequest(BaseModel):
    target_version: int
    device_id: str


class RevertResponse(BaseModel):
    ok: bool
    new_version: int


class OkResponse(BaseModel):
    ok: bool
