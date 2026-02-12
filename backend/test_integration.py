"""
Backend Integration Test Suite - Phase 1-9 Validation

Tests the complete user journey:
1. Auth (signup/login)
2. Work CRUD
3. Version system (draft/submit)
4. AI evaluation (first-time + iterative)
5. Suggestion tracking
6. Version history & revert
"""

import json
import os
import time
import uuid
from typing import Any, Dict, Optional

import httpx

# Test configuration
# Railway uses PORT env var, default to 8000 for local testing
PORT = os.environ.get("PORT", "8000")
BASE_URL = os.environ.get("BASE_URL", f"http://localhost:{PORT}")
TEST_USER_EMAIL = f"test_{uuid.uuid4().hex[:8]}@test.com"
TEST_USER_USERNAME = f"testuser_{uuid.uuid4().hex[:8]}"
TEST_USER_PASSWORD = "TestPass123!"
DEVICE_ID = str(uuid.uuid4())

# Test state
token: Optional[str] = None
work_id: Optional[str] = None
first_analysis_id: Optional[str] = None
first_version: Optional[int] = None
sentence_comment_ids: list = []


class TestFailure(Exception):
    """Test assertion failure"""
    pass


def log(message: str, level: str = "INFO"):
    """Print formatted test log"""
    prefix = {
        "INFO": "ℹ️ ",
        "SUCCESS": "✅",
        "ERROR": "❌",
        "TEST": "🧪",
    }.get(level, "  ")
    print(f"{prefix} {message}")


def assert_equal(actual, expected, message: str):
    """Assert equality with clear error message"""
    if actual != expected:
        raise TestFailure(
            f"{message}\n"
            f"  Expected: {expected}\n"
            f"  Got: {actual}"
        )


def assert_in(value, container, message: str):
    """Assert value in container"""
    if value not in container:
        raise TestFailure(f"{message}\n  {value} not in {container}")


def assert_status(response: httpx.Response, expected_status: int, endpoint: str):
    """Assert HTTP status code"""
    if response.status_code != expected_status:
        raise TestFailure(
            f"[{endpoint}] Expected status {expected_status}, got {response.status_code}\n"
            f"Response: {response.text[:500]}"
        )


# =============================================================================
# Test Cases
# =============================================================================


def test_01_signup():
    """Test: User signup"""
    log("Testing user signup...", "TEST")

    response = httpx.post(
        f"{BASE_URL}/api/auth/signup",
        json={
            "email": TEST_USER_EMAIL,
            "username": TEST_USER_USERNAME,
            "password": TEST_USER_PASSWORD,
        },
        timeout=10.0,
    )

    assert_status(response, 200, "POST /api/auth/signup")
    data = response.json()

    assert_in("token", data, "Signup response should contain token")
    assert_in("user", data, "Signup response should contain user")
    assert_equal(data["user"]["email"], TEST_USER_EMAIL, "Email should match")

    global token
    token = data["token"]

    log(f"User created: {TEST_USER_EMAIL}", "SUCCESS")


def test_02_login():
    """Test: User login"""
    log("Testing user login...", "TEST")

    response = httpx.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email_or_username": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD,
        },
        timeout=10.0,
    )

    assert_status(response, 200, "POST /api/auth/login")
    data = response.json()

    assert_in("token", data, "Login response should contain token")
    log("Login successful", "SUCCESS")


def test_03_create_work():
    """Test: Create work"""
    log("Testing work creation...", "TEST")

    response = httpx.post(
        f"{BASE_URL}/api/work/create",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )

    assert_status(response, 200, "POST /api/work/create")
    data = response.json()

    assert_in("work_id", data, "Create response should contain work_id")

    global work_id
    work_id = data["work_id"]

    log(f"Work created: {work_id}", "SUCCESS")


def test_04_get_work():
    """Test: Get work details"""
    log("Testing get work...", "TEST")

    response = httpx.get(
        f"{BASE_URL}/api/work/{work_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )

    assert_status(response, 200, "GET /api/work/{id}")
    data = response.json()

    assert_equal(data["work_id"], work_id, "Work ID should match")
    assert_equal(data["content"], "", "Initial content should be empty")
    assert_equal(data["current_version"], 0, "Initial version should be 0")

    log("Work details retrieved", "SUCCESS")


def test_05_auto_save():
    """Test: Auto-save (no version creation)"""
    log("Testing auto-save...", "TEST")

    content = "This is a test essay. It explores the importance of education."

    response = httpx.post(
        f"{BASE_URL}/api/work/{work_id}/update",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "content": content,
            "device_id": DEVICE_ID,
            "auto_save": True,  # Should NOT create version
        },
        timeout=10.0,
    )

    assert_status(response, 200, "POST /api/work/{id}/update")
    data = response.json()

    assert_equal(data["ok"], True, "Update should succeed")
    assert_equal(data.get("version"), None, "Auto-save should not create version")

    log("Auto-save successful (no version created)", "SUCCESS")


