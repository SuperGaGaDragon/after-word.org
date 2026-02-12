from typing import Optional

from pydantic import BaseModel


class SignupRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    new_password_confirm: str


class ChangeUsernameRequest(BaseModel):
    new_username: str


class UserOut(BaseModel):
    id: Optional[str]
    email: str
    username: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class OkResponse(BaseModel):
    ok: bool
