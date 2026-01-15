# Architecture Guardrails

- Frontend cannot decide whether editing is allowed; it only reflects UI state.
- API layer must not build prompts and must not contain business logic.
- LLM Gateway cannot access Storage or change system state.
- Work cannot write to Storage without Session/Lock.
- Storage does not implement business rules or call business components.
