from fastapi import Request
from fastapi.responses import JSONResponse

from backend.errors import BusinessError, business_error_to_status


async def business_error_handler(
    request: Request, exc: BusinessError
) -> JSONResponse:
    status_code = business_error_to_status(exc.code)
    payload = {"code": exc.code, "message": exc.message}
    return JSONResponse(status_code=status_code, content=payload)
