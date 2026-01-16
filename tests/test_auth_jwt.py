import importlib
import os
import sys

import pytest


def _set_required_env() -> None:
    os.environ["APP_ENV"] = "test"
    os.environ["APP_HOST"] = "127.0.0.1"
    os.environ["APP_PORT"] = "8000"
    os.environ["JWT_SECRET_KEY"] = "secret"
    os.environ["JWT_EXPIRE_MINUTES"] = "60"
    os.environ["DATABASE_URL"] = "postgresql://user:pass@localhost/db"
    os.environ["REDIS_URL"] = "redis://localhost:6379/0"
    os.environ["WORK_LOCK_EXPIRE_SECONDS"] = "30"
    os.environ["LLM_BASE_URL"] = "https://llm.after-word.org"
    os.environ["LLM_TIMEOUT_SECONDS"] = "10"
    os.environ["FRONTEND_BASE_URL"] = "http://localhost:3000"


def _reload_jwt_module():
    _set_required_env()
    for module_name in ("backend.config", "backend.modules.auth.jwt"):
        if module_name in sys.modules:
            del sys.modules[module_name]
    return importlib.import_module("backend.modules.auth.jwt")


def test_create_and_decode_token() -> None:
    jwt_module = _reload_jwt_module()
    token = jwt_module.create_token("user@example.com", "user")
    payload = jwt_module.decode_token(token)
    assert payload["email"] == "user@example.com"
    assert payload["username"] == "user"


def test_decode_invalid_token_raises() -> None:
    jwt_module = _reload_jwt_module()
    with pytest.raises(jwt_module.BusinessError) as excinfo:
        jwt_module.decode_token("not-a-token")
    assert excinfo.value.code == "unauthorized"