def test_06_manual_save():
    """Test: Manual save (creates draft version)"""
    log("Testing manual save (draft version)...", "TEST")

    content = "This is a test essay. It explores the importance of education in society."

    response = httpx.post(
        f"{BASE_URL}/api/work/{work_id}/update",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "content": content,
            "device_id": DEVICE_ID,
            "auto_save": False,  # Should create version
        },
        timeout=10.0,
    )

    assert_status(response, 200, "POST /api/work/{id}/update")
    data = response.json()

    assert_equal(data["ok"], True, "Update should succeed")
    assert_in("version", data, "Manual save should return version number")
    assert_equal(data["version"], 1, "First version should be 1")

    log("Draft version 1 created", "SUCCESS")


def test_07_first_submit():
    """Test: First submission (AI evaluation)"""
    log("Testing first submission with AI evaluation...", "TEST")

    content = (
        "Education is very important. It helps people learn things. "
        "Many students go to school every day. Teachers teach them many subjects. "
        "Education makes people smart and helps them get jobs in the future."
    )

    response = httpx.post(
        f"{BASE_URL}/api/work/{work_id}/submit",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "content": content,
            "device_id": DEVICE_ID,
            "fao_reflection": None,  # First time, no reflection
            "suggestion_actions": None,  # First time, no actions
        },
        timeout=60.0,  # AI analysis takes time
    )

    assert_status(response, 200, "POST /api/work/{id}/submit")
    data = response.json()

    assert_equal(data["ok"], True, "Submit should succeed")
    assert_in("version", data, "Submit should return version")
    assert_in("analysis_id", data, "Submit should return analysis_id")

    global first_version, first_analysis_id
    first_version = data["version"]
    first_analysis_id = data["analysis_id"]

    log(f"First submission successful: version {first_version}", "SUCCESS")

    # Wait a moment for analysis to be saved
    time.sleep(1)


def test_08_get_analysis():
    """Test: Get analysis from version detail"""
    log("Testing get analysis...", "TEST")

    response = httpx.get(
        f"{BASE_URL}/api/work/{work_id}/versions/{first_version}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )

    assert_status(response, 200, "GET /api/work/{id}/versions/{num}")
    data = response.json()

    assert_equal(data["version_number"], first_version, "Version should match")
    assert_equal(data["is_submitted"], True, "Should be submitted version")
    assert_in("analysis", data, "Should contain analysis")

    analysis = data["analysis"]
    assert_in("fao_comment", analysis, "Should have FAO comment")
    assert_in("sentence_comments", analysis, "Should have sentence comments")

    # Store sentence comment IDs for next test
    global sentence_comment_ids
    sentence_comment_ids = [c["id"] for c in analysis["sentence_comments"]]

    log(f"Analysis retrieved: {len(sentence_comment_ids)} sentence comments", "SUCCESS")

    # Validate sentence comment structure
    if sentence_comment_ids:
        comment = analysis["sentence_comments"][0]
        required_fields = [
            "id", "original_text", "start_index", "end_index",
            "issue_type", "severity", "title", "description", "suggestion"
        ]
        for field in required_fields:
            assert_in(field, comment, f"Sentence comment should have '{field}'")

        log("Sentence comment structure validated", "SUCCESS")


def test_09_second_submit_without_marking():
    """Test: Second submission without marking suggestions (should fail)"""
    log("Testing submit without marking suggestions (should fail)...", "TEST")

    if not sentence_comment_ids:
        log("No suggestions to mark, skipping this test", "INFO")
        return

    content = "Education is crucial. It empowers individuals to acquire knowledge."

    response = httpx.post(
        f"{BASE_URL}/api/work/{work_id}/submit",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "content": content,
            "device_id": DEVICE_ID,
            "fao_reflection": "I made the language more sophisticated.",
            "suggestion_actions": None,  # Missing actions!
        },
        timeout=30.0,
    )

    # Should fail with validation error
    assert_status(response, 400, "POST /api/work/{id}/submit (should fail)")

    error = response.json()
    assert_in("code", error, "Error should have code")
    assert_equal(
        error["code"],
        "suggestions_not_processed",
        "Should fail with suggestions_not_processed"
    )

    log("Correctly rejected submit without marking", "SUCCESS")


