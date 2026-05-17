"""LobsterTrap async DPI pre-check for /v1/verify. Fail-open on unreachable:
the 9-vendor adversarial ensemble is the primary safety layer."""
from __future__ import annotations

import time
from typing import Optional

import httpx

LOBSTERTRAP_PATH = "/dpi/inspect"
LOBSTERTRAP_TIMEOUT = 5.0
DENY_MARKER = "lobstertrap-deny"


def _make_client() -> httpx.AsyncClient:
    """Factory the tests monkeypatch to inject a MockTransport."""
    return httpx.AsyncClient(timeout=LOBSTERTRAP_TIMEOUT)


def _safe_json(resp: httpx.Response) -> dict:
    try:
        body = resp.json()
        return body if isinstance(body, dict) else {}
    except Exception:  # noqa: BLE001
        return {}


def _extract_reason(resp: httpx.Response, default: str) -> str:
    body = _safe_json(resp)
    for key in ("reason", "detail", "message"):
        v = body.get(key)
        if isinstance(v, str):
            return v[:240]
    return default


async def check_prompt_with_lobstertrap(
    prompt: str,
    lt_url: Optional[str],
) -> dict:
    """Forward ``prompt`` to LobsterTrap for DPI inspection.

    Returns a dict ``{allowed, reason, latency_ms, source}``.
    """
    if not lt_url:
        return {
            "allowed": True,
            "reason": "LOBSTERTRAP_URL not set",
            "latency_ms": 0.0,
            "source": "disabled",
        }

    url = lt_url.rstrip("/") + LOBSTERTRAP_PATH
    started = time.perf_counter()
    try:
        async with _make_client() as client:
            resp = await client.post(
                url,
                json={"content": prompt, "direction": "inbound"},
            )
    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPError) as exc:
        return {
            "allowed": True,
            "reason": f"lobstertrap unreachable: {type(exc).__name__}",
            "latency_ms": (time.perf_counter() - started) * 1000.0,
            "source": "unreachable-fallback",
        }

    latency_ms = (time.perf_counter() - started) * 1000.0

    if resp.status_code == 403:
        return {
            "allowed": False,
            "reason": _extract_reason(resp, default="403 deny"),
            "latency_ms": latency_ms,
            "source": "lobstertrap",
        }

    if 200 <= resp.status_code < 300:
        body = _safe_json(resp)
        if body.get("id") == DENY_MARKER or body.get("verdict") == "deny":
            return {
                "allowed": False,
                "reason": _extract_reason(resp, default="deny marker in body"),
                "latency_ms": latency_ms,
                "source": "lobstertrap",
            }
        return {
            "allowed": True,
            "reason": "ok",
            "latency_ms": latency_ms,
            "source": "lobstertrap",
        }

    return {
        "allowed": True,
        "reason": f"unexpected status {resp.status_code}",
        "latency_ms": latency_ms,
        "source": "unreachable-fallback",
    }
