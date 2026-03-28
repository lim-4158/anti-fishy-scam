"""Real integration tests for phishing and dropship scam scenarios.

Runs the full orchestrator against live TinyFish + OpenAI APIs.
Saves results as conversation JSON files for demo use.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import TINYFISH_API_KEY, OPENAI_API_KEY
from agents import Runner
from openai.types.responses import ResponseTextDeltaEvent
from orchestration.orchestrator import orchestrator


CONVERSATIONS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "conversations"
CONVERSATIONS_DIR.mkdir(parents=True, exist_ok=True)


def parse_events_from_stream(full_text: str) -> list[dict]:
    events = []
    for line in full_text.strip().splitlines():
        line = line.strip()
        if not line or line.startswith("```"):
            continue
        try:
            obj = json.loads(line)
            if isinstance(obj, dict) and "type" in obj:
                events.append(obj)
        except json.JSONDecodeError:
            continue
    return events


async def run_scenario(name: str, user_input: str) -> dict:
    print(f"\n{'=' * 60}")
    print(f"RUNNING: {name}")
    print(f"{'=' * 60}")
    print(f"  Input: {user_input[:150]}...")

    start = time.time()
    events_collected = []

    result = Runner.run_streamed(orchestrator, input=user_input)
    full_text = ""

    async for event in result.stream_events():
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
                            etype = obj["type"]
                            if etype == "classification":
                                print(f"  Classification: {obj.get('scam_type')} ({obj.get('confidence')})")
                            elif etype == "check_complete":
                                print(f"  Check [{obj.get('status', '?').upper()}] {obj.get('check_id')}: {obj.get('summary', '')[:80]}")
                            elif etype == "verdict":
                                print(f"  VERDICT: {obj.get('overall')} (score: {obj.get('score')})")
                            else:
                                print(f"  Event: {etype}")
                    except json.JSONDecodeError:
                        continue

    # Remaining text
    if full_text.strip():
        for evt in parse_events_from_stream(full_text):
            if evt not in events_collected:
                events_collected.append(evt)
                print(f"  Event (tail): {evt['type']}")

    # Final output
    final = result.final_output
    if final:
        for evt in parse_events_from_stream(final):
            if evt not in events_collected:
                events_collected.append(evt)

    elapsed = time.time() - start
    print(f"\n  Time: {elapsed:.1f}s | Events: {len(events_collected)}")

    return {
        "events": events_collected,
        "elapsed": elapsed,
        "input": user_input,
        "name": name,
    }


def save_conversation(scenario: dict) -> str:
    events = scenario["events"]
    user_input = scenario["input"]

    classification = next((e for e in events if e["type"] == "classification"), {})
    verdict = next((e for e in events if e["type"] == "verdict"), {})

    conv_id = str(uuid.uuid4())
    conversation = {
        "id": conv_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "input": user_input.replace("User input: ", "").split("\n")[0][:500],
        "scam_type": classification.get("scam_type", "generic"),
        "verdict": verdict.get("overall", "unknown"),
        "score": verdict.get("score", 0),
        "summary": verdict.get("summary", ""),
        "events": events,
        "context": {},
    }

    filepath = CONVERSATIONS_DIR / f"{conv_id}.json"
    filepath.write_text(json.dumps(conversation, indent=2))
    print(f"  Saved: {filepath.name}")
    return conv_id


async def main():
    # Run both scenarios (sequentially — they share the same OpenAI connection)
    # Running in parallel would be ideal but the orchestrator agent may conflict

    phishing_input = """User input: I received this SMS on my phone:

"URGENT: DBS Bank Security Alert - We detected unauthorized login to your account from an unknown device in Vietnam. Your account has been temporarily restricted. Verify your identity immediately at https://dbs-secure-login.com/verify-sg or your account will be permanently locked within 12 hours. Reply STOP to opt out. Ref: DBS-SG-2026-0328"

Channel: SMS
Contact: Unknown sender, no caller ID"""

    dropship_input = """User input: I found this store selling a "Premium Ergonomic Office Chair" for $399 at https://elitecomfort-chairs.com. The exact same chair looks identical to one on AliExpress for $45. The store claims it's "handcrafted in Italy" and "premium leather" but the product photos look the same. They only accept payment via Zelle or crypto. Their Instagram has 50k followers but all comments look fake.

Product URL: https://elitecomfort-chairs.com/premium-ergonomic-chair
Original/source URL: https://www.aliexpress.com/item/ergonomic-office-chair-45.html"""

    print("=" * 60)
    print("ANTIFISHY INTEGRATION TESTS — PHISHING + DROPSHIP")
    print("=" * 60)

    # Phishing
    phishing_result = await run_scenario("Phishing — Fake DBS Bank SMS", phishing_input)
    phishing_id = save_conversation(phishing_result)

    # Dropship
    dropship_result = await run_scenario("Dropship — Fake Italian Chair Store", dropship_input)
    dropship_id = save_conversation(dropship_result)

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    for r in [phishing_result, dropship_result]:
        events = r["events"]
        verdict = next((e for e in events if e["type"] == "verdict"), {})
        status = "PASS" if verdict else "FAIL"
        print(f"  [{status}] {r['name']} ({r['elapsed']:.0f}s) — {verdict.get('overall', 'no verdict')} ({verdict.get('score', '?')})")

    print(f"\nConversation files saved to: {CONVERSATIONS_DIR}")
    print(f"  Phishing: {phishing_id}.json")
    print(f"  Dropship: {dropship_id}.json")

    # Also write to findings doc
    findings_path = Path(__file__).resolve().parent.parent.parent / "docs" / "test_findings_v2.md"
    lines = [
        "# AntiFishy Integration Tests v2 — Phishing + Dropship",
        "",
        f"**Run date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
    ]
    for r in [phishing_result, dropship_result]:
        events = r["events"]
        verdict = next((e for e in events if e["type"] == "verdict"), {})
        lines.append(f"## {r['name']}")
        lines.append(f"- **Time:** {r['elapsed']:.0f}s")
        lines.append(f"- **Events:** {len(events)}")
        lines.append(f"- **Verdict:** {verdict.get('overall', 'N/A')} (score: {verdict.get('score', 'N/A')})")
        lines.append(f"- **Summary:** {verdict.get('summary', 'N/A')}")
        lines.append("")
        for evt in events:
            if evt["type"] == "check_complete":
                lines.append(f"  - [{evt.get('status', '?').upper()}] **{evt.get('check_id')}**: {evt.get('summary', '')}")
        lines.append("")
        lines.append("---")
        lines.append("")

    findings_path.write_text("\n".join(lines))
    print(f"Findings written to: {findings_path}")


if __name__ == "__main__":
    asyncio.run(main())