def test_10_second_submit_with_marking():
    """Test: Second submission with suggestion actions"""
    log("Testing second submission with suggestion actions...", "TEST")

    if not sentence_comment_ids:
        log("No suggestions to mark, skipping this test", "INFO")
        return

    content = (
        "Education is crucial for personal development. "
        "It empowers individuals to acquire knowledge and critical thinking skills. "
        "Students engage with diverse subjects in academic settings. "
        "Educators facilitate learning through structured curricula. "
        "Quality education enhances career prospects and societal contribution."
    )

    # Mark all suggestions
    suggestion_actions = {}
    for i, comment_id in enumerate(sentence_comment_ids):
        if i % 2 == 0:
            suggestion_actions[comment_id] = {
                "action": "resolved",
                "user_note": f"I improved this as suggested - made it more specific and clear."
            }
        else:
            suggestion_actions[comment_id] = {
                "action": "rejected"
            }

    response = httpx.post(
        f"{BASE_URL}/api/work/{work_id}/submit",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "content": content,
            "device_id": DEVICE_ID,
            "fao_reflection": "I focused on making the language more sophisticated and the arguments clearer.",
            "suggestion_actions": suggestion_actions,
        },
        timeout=60.0,
    )

    assert_status(response, 200, "POST /api/work/{id}/submit")
    data = response.json()

    assert_equal(data["ok"], True, "Submit should succeed")

    second_version = data["version"]
    log(f"Second submission successful: version {second_version}", "SUCCESS")

    # Wait for analysis
    time.sleep(1)

    # Check analysis has improvement_feedback
    response = httpx.get(
        f"{BASE_URL}/api/work/{work_id}/versions/{second_version}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )

    data = response.json()
    analysis = data["analysis"]

    # Check for reflection_comment (since we provided reflection)
    if "reflection_comment" in analysis:
        log("Reflection comment received", "SUCCESS")

    # Check sentence comments for improvement_feedback
    has_improvement_feedback = any(
        "improvement_feedback" in c
        for c in analysis.get("sentence_comments", [])
    )

    if has_improvement_feedback:
        log("Improvement feedback received", "SUCCESS")


def test_11_version_list():
    """Test: Get version list"""
    log("Testing version list...", "TEST")

    response = httpx.get(
        f"{BASE_URL}/api/work/{work_id}/versions?type=all",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )

    assert_status(response, 200, "GET /api/work/{id}/versions")
    data = response.json()

    assert_in("versions", data, "Response should contain versions")
    assert_in("current_version", data, "Response should contain current_version")

    # Should have at least 2 submitted versions + 1 draft
    versions = data["versions"]
    submitted_versions = [v for v in versions if v["is_submitted"]]

    assert_equal(
        len(submitted_versions) >= 2,
        True,
        f"Should have at least 2 submitted versions, got {len(submitted_versions)}"
    )

    log(f"Version list retrieved: {len(versions)} total versions", "SUCCESS")


def test_12_revert():
    """Test: Revert to previous version"""
    log("Testing version revert...", "TEST")

    response = httpx.post(
        f"{BASE_URL}/api/work/{work_id}/revert",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "target_version": first_version,
            "device_id": DEVICE_ID,
        },
        timeout=10.0,
    )

    assert_status(response, 200, "POST /api/work/{id}/revert")
    data = response.json()

    assert_equal(data["ok"], True, "Revert should succeed")
    assert_in("new_version", data, "Should return new version number")

    log(f"Reverted to version {first_version}, created new version {data['new_version']}", "SUCCESS")


def test_13_delete_work():
    """Test: Delete work"""
    log("Testing work deletion...", "TEST")

    response = httpx.delete(
        f"{BASE_URL}/api/work/{work_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )

    assert_status(response, 200, "DELETE /api/work/{id}")
    data = response.json()

    assert_equal(data["ok"], True, "Delete should succeed")

    # Verify work is deleted
    response = httpx.get(
        f"{BASE_URL}/api/work/{work_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )

    assert_status(response, 404, "GET deleted work should return 404")

    log("Work deleted successfully", "SUCCESS")


def test_14_work_list():
    """Test: Get work list"""
    log("Testing work list...", "TEST")

    response = httpx.get(
        f"{BASE_URL}/api/work/list",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10.0,
    )

    assert_status(response, 200, "GET /api/work/list")
    data = response.json()

    assert_in("items", data, "Response should contain items")

    log(f"Work list retrieved: {len(data['items'])} works", "SUCCESS")


# =============================================================================
# Test Runner
# =============================================================================


def run_tests():
    """Run all integration tests"""
    tests = [
        test_01_signup,
        test_02_login,
        test_03_create_work,
        test_04_get_work,
        test_05_auto_save,
        test_06_manual_save,
        test_07_first_submit,
        test_08_get_analysis,
        test_09_second_submit_without_marking,
        test_10_second_submit_with_marking,
        test_11_version_list,
        test_12_revert,
        test_13_delete_work,
        test_14_work_list,
    ]

    passed = 0
    failed = 0

    log("=" * 60, "INFO")
    log("Starting Backend Integration Tests", "INFO")
    log("=" * 60, "INFO")

    for test in tests:
        try:
            test()
            passed += 1
        except TestFailure as e:
            log(f"FAILED: {test.__name__}", "ERROR")
            log(str(e), "ERROR")
            failed += 1
        except Exception as e:
            log(f"ERROR: {test.__name__}", "ERROR")
            log(f"Unexpected error: {type(e).__name__}: {str(e)}", "ERROR")
            failed += 1

    log("=" * 60, "INFO")
    log(f"Tests completed: {passed} passed, {failed} failed", "INFO")
    log("=" * 60, "INFO")

    return failed == 0


if __name__ == "__main__":
    import sys
    success = run_tests()
    sys.exit(0 if success else 1)
