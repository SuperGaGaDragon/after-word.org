from typing import Any, Callable, Dict, Optional

from errors import BusinessError
from modules.auth import check
from modules.auth.passwords import hash_password, verify_password
from storage.user import repo as user_repo

Query = Dict[str, Any]
QueryExecutor = Callable[[Query], Optional[Dict[str, Any]]]

_EXECUTOR: Optional[QueryExecutor] = None


def set_query_executor(executor: QueryExecutor) -> None:
    """Configure the storage executor used by change operations."""
    global _EXECUTOR
    _EXECUTOR = executor


def _run(query: Query) -> Optional[Dict[str, Any]]:
    if _EXECUTOR is None:
        return None
    return _EXECUTOR(query)


def change_password(
    email: str, old_password: str, new_password: str, new_password_confirm: str
) -> bool:
    if new_password != new_password_confirm:
        raise BusinessError("PASSWORD_MISMATCH", "passwords do not match")
    if new_password == old_password:
        raise BusinessError("PASSWORD_SAME", "new password must differ")
    user = _run(user_repo.get_user_by_email(email))
    if user is None:
        raise BusinessError("INVALID_CREDENTIALS", "invalid credentials")
    stored_hash = user.get("password_hash", "")
    if not verify_password(old_password, stored_hash):
        raise BusinessError("INVALID_CREDENTIALS", "invalid credentials")
    new_hash = hash_password(new_password)
    _run(user_repo.update_password(email, new_hash))
    return True


def change_username(email: str, new_username: str) -> bool:
    user = _run(user_repo.get_user_by_email(email))
    if user is None:
        raise BusinessError("INVALID_CREDENTIALS", "invalid credentials")
    current = user.get("username")
    if current == new_username:
        raise BusinessError("USERNAME_SAME", "username unchanged")
    if check.is_username_taken(new_username):
        raise BusinessError("USERNAME_TAKEN", "username already exists")
    _run(user_repo.update_username(email, new_username))
    return True
