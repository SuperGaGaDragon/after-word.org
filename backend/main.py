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


app = FastAPI()
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


# ============================================================================
# ⚠️⚠️⚠️ TEMPORARY DATABASE MIGRATION - DELETE AFTER DEPLOYMENT ⚠️⚠️⚠️
# ============================================================================
# This code will be REMOVED immediately after Railway deployment and verification
# Purpose: Run migrations 002 and 003 to add rubric support
# TODO: DELETE THIS ENTIRE SECTION after confirming deployment works
# ============================================================================

@app.on_event("startup")
async def run_temporary_migrations():
    """
    ⚠️⚠️⚠️ TEMPORARY - DELETE AFTER DEPLOYMENT ⚠️⚠️⚠️
    Run database migrations for rubric feature.
    This will execute ONCE on startup, then this code will be removed.
    """
    print("\n" + "="*80)
    print("⚠️  RUNNING TEMPORARY MIGRATIONS - THIS CODE WILL BE DELETED SOON")
    print("="*80 + "\n")

    try:
        # Migration 002: Add rubric column to works table
        migration_002 = """
        ALTER TABLE works ADD COLUMN IF NOT EXISTS rubric TEXT;
        COMMENT ON COLUMN works.rubric IS 'Claude-generated evaluation rubric (JSON). Generated on first submission, used for all subsequent evaluations.';
        """

        # Migration 003: Add rubric_evaluation column to text_analyses table
        migration_003 = """
        ALTER TABLE text_analyses ADD COLUMN IF NOT EXISTS rubric_evaluation JSONB;
        COMMENT ON COLUMN text_analyses.rubric_evaluation IS 'GPT evaluation scores for each rubric dimension (JSON). Populated when rubric exists.';
        """

        print("[MIGRATION 002] Adding rubric column to works table...")
        execute_query({"sql": migration_002, "params": {}})
        print("✓ Migration 002 completed")

        print("[MIGRATION 003] Adding rubric_evaluation column to text_analyses table...")
        execute_query({"sql": migration_003, "params": {}})
        print("✓ Migration 003 completed")

        print("\n" + "="*80)
        print("✓ ALL TEMPORARY MIGRATIONS COMPLETED SUCCESSFULLY")
        print("⚠️  REMEMBER TO DELETE THIS STARTUP FUNCTION AFTER VERIFICATION")
        print("="*80 + "\n")

    except Exception as e:
        print(f"\n✗ MIGRATION FAILED: {e}")
        print("Check database logs for details\n")
        # Don't crash the app, just log the error
        pass

# ============================================================================
# ⚠️⚠️⚠️ END OF TEMPORARY MIGRATION CODE ⚠️⚠️⚠️
# ============================================================================
