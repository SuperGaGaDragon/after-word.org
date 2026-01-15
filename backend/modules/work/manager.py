from typing import Any, Callable, Dict, Optional

from errors import BusinessError
from modules.session_lock import lock as session_lock
from storage.work import repo as work_repo
from storage.work_retrieve import repo as work_retrieve_repo

Query = Dict[str, Any]
QueryExecutor = Callable[[Query], Any]

_EXECUTOR: Optional[QueryExecutor] = None


def set_query_executor(executor: QueryExecutor) -> None:
    """Configure the storage executor used by Work operations."""
    global _EXECUTOR
    _EXECUTOR = executor


def _run(query: Query) -> Any:
    if _EXECUTOR is None:
        return None
    return _EXECUTOR(query)


def create_work(user_email: str) -> Optional[str]:
    query = work_repo.create_work(user_email)
    result = _run(query) or {}
    return result.get("id")


def list_works(user_email: str) -> Any:
    query = work_retrieve_repo.list_works(user_email)
    return _run(query) or []


def get_work(work_id: str, user_email: str) -> Any:
    query = work_retrieve_repo.get_work(work_id, user_email)
    result = _run(query)
    if result is None:
        raise BusinessError("NOT_FOUND", "work not found")
    return result


def update_work(
    work_id: str, user_email: str, content: str, device_id: str
) -> bool:
    if not session_lock.acquire_lock(work_id, device_id):
        raise BusinessError("LOCKED", "work locked")
    _ = get_work(work_id, user_email)
    query = work_repo.update_work_content(work_id, user_email, content)
    _run(query)
    session_lock.refresh_lock(work_id, device_id)
    return True
