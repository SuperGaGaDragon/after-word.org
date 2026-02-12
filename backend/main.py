import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.auth.router import router as auth_router
from backend.api.conversation.router import router as conversation_router
from backend.api.errors import BusinessError, business_error_handler
from backend.api.llm.router import router as llm_router
from backend.api.work.router import router as work_router
from backend.config import FRONTEND_BASE_URL
from backend.modules.auth import change, check, login, signup
from backend.modules.conversation import manager as conversation_manager
from backend.modules.work import manager as work_manager
from backend.storage.db import execute_query


def register_routers(app: FastAPI) -> None:
    """Register API routers with no business logic attached."""
    app.include_router(auth_router)
    app.include_router(work_router)
    app.include_router(conversation_router)
    app.include_router(llm_router)


def register_error_handlers(app: FastAPI) -> None:
    """Register HTTP-level exception mapping for business errors."""
    app.add_exception_handler(BusinessError, business_error_handler)


def register_storage_executors() -> None:
    """Wire storage executors into business modules."""
    check.set_query_executor(execute_query)
    signup.set_query_executor(execute_query)
    login.set_query_executor(execute_query)
    change.set_query_executor(execute_query)
    work_manager.set_query_executor(execute_query)
    conversation_manager.set_query_executor(execute_query)


# ============================================================================
# TEMPORARY DATABASE MIGRATION - FOR TESTING ONLY
# ============================================================================
# TODO: DELETE THIS FUNCTION AFTER DEPLOYMENT TO RAILWAY
# Add title field to works table for rename functionality
# Execute once on Railway, then remove this code
# ============================================================================
def _temp_migration_add_work_title() -> None:
    """
    TEMPORARY: Add title column to works table.

    Allows users to give custom names to their works.
    Default value is empty string.

    After Railway executes this successfully, DELETE this entire function
    and its call in the startup event.
    """
    try:
        migration_sql = {
            "sql": "ALTER TABLE works ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT '';",
            "params": {}
        }
        execute_query(migration_sql)
        print("[TEMP MIGRATION] ✓ title column added to works table")
        print("[TEMP MIGRATION] ⚠️  REMEMBER TO DELETE THIS CODE AFTER DEPLOYMENT")
    except Exception as e:
        print(f"[TEMP MIGRATION] Migration failed or already applied: {e}")


app = FastAPI()

# ============================================================================
# TEMPORARY: Run migration on startup
# TODO: DELETE THIS EVENT HANDLER AFTER RAILWAY DEPLOYMENT
# ============================================================================
@app.on_event("startup")
async def temp_startup_migration():
    """TEMPORARY: Run title migration on startup. DELETE AFTER USE."""
    _temp_migration_add_work_title()
# ============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_BASE_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_routers(app)
register_error_handlers(app)
register_storage_executors()
