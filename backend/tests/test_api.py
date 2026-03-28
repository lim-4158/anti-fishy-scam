"""Tests for the FastAPI /api/analyze endpoint — mocks the orchestrator agent."""

import json
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

# Mock config before imports
with patch.dict("os.environ", {
    "TINYFISH_API_KEY": "test-key",
    "OPENAI_API_KEY": "test-key",
}):
    import sys
    if "config" in sys.modules:
        del sys.modules["config"]

    import config
    config.TINYFISH_API_KEY = "test-key"
    config.OPENAI_API_KEY = "test-key"

from main import app, _build_agent_input, _try_parse_json_lines
from models import AnalyzeRequest, AnalyzeContext
from httpx import AsyncClient, ASGITransport


# ── Unit tests for helpers ───────────────────────────────────────────────────

def test_build_agent_input_minimal():
    req = AnalyzeRequest(message="Is this a scam?")
    result = _build_agent_input(req)
    assert "Is this a scam?" in result


def test_build_agent_input_with_context():
    req = AnalyzeRequest(
        message="Check this job",
        session_id="abc-123",
        context=AnalyzeContext(
            channel="LinkedIn",
            company="TechVenture Global",
            contact="john@techventure.com",
        ),
    )
    result = _build_agent_input(req)
    assert "LinkedIn" in result
    assert "TechVenture Global" in result
    assert "john@techventure.com" in result
    assert "abc-123" in result


def test_parse_json_lines_happy_path():
    text = '{"type": "classification", "scam_type": "job_scam", "confidence": 0.9, "summary": "Test"}\n{"type": "done"}\n'
    events = _try_parse_json_lines(text)
    assert len(events) == 2
    assert events[0]["type"] == "classification"
    assert events[1]["type"] == "done"


def test_parse_json_lines_with_noise():
    text = """Some preamble text
```json
{"type": "classification", "scam_type": "generic", "confidence": 0.5, "summary": "test"}
```
{"type": "done"}
"""
    events = _try_parse_json_lines(text)
    assert len(events) == 2


def test_parse_json_lines_empty():
    assert _try_parse_json_lines("") == []
    assert _try_parse_json_lines("not json at all") == []


# ── Integration tests with mocked Runner ─────────────────────────────────────

class FakeStreamEvent:
    """Simulates a raw_response_event with text delta."""
    def __init__(self, delta: str):
        self.type = "raw_response_event"
        self.data = MagicMock()
        self.data.delta = delta
        # Make isinstance check work
        self.data.__class__ = type("ResponseTextDeltaEvent", (), {})


class FakeRunResult:
    """Simulates Runner.run_streamed result."""
    def __init__(self, events_text: str):
        self._text = events_text
        self.final_output = events_text

    async def stream_events(self):
        # Simulate streaming the full text in one chunk
        from openai.types.responses import ResponseTextDeltaEvent as RealDelta
        event = MagicMock()
        event.type = "raw_response_event"
        event.data = MagicMock(spec=RealDelta)
        event.data.delta = self._text
        yield event


@pytest.mark.asyncio
async def test_analyze_endpoint_returns_sse():
    """Test that /api/analyze returns SSE events."""
    mock_output = (
        '{"type": "classification", "scam_type": "job_scam", "confidence": 0.85, "summary": "Suspicious job posting"}\n'
        '{"type": "check_started", "check_id": "company_website", "name": "Company Website", "icon": "globe"}\n'
        '{"type": "check_complete", "check_id": "company_website", "status": "red", "summary": "Thin template site", "details": {"evidence": ["No team page"]}}\n'
        '{"type": "verdict", "overall": "likely_scam", "score": 0.85, "summary": "Multiple red flags", "checks_summary": [{"check_id": "company_website", "name": "Company Website", "status": "red", "one_liner": "Thin site"}]}\n'
        '{"type": "done"}\n'
    )

    with patch("main.Runner") as mock_runner:
        mock_runner.run_streamed.return_value = FakeRunResult(mock_output)

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/analyze",
                json={"message": "Is this job posting legit? https://techventure-global.com/careers"},
            )

    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "antifishy"


@pytest.mark.asyncio
async def test_analyze_with_empty_message_fails():
    """Empty message should fail validation."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/analyze", json={})
    assert response.status_code == 422  # Validation error
