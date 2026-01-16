import importlib
import sys

import pytest


class FakeResponse:
    def __init__(self, payload, raise_error=False) -> None:
        self.payload = payload
        self.raise_error = raise_error
        self.status_checked = False

    def raise_for_status(self) -> None:
        self.status_checked = True
        if self.raise_error:
            raise RuntimeError("http error")

    def json(self):
        return self.payload


def _reload_client_module():
    for name in ("backend.config", "backend.modules.llm_gateway.client"):
        if name in sys.modules:
            del sys.modules[name]
    return importlib.import_module("backend.modules.llm_gateway.client")


def test_generate_comment_success(monkeypatch) -> None:
    client = _reload_client_module()
    captured = {}

    def fake_post(url, json, timeout):
        captured["url"] = url
        captured["json"] = json
        captured["timeout"] = timeout
        return FakeResponse({"comment": "ok"})

    monkeypatch.setattr(client.httpx, "post", fake_post)

    result = client.generate_comment("sample text")
    assert result == "ok"
    assert "sample text" in captured["json"]["prompt"]
    assert "Do not include user identities." in captured["json"]["prompt"]


def test_generate_comment_invalid_response(monkeypatch) -> None:
    client = _reload_client_module()

    def fake_post(url, json, timeout):
        return FakeResponse({"unexpected": "value"})

    monkeypatch.setattr(client.httpx, "post", fake_post)

    with pytest.raises(client.BusinessError) as excinfo:
        client.generate_comment("sample text")
    assert excinfo.value.code == "llm_failed"


def test_generate_comment_http_error(monkeypatch) -> None:
    client = _reload_client_module()

    def fake_post(url, json, timeout):
        return FakeResponse({"comment": "x"}, raise_error=True)

    monkeypatch.setattr(client.httpx, "post", fake_post)

    with pytest.raises(client.BusinessError) as excinfo:
        client.generate_comment("sample text")
    assert excinfo.value.code == "llm_failed"
