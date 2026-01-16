from fastapi import Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.modules.auth.jwt import decode_token

_bearer = HTTPBearer()


def require_user(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> dict:
    return decode_token(credentials.credentials)
