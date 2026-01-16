from typing import Any, Dict, List, Optional

import pytest

from backend.errors import BusinessError
from backend.modules.auth import check
from backend.modules.auth.change import (
    change_password,
    change_username,
    set_query_executor,
)
from backend.modules.auth.login import login, set_query_executor as set_login_executor
from backend.modules.auth.passwords import hash_password
from backend.modules.auth.signup import (
    set_query_executor as set_signup_executor,
    signup,
)


def _make_executor(
    taken_emails=None,
    taken_usernames=None,
    stored_users=None,
    executed_queries=None,
):
    taken_emails = taken_emails or set()
    taken_usernames = taken_usernames or set()
    stored_users = stored_users or {}
    executed_queries = executed_queries or []

    def executor(query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        sql = query.get("sql", "")
        params = query.get("params", {})
        executed_queries.append(query)
        if "FROM users WHERE email" in sql:
            email = params.get("email")
            if email in taken_emails:
                return {"email": email}
            return stored_users.get(email)
        if "FROM users WHERE username" in sql:
            username = params.get("username")
            if username in taken_usernames:
                return {"username": username}
            for user in stored_users.values():
                if user.get("username") == username:
                    return user
            return None
        if "INSERT INTO users" in sql:
            return {"id": "user-1"}
        if "UPDATE users SET password_hash" in sql:
            return {"updated": True}
        if "UPDATE users SET username" in sql:
            return {"updated": True}
        return None

    return executor, executed_queries


def test_signup_success() -> None:
    executor, _ = _make_executor()
    check.set_query_executor(executor)
    set_signup_executor(executor)

    result = signup("new@example.com", "new_user", "pw123")
    assert result["email"] == "new@example.com"
    assert result["username"] == "new_user"
    assert result["id"] == "user-1"


def test_signup_conflicts() -> None:
    executor, _ = _make_executor(taken_emails={"used@example.com"})
    check.set_query_executor(executor)
    set_signup_executor(executor)

    with pytest.raises(BusinessError) as excinfo:
        signup("used@example.com", "new_user", "pw123")
    assert excinfo.value.code == "email_taken"

    executor, _ = _make_executor(taken_usernames={"taken"})
    check.set_query_executor(executor)
    set_signup_executor(executor)

    with pytest.raises(BusinessError) as excinfo:
        signup("free@example.com", "taken", "pw123")
    assert excinfo.value.code == "username_taken"


def test_login_by_email_and_username() -> None:
    password_hash = hash_password("secret")
    stored_users = {
        "user@example.com": {
            "id": "user-1",
            "email": "user@example.com",
            "username": "user",
            "password_hash": password_hash,
        }
    }
    executor, _ = _make_executor(stored_users=stored_users)
    set_login_executor(executor)

    by_email = login("user@example.com", "secret")
    assert by_email["email"] == "user@example.com"

    by_username = login("user", "secret")
    assert by_username["username"] == "user"

    with pytest.raises(BusinessError) as excinfo:
        login("user@example.com", "wrong")
    assert excinfo.value.code == "invalid_credentials"


def test_change_password_success_and_failures() -> None:
    old_hash = hash_password("oldpass")
    stored_users = {
        "user@example.com": {
            "email": "user@example.com",
            "username": "user",
            "password_hash": old_hash,
        }
    }
    executor, executed = _make_executor(stored_users=stored_users)
    set_query_executor(executor)

    with pytest.raises(BusinessError) as excinfo:
        change_password("user@example.com", "oldpass", "newpass", "mismatch")
    assert excinfo.value.code == "password_mismatch"

    with pytest.raises(BusinessError) as excinfo:
        change_password("user@example.com", "oldpass", "oldpass", "oldpass")
    assert excinfo.value.code == "password_same"

    assert change_password("user@example.com", "oldpass", "newpass", "newpass") is True
    update_queries = [
        q for q in executed if "UPDATE users SET password_hash" in q.get("sql", "")
    ]
    assert len(update_queries) == 1
    assert update_queries[0]["params"]["email"] == "user@example.com"
    assert update_queries[0]["params"]["password_hash"] != old_hash


def test_change_username_success_and_failures() -> None:
    stored_users = {
        "user@example.com": {
            "email": "user@example.com",
            "username": "current",
            "password_hash": "hash",
        }
    }
    executor, executed = _make_executor(
        stored_users=stored_users, taken_usernames={"taken"}
    )
    set_query_executor(executor)
    check.set_query_executor(executor)

    with pytest.raises(BusinessError) as excinfo:
        change_username("user@example.com", "current")
    assert excinfo.value.code == "username_same"

    with pytest.raises(BusinessError) as excinfo:
        change_username("user@example.com", "taken")
    assert excinfo.value.code == "username_taken"

    assert change_username("user@example.com", "fresh") is True
    update_queries = [
        q for q in executed if "UPDATE users SET username" in q.get("sql", "")
    ]
    assert len(update_queries) == 1
    assert update_queries[0]["params"]["email"] == "user@example.com"
    assert update_queries[0]["params"]["username"] == "fresh"
