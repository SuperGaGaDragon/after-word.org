from typing import Any, Dict

import httpx

from backend.config import LLM_BASE_URL, LLM_TIMEOUT_SECONDS
from backend.errors import BusinessError


def _build_prompt(text_snapshot: str) -> str:
    instruction = (
        "Read the text and provide a concise assistant comment. "
        "Do not include user identities."
    )
    return f"{instruction}\n\n{text_snapshot}"


def generate_comment(text_snapshot: str) -> str:
    prompt = _build_prompt(text_snapshot)
    payload: Dict[str, Any] = {"prompt": prompt}
    try:
        response = httpx.post(
            LLM_BASE_URL, json=payload, timeout=LLM_TIMEOUT_SECONDS
        )
        response.raise_for_status()
        data = response.json()
    except Exception as exc:  # noqa: BLE001
        raise BusinessError("llm_failed", "llm request failed") from exc
    comment = data.get("comment") or data.get("text")
    if not isinstance(comment, str) or not comment:
        raise BusinessError("llm_failed", "invalid llm response")
    return comment
