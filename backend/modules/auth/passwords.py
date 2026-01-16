import base64
import hashlib
import hmac
import os
from typing import Tuple

_ITERATIONS = 120_000
_SALT_BYTES = 16


def _split_hash(value: str) -> Tuple[bytes, bytes]:
    salt_b64, digest_b64 = value.split("$", 1)
    return base64.b64decode(salt_b64), base64.b64decode(digest_b64)


def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256."""
    salt = os.urandom(_SALT_BYTES)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITERATIONS)
    return f"{base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against a stored hash."""
    salt, digest = _split_hash(stored_hash)
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ITERATIONS)
    return hmac.compare_digest(candidate, digest)
