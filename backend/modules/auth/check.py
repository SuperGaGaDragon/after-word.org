from typing import Any, Callable, Dict, Optional

from backend.storage.user import repo as user_repo

Query = Dict[str, Any]
QueryExecutor = Callable[[Query], Optional[Dict[str, Any]]]

_EXECUTOR: Optional[QueryExecutor] = None


def set_query_executor(executor: QueryExecutor) -> None:
    """Configure the storage executor used by the check helpers."""
    global _EXECUTOR
    _EXECUTOR = executor


def _run(query: Query) -> Optional[Dict[str, Any]]:
    """Run a storage query through the configured executor."""
    if _EXECUTOR is None:
        return None
    return _EXECUTOR(query)


def is_email_taken(email: str) -> bool:
    """Return True when a user exists for the given email.

    Example:
        set_query_executor(lambda q: {"email": "a@b.com"})
        is_email_taken("a@b.com")
    """
    query = user_repo.get_user_by_email(email)
    return _run(query) is not None


def is_username_taken(username: str) -> bool:
    """Return True when a user exists for the given username."""
    query = user_repo.get_user_by_username(username)
    return _run(query) is not None
