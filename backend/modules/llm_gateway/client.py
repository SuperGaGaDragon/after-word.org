from typing import Any, Dict

import httpx

from backend.config import (
    CLAUDE_API_KEY,
    CLAUDE_BASE_URL,
    CLAUDE_MODEL,
    CLAUDE_TIMEOUT_SECONDS,
    LLM_API_KEY,
    LLM_BASE_URL,
    LLM_MODEL,
    LLM_TIMEOUT_SECONDS,
)
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
    """Legacy function for simple text comment generation."""
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


def generate_rubric(prompt: str) -> str:
    """
    Generate evaluation rubric using Claude API.

    Args:
        prompt: The prompt requesting rubric generation

    Returns:
        JSON string containing rubric structure

    Raises:
        BusinessError: If API call fails or times out
    """
    payload: Dict[str, Any] = {
        "model": CLAUDE_MODEL,
        "max_tokens": 4096,
        "messages": [{"role": "user", "content": prompt}],
    }
    headers = {
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }

    endpoint = f"{CLAUDE_BASE_URL.rstrip('/')}/v1/messages"
    print(f"[CLAUDE] Calling endpoint: {endpoint}")
    print(f"[CLAUDE] Model: {CLAUDE_MODEL}")
    print(f"[CLAUDE] Prompt length: {len(prompt)} chars")

    try:
        response = httpx.post(
            endpoint,
            json=payload,
            headers=headers,
            timeout=CLAUDE_TIMEOUT_SECONDS
        )
        print(f"[CLAUDE] Response status: {response.status_code}")

        response.raise_for_status()
        data = response.json()

        # Extract content from Claude response
        content_blocks = data.get("content") or []
        if not content_blocks:
            raise BusinessError("claude_failed", "No content in Claude response")

        # Get text from first content block
        first_block = content_blocks[0]
        content = first_block.get("text")

        if not isinstance(content, str) or not content:
            raise BusinessError("claude_failed", "Empty or invalid content in Claude response")

        print(f"[CLAUDE] Rubric generated, length: {len(content)} chars")
        return content

    except httpx.TimeoutException as exc:
        print(f"[CLAUDE TIMEOUT] Request timed out after {CLAUDE_TIMEOUT_SECONDS}s")
        raise BusinessError("claude_timeout", f"Claude API timeout: {CLAUDE_TIMEOUT_SECONDS}s") from exc
    except httpx.HTTPStatusError as exc:
        print(f"[CLAUDE ERROR] HTTP {exc.response.status_code}: {exc.response.text}")
        raise BusinessError("claude_failed", f"Claude API error: {exc.response.status_code}") from exc
    except Exception as exc:
        print(f"[CLAUDE ERROR] Exception: {type(exc).__name__}: {str(exc)}")
        raise BusinessError("claude_failed", f"Claude request failed: {str(exc)}") from exc


def generate_structured_response(prompt: str) -> str:
    """
    Generate structured JSON response using OpenAI JSON Mode.

    Args:
        prompt: The prompt to send (must request JSON format in the text)

    Returns:
        JSON string from LLM

    Raises:
        BusinessError: If API call fails
    """
    payload: Dict[str, Any] = {
        "model": LLM_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},  # Enable JSON Mode
    }
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }

    endpoint = _llm_endpoint()
    print(f"[LLM] Calling endpoint: {endpoint} (JSON Mode)")
    print(f"[LLM] Model: {LLM_MODEL}")
    print(f"[LLM] Prompt length: {len(prompt)} chars")

    try:
        response = httpx.post(
            endpoint,
            json=payload,
            headers=headers,
            timeout=LLM_TIMEOUT_SECONDS
        )
        print(f"[LLM] Response status: {response.status_code}")

        response.raise_for_status()
        data = response.json()

        # Extract content from OpenAI response
        choices = data.get("choices") or []
        if not choices:
            raise BusinessError("llm_failed", "No choices in LLM response")

        message = choices[0].get("message") or {}
        content = message.get("content")

        if not isinstance(content, str) or not content:
            raise BusinessError("llm_failed", "Empty or invalid content in LLM response")

        print(f"[LLM] JSON response received, length: {len(content)} chars")
        return content

    except httpx.HTTPStatusError as exc:
        print(f"[LLM ERROR] HTTP {exc.response.status_code}: {exc.response.text}")
        raise BusinessError("llm_failed", f"LLM API error: {exc.response.status_code}") from exc
    except Exception as exc:
        print(f"[LLM ERROR] Exception: {type(exc).__name__}: {str(exc)}")
        raise BusinessError("llm_failed", f"llm request failed: {str(exc)}") from exc
