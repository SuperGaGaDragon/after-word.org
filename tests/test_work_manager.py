from typing import Any, Dict, Optional

import pytest

from backend.errors import BusinessError
from backend.modules.work import manager as work_manager


def _make_executor(work_row: Optional[Dict[str, Any]] = None):
    executed = []

    def executor(query: Dict[str, Any]):
        executed.append(query)
        sql = query.get("sql", "")
        if "INSERT INTO works" in sql:
            return {"id": "work-1"}
        if "FROM works WHERE id" in sql:
            return work_row
        if "FROM works WHERE user_email" in sql:
            return [work_row] if work_row else []
        if "UPDATE works SET content" in sql:
            return {"updated": True}
        return None

    return executor, executed


def test_create_list_get_work() -> None:
    work_row = {"id": "work-1", "user_email": "a@example.com", "content": ""}
    executor, _ = _make_executor(work_row=work_row)
    work_manager.set_query_executor(executor)

    assert work_manager.create_work("a@example.com") == "work-1"
    assert work_manager.list_works("a@example.com") == [work_row]
    assert work_manager.get_work("work-1", "a@example.com") == work_row


def test_get_work_not_found() -> None:
    executor, _ = _make_executor(work_row=None)
    work_manager.set_query_executor(executor)

    with pytest.raises(BusinessError) as excinfo:
        work_manager.get_work("missing", "a@example.com")
    assert excinfo.value.code == "not_found"


def test_update_work_locking_and_refresh(monkeypatch) -> None:
    work_row = {"id": "work-2", "user_email": "b@example.com", "content": ""}
    executor, executed = _make_executor(work_row=work_row)
    work_manager.set_query_executor(executor)

    lock_calls = {"acquire": [], "refresh": []}

    def acquire_lock(work_id, device_id):
        lock_calls["acquire"].append((work_id, device_id))
        return False

    def refresh_lock(work_id, device_id):
        lock_calls["refresh"].append((work_id, device_id))
        return True

    monkeypatch.setattr(work_manager.session_lock, "acquire_lock", acquire_lock)
    monkeypatch.setattr(work_manager.session_lock, "refresh_lock", refresh_lock)

    with pytest.raises(BusinessError) as excinfo:
        work_manager.update_work("work-2", "b@example.com", "body", "device-1")
    assert excinfo.value.code == "locked"

    def acquire_success(work_id, device_id):
        lock_calls["acquire"].append((work_id, device_id))
        return True

    monkeypatch.setattr(work_manager.session_lock, "acquire_lock", acquire_success)

    assert (
        work_manager.update_work("work-2", "b@example.com", "body", "device-1")
        is True
    )
    assert lock_calls["refresh"] == [("work-2", "device-1")]
    update_queries = [
        q for q in executed if "UPDATE works SET content" in q.get("sql", "")
    ]
    assert len(update_queries) == 1
