# Storage Contracts

## Tables

### users
- id (uuid, pk)
- email (text, unique, not null)
- username (text, unique, not null)
- password_hash (text, not null)
- created_at (timestamptz)

### works
- id (uuid, pk)
- user_email (text, not null)
- content (text, default '')
- updated_at (timestamptz)
- created_at (timestamptz)

### conversations
- id (uuid, pk)
- work_id (uuid, not null)
- user_email (text, not null)
- role (text, not null, fixed to 'assistant')
- content (text, not null)
- created_at (timestamptz)

## Notes
- All retrieval queries must filter by user_email.
- Storage only provides CRUD contracts and SQL; business rules live elsewhere.
