# Auth Check Contract

## Functions
- is_email_taken(email) -> bool
- is_username_taken(username) -> bool

## Boundaries
- Only depends on storage/user and storage/user_retrieve.
- Returns booleans; does not raise business errors.
