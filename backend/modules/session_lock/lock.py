from typing import Optional

import redis

from config import REDIS_URL, WORK_LOCK_EXPIRE_SECONDS

_CLIENT: Optional[redis.Redis] = None


def set_client(client: redis.Redis) -> None:
    """Set a Redis client for dependency injection."""
    global _CLIENT
    _CLIENT = client


def _get_client() -> redis.Redis:
    if _CLIENT is None:
        return redis.Redis.from_url(REDIS_URL, decode_responses=True)
    return _CLIENT


def _key(work_id: str) -> str:
    return f"work_lock:{work_id}"


def acquire_lock(work_id: str, device_id: str) -> bool:
    client = _get_client()
    key = _key(work_id)
    acquired = client.set(key, device_id, nx=True, ex=WORK_LOCK_EXPIRE_SECONDS)
    if acquired:
        return True
    holder = client.get(key)
    if holder == device_id:
        client.expire(key, WORK_LOCK_EXPIRE_SECONDS)
        return True
    return False


def refresh_lock(work_id: str, device_id: str) -> bool:
    client = _get_client()
    key = _key(work_id)
    if client.get(key) != device_id:
        return False
    return bool(client.expire(key, WORK_LOCK_EXPIRE_SECONDS))


def release_lock(work_id: str, device_id: str) -> bool:
    client = _get_client()
    key = _key(work_id)
    if client.get(key) != device_id:
        return False
    return bool(client.delete(key))


def get_lock_holder(work_id: str) -> Optional[str]:
    client = _get_client()
    return client.get(_key(work_id))
