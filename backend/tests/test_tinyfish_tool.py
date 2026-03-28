"""Tests for the TinyFish browse_website tool — mocks the TinyFish API."""

import json
import pytest
import httpx

# Patch config before importing the tool
import sys
from unittest.mock import patch, MagicMock

# Mock config values before importing tool module
with patch.dict("os.environ", {
    "TINYFISH_API_KEY": "test-key",
    "OPENAI_API_KEY": "test-key",
}):
    if "config" in sys.modules:
        del sys.modules["config"]

    import config
    config.TINYFISH_API_KEY = "test-key"
    config.OPENAI_API_KEY = "test-key"
    config.TINYFISH_TIMEOUT = 10

    from tools.tinyfish import browse_website


def _make_sse_body(events: list[dict]) -> str:
    """Build an SSE body string from a list of event dicts."""
    lines = []
    for evt in events:
        lines.append(f"data: {json.dumps(evt)}\n\n")
    return "".join(lines)


def _make_tool_context(tool_args: dict) -> MagicMock:
    """Create a minimal mock ToolContext."""
    ctx = MagicMock()
    ctx.tool_name = "browse_website"
    ctx.tool_call_id = "test-call-123"
    ctx.context = None
    return ctx


class FakeSSEResponse:
    """Fake streaming response that yields SSE chunks."""

    def __init__(self, events: list[dict], status_code: int = 200):
        self.status_code = status_code
        self._body = _make_sse_body(events)

    async def aiter_text(self):
        yield self._body

    async def aread(self):
        return self._body.encode()

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass


class FakeClient:
    """Fake httpx.AsyncClient that returns a FakeSSEResponse."""

    def __init__(self, events: list[dict], status_code: int = 200):
        self._events = events
        self._status_code = status_code

    def stream(self, method, url, **kwargs):
        return FakeSSEResponse(self._events, self._status_code)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args):
        pass


@pytest.mark.asyncio
async def test_successful_browse():
    """Test happy-path: STREAMING_URL -> PROGRESS -> COMPLETE."""
    events = [
        {"type": "STREAMING_URL", "streamingUrl": "https://stream.tinyfish.ai/abc123"},
        {"type": "PROGRESS", "message": "Navigating to page..."},
        {"type": "PROGRESS", "message": "Extracting data..."},
        {"type": "COMPLETE", "resultJson": {"title": "Test Page", "data": [1, 2, 3]}},
    ]

    tool_args = {"url": "https://example.com", "goal": "Extract the title", "browser_profile": "lite"}
    ctx = _make_tool_context(tool_args)

    with patch("tools.tinyfish.httpx.AsyncClient", return_value=FakeClient(events)):
        result_str = await browse_website.on_invoke_tool(ctx, json.dumps(tool_args))

    result = json.loads(result_str)
    assert result["error"] is False
    assert result["url"] == "https://example.com"
    assert result["data"]["title"] == "Test Page"
    assert result["progress_steps"] == 2
    assert "browser_stream_url" in result


@pytest.mark.asyncio
async def test_tinyfish_error_event():
    """Test that TinyFish ERROR events are returned properly."""
    events = [
        {"type": "STREAMING_URL", "streamingUrl": "https://stream.tinyfish.ai/xyz"},
        {"type": "PROGRESS", "message": "Loading page..."},
        {"type": "ERROR", "message": "Page blocked by Cloudflare"},
    ]

    tool_args = {"url": "https://blocked.com", "goal": "Extract data", "browser_profile": "lite"}
    ctx = _make_tool_context(tool_args)

    with patch("tools.tinyfish.httpx.AsyncClient", return_value=FakeClient(events)):
        result_str = await browse_website.on_invoke_tool(ctx, json.dumps(tool_args))

    result = json.loads(result_str)
    assert result["error"] is True
    assert "Cloudflare" in result["message"]
    assert len(result["progress"]) == 1


@pytest.mark.asyncio
async def test_timeout_handling():
    """Test that httpx timeouts are caught and returned as errors."""

    class TimeoutClient:
        def stream(self, *args, **kwargs):
            raise httpx.TimeoutException("Connection timed out")

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

    tool_args = {"url": "https://slow.com", "goal": "Get data", "browser_profile": "lite"}
    ctx = _make_tool_context(tool_args)

    with patch("tools.tinyfish.httpx.AsyncClient", return_value=TimeoutClient()):
        result_str = await browse_website.on_invoke_tool(ctx, json.dumps(tool_args))

    result = json.loads(result_str)
    assert result["error"] is True
    assert "timed out" in result["message"]


@pytest.mark.asyncio
async def test_http_error_status():
    """Test non-200 HTTP responses."""

    class ErrorResponse:
        status_code = 429

        async def aread(self):
            return b"Rate limited"

        async def aiter_text(self):
            yield ""

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

    class ErrorClient:
        def stream(self, *args, **kwargs):
            return ErrorResponse()

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

    tool_args = {"url": "https://example.com", "goal": "test", "browser_profile": "lite"}
    ctx = _make_tool_context(tool_args)

    with patch("tools.tinyfish.httpx.AsyncClient", return_value=ErrorClient()):
        result_str = await browse_website.on_invoke_tool(ctx, json.dumps(tool_args))

    result = json.loads(result_str)
    assert result["error"] is True
    assert "429" in result["message"]


@pytest.mark.asyncio
async def test_stealth_adds_proxy():
    """Test that stealth browser_profile adds proxy config."""
    captured_kwargs = {}

    class CapturingResponse:
        status_code = 200

        async def aiter_text(self):
            yield 'data: {"type": "COMPLETE", "resultJson": {}}\n\n'

        async def aread(self):
            return b""

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

    class CapturingClient:
        def stream(self, method, url, **kwargs):
            captured_kwargs.update(kwargs)
            return CapturingResponse()

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            pass

    tool_args = {"url": "https://example.com", "goal": "test", "browser_profile": "stealth"}
    ctx = _make_tool_context(tool_args)

    with patch("tools.tinyfish.httpx.AsyncClient", return_value=CapturingClient()):
        await browse_website.on_invoke_tool(ctx, json.dumps(tool_args))

    payload = captured_kwargs["json"]
    assert payload["browser_profile"] == "stealth"
    assert payload["proxy_config"]["enabled"] is True
    assert payload["proxy_config"]["country_code"] == "US"
