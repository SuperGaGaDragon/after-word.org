from typing import Any, Callable, Dict, Optional

from backend.modules.work import manager as work_manager
from backend.storage.conversation import repo as conversation_repo

Query = Dict[str, Any]
QueryExecutor = Callable[[Query], Any]

_EXECUTOR: Optional[QueryExecutor] = None


def set_query_executor(executor: QueryExecutor) -> None:
    """Configure the storage executor used by Conversation operations."""
    global _EXECUTOR
    _EXECUTOR = executor


def _run(query: Query) -> Any:
    if _EXECUTOR is None:
        return None
    return _EXECUTOR(query)


def add_comment(work_id: str, user_email: str, content: str) -> Optional[str]:
    _ = work_manager.get_work(work_id, user_email)
    query = conversation_repo.create_comment(work_id, user_email, content)
    result = _run(query) or {}
    return result.get("id")


def list_comments(work_id: str, user_email: str) -> Any:
    _ = work_manager.get_work(work_id, user_email)
    query = conversation_repo.list_comments(work_id, user_email)
    return _run(query) or []
