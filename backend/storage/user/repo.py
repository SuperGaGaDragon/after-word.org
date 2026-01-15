from typing import Any, Dict


def _build_query(sql: str, params: Dict[str, Any]) -> Dict[str, Any]:
    """Return a portable SQL contract for the caller to execute."""
    return {"sql": sql, "params": params}


def create_user(email: str, username: str, password_hash: str) -> Dict[str, Any]:
    sql = (
        "INSERT INTO users (id, email, username, password_hash, created_at) "
        "VALUES (gen_random_uuid(), %(email)s, %(username)s, %(password_hash)s, NOW()) "
        "RETURNING id"
    )
    params = {
        "email": email,
        "username": username,
        "password_hash": password_hash,
    }
    return _build_query(sql, params)


def get_user_by_email(email: str) -> Dict[str, Any]:
    sql = (
        "SELECT id, email, username, password_hash, created_at "
        "FROM users WHERE email = %(email)s"
    )
    return _build_query(sql, {"email": email})


def get_user_by_username(username: str) -> Dict[str, Any]:
    sql = (
        "SELECT id, email, username, password_hash, created_at "
        "FROM users WHERE username = %(username)s"
    )
    return _build_query(sql, {"username": username})
