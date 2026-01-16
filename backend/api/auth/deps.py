from fastapi import Header

from backend.errors import BusinessError
from backend.modules.auth.jwt import decode_token


def require_user(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise BusinessError("unauthorized", "missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise BusinessError("unauthorized", "missing bearer token")
    return decode_token(token)
