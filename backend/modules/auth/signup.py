from typing import Any, Callable, Dict, Optional

from backend.errors import BusinessError
from backend.modules.auth import check
from backend.modules.auth.passwords import hash_password
from backend.storage.user import repo as user_repo

Query = Dict[str, Any]
QueryExecutor = Callable[[Query], Optional[Dict[str, Any]]]

_EXECUTOR: Optional[QueryExecutor] = None


def set_query_executor(executor: QueryExecutor) -> None:
    """Configure the storage executor used by signup."""
    global _EXECUTOR
    _EXECUTOR = executor


def _run(query: Query) -> Optional[Dict[str, Any]]:
    if _EXECUTOR is None:
        return None
    return _EXECUTOR(query)


def signup(email: str, username: str, password: str) -> Dict[str, Any]:
    if check.is_email_taken(email):
        raise BusinessError("email_taken", "email already exists")
    if check.is_username_taken(username):
        raise BusinessError("username_taken", "username already exists")
    password_hash = hash_password(password)
    query = user_repo.create_user(email, username, password_hash)
    result = _run(query) or {}
    return {
        "id": result.get("id"),
        "email": email,
        "username": username,
    }
