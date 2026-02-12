from typing import Optional

from fastapi import HTTPException, Request, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.modules.auth.jwt import decode_token

_bearer = HTTPBearer(auto_error=False)  # Don't auto-error, we'll check cookie too

COOKIE_NAME = "session_token"


def _get_token_from_request(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials],
) -> str:
    """
    Get JWT token from request.

    Priority:
    1. httpOnly cookie (session_token)
    2. Authorization header (Bearer token) - for backward compatibility
    """
    # Try cookie first (preferred method)
    token = request.cookies.get(COOKIE_NAME)
    if token:
        return token

    # Fall back to Authorization header
    if credentials:
        return credentials.credentials

    # No token found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Session cookie or Authorization header required.",
    )


def require_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(_bearer),
) -> dict:
    """
    Require authenticated user.

    Reads token from httpOnly cookie (preferred) or Authorization header (legacy).
    Returns decoded user data from JWT.
    """
    token = _get_token_from_request(request, credentials)
    return decode_token(token)
