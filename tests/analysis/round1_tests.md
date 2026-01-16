# Round 1 Test Failures Analysis

## Summary
Two tests failed due to an AttributeError in the password verification helper used by auth logic.

## Failing Tests
1. `tests/test_auth_signup_login_change.py::test_login_by_email_and_username`
2. `tests/test_auth_signup_login_change.py::test_change_password_success_and_failures`

## Error Details
Both failures originate from `backend/modules/auth/passwords.py`:

- Error: `AttributeError: module 'hashlib' has no attribute 'compare_digest'`
- Location: `verify_password`, line calling `hashlib.compare_digest`.

The stack trace shows `verify_password` is invoked by:
- `modules/auth/login.py` during login password verification.
- `modules/auth/change.py` during password change verification.

## Likely Root Cause
`hashlib.compare_digest` is not available in Python 3.12. The standard constant-time compare is in `hmac.compare_digest` (or `secrets.compare_digest`). Using `hashlib.compare_digest` raises `AttributeError` and stops both flows.

## Fix Recommendation
Replace the call in `backend/modules/auth/passwords.py`:

- From: `hashlib.compare_digest(candidate, digest)`
- To: `hmac.compare_digest(candidate, digest)` or `secrets.compare_digest(candidate, digest)`

Also ensure `hmac` or `secrets` is imported in that module.

## Expected Outcome After Fix
Both login and change-password flows should succeed under correct credentials, and the two failing tests should pass.
