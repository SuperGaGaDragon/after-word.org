# -*- coding: utf-8 -*-
"""
This module provides dependency injection functions for FastAPI routes.

These dependencies are used to protect routes and provide them with necessary
context, such as the currently authenticated user's identity.
"""

from typing import TypedDict

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from backend.modules.auth.jwt import decode_token

# ==============================================================================
# Typed Dictionaries for Payload Structure
# ==============================================================================


# By defining a TypedDict for the user payload, we provide clear type hinting
# for the data structure that our dependency will return. This improves
# static analysis and developer experience.
class UserPayload(TypedDict):
    """
    Represents the structure of the user data decoded from the JWT payload.
    """
    email: str
    username: str


# ==============================================================================
# Dependency Injection Utilities
# ==============================================================================

# An instance of HTTPBearer is created here. FastAPI's dependency injection
# system will use this object to extract the "Authorization" header,
# verify that it contains a "Bearer" token, and provide the token to the
# dependency function. If the header is missing or malformed, FastAPI
# will automatically return a 401 Unauthorized response.
token_scheme = HTTPBearer()


def require_user(
    token: HTTPAuthorizationCredentials = Depends(token_scheme),
) -> UserPayload:
    """
    A FastAPI dependency that authenticates a user via a JWT Bearer token.

    This function is intended to be used in the `Depends()` function for API
    routes that require authentication. It performs the following steps:
    1. Relies on `token_scheme` (HTTPBearer) to extract the token from the
       'Authorization' header.
    2. Passes the token credentials to the `decode_token` utility function.
    3. `decode_token` will validate the token's signature and expiration.
    4. If validation fails, `decode_token` raises a `BusinessError`, which
       is expected to be caught by a global error handling middleware that
       translates it into an appropriate HTTP response.
    5. If validation succeeds, it returns the user payload.

    Args:
        token: An `HTTPAuthorizationCredentials` object injected by FastAPI,
               containing the bearer token string in its `credentials` attribute.

    Returns:
        The user payload as a `UserPayload` dictionary, containing the
        user's email and username.
    """
    # The `decode_token` function encapsulates all validation logic.
    # We simply pass the raw credential string to it.
    # The return value is cast to UserPayload to ensure type consistency.
    user_payload = decode_token(token.credentials)
    return UserPayload(email=user_payload["email"], username=user_payload["username"])
