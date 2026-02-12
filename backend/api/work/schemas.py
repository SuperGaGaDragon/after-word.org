"""
API request/response schemas for work endpoints.

Defines Pydantic models for validating requests and serializing responses.
"""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ============================================================================
# Work CRUD Schemas
# ============================================================================


class WorkCreateResponse(BaseModel):
    """Response for creating a new work."""

    work_id: str = Field(..., description="Unique identifier for the created work")


class WorkListItem(BaseModel):
    """Single item in works list."""

    work_id: str = Field(..., description="Work unique identifier")
    updated_at: str = Field(..., description="ISO 8601 timestamp of last update")


class WorkListResponse(BaseModel):
    """Response containing list of user's works."""

    items: List[WorkListItem] = Field(..., description="List of works")


class WorkGetResponse(BaseModel):
    """Response for getting work details."""

    work_id: str = Field(..., description="Work unique identifier")
    content: str = Field(..., description="Current essay content")
    current_version: int = Field(0, description="Current version number")


# ============================================================================
# Work Update Schemas
# ============================================================================


class WorkUpdateRequest(BaseModel):
    """Request to update work content."""

    content: str = Field(..., description="Updated essay content")
    device_id: str = Field(..., description="Device ID for session locking")
    auto_save: bool = Field(
        True,
        description="If true, only update content without creating version. "
        "If false, create a new draft version.",
    )


class WorkUpdateResponse(BaseModel):
    """Response after updating work."""

    ok: bool = Field(..., description="Success indicator")
    version: Optional[int] = Field(
        None, description="Version number if new draft version was created"
    )


# ============================================================================
# Work Submit Schemas
# ============================================================================


class WorkSubmitRequest(BaseModel):
    """Request to submit work for AI evaluation."""

    content: str = Field(..., description="Final essay content to submit")
    device_id: str = Field(..., description="Device ID for session locking")
    fao_reflection: Optional[str] = Field(
        None,
        description="Optional user's reflection on previous FAO (overall) comment. "
        "Should explain their revision approach.",
    )
    suggestion_actions: Optional[Dict[str, Any]] = Field(
        None,
        description="User's actions on previous suggestions (required for 2nd+ submission). "
        "Format: {'suggestion_id': {'action': 'resolved|rejected', 'user_note': '...'}}"
        "All previous suggestions must be marked.",
    )


class WorkSubmitResponse(BaseModel):
    """Response after submitting work."""

    ok: bool = Field(..., description="Success indicator")
    version: int = Field(..., description="Version number of submitted version")
    analysis_id: Optional[str] = Field(
        None, description="Unique identifier for the AI analysis result"
    )


# ============================================================================
# Version Management Schemas
# ============================================================================


class VersionListItem(BaseModel):
    """Single version item in version history."""

    version_number: int = Field(..., description="Version number")
    content_preview: str = Field(
        ..., description="First 100 characters of content"
    )
    is_submitted: bool = Field(
        ..., description="True if submitted version, false if draft"
    )
    change_type: str = Field(
        ...,
        description="Type of change: 'submission', 'draft_edit', 'revert', etc.",
    )
    created_at: str = Field(..., description="ISO 8601 timestamp of version creation")


class VersionListResponse(BaseModel):
    """Response containing version history with optional pagination."""

    current_version: int = Field(..., description="Current version number of the work")
    versions: List[VersionListItem] = Field(..., description="List of versions")
    next_cursor: Optional[str] = Field(
        None,
        description="Cursor for next page (created_at timestamp). Null if no more results.",
    )


class VersionDetailResponse(BaseModel):
    """Detailed information about a specific version."""

    version_number: int = Field(..., description="Version number")
    content: str = Field(..., description="Full essay content at this version")
    is_submitted: bool = Field(
        ..., description="True if submitted version, false if draft"
    )
    user_reflection: Optional[str] = Field(
        None, description="User's reflection (only for submitted versions)"
    )
    change_type: str = Field(
        ..., description="Type of change: 'submission', 'draft_edit', 'revert'"
    )
    created_at: str = Field(..., description="ISO 8601 timestamp of version creation")
    analysis: Optional[Dict[str, Any]] = Field(
        None,
        description="AI analysis result (only for submitted versions). "
        "Contains: fao_comment, sentence_comments, reflection_comment",
    )


class RevertRequest(BaseModel):
    """Request to revert work to a previous version."""

    target_version: int = Field(..., description="Version number to revert to")
    device_id: str = Field(..., description="Device ID for session locking")


class RevertResponse(BaseModel):
    """Response after reverting to a previous version."""

    ok: bool = Field(..., description="Success indicator")
    new_version: int = Field(
        ...,
        description="New draft version number containing the reverted content",
    )


# ============================================================================
# Generic Schemas
# ============================================================================


class OkResponse(BaseModel):
    """Generic success response."""

    ok: bool = Field(..., description="Success indicator")
