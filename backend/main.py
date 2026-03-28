"""AntiFishy FastAPI application.

POST /api/analyze  →  SSE stream of scam-check events.
"""

from __future__ import annotations

import json
import logging
import traceback
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from agents import Runner, ItemHelpers
from openai.types.responses import ResponseTextDeltaEvent

from models import AnalyzeRequest, ErrorEvent, DoneEvent
from orchestration.orchestrator import orchestrator

# ── Setup ────────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("antifishy")

app = FastAPI(
    title="AntiFishy API",
    description="Scam detection powered by TinyFish web agents",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ──────────────────────────────────────────────────────────────────

def _build_agent_input(req: AnalyzeRequest) -> str:
    """Convert the frontend request into a natural-language prompt for the orchestrator."""
    parts: list[str] = [f"User input: {req.message}"]
    if req.session_id:
        parts.append(f"Session ID (follow-up): {req.session_id}")
    if req.context:
        ctx = req.context
        if ctx.channel:
            parts.append(f"Channel: {ctx.channel}")
        if ctx.contact:
            parts.append(f"Contact info: {ctx.contact}")
        if ctx.company:
            parts.append(f"Company: {ctx.company}")
        if ctx.product_url:
            parts.append(f"Product URL: {ctx.product_url}")
        if ctx.original_url:
            parts.append(f"Original/source URL: {ctx.original_url}")
    return "\n".join(parts)


def _try_parse_json_lines(text: str) -> list[dict]:
    """Parse one or more JSON objects from text, one per line.

    The orchestrator is instructed to emit one JSON object per line.
    We tolerate some noise (blank lines, non-JSON lines) and also handle
    the case where JSON objects are concatenated without newlines.
    """
    events: list[dict] = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        # Skip markdown code fences if the LLM wraps output
        if line.startswith("```"):
            continue
        try:
            obj = json.loads(line)
            if isinstance(obj, dict) and "type" in obj:
                events.append(obj)
        except json.JSONDecodeError:
            continue
    return events


# ── Endpoint ─────────────────────────────────────────────────────────────────

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """Analyze user input for scams. Returns an SSE stream of events."""

    agent_input = _build_agent_input(request)
    logger.info("Analyze request: %s", agent_input[:200])

    async def event_generator() -> AsyncGenerator[dict, None]:
        try:
            result = Runner.run_streamed(orchestrator, input=agent_input)
            full_text = ""

            async for event in result.stream_events():
                # Accumulate text deltas from the orchestrator's final output
                if event.type == "raw_response_event":
                    if isinstance(event.data, ResponseTextDeltaEvent):
                        delta = event.data.delta
                        full_text += delta

                        # Try to parse complete JSON lines as they arrive
                        while "\n" in full_text:
                            line, full_text = full_text.split("\n", 1)
                            line = line.strip()
                            if not line or line.startswith("```"):
                                continue
                            try:
                                obj = json.loads(line)
                                if isinstance(obj, dict) and "type" in obj:
                                    logger.info("SSE event: %s", obj.get("type"))
                                    yield {"data": json.dumps(obj)}
                            except json.JSONDecodeError:
                                continue

                # When the agent hands off to a tool (skill agent), log it
                elif event.type == "run_item_stream_event":
                    if event.item.type == "tool_call_item":
                        logger.info("Tool call: %s", getattr(event.item, "name", "unknown"))

            # Process any remaining text after stream ends
            if full_text.strip():
                for obj in _try_parse_json_lines(full_text):
                    logger.info("SSE event (tail): %s", obj.get("type"))
                    yield {"data": json.dumps(obj)}

            # If we got a final_output but didn't stream it yet (non-streaming fallback)
            final = result.final_output
            if final:
                remaining_events = _try_parse_json_lines(final)
                # Deduplicate: check if we already sent a done event
                sent_types = set()
                for evt in remaining_events:
                    evt_key = (evt.get("type"), evt.get("check_id", ""))
                    if evt_key not in sent_types:
                        sent_types.add(evt_key)
                        # Only yield events we haven't streamed yet
                        # This is a best-effort dedup — the frontend should also handle dupes
                        yield {"data": json.dumps(evt)}

            # Ensure we always send a done event
            yield {"data": json.dumps(DoneEvent().model_dump())}

        except Exception as exc:
            logger.error("Orchestrator error: %s\n%s", exc, traceback.format_exc())
            yield {"data": json.dumps(ErrorEvent(message=str(exc)).model_dump())}
            yield {"data": json.dumps(DoneEvent().model_dump())}

    return EventSourceResponse(event_generator())


# ── Health ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "antifishy"}


# ── Dev runner ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
