# -*- coding: utf-8 -*-
"""
This module provides utilities for creating and decoding JSON Web Tokens (JWT).

It serves as the core of the authentication system, ensuring that tokens are
generated with the correct claims and signature, and that they are validated
properly upon request. The implementation uses the PyJWT library.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import jwt

from backend.config import JWT_EXPIRE_MINUTES, JWT_SECRET_KEY
from backend.errors import BusinessError

# The algorithm used to sign the JWT. HS256 is a common and secure choice.
ALGORITHM = "HS256"


def create_token(email: str, username: str) -> str:
    """
    Generates a new JWT for a given user.

    This function constructs a payload with standard claims like 'exp' (expiration)
    and 'sub' (subject), as well as custom claims for the username. The token
    is then signed using the secret key and algorithm defined in the config.

    Args:
        email: The user's email address, used as the 'subject' of the token.
        username: The user's username, included as a custom claim.

    Returns:
        A signed JWT as a string.
    """
    # Calculate the token's expiration time.
    # The expiration is set based on the `JWT_EXPIRE_MINUTES` configuration value.
    # It's crucial to use UTC time to avoid timezone-related issues.
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)

    # The payload contains the claims of the JWT.
    # 'sub' (Subject): Identifies the principal that is the subject of the JWT. Here, it's the user's email.
    # 'exp' (Expiration Time): Identifies the expiration time on or after which the JWT MUST NOT be accepted.
    # 'username': A custom claim to carry user-specific information.
    to_encode: Dict[str, Any] = {
        "sub": email,
        "exp": expire,
        "username": username,
    }

    # The jwt.encode function takes the payload, secret key, and algorithm
    # to create the final, signed token string.
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def decode_token(token: str) -> Dict[str, str]:
    """
    Decodes and validates a JWT.

    This function attempts to parse the token, verify its signature, and check its
    expiration. If any part of this process fails, it indicates an invalid or
    expired token, and an authorization error is raised.

    Args:
        token: The JWT string to decode.

    Returns:
        A dictionary containing the user's email and username from the token's payload.

    Raises:
        BusinessError: If the token is invalid, expired, or malformed,
                       a BusinessError with code 'unauthorized' is raised.
    """
    try:
        # The jwt.decode function handles the entire validation process:
        # 1. Checks if the token is well-formed.
        # 2. Verifies the signature using the secret key and algorithm.
        # 3. Checks the 'exp' claim to ensure the token has not expired.
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])

        # After successful decoding, we extract the claims.
        # It's good practice to explicitly check for the existence of expected claims.
        email: str | None = payload.get("sub")
        username: str | None = payload.get("username")

        if email is None or username is None:
            # If the expected claims are not in the payload, the token is considered invalid.
            raise BusinessError(code="unauthorized", message="Invalid token claims")

        # Return the extracted user information.
        return {"email": email, "username": username}

    except jwt.PyJWTError:
        # This is a broad exception from the PyJWT library that catches various issues
        # like signature mismatch, expired token, malformed token, etc.
        # In all these cases, the user is not authorized.
        raise BusinessError(code="unauthorized", message="Invalid or expired token")
