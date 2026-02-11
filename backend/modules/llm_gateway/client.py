from typing import Any, Dict

import httpx

from backend.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_TIMEOUT_SECONDS
from backend.errors import BusinessError


def _build_prompt(text_snapshot: str) -> str:
    instruction = (
        "Read the text and provide a concise assistant comment. "
        "Do not include user identities."
    )
    return f"{instruction}\n\n{text_snapshot}"


def _llm_endpoint() -> str:
    base = LLM_BASE_URL.rstrip("/")
    if base.endswith("/v1/chat/completions"):
        return base
    if base.endswith("/v1"):
        return f"{base}/chat/completions"
    return f"{base}/v1/chat/completions"


def generate_comment(text_snapshot: str) -> str:
    prompt = _build_prompt(text_snapshot)
    payload: Dict[str, Any] = {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": prompt}],
    }
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }

    endpoint = _llm_endpoint()
    print(f"[LLM] Calling endpoint: {endpoint}")
    print(f"[LLM] Model: {LLM_MODEL}")
    print(f"[LLM] API Key prefix: {LLM_API_KEY[:20]}...")

    try:
        response = httpx.post(
            endpoint,
            json=payload,
            headers=headers,
            timeout=LLM_TIMEOUT_SECONDS
        )
        print(f"[LLM] Response status: {response.status_code}")
        print(f"[LLM] Response text: {response.text[:500]}")

        response.raise_for_status()
        data = response.json()
    except httpx.HTTPStatusError as exc:
        print(f"[LLM ERROR] HTTP {exc.response.status_code}: {exc.response.text}")
        raise BusinessError("llm_failed", f"LLM API error: {exc.response.status_code}") from exc
    except Exception as exc:
        print(f"[LLM ERROR] Exception: {type(exc).__name__}: {str(exc)}")
        raise BusinessError("llm_failed", f"llm request failed: {str(exc)}") from exc
    choices = data.get("choices") or []
    if choices:
        message = choices[0].get("message") or {}
        content = message.get("content") or choices[0].get("text")
        if isinstance(content, str) and content:
            return content
    comment = data.get("comment") or data.get("text")
    if isinstance(comment, str) and comment:
        return comment
    raise BusinessError("llm_failed", "invalid llm response")
