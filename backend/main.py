"""AntiFishy FastAPI application.

POST /api/analyze  →  SSE stream of scam-check events.
"""

from __future__ import annotations

import json
import logging
import traceback
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from agents import Runner, ItemHelpers
from openai.types.responses import ResponseTextDeltaEvent

from models import AnalyzeRequest, ErrorEvent, DoneEvent
from orchestration.orchestrator import orchestrator

# ── Setup ────────────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("antifishy")

CONVERSATIONS_DIR = Path(__file__).resolve().parent.parent / "data" / "conversations"
CONVERSATIONS_DIR.mkdir(parents=True, exist_ok=True)

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


def _save_conversation(
    conversation_id: str,
    request: AnalyzeRequest,
    events: list[dict],
) -> None:
    """Persist a completed conversation to disk as JSON."""
    # Extract classification / verdict from collected events
    scam_type = "generic"
    verdict = "suspicious"
    score = 0.5
    summary = ""

    for evt in events:
        if evt.get("type") == "classification":
            scam_type = evt.get("scam_type", scam_type)
        elif evt.get("type") == "verdict":
            verdict = evt.get("overall", verdict)
            score = evt.get("score", score)
            summary = evt.get("summary", summary)

    record = {
        "id": conversation_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "input": request.message,
        "scam_type": scam_type,
        "verdict": verdict,
        "score": score,
        "summary": summary,
        "events": events,
        "context": request.context.model_dump() if request.context else {},
    }

    filepath = CONVERSATIONS_DIR / f"{conversation_id}.json"
    filepath.write_text(json.dumps(record, indent=2), encoding="utf-8")
    logger.info("Saved conversation %s", conversation_id)


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
    conversation_id = str(uuid.uuid4())
    collected_events: list[dict] = []

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
                                    collected_events.append(obj)
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
                    collected_events.append(obj)
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
                        collected_events.append(evt)
                        yield {"data": json.dumps(evt)}

            # Ensure we always send a done event
            done_evt = DoneEvent().model_dump()
            collected_events.append(done_evt)
            yield {"data": json.dumps(done_evt)}

        except Exception as exc:
            logger.error("Orchestrator error: %s\n%s", exc, traceback.format_exc())
            err_evt = ErrorEvent(message=str(exc)).model_dump()
            collected_events.append(err_evt)
            yield {"data": json.dumps(err_evt)}
            done_evt = DoneEvent().model_dump()
            collected_events.append(done_evt)
            yield {"data": json.dumps(done_evt)}
        finally:
            # Persist conversation after stream completes
            try:
                _save_conversation(conversation_id, request, collected_events)
            except Exception as save_exc:
                logger.error("Failed to save conversation: %s", save_exc)

    return EventSourceResponse(event_generator())


# ── Conversations ───────────────────────────────────────────────────────────

@app.get("/api/conversations")
async def list_conversations():
    """Return a list of all saved conversations, sorted by most recent."""
    conversations: list[dict] = []
    for filepath in CONVERSATIONS_DIR.glob("*.json"):
        try:
            data = json.loads(filepath.read_text(encoding="utf-8"))
            conversations.append({
                "id": data["id"],
                "created_at": data["created_at"],
                "input": data["input"][:120],
                "scam_type": data.get("scam_type", "generic"),
                "verdict": data.get("verdict", "suspicious"),
                "score": data.get("score", 0.5),
            })
        except (json.JSONDecodeError, KeyError) as exc:
            logger.warning("Skipping malformed conversation file %s: %s", filepath.name, exc)
            continue

    conversations.sort(key=lambda c: c["created_at"], reverse=True)
    return conversations


@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Return the full detail for a single conversation."""
    filepath = CONVERSATIONS_DIR / f"{conversation_id}.json"
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Conversation not found")

    try:
        data = json.loads(filepath.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, KeyError) as exc:
        raise HTTPException(status_code=500, detail=f"Malformed conversation file: {exc}")

    return data


# ── Health ───────────────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "antifishy"}


# ── Dev runner ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
