"""Integration tests using real TinyFish and OpenAI APIs.

These tests hit live APIs and cost real credits. Run intentionally.
Results are documented in docs/test_findings.md.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import time
from pathlib import Path

# Ensure backend is on path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import TINYFISH_API_KEY, OPENAI_API_KEY  # noqa: E402 — validates keys exist
from tools.tinyfish import browse_website  # noqa: E402
from agents import Agent, Runner  # noqa: E402


# ── Test Case 1: TinyFish direct — verify a real company website ─────────────

async def test_tinyfish_real_company() -> dict:
    """Hit TinyFish with a real company (Grab) to verify company website check."""
    print("\n" + "=" * 60)
    print("TEST 1: TinyFish Direct — Grab.com company website check")
    print("=" * 60)

    start = time.time()
    # Call the raw function (not as a tool, since we're outside agent context)
    # browse_website is a FunctionTool, so we call its .on_invoke_tool or use the underlying fn
    import httpx

    url = "https://www.grab.com"
    goal = (
        "Navigate to this website and evaluate it. Check for: an About page, "
        "a Careers/Jobs page, Contact information, social media links, "
        "and overall content quality. Return as JSON: "
        '{"site_exists": true, "has_about_page": bool, "has_careers_page": bool, '
        '"has_contact_info": bool, "has_social_links": bool, '
        '"content_quality": "thin|moderate|substantive", "notes": str}. '
        'If the site is unreachable, return {"site_exists": false, "error": str}.'
    )

    endpoint = "https://agent.tinyfish.ai/v1/automation/run-sse"
    payload = {"url": url, "goal": goal, "browser_profile": "lite"}
    headers = {"X-API-Key": TINYFISH_API_KEY, "Content-Type": "application/json"}

    result_json = None
    streaming_url = None
    progress_msgs = []

    async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=15.0)) as client:
        async with client.stream("POST", endpoint, json=payload, headers=headers) as resp:
            print(f"  HTTP status: {resp.status_code}")
            buffer = ""
            async for chunk in resp.aiter_text():
                buffer += chunk
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line.startswith("data: "):
                        continue
                    try:
                        event = json.loads(line[6:])
                    except json.JSONDecodeError:
                        continue

                    etype = event.get("type", "")
                    if etype == "STREAMING_URL":
                        streaming_url = event.get("streamingUrl") or event.get("url")
                        print(f"  Browser stream: {streaming_url}")
                    elif etype == "PROGRESS":
                        msg = event.get("message") or event.get("step") or ""
                        if msg:
                            progress_msgs.append(msg)
                            print(f"  Progress: {msg}")
                    elif etype == "COMPLETE":
                        result_json = event.get("resultJson")
                        print(f"  Status: {event.get('status')}")
                    elif etype == "ERROR":
                        print(f"  ERROR: {event.get('message')}")

    elapsed = time.time() - start
    print(f"\n  Time: {elapsed:.1f}s")
    print(f"  Progress steps: {len(progress_msgs)}")
    print(f"  Result: {json.dumps(result_json, indent=2) if result_json else 'None'}")

    return {
        "test": "TinyFish Direct — Grab.com",
        "elapsed_seconds": round(elapsed, 1),
        "progress_steps": len(progress_msgs),
        "streaming_url": streaming_url,
        "result": result_json,
        "passed": result_json is not None,
    }


# ── Test Case 2: TinyFish — WHOIS domain lookup ─────────────────────────────

async def test_tinyfish_whois() -> dict:
    """Hit TinyFish to do a WHOIS lookup on a known domain."""
    print("\n" + "=" * 60)
    print("TEST 2: TinyFish Direct — WHOIS lookup for grab.com")
    print("=" * 60)

    start = time.time()
    import httpx

    url = "https://www.whois.com/whois/grab.com"
    goal = (
        "Extract WHOIS information for this domain. Return as JSON: "
        '{"domain": str, "registrar": str, "creation_date": str, '
        '"domain_age_days": int, "registrant_org": str or "REDACTED", '
        '"privacy_protected": bool, "notes": str}. '
        'If unavailable, return {"error": str}.'
    )

    endpoint = "https://agent.tinyfish.ai/v1/automation/run-sse"
    payload = {"url": url, "goal": goal, "browser_profile": "lite"}
    headers = {"X-API-Key": TINYFISH_API_KEY, "Content-Type": "application/json"}

    result_json = None
    progress_msgs = []

    async with httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=15.0)) as client:
        async with client.stream("POST", endpoint, json=payload, headers=headers) as resp:
            print(f"  HTTP status: {resp.status_code}")
            buffer = ""
            async for chunk in resp.aiter_text():
                buffer += chunk
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line.startswith("data: "):
                        continue
                    try:
                        event = json.loads(line[6:])
                    except json.JSONDecodeError:
                        continue

                    etype = event.get("type", "")
                    if etype == "PROGRESS":
                        msg = event.get("message") or event.get("step") or ""
                        if msg:
                            progress_msgs.append(msg)
                            print(f"  Progress: {msg}")
                    elif etype == "COMPLETE":
                        result_json = event.get("resultJson")
                        print(f"  Status: {event.get('status')}")
                    elif etype == "ERROR":
                        print(f"  ERROR: {event.get('message')}")

    elapsed = time.time() - start
    print(f"\n  Time: {elapsed:.1f}s")
    print(f"  Result: {json.dumps(result_json, indent=2) if result_json else 'None'}")

    return {
        "test": "TinyFish Direct — WHOIS grab.com",
        "elapsed_seconds": round(elapsed, 1),
        "progress_steps": len(progress_msgs),
        "result": result_json,
        "passed": result_json is not None,
    }


# ── Test Case 3: Full orchestrator — suspicious job posting ──────────────────

async def test_orchestrator_suspicious_job() -> dict:
    """Run the full orchestrator agent against a suspicious job posting."""
    print("\n" + "=" * 60)
    print("TEST 3: Full Orchestrator — Suspicious job posting")
    print("=" * 60)

    start = time.time()

    # Import the orchestrator
    from orchestration.orchestrator import orchestrator

    user_input = """User input: I received this message on WhatsApp from someone claiming to be a recruiter:

