"""Real integration test for dropship scam — AliExpress dupe scenario.

Uses a realistic scenario based on common TikTok/Shopify dropshipping patterns:
- LED strip lights sold for $49.99 on a Shopify store
- Same product available on AliExpress for $3-5
- Store claims "premium quality", "US warehouse", "handcrafted"
- Classic fake store indicators: default theme, stock photos, no real contact
"""

from __future__ import annotations

import asyncio
import json
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


def parse_events(text: str) -> list[dict]:
    events = []
    for line in text.strip().splitlines():
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


async def test_dropship_aliexpress_dupe():
    """Test the orchestrator with a realistic AliExpress dropship markup scenario."""
    print("=" * 60)
    print("TEST: Dropship — AliExpress LED Strip Markup")
    print("=" * 60)

    # This is a realistic scenario based on common patterns:
    # - Shopify stores selling cheap AliExpress LED strips at 10x markup
    # - Fake "US warehouse" and "premium quality" claims
    # - TikTok ads driving traffic
    # - Typical shipping time gives away the China-direct dropship
    user_input = """User input: I saw an ad on TikTok for "ambient LED strip lights" from a store called LumiGlow (lumiglow-store.com). They're selling a 5-meter RGB LED strip with remote for $49.99, claiming it's "premium quality, ships from US warehouse in 2-3 days."

But I found what looks like the EXACT same product on AliExpress for $3.47:
https://www.aliexpress.com/item/1005006123456789.html

The product photos on the store look identical to the AliExpress listing — same angles, same lighting, even the same hand model. The store has a "4.9 star" rating but when I looked at the reviews, they all sound the same and were posted within the same week. The site has a countdown timer saying "67% OFF — only 12 left!" and the only payment options are credit card and PayPal.

The store also sells random unrelated products: a yoga mat, a pet hair remover, and sunglasses — classic dropshipping store pattern.

Product URL: https://lumiglow-store.com/premium-led-strip-rgb
Original/source URL: https://www.aliexpress.com/item/1005006123456789.html"""

    start = time.time()
    events_collected = []

    print(f"  Input summary: TikTok LED strip store selling $3.47 AliExpress product for $49.99")
    print(f"  Running orchestrator...\n")

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
                                print(f"    {obj.get('summary', '')[:120]}")
                            elif etype == "check_started":
                                print(f"  Check started: {obj.get('check_id')} — {obj.get('name')}")
                            elif etype == "check_complete":
                                status = obj.get('status', '?').upper()
                                print(f"  Check [{status}] {obj.get('check_id')}: {obj.get('summary', '')[:100]}")
                            elif etype == "verdict":
                                print(f"\n  VERDICT: {obj.get('overall')} (score: {obj.get('score')})")
                                print(f"    {obj.get('summary', '')[:200]}")
                            elif etype == "done":
                                print(f"  Done.")
                            else:
                                print(f"  Event: {etype}")
                    except json.JSONDecodeError:
                        continue

    # Remaining text
    if full_text.strip():
        for evt in parse_events(full_text):
            if evt not in events_collected:
                events_collected.append(evt)
                print(f"  Event (tail): {evt['type']}")

    # Final output
    final = result.final_output
    if final:
        for evt in parse_events(final):
            if evt not in events_collected:
                events_collected.append(evt)

    elapsed = time.time() - start

    print(f"\n  Time: {elapsed:.1f}s")
    print(f"  Total events: {len(events_collected)}")

    # Save as conversation
    classification = next((e for e in events_collected if e["type"] == "classification"), {})
    verdict = next((e for e in events_collected if e["type"] == "verdict"), {})

    conv_id = str(uuid.uuid4())
    conversation = {
        "id": conv_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "input": "I saw an ad on TikTok for \"ambient LED strip lights\" from LumiGlow (lumiglow-store.com). They're selling a 5m RGB LED strip for $49.99 claiming 'premium quality, ships from US warehouse' — but I found the exact same product on AliExpress for $3.47. Same photos, same hand model. Store also sells random yoga mats and pet hair removers.",
        "scam_type": classification.get("scam_type", "dropship"),
        "verdict": verdict.get("overall", "unknown"),
        "score": verdict.get("score", 0),
        "summary": verdict.get("summary", ""),
        "events": events_collected,
        "context": {
            "product_url": "https://lumiglow-store.com/premium-led-strip-rgb",
            "original_url": "https://www.aliexpress.com/item/1005006123456789.html",
        },
    }

    filepath = CONVERSATIONS_DIR / f"{conv_id}.json"
    filepath.write_text(json.dumps(conversation, indent=2))
    print(f"\n  Saved conversation: {filepath.name}")

    # Summary
    print(f"\n{'=' * 60}")
    print("RESULT")
    print(f"{'=' * 60}")
    status = "PASS" if verdict else "FAIL"
    print(f"  [{status}] Dropship AliExpress Dupe ({elapsed:.0f}s)")
    print(f"  Verdict: {verdict.get('overall', 'N/A')} (score: {verdict.get('score', 'N/A')})")
    print(f"  Conversation ID: {conv_id}")

    return conversation


if __name__ == "__main__":
    asyncio.run(test_dropship_aliexpress_dupe())
