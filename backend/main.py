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

# ╔════════════════════════════════════════════════════════════════════════════╗
# ║                           🚨 CRITICAL WARNING 🚨                           ║
# ║                                                                            ║
# ║  THIS IS TEMPORARY TEST DATA INSERTION CODE - PHASE 1 VERIFICATION ONLY   ║
# ║                                                                            ║
# ║  ⚠️  MUST BE DELETED AFTER VERIFICATION PASSES  ⚠️                        ║
# ║                                                                            ║
# ║  This code will insert test data on EVERY deployment/restart.             ║
# ║  DO NOT leave this in production code.                                    ║
# ║  DELETE immediately after Phase 1 acceptance testing completes.           ║
# ║                                                                            ║
# ╚════════════════════════════════════════════════════════════════════════════╝

try:
    import psycopg
except ImportError:
    psycopg = None

try:
    import psycopg2
except ImportError:
    psycopg2 = None


def _insert_phase1_test_data() -> None:
    """
    🚨 TEMPORARY: Insert test data for Phase 1 verification

    ⚠️  WARNING: This function MUST be deleted after acceptance testing! ⚠️

    Inserts test records into:
    - works (update current_version)
    - work_versions
    - text_analyses
    - suggestion_resolutions
    """
    print("🧪 [PHASE 1 TEST] Inserting test data...")

    sql_statements = """
    -- Test data for Phase 1 verification

    -- 1. Get a test user (use first user in database)
    DO $$
    DECLARE
        test_user_email VARCHAR(255);
        test_work_id UUID;
        test_analysis_id UUID;
    BEGIN
        -- Get first user email
        SELECT email INTO test_user_email FROM users LIMIT 1;

        IF test_user_email IS NULL THEN
            RAISE NOTICE 'No users found - skipping test data insertion';
            RETURN;
        END IF;

        -- 2. Create a test work or use existing
        INSERT INTO works (id, user_email, content, current_version, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            test_user_email,
            'This is a test essay for Phase 1 verification. It contains sample content to test the version system.',
            2,
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id INTO test_work_id;

        -- If no new work created, get an existing one
        IF test_work_id IS NULL THEN
            SELECT id INTO test_work_id FROM works WHERE user_email = test_user_email LIMIT 1;
        END IF;

        -- 3. Insert work_versions (version 1 - submitted)
        INSERT INTO work_versions (
            work_id, user_email, version_number, content,
            is_submitted, parent_submission_version, user_reflection,
            change_type, created_at
        ) VALUES (
            test_work_id,
            test_user_email,
            1,
            'This is version 1 of the test essay.',
            true,
            NULL,
            'This is my first submission reflection.',
            'submission',
            NOW() - INTERVAL '2 days'
        )
        ON CONFLICT (work_id, version_number) DO NOTHING;

        -- 4. Insert work_versions (version 2 - draft)
        INSERT INTO work_versions (
            work_id, user_email, version_number, content,
            is_submitted, parent_submission_version, user_reflection,
            change_type, created_at
        ) VALUES (
            test_work_id,
            test_user_email,
            2,
            'This is version 2 of the test essay with improvements.',
            false,
            1,
            NULL,
            'draft_edit',
            NOW()
        )
        ON CONFLICT (work_id, version_number) DO NOTHING;

        -- 5. Insert text_analyses for version 1
        INSERT INTO text_analyses (
            id, work_id, user_email, version_number,
            text_snapshot, fao_comment, sentence_comments, reflection_comment,
            created_at
        ) VALUES (
            gen_random_uuid(),
            test_work_id,
            test_user_email,
            1,
            'This is version 1 of the test essay.',
            'Overall Assessment: This essay shows promise but needs work on clarity and structure.',
            '[
                {
                    "id": "test-comment-1",
                    "original_text": "test essay",
                    "start_index": 8,
                    "end_index": 18,
                    "issue_type": "clarity",
                    "severity": "medium",
                    "title": "Vague expression",
                    "description": "The term is too generic",
                    "suggestion": "Be more specific about what you are testing"
                }
            ]'::jsonb,
            NULL,
            NOW() - INTERVAL '2 days'
        )
        ON CONFLICT DO NOTHING
        RETURNING id INTO test_analysis_id;

        -- 6. Insert suggestion_resolutions
        IF test_analysis_id IS NOT NULL THEN
            INSERT INTO suggestion_resolutions (
                work_id, analysis_id, suggestion_id,
                from_version, to_version, user_action, user_note,
                resolution_status, llm_feedback, created_at
            ) VALUES (
                test_work_id,
                test_analysis_id,
                'test-comment-1',
                1,
                2,
                'resolved',
                'I made the description more specific',
                NULL,
                NULL,
                NOW()
            )
            ON CONFLICT DO NOTHING;
        END IF;

        RAISE NOTICE '✅ Test data inserted successfully';
    END $$;
    """

    try:
        if psycopg is not None:
            with psycopg.connect(DATABASE_URL) as conn:
                with conn.cursor() as cursor:
                    cursor.execute(sql_statements)
                    conn.commit()
            print("✅ [PHASE 1 TEST] Test data inserted (psycopg)")
            return

        if psycopg2 is not None:
            conn = psycopg2.connect(DATABASE_URL)
            try:
                cursor = conn.cursor()
                cursor.execute(sql_statements)
                conn.commit()
                cursor.close()
                print("✅ [PHASE 1 TEST] Test data inserted (psycopg2)")
            finally:
                conn.close()
            return

        print("⚠️  No PostgreSQL driver found")
    except Exception as e:
        print(f"❌ [PHASE 1 TEST] Test data insertion failed: {e}")
        # Don't raise - let app start anyway


# 🚨 EXECUTE TEST DATA INSERTION - DELETE THIS AFTER VERIFICATION! 🚨
_insert_phase1_test_data()

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
