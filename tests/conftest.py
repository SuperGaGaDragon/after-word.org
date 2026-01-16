import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "backend"

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("APP_HOST", "127.0.0.1")
os.environ.setdefault("APP_PORT", "8000")
os.environ.setdefault("JWT_SECRET_KEY", "secret")
os.environ.setdefault("JWT_EXPIRE_MINUTES", "60")
os.environ.setdefault("DATABASE_URL", "postgresql://user:pass@localhost/db")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("WORK_LOCK_EXPIRE_SECONDS", "30")
os.environ.setdefault("LLM_BASE_URL", "https://llm.after-word.org")
os.environ.setdefault("LLM_TIMEOUT_SECONDS", "10")
os.environ.setdefault("FRONTEND_BASE_URL", "http://localhost:3000")
