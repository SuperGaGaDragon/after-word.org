from backend.errors import BusinessError
from backend.modules.work import manager
from backend.modules.session_lock import lock as session_lock


def _make_executor(store):
    def executor(query):
        sql = query["sql"]
        params = query["params"]
        if "INSERT INTO works" in sql:
            work_id = f"work-{len(store)}"
            store[work_id] = {
                "id": work_id,
                "user_email": params["user_email"],
                "content": "",
                "updated_at": "t0",
            }
            return {"id": work_id}
        if "FROM works WHERE id" in sql:
            work = store.get(params["work_id"])
            if work and work["user_email"] == params["user_email"]:
                return work
            return None
        if "FROM works WHERE user_email" in sql:
            return list(store.values())
        if "UPDATE works SET content" in sql:
            work = store.get(params["work_id"])
            if work and work["user_email"] == params["user_email"]:
                work["content"] = params["content"]
            return {"ok": True}
        return None

    return executor


def test_create_list_get_update(monkeypatch):
    store = {}
    manager.set_query_executor(_make_executor(store))
    monkeypatch.setattr(session_lock, "acquire_lock", lambda *_: True)
    monkeypatch.setattr(session_lock, "refresh_lock", lambda *_: True)

    work_id = manager.create_work("a@b.com")
    assert work_id in store
    works = manager.list_works("a@b.com")
    assert len(works) == 1
    work = manager.get_work(work_id, "a@b.com")
    assert work["id"] == work_id
    manager.update_work(work_id, "a@b.com", "hello", "device-1")
    assert store[work_id]["content"] == "hello"


def test_update_lock_conflict(monkeypatch):
    store = {}
    manager.set_query_executor(_make_executor(store))
    work_id = manager.create_work("a@b.com")
    monkeypatch.setattr(session_lock, "acquire_lock", lambda *_: False)
    try:
        manager.update_work(work_id, "a@b.com", "hello", "device-1")
    except BusinessError as exc:
        assert exc.code == "locked"
    else:
        raise AssertionError("expected locked")
