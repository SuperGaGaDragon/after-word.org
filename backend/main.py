from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.auth.router import router as auth_router
from backend.api.conversation.router import router as conversation_router
from backend.api.errors import BusinessError, business_error_handler
from backend.api.llm.router import router as llm_router
from backend.api.work.router import router as work_router
from backend.config import DATABASE_URL, FRONTEND_BASE_URL
from backend.modules.auth import change, check, login, signup
from backend.modules.conversation import manager as conversation_manager
from backend.modules.work import manager as work_manager
from backend.storage.db import execute_query

# ============================================================================
# TEMPORARY: Database migration for Phase 1 - Version System
# This code will be REMOVED after successful deployment and table creation
# ============================================================================
try:
    import psycopg
except ImportError:
    psycopg = None

try:
    import psycopg2
except ImportError:
    psycopg2 = None


def _run_phase1_migration() -> None:
    """
    TEMPORARY: Execute Phase 1 database migration on startup.
    Creates tables: work_versions, text_analyses, suggestion_resolutions
    TODO: Remove this function after deployment verification
    """
    migration_file = Path(__file__).parent / "migrations" / "001_version_system.sql"

    if not migration_file.exists():
        print(f"⚠️  Migration file not found: {migration_file}")
        return

    sql_content = migration_file.read_text()
    print(f"🔄 Running Phase 1 migration: {migration_file.name}")

    try:
        if psycopg is not None:
            with psycopg.connect(DATABASE_URL) as conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql_content)
                    conn.commit()
            print("✅ Phase 1 migration completed (psycopg)")
            return

        if psycopg2 is not None:
            conn = psycopg2.connect(DATABASE_URL)
            try:
                cursor = conn.cursor()
                cursor.execute(sql_content)
                conn.commit()
                cursor.close()
                print("✅ Phase 1 migration completed (psycopg2)")
            finally:
                conn.close()
            return

        print("⚠️  No PostgreSQL driver found")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise


# Execute migration on startup
_run_phase1_migration()
# ============================================================================
# END TEMPORARY MIGRATION CODE
# ============================================================================


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
