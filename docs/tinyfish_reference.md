# TinyFish Web Agent — Consolidated Reference

## What It Is
Enterprise infrastructure for AI web agents. Send a URL + natural language goal, get back structured JSON. It handles real browser automation — navigation, forms, filters, dynamic content, JS-heavy SPAs, authenticated sessions, and bot-protected sites.

Scored 81% on Mind2Web hard web tasks (vs OpenAI Operator's 43%).

## API Base URL
```
https://agent.tinyfish.ai/v1/automation/
```

## Authentication
```
Header: X-API-Key: sk-tinyfish-XXXXX
```
Get keys at: https://agent.tinyfish.ai/api-keys

## Endpoints

| Endpoint | Response Type | Best For |
|----------|--------------|----------|
| `/run` | Synchronous JSON | Quick tasks under 30s |
| `/run-async` | Returns `run_id`, poll `/runs/{run_id}` | Batch jobs, long tasks |
| `/run-sse` | SSE event stream | Real-time UI, progress updates |

## Request Body

```json
{
  "url": "https://example.com",
  "goal": "Find all product prices and return as JSON: [{\"name\": str, \"price\": str}]",
  "browser_profile": "lite",
  "proxy_config": {
    "enabled": true,
    "country_code": "US"
  },
  "feature_flags": {
    "enable_agent_memory": true
  }
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | Yes | Target website URL |
| `goal` | string | Yes | Natural language goal — include desired JSON schema |
| `browser_profile` | string | No | `"lite"` (default) or `"stealth"` (anti-detection) |
| `proxy_config` | object | No | `{enabled: bool, country_code: str}` |
| `proxy_config.country_code` | string | No | US, GB, CA, DE, FR, JP, AU |
| `api_integration` | string | No | Analytics tag (e.g., "antifishy") |
| `feature_flags` | object | No | `{enable_agent_memory: bool}` |

## SSE Event Types (for /run-sse)

```
data: {"type": "STARTED", "runId": "run_123", "timestamp": "..."}
data: {"type": "STREAMING_URL", "url": "https://stream.tinyfish.ai/..."}
data: {"type": "PROGRESS", "message": "Navigating to..."}
data: {"type": "COMPLETE", "status": "COMPLETED", "resultJson": {...}}
```

| Event | Description |
|-------|-------------|
| `STARTED` | Run initiated, includes `runId` |
| `STREAMING_URL` | Live browser preview URL (valid 24hrs) — embed for demos |
| `PROGRESS` | Intermediate status updates |
| `COMPLETE` | Final result in `resultJson` field |

### Extracting Results
The final data is in `event.resultJson` when `type == "COMPLETE"` and `status == "COMPLETED"`.

## Async Pattern (/run-async)

```python
# 1. Start
response = POST /run-async {url, goal}
run_id = response["run_id"]

# 2. Poll
response = GET /runs/{run_id}
# status: PENDING | RUNNING | COMPLETED | FAILED | CANCELLED

# 3. Cancel (optional)
POST /runs/{run_id}/cancel
```

## Goal Writing Best Practices

### DO
- Describe elements visually: "the blue button below the price"
- Specify exact JSON schema: `Return as JSON: {"name": str, "price": str, "in_stock": bool}`
- Number multi-step workflows: "Step 1: Click on Careers. Step 2: Search for 'Data Analyst'. Step 3: Extract..."
- Include explicit waits: "Wait for the page to fully load before extracting"
- Add fallback instructions: "If the careers page doesn't exist, return {\"found\": false, \"reason\": \"no careers page\"}"
- Be specific about what "not found" means: "If no results appear, return an empty array []"

### DON'T
- Don't use CSS selectors or XPath — use natural language descriptions
- Don't assume page structure — describe what you see
- Don't combine multiple independent sites in one goal — use parallel calls instead

### Example Goals

**Company website check:**
```
Navigate to techventure-global.com. Analyze the website thoroughly.
Check for: About page with real team members (not stock photos),
products/services page, careers/jobs page, physical address,
phone number, real contact form.
Return JSON: {
  "site_exists": bool,
  "has_about_page": bool,
  "has_real_team": bool,
  "has_products": bool,
  "has_careers": bool,
  "has_physical_address": bool,
  "has_phone": bool,
  "content_quality": "thin|moderate|substantive",
  "suspicious_signs": [str],
  "notes": str
}
If the site doesn't load or doesn't exist, return:
{"site_exists": false, "error": "Site unreachable", "notes": str}
```

**Job listing cross-match:**
```
Navigate to {company_url}/careers or the company's jobs page.
Search for the role: "{job_title}".
Check if this exact position exists on the company's own website.
If found, extract the listing details and compare with:
- Expected salary: {salary}
- Expected location: {location}
Return JSON: {
  "careers_page_exists": bool,
  "listing_found": bool,
  "title_match": bool,
  "salary_listed": str | null,
  "salary_matches": bool | null,
  "location_matches": bool | null,
  "discrepancies": [str],
  "url_checked": str
}
```

**WHOIS domain lookup:**
```
Navigate to who.is/whois/{domain} or whois.domaintools.com/{domain}.
Extract the domain registration information.
Return JSON: {
  "domain": str,
  "registration_date": str,
  "domain_age_days": int,
  "registrar": str,
  "whois_privacy": bool,
  "country": str | null,
  "organization": str | null,
  "suspicious": bool,
  "notes": str
}
```

**Salary comparison:**
```
Navigate to glassdoor.com and search for "{job_title}" salary in "{location}".
Also try levels.fyi if Glassdoor is blocked.
Extract the typical salary range for this role.
Return JSON: {
  "role": str,
  "location": str,
  "source": "glassdoor|levels.fyi|payscale",
  "salary_low": int,
  "salary_median": int,
  "salary_high": int,
  "currency": str,
  "sample_size": int | null,
  "notes": str
}
If blocked, use browser_profile "stealth" and try again.
```

## Bot Protection Strategy
1. Start with `browser_profile: "lite"` (faster, cheaper)
2. If blocked → retry with `browser_profile: "stealth"`
3. If still blocked → add `proxy_config: {enabled: true, country_code: "US"}`
4. Always include fallback instructions in goals for blocked scenarios

## Live Browser Preview
Every /run-sse emits a `STREAMING_URL` event — a live video feed of the browser. Valid for 24 hours. Embed in UI for demo wow factor. No API keys exposed in the stream URL.

## Rate Limits & Pricing
- Free tier: 500 steps
- Pay-as-you-go: $0.015/step
- Starter ($15/mo): 1,650 steps, 10 concurrent agents
- Pro ($150/mo): 16,500 steps, 50 concurrent agents
- Up to 1,000 parallel operations on enterprise

## Python Example (SSE Streaming)

```python
import httpx
import json
import os

async def run_tinyfish(url: str, goal: str, browser_profile: str = "lite") -> dict:
    api_key = os.getenv("TINYFISH_API_KEY")

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST",
            "https://agent.tinyfish.ai/v1/automation/run-sse",
            headers={
                "X-API-Key": api_key,
                "Content-Type": "application/json",
            },
            json={
                "url": url,
                "goal": goal,
                "browser_profile": browser_profile,
            },
        ) as response:
            result = None
            browser_url = None

            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    event = json.loads(line[6:])

                    if event.get("type") == "STREAMING_URL":
                        browser_url = event.get("url")

                    if event.get("type") == "PROGRESS":
                        print(f"Progress: {event.get('message', '')}")

                    if event.get("type") == "COMPLETE":
                        if event.get("status") == "COMPLETED":
                            result = event.get("resultJson", {})
                        else:
                            result = {"error": event.get("status"), "message": event.get("message", "Unknown error")}

            return {"result": result, "browser_url": browser_url}
```

## JavaScript Example (SSE Streaming)

```javascript
async function runTinyFish(url, goal, browserProfile = "lite") {
  const response = await fetch("https://agent.tinyfish.ai/v1/automation/run-sse", {
    method: "POST",
    headers: {
      "X-API-Key": process.env.TINYFISH_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, goal, browser_profile: browserProfile }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    for (const line of text.split("\n")) {
      if (line.startsWith("data: ")) {
        const event = JSON.parse(line.slice(6));
        if (event.type === "COMPLETE" && event.status === "COMPLETED") {
          result = event.resultJson;
        }
      }
    }
  }

  return result;
}
```

## SDKs
- Python: `pip install tinyfish`
- TypeScript: `npm install @tiny-fish/sdk`
- Or just use raw HTTP — no SDK needed