"Hi! I'm Sarah Chen from GlobalTech Dynamics. We have an exciting Senior Data Analyst position available - $185,000/year, fully remote, flexible hours. No experience needed! Please send your resume to sarah.recruitment.globaltech@gmail.com or reply here on WhatsApp. We need to fill this position urgently - please respond within 24 hours."

Channel: WhatsApp
Contact: sarah.recruitment.globaltech@gmail.com"""

    print(f"  Input: {user_input[:150]}...")

    events_collected = []

    result = Runner.run_streamed(orchestrator, input=user_input)
    full_text = ""

    async for event in result.stream_events():
        from openai.types.responses import ResponseTextDeltaEvent
        if event.type == "raw_response_event":
            if isinstance(event.data, ResponseTextDeltaEvent):
                delta = event.data.delta
                full_text += delta

                while "\n" in full_text:
                    line, full_text = full_text.split("\n", 1)
                    line = line.strip()
                    if not line or line.startswith("```"):
                        continue
                    try:
                        obj = json.loads(line)
                        if isinstance(obj, dict) and "type" in obj:
                            events_collected.append(obj)
                            print(f"  Event: {obj['type']} — {json.dumps(obj)[:120]}")
                    except json.JSONDecodeError:
                        continue

    # Parse any remaining text
    if full_text.strip():
        for line in full_text.strip().splitlines():
            line = line.strip()
            if not line or line.startswith("```"):
                continue
            try:
                obj = json.loads(line)
                if isinstance(obj, dict) and "type" in obj:
                    events_collected.append(obj)
                    print(f"  Event (tail): {obj['type']} — {json.dumps(obj)[:120]}")
            except json.JSONDecodeError:
                continue

    # Also grab final output
    final = result.final_output
    if final:
        for line in final.strip().splitlines():
            line = line.strip()
            if not line or line.startswith("```"):
                continue
            try:
                obj = json.loads(line)
                if isinstance(obj, dict) and "type" in obj:
                    # Dedup
                    if obj not in events_collected:
                        events_collected.append(obj)
                        print(f"  Event (final): {obj['type']} — {json.dumps(obj)[:120]}")
            except json.JSONDecodeError:
                continue

    elapsed = time.time() - start
    print(f"\n  Time: {elapsed:.1f}s")
    print(f"  Total events: {len(events_collected)}")

    # Analyze events
    event_types = [e["type"] for e in events_collected]
    has_classification = "classification" in event_types
    has_verdict = "verdict" in event_types
    has_checks = any(t == "check_complete" for t in event_types)

    verdict_event = next((e for e in events_collected if e["type"] == "verdict"), None)

    print(f"  Has classification: {has_classification}")
    print(f"  Has checks: {has_checks}")
    print(f"  Has verdict: {has_verdict}")
    if verdict_event:
        print(f"  Verdict: {verdict_event.get('overall')} (score: {verdict_event.get('score')})")
        print(f"  Summary: {verdict_event.get('summary', '')[:200]}")

    return {
        "test": "Full Orchestrator — Suspicious job posting",
        "elapsed_seconds": round(elapsed, 1),
        "total_events": len(events_collected),
        "event_types": event_types,
        "events": events_collected,
        "has_classification": has_classification,
        "has_verdict": has_verdict,
        "verdict": verdict_event,
        "passed": has_classification and has_verdict,
    }


# ── Runner ───────────────────────────────────────────────────────────────────

async def run_all_tests() -> list[dict]:
    """Run all integration tests and return results."""
    results = []

    # Test 1 and 2 can run in parallel (independent TinyFish calls)
    print("\nRunning Test 1 and Test 2 in parallel...")
    t1, t2 = await asyncio.gather(
        test_tinyfish_real_company(),
        test_tinyfish_whois(),
    )
    results.extend([t1, t2])

    # Test 3 depends on orchestrator (sequential)
    print("\nRunning Test 3 (full orchestrator)...")
    t3 = await test_orchestrator_suspicious_job()
    results.append(t3)

    return results


def write_findings(results: list[dict]) -> None:
    """Write test findings to docs/test_findings.md."""
    docs_dir = Path(__file__).resolve().parent.parent.parent / "docs"
    docs_dir.mkdir(exist_ok=True)
    out_path = docs_dir / "test_findings.md"

    lines = [
        "# AntiFishy Integration Test Findings",
        "",
        f"**Run date:** 2026-03-28",
        f"**Tests run:** {len(results)}",
        f"**Passed:** {sum(1 for r in results if r['passed'])}/{len(results)}",
        "",
        "---",
        "",
    ]

    for i, r in enumerate(results, 1):
        status = "PASS" if r["passed"] else "FAIL"
        lines.append(f"## Test {i}: {r['test']} [{status}]")
        lines.append("")
        lines.append(f"- **Time:** {r['elapsed_seconds']}s")
        lines.append(f"- **Progress steps:** {r.get('progress_steps', 'N/A')}")
        lines.append("")

        if "result" in r and r["result"]:
            lines.append("### Raw Result")
            lines.append("```json")
            lines.append(json.dumps(r["result"], indent=2))
            lines.append("```")
            lines.append("")

        if "events" in r:
            lines.append(f"### Events ({r['total_events']} total)")
            lines.append("")
            for evt in r["events"]:
                evt_type = evt.get("type", "unknown")
                if evt_type == "classification":
                    lines.append(f"- **Classification:** {evt.get('scam_type')} (confidence: {evt.get('confidence')})")
                    lines.append(f"  - {evt.get('summary', '')}")
                elif evt_type == "check_complete":
                    lines.append(f"- **Check [{evt.get('status', '?').upper()}]** `{evt.get('check_id')}`: {evt.get('summary', '')}")
                    details = evt.get("details", {})
                    evidence = details.get("evidence", [])
                    if evidence:
                        for e in evidence[:5]:
                            lines.append(f"  - {e}")
                elif evt_type == "verdict":
                    lines.append(f"- **VERDICT: {evt.get('overall', '?').upper()}** (score: {evt.get('score')})")
                    lines.append(f"  - {evt.get('summary', '')}")
                elif evt_type == "follow_up":
                    lines.append(f"- **Follow-up requested:** {json.dumps(evt.get('questions', []))}")
                elif evt_type == "check_started":
                    lines.append(f"- **Check started:** `{evt.get('check_id')}` — {evt.get('name')}")
            lines.append("")

        if "verdict" in r and r.get("verdict"):
            v = r["verdict"]
            lines.append("### Verdict Summary")
            lines.append(f"- **Overall:** {v.get('overall')}")
            lines.append(f"- **Score:** {v.get('score')}")
            lines.append(f"- **Summary:** {v.get('summary', '')}")
            checks_summary = v.get("checks_summary", [])
            if checks_summary:
                lines.append("")
                lines.append("| Check | Status | Finding |")
                lines.append("|-------|--------|---------|")
                for cs in checks_summary:
                    lines.append(f"| {cs.get('name', cs.get('check_id', '?'))} | {cs.get('status', '?')} | {cs.get('one_liner', '')} |")
            lines.append("")

        if r.get("streaming_url"):
            lines.append(f"### Browser Stream")
            lines.append(f"- URL: {r['streaming_url']}")
            lines.append("")

        lines.append("---")
        lines.append("")

    lines.append("## Key Observations")
    lines.append("")
    lines.append("*(To be filled after reviewing results)*")
    lines.append("")

    out_path.write_text("\n".join(lines))
    print(f"\nFindings written to: {out_path}")


if __name__ == "__main__":
    results = asyncio.run(run_all_tests())

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for r in results:
        status = "PASS" if r["passed"] else "FAIL"
        print(f"  [{status}] {r['test']} ({r['elapsed_seconds']}s)")

    write_findings(results)
