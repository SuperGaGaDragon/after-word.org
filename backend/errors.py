from typing import Dict


class BusinessError(Exception):
    """Business-layer error exposed to HTTP as a structured payload."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


ERROR_STATUS_MAP: Dict[str, int] = {
    "unauthorized": 401,
    "forbidden": 403,
    "not_found": 404,
    "conflict": 409,
    "locked": 409,
    "llm_failed": 502,
    "invalid_credentials": 401,
    "email_taken": 409,
    "username_taken": 409,
    "password_mismatch": 422,
    "password_same": 422,
    "username_same": 409,
    "validation_failed": 422,
}


def business_error_to_status(code: str) -> int:
    """Map business error codes to HTTP status codes."""
    return ERROR_STATUS_MAP.get(code, 400)
