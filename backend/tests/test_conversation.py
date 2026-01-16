from backend.errors import BusinessError
from backend.modules.conversation import manager
from backend.modules.work import manager as work_manager


def _make_executor(store):
    def executor(query):
        sql = query["sql"]
        params = query["params"]
        if "INSERT INTO conversations" in sql:
            comment_id = f"c-{len(store)}"
            store.append({
                "id": comment_id,
                "work_id": params["work_id"],
                "user_email": params["user_email"],
                "content": params["content"],
            })
            return {"id": comment_id}
        if "FROM conversations" in sql:
            return list(store)
        return None

    return executor


def test_add_and_list_comments(monkeypatch):
    store = []
    manager.set_query_executor(_make_executor(store))
    monkeypatch.setattr(work_manager, "get_work", lambda *_: {"id": "w1"})
    comment_id = manager.add_comment("w1", "a@b.com", "hi")
    assert comment_id is not None
    items = manager.list_comments("w1", "a@b.com")
    assert len(items) == 1


def test_add_comment_requires_work(monkeypatch):
    store = []
    manager.set_query_executor(_make_executor(store))
    monkeypatch.setattr(work_manager, "get_work", lambda *_: (_ for _ in ()).throw(
        BusinessError("not_found", "work not found")
    ))
    try:
        manager.add_comment("w1", "a@b.com", "hi")
    except BusinessError as exc:
        assert exc.code == "not_found"
    else:
        raise AssertionError("expected not_found")
