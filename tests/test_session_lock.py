import importlib
import sys


class FakeRedis:
    def __init__(self) -> None:
        self.store = {}
        self.expire_calls = []

    def set(self, key, value, nx=False, ex=None):
        if nx and key in self.store:
            return False
        self.store[key] = value
        if ex is not None:
            self.expire_calls.append((key, ex))
        return True

    def get(self, key):
        return self.store.get(key)

    def expire(self, key, seconds):
        if key not in self.store:
            return False
        self.expire_calls.append((key, seconds))
        return True

    def delete(self, key):
        if key in self.store:
            del self.store[key]
            return 1
        return 0


def _reload_lock_module():
    for name in ("backend.config", "backend.modules.session_lock.lock"):
        if name in sys.modules:
            del sys.modules[name]
    return importlib.import_module("backend.modules.session_lock.lock")


def test_lock_acquire_and_refresh() -> None:
    lock = _reload_lock_module()
    client = FakeRedis()
    lock.set_client(client)

    assert lock.acquire_lock("work-1", "device-1") is True
    assert client.get("work_lock:work-1") == "device-1"

    assert lock.acquire_lock("work-1", "device-2") is False

    assert lock.acquire_lock("work-1", "device-1") is True
    assert client.expire_calls


def test_lock_refresh_release_and_holder() -> None:
    lock = _reload_lock_module()
    client = FakeRedis()
    lock.set_client(client)

    assert lock.get_lock_holder("work-2") is None
    assert lock.acquire_lock("work-2", "device-9") is True
    assert lock.get_lock_holder("work-2") == "device-9"
    assert lock.refresh_lock("work-2", "other-device") is False
    assert lock.refresh_lock("work-2", "device-9") is True
    assert lock.release_lock("work-2", "other-device") is False
    assert lock.release_lock("work-2", "device-9") is True
    assert lock.get_lock_holder("work-2") is None
