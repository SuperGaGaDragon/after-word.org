# Auth API Dependencies

## Contract
- require_user() -> {email, username}

## Rules
- Reads Authorization: Bearer token.
- Only performs JWT parsing and validation.
- Does not invoke business logic.
