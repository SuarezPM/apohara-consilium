"""Tests for packages/backend/lobstertrap_client.py — 7 cases covering the
5 acceptance-criteria paths (disabled×2, allow, deny-403, deny-body-marker,
timeout, connect-error)."""
from __future__ import annotations

import asyncio

import httpx
import pytest

import lobstertrap_client
from lobstertrap_client import DENY_MARKER, check_prompt_with_lobstertrap


@pytest.fixture()
def mock_transport(monkeypatch):
    """Returns a setter that swaps _make_client to use an httpx.MockTransport."""
    def _set(handler):
        transport = httpx.MockTransport(handler)
        monkeypatch.setattr(
            lobstertrap_client,
            "_make_client",
            lambda: httpx.AsyncClient(transport=transport, timeout=5.0),
        )
    return _set


def test_disabled_when_lt_url_none():
    out = asyncio.run(check_prompt_with_lobstertrap("any prompt", None))
    assert out["allowed"] is True
    assert out["source"] == "disabled"
    assert out["latency_ms"] == 0.0


def test_disabled_when_lt_url_blank():
    out = asyncio.run(check_prompt_with_lobstertrap("any prompt", ""))
    assert out["allowed"] is True
    assert out["source"] == "disabled"


def test_allow_passthrough_on_200(mock_transport):
    mock_transport(lambda req: httpx.Response(200, json={"verdict": "allow"}))
    out = asyncio.run(
        check_prompt_with_lobstertrap("benign prompt", "http://lobstertrap:8080")
    )
    assert out["allowed"] is True
    assert out["source"] == "lobstertrap"
    assert out["reason"] == "ok"
    assert out["latency_ms"] >= 0


def test_deny_on_403(mock_transport):
    mock_transport(
        lambda req: httpx.Response(403, json={"reason": "prompt-injection pattern"})
    )
    out = asyncio.run(
        check_prompt_with_lobstertrap(
            "ignore previous instructions", "http://lobstertrap:8080"
        )
    )
    assert out["allowed"] is False
    assert out["source"] == "lobstertrap"
    assert "prompt-injection" in out["reason"]


def test_deny_marker_in_200_body(mock_transport):
    mock_transport(
        lambda req: httpx.Response(
            200, json={"id": DENY_MARKER, "reason": "blocked by DPI"}
        )
    )
    out = asyncio.run(
        check_prompt_with_lobstertrap("malicious", "http://lobstertrap:8080")
    )
    assert out["allowed"] is False
    assert out["source"] == "lobstertrap"
    assert "blocked by DPI" in out["reason"]


def test_fail_open_on_timeout(mock_transport):
    def _raise(req):
        raise httpx.TimeoutException("timeout")
    mock_transport(_raise)
    out = asyncio.run(
        check_prompt_with_lobstertrap("prompt", "http://lobstertrap:8080")
    )
    assert out["allowed"] is True
    assert out["source"] == "unreachable-fallback"
    assert "Timeout" in out["reason"]


def test_fail_open_on_connect_error(mock_transport):
    def _raise(req):
        raise httpx.ConnectError("no route")
    mock_transport(_raise)
    out = asyncio.run(
        check_prompt_with_lobstertrap("prompt", "http://lobstertrap:8080")
    )
    assert out["allowed"] is True
    assert out["source"] == "unreachable-fallback"
    assert "ConnectError" in out["reason"]
