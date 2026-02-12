from fastapi import APIRouter, Depends, Response

from backend.api.auth.deps import require_user
from backend.api.auth.schemas import (
    AuthCookieResponse,
    AuthResponse,
    ChangePasswordRequest,
    ChangeUsernameRequest,
    LoginRequest,
    OkResponse,
    SignupRequest,
    UserOut,
)
from backend.config import APP_ENV
from backend.modules.auth.change import change_password, change_username
from backend.modules.auth.jwt import create_token
from backend.modules.auth.login import login as login_user
from backend.modules.auth.signup import signup as signup_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Cookie settings
COOKIE_NAME = "session_token"
COOKIE_MAX_AGE = 30 * 24 * 60 * 60  # 30 days in seconds
COOKIE_SECURE = APP_ENV == "production"  # Only require HTTPS in production
COOKIE_HTTPONLY = True
COOKIE_SAMESITE = "lax"


def _set_auth_cookie(response: Response, token: str) -> None:
    """Set httpOnly cookie with JWT token."""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=None,  # Let browser handle domain
    )


@router.post("/signup", response_model=AuthCookieResponse)
def signup(payload: SignupRequest, response: Response) -> AuthCookieResponse:
    """Create new user account and set session cookie."""
    user = signup_user(payload.email, payload.username, payload.password)
    token = create_token(user["email"], user["username"])
    _set_auth_cookie(response, token)
    return AuthCookieResponse(user=UserOut(**user))


@router.post("/login", response_model=AuthCookieResponse)
def login(payload: LoginRequest, response: Response) -> AuthCookieResponse:
    """Login and set session cookie."""
    user = login_user(payload.email_or_username, payload.password)
    token = create_token(user["email"], user["username"])
    _set_auth_cookie(response, token)
    return AuthCookieResponse(user=UserOut(**user))


@router.post("/logout", response_model=OkResponse)
def logout(response: Response) -> OkResponse:
    """Logout by clearing session cookie."""
    response.delete_cookie(
        key=COOKIE_NAME,
        httponly=COOKIE_HTTPONLY,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
    )
    return OkResponse(ok=True)


@router.post("/change_password", response_model=OkResponse)
def change_password_route(
    payload: ChangePasswordRequest, user: dict = Depends(require_user)
) -> OkResponse:
    change_password(
        user["email"],
        payload.old_password,
        payload.new_password,
        payload.new_password_confirm,
    )
    return OkResponse(ok=True)


@router.post("/change_username", response_model=OkResponse)
def change_username_route(
    payload: ChangeUsernameRequest, user: dict = Depends(require_user)
) -> OkResponse:
    change_username(user["email"], payload.new_username)
    return OkResponse(ok=True)
