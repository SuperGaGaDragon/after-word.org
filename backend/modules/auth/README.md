# Auth Check Contract

## Functions
- is_email_taken(email) -> bool
- is_username_taken(username) -> bool
- signup(email, username, password) -> user
- login(email_or_username, password) -> user
- change_password(email, old_password, new_password, new_password_confirm) -> ok
- change_username(email, new_username) -> ok

## Boundaries
- Depends on storage/user and storage/user_retrieve.
- Uses shared BusinessError from backend/errors.py.
## Signup rules
- Uniqueness is enforced by the check component.
- Passwords are stored as hashes.

## Login rules
- Supports email or username.
- Passwords must verify against the stored hash.

## Change rules
- Email cannot be changed.
- New password must match confirmation and differ from the old password.
- New username must differ and not already exist.
