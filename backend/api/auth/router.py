from fastapi import APIRouter, Depends

from backend.api.auth.deps import require_user
from backend.api.auth.schemas import (
    AuthResponse,
    ChangePasswordRequest,
    ChangeUsernameRequest,
    LoginRequest,
    OkResponse,
    SignupRequest,
    UserOut,
)
from backend.modules.auth.change import change_password, change_username
from backend.modules.auth.jwt import create_token
from backend.modules.auth.login import login as login_user
from backend.modules.auth.signup import signup as signup_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest) -> AuthResponse:
    user = signup_user(payload.email, payload.username, payload.password)
    token = create_token(user["email"], user["username"])
    return AuthResponse(token=token, user=UserOut(**user))


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    user = login_user(payload.email, payload.password)
    token = create_token(user["email"], user["username"])
    return AuthResponse(token=token, user=UserOut(**user))


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
