# AntiFishy — API Contract

## Branding
- **Name**: AntiFishy (plays on TinyFish hackathon + anti-scam)
- **Tagline**: "Don't get hooked."
- **Theme**: Dark UI, aquatic/shield motifs, traffic-light color coding

## Endpoint

```
POST /api/analyze
Content-Type: application/json
```

### Request Body
```json
{
  "message": "string — user's raw input (URL, pasted message, etc.)",
  "session_id": "string? — for follow-up responses",
  "context": {
    "channel": "string? — Email, WhatsApp, LinkedIn, Telegram, SMS",
    "contact": "string? — recruiter/sender contact info",
    "company": "string? — company name if known",
    "product_url": "string? — for dropship scams, the seller URL",
    "original_url": "string? — for dropship, the AliExpress/source URL"
  }
}
```

### Response: SSE Stream (`text/event-stream`)

Each event is a JSON object on a `data:` line.

#### Event Types (in order)

```jsonc
// 1. Scam type classification
{ "type": "classification", "scam_type": "job_scam|phishing|dropship|romance|generic", "confidence": 0.95, "summary": "This appears to be a suspicious job posting..." }

// 2. Follow-up questions (if more info needed before checks)
{ "type": "follow_up", "questions": [
  { "field": "channel", "label": "What channel was this sent from?", "input_type": "select", "options": ["Email", "WhatsApp", "LinkedIn", "Telegram", "SMS", "Other"] },
  { "field": "contact", "label": "Sender's contact info (email, phone, profile URL)", "input_type": "text" }
]}

// 3. Check lifecycle events (repeated per check, 3-6 checks depending on skill)
{ "type": "check_started", "check_id": "company_website", "name": "Company Website Verification", "icon": "globe" }
{ "type": "check_progress", "check_id": "company_website", "message": "Navigating to techventure-global.com...", "browser_url": "https://stream.tinyfish.ai/..." }
{ "type": "check_complete", "check_id": "company_website", "status": "red", "summary": "Website is a thin template with no real content", "details": { "url_visited": "https://techventure-global.com", "evidence": ["No team page", "Generic stock photos", "Domain registered 12 days ago"], "raw_data": {} } }

// 4. Final verdict
{ "type": "verdict", "overall": "likely_safe|suspicious|likely_scam", "score": 0.85, "summary": "This job posting shows multiple red flags...", "checks_summary": [
  { "check_id": "company_website", "name": "Company Website", "status": "red", "one_liner": "Thin template site, 12-day-old domain" },
  { "check_id": "salary_check", "name": "Salary Reality", "status": "red", "one_liner": "Offered $180k is 65% above market rate" }
]}

// 5. Stream end
{ "type": "done" }

// Error (can appear anytime)
{ "type": "error", "message": "TinyFish agent timed out on LinkedIn" }
```

#### Check IDs by Skill

**Job Scam**: `company_website`, `job_listing_match`, `domain_trust`, `salary_check`, `linkedin_presence`, `reviews_reputation`
**Phishing**: `url_analysis`, `domain_trust`, `ssl_check`, `page_content`, `known_brand_match`
**Dropship**: `source_price_check`, `seller_price_check`, `seller_reputation`, `domain_trust`
**Generic**: `domain_trust`, `contact_verification`, `content_analysis`

#### Icon Map
`globe` = company website, `briefcase` = job listing, `shield` = domain trust, `dollar-sign` = salary, `users` = linkedin, `star` = reviews, `link` = URL analysis, `lock` = SSL, `file-text` = page content, `tag` = brand match, `shopping-cart` = price check, `store` = seller rep, `search` = content analysis, `phone` = contact verification

## CORS
Backend serves on `:8000`, frontend on `:5173`. CORS must allow `http://localhost:5173`.
