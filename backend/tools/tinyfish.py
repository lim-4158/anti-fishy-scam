"""TinyFish web agent wrapper — exposed as an OpenAI Agents SDK function_tool."""

from __future__ import annotations

import json
import logging

import httpx
from agents import function_tool

from config import TINYFISH_API_KEY, TINYFISH_BASE_URL, TINYFISH_TIMEOUT

logger = logging.getLogger(__name__)


@function_tool
async def browse_website(url: str, goal: str, browser_profile: str = "lite") -> str:
    """Use TinyFish web agent to navigate a website and extract information.

    Args:
        url: The website URL to navigate to.
        goal: Natural language description of what to extract. Be specific about the JSON structure you want returned.
        browser_profile: 'lite' for standard sites, 'stealth' for bot-protected sites.
    """
    endpoint = f"{TINYFISH_BASE_URL}/run-sse"

    payload: dict = {
        "url": url,
        "goal": goal,
        "browser_profile": browser_profile,
    }

    # Stealth profiles benefit from US proxy
    if browser_profile == "stealth":
        payload["proxy_config"] = {"enabled": True, "country_code": "US"}

    headers = {
        "X-API-Key": TINYFISH_API_KEY,
        "Content-Type": "application/json",
    }

    progress_messages: list[str] = []
    streaming_url: str | None = None
    result_json: str | None = None
    error_message: str | None = None

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(TINYFISH_TIMEOUT, connect=15.0)) as client:
            async with client.stream("POST", endpoint, json=payload, headers=headers) as response:
                if response.status_code != 200:
                    body = await response.aread()
                    return json.dumps({
                        "error": True,
                        "status_code": response.status_code,
                        "message": f"TinyFish API returned {response.status_code}: {body.decode()[:500]}",
                    })

                buffer = ""
                async for chunk in response.aiter_text():
                    buffer += chunk
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        line = line.strip()
                        if not line.startswith("data: "):
                            continue

                        raw = line[6:]
                        try:
                            event = json.loads(raw)
                        except json.JSONDecodeError:
                            continue

                        event_type = event.get("type", "")

                        if event_type == "STREAMING_URL":
                            streaming_url = event.get("streamingUrl") or event.get("url")
                            logger.info("TinyFish browser stream: %s", streaming_url)

                        elif event_type == "PROGRESS":
                            msg = event.get("message") or event.get("step") or ""
                            if msg:
                                progress_messages.append(msg)
                                logger.debug("TinyFish progress: %s", msg)

                        elif event_type == "COMPLETE":
                            result_json = event.get("resultJson")
                            logger.info("TinyFish complete for %s", url)

                        elif event_type == "ERROR":
                            error_message = event.get("message") or event.get("error") or "Unknown TinyFish error"
                            logger.error("TinyFish error: %s", error_message)

    except httpx.TimeoutException:
        return json.dumps({
            "error": True,
            "message": f"TinyFish request timed out after {TINYFISH_TIMEOUT}s for {url}",
        })
    except httpx.HTTPError as exc:
        return json.dumps({
            "error": True,
            "message": f"HTTP error calling TinyFish: {exc}",
        })

    if error_message:
        return json.dumps({
            "error": True,
            "message": error_message,
            "progress": progress_messages,
        })

    # Build successful response
    result: dict = {
        "error": False,
        "url": url,
        "data": result_json,
        "progress_steps": len(progress_messages),
    }
    if streaming_url:
        result["browser_stream_url"] = streaming_url

    return json.dumps(result)
