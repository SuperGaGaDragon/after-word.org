import os
from pathlib import Path


def _load_env() -> None:
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        key = key.strip()
        value = value.strip()
        if key and key not in os.environ:
            os.environ[key] = value


def _require(key: str) -> str:
    value = os.getenv(key)
    if value is None:
        raise RuntimeError(f"Missing env var: {key}")
    return value


_load_env()

APP_ENV = _require("APP_ENV")
APP_HOST = _require("APP_HOST")
APP_PORT = int(_require("APP_PORT"))

JWT_SECRET_KEY = _require("JWT_SECRET_KEY")
JWT_EXPIRE_MINUTES = int(_require("JWT_EXPIRE_MINUTES"))

DATABASE_URL = _require("DATABASE_URL")

REDIS_URL = _require("REDIS_URL")
WORK_LOCK_EXPIRE_SECONDS = int(_require("WORK_LOCK_EXPIRE_SECONDS"))

LLM_BASE_URL = _require("LLM_BASE_URL")
LLM_TIMEOUT_SECONDS = int(_require("LLM_TIMEOUT_SECONDS"))

FRONTEND_BASE_URL = _require("FRONTEND_BASE_URL")
