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


def _run_integration_tests_on_startup():
    """
    🚨 TEMPORARY: Auto-run integration tests on Railway deployment startup.

    ⚠️  WARNING: This function MUST be deleted after acceptance testing! ⚠️

    This function automatically runs the full integration test suite when the
    backend service starts on Railway. Test results will appear in Railway logs.

    Set environment variable: RUN_INTEGRATION_TESTS=true to enable.

    Tests validate:
    - Phase 1-4: Auth, Work CRUD, Version system
    - Phase 5-7: AI evaluation (first-time + iterative)
    - Phase 8: Suggestion tracking and validation
    - Phase 9: Version history and revert

    TODO: Remove this function AND test files after deployment verification
    """
    # Only run if explicitly enabled
    if os.environ.get("RUN_INTEGRATION_TESTS") != "true":
        print("ℹ️  Integration tests available (set RUN_INTEGRATION_TESTS=true to auto-run)")
        return

    import sys
    import time
    from pathlib import Path

    test_file = Path(__file__).parent / "test_integration.py"

    if not test_file.exists():
        print("⚠️  Integration test file not found")
        return

    print("\n" + "=" * 80)
    print("🧪🧪🧪 [PHASE 10] AUTO-RUNNING INTEGRATION TESTS 🧪🧪🧪")
    print("=" * 80)
    print("⚠️  TEMPORARY TEST CODE - WILL BE DELETED AFTER VERIFICATION")
    print("=" * 80)
    print("")

    # Import and run tests
    try:
        # Add backend to path
        backend_path = Path(__file__).parent.parent
        if str(backend_path) not in sys.path:
            sys.path.insert(0, str(backend_path))

        # Give server a moment to fully start
        print("⏳ Waiting 3 seconds for server to fully initialize...")
        time.sleep(3)

        # Import test module
        from backend.test_integration import run_tests

        # Run tests against localhost (same instance)
        print("🚀 Running integration tests against http://localhost:8000")
        print("")

        success = run_tests()

        print("")
        print("=" * 80)
        if success:
            print("✅✅✅ ALL TESTS PASSED - PHASE 10 VERIFICATION COMPLETE ✅✅✅")
            print("=" * 80)
            print("")
            print("🎯 Next steps:")
            print("1. Remove RUN_INTEGRATION_TESTS environment variable from Railway")
            print("2. Delete test code from backend/main.py (lines 18-110)")
            print("3. Delete backend/test_integration.py")
            print("4. Delete backend/TEST_PHASE10.md")
            print("5. Commit: 'Phase 10 completed - Remove integration test code'")
        else:
            print("❌❌❌ SOME TESTS FAILED - REVIEW LOGS ABOVE ❌❌❌")
            print("=" * 80)
            print("")
            print("⚠️  Fix issues before proceeding with cleanup")

        print("=" * 80 + "\n")

    except Exception as e:
        print("")
        print("=" * 80)
        print(f"❌ TEST EXECUTION ERROR: {type(e).__name__}: {str(e)}")
        print("=" * 80)
        import traceback
        traceback.print_exc()
        print("")


# Auto-run tests on startup if enabled
_run_integration_tests_on_startup()

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
