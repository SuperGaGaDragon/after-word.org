from fastapi.testclient import TestClient

from backend.api.auth import deps as auth_deps
from backend.errors import BusinessError
from backend.main import app
from backend.modules.conversation import manager as conversation_manager
from backend.modules.llm_gateway import client as llm_client


def test_llm_comment_success(monkeypatch):
    app.dependency_overrides[auth_deps.require_user] = lambda: {
        "email": "a@b.com",
        "username": "usera",
    }
    monkeypatch.setattr(llm_client, "generate_comment", lambda *_: "ok")
    monkeypatch.setattr(conversation_manager, "add_comment", lambda *_: "c1")

    client = TestClient(app)
    response = client.post(
        "/api/llm/comment",
        json={"work_id": "w1", "text_snapshot": "hello"},
    )
    assert response.status_code == 200
    assert response.json()["comment"] == "ok"
    app.dependency_overrides.clear()


def test_llm_comment_failure(monkeypatch):
    app.dependency_overrides[auth_deps.require_user] = lambda: {
        "email": "a@b.com",
        "username": "usera",
    }

    def _fail(*_args, **_kwargs):
        raise BusinessError("llm_failed", "fail")

    monkeypatch.setattr(llm_client, "generate_comment", _fail)
    client = TestClient(app)
    response = client.post(
        "/api/llm/comment",
        json={"work_id": "w1", "text_snapshot": "hello"},
    )
    assert response.status_code == 502
    app.dependency_overrides.clear()
