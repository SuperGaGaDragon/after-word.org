from typing import Any, Callable, Dict, Optional

from backend.errors import BusinessError
from backend.modules.auth.passwords import verify_password
from backend.storage.user import repo as user_repo

Query = Dict[str, Any]
QueryExecutor = Callable[[Query], Optional[Dict[str, Any]]]

_EXECUTOR: Optional[QueryExecutor] = None


def set_query_executor(executor: QueryExecutor) -> None:
    """Configure the storage executor used by login."""
    global _EXECUTOR
    _EXECUTOR = executor


def _run(query: Query) -> Optional[Dict[str, Any]]:
    if _EXECUTOR is None:
        return None
    return _EXECUTOR(query)


def _find_user(email_or_username: str) -> Optional[Dict[str, Any]]:
    user = _run(user_repo.get_user_by_email(email_or_username))
    if user is not None:
        return user
    return _run(user_repo.get_user_by_username(email_or_username))


def login(email_or_username: str, password: str) -> Dict[str, Any]:
    user = _find_user(email_or_username)
    if user is None:
        raise BusinessError("invalid_credentials", "invalid credentials")
    stored_hash = user.get("password_hash", "")
    if not verify_password(password, stored_hash):
        raise BusinessError("invalid_credentials", "invalid credentials")
    return {
        "id": user.get("id"),
        "email": user.get("email"),
        "username": user.get("username"),
    }
