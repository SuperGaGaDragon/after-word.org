from fastapi import FastAPI

from api.auth.router import router as auth_router
from api.conversation.router import router as conversation_router
from api.errors import BusinessError, business_error_handler
from api.llm.router import router as llm_router
from api.work.router import router as work_router


def register_routers(app: FastAPI) -> None:
    """Register API routers with no business logic attached."""
    app.include_router(auth_router)
    app.include_router(work_router)
    app.include_router(conversation_router)
    app.include_router(llm_router)


def register_error_handlers(app: FastAPI) -> None:
    """Register HTTP-level exception mapping for business errors."""
    app.add_exception_handler(BusinessError, business_error_handler)


app = FastAPI()
register_routers(app)
register_error_handlers(app)
