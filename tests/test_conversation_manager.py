from typing import Any, Dict

from modules.conversation import manager as conversation_manager


def _make_executor():
    executed = []

    def executor(query: Dict[str, Any]):
        executed.append(query)
        sql = query.get("sql", "")
        if "INSERT INTO conversations" in sql:
            return {"id": "comment-1"}
        if "FROM conversations" in sql:
            return [{"id": "comment-1", "content": "hello"}]
        return None

    return executor, executed


def test_add_and_list_comments(monkeypatch) -> None:
    executor, executed = _make_executor()
    conversation_manager.set_query_executor(executor)

    calls = []

    def fake_get_work(work_id, user_email):
        calls.append((work_id, user_email))
        return {"id": work_id, "user_email": user_email}

    monkeypatch.setattr(conversation_manager.work_manager, "get_work", fake_get_work)

    comment_id = conversation_manager.add_comment("work-1", "a@example.com", "hello")
    assert comment_id == "comment-1"

    comments = conversation_manager.list_comments("work-1", "a@example.com")
    assert comments == [{"id": "comment-1", "content": "hello"}]
    assert calls == [("work-1", "a@example.com"), ("work-1", "a@example.com")]
    assert any("INSERT INTO conversations" in q.get("sql", "") for q in executed)
