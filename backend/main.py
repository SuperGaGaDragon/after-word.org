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

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║                           🚨 CRITICAL WARNING 🚨                           ║
# ║                                                                            ║
# ║  THIS IS TEMPORARY INTEGRATION TEST CODE - PHASE 10 VALIDATION ONLY       ║
# ║                                                                            ║
# ║  ⚠️  MUST BE DELETED AFTER VERIFICATION PASSES  ⚠️                        ║
# ║                                                                            ║
# ║  This code provides integration test information on deployment.           ║
# ║  DO NOT leave this in production code.                                    ║
# ║  DELETE immediately after Phase 10 acceptance testing completes.          ║
# ║                                                                            ║
# ║  Tests validate:                                                          ║
# ║  - Auth (signup/login)                                                    ║
# ║  - Work CRUD                                                              ║
# ║  - Version system (draft/submit)                                          ║
# ║  - AI evaluation (first + iterative)                                      ║
# ║  - Suggestion tracking                                                    ║
# ║  - Version history & revert                                               ║
# ║                                                                            ║
# ╚════════════════════════════════════════════════════════════════════════════╝


def _show_test_info():
    """
    🚨 TEMPORARY: Show integration test information on startup.

    ⚠️  WARNING: This function MUST be deleted after acceptance testing! ⚠️

    Provides instructions for running comprehensive backend integration tests.

    TODO: Remove this function after deployment verification
    """
    test_file = Path(__file__).parent / "test_integration.py"

    if not test_file.exists():
        print("⚠️  Integration test file not found")
        return

    print("\n" + "=" * 80)
    print("🧪 [PHASE 10] Backend Integration Tests Available")
    print("=" * 80)
    print("")
    print("Comprehensive tests covering:")
    print("  ✓ Authentication (signup/login)")
    print("  ✓ Work CRUD operations")
    print("  ✓ Version system (auto-save vs manual save)")
    print("  ✓ AI evaluation (first-time submission)")
    print("  ✓ AI evaluation (iterative with suggestion tracking)")
    print("  ✓ Suggestion validation (2nd+ submission)")
    print("  ✓ Version history and revert")
    print("")
    print("To run tests:")
    print(f"  python {test_file}")
    print("")
    print("Or with custom base URL:")
    print("  BASE_URL=https://your-api.com python backend/test_integration.py")
    print("=" * 80 + "\n")


# Show test info on startup
_show_test_info()

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║                    END OF TEMPORARY TEST CODE                              ║
# ║                    ⚠️  REMEMBER TO DELETE  ⚠️                             ║
# ╚════════════════════════════════════════════════════════════════════════════╝


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
