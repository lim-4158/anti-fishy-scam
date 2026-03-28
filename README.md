# AntiFishy — Don't Get Hooked.

**AntiFishy** fights scams with AI web agents. Paste any suspicious job posting, phishing message, or online store — our OpenAI orchestrator classifies the scam type and routes to specialized skill agents, each encoding deep verification expertise for that category. These skills leverage TinyFish best practices to dispatch parallel browser agents that autonomously navigate real websites — company pages, WHOIS, Glassdoor, AliExpress, ScamAdviser — and return structured, evidence-backed verdicts. The skills-based architecture makes it extensible: new scam type = new skill file. In live testing, it caught a 1,340% AliExpress markup, a phishing domain registered days ago, and a fake recruiter operating from a 12-day-old website.

**Live demo:** [isitascam-app.vercel.app](https://isitascam-app.vercel.app)

Built at NUS for the [TinyFish $2M Pre-Accelerator Hackathon](https://www.hackerearth.com/challenges/hackathon/the-tiny-fish-hackathon-2026/), March 2026.

---

## Architecture

```
User Input (URL, message, screenshot text)
        │
        ▼
┌─────────────────────────────┐
│   OpenAI Orchestrator Agent │  ← Classifies scam type, asks follow-ups
│   (gpt-4.1)                 │
└──────────┬──────────────────┘
           │ routes via as_tool()
           ▼
┌──────────────────────────────────────────────────┐
│              Skill Agents (4 skills)              │
│                                                   │
│  ┌─────────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Job Scam    │  │ Phishing │  │  Dropship   │ │
│  │  6 checks    │  │ 5 checks │  │  4 checks   │ │
│  └──────┬──────┘  └────┬─────┘  └──────┬──────┘ │
│         │              │               │         │
│  ┌──────────────────────────────────────┐        │
│  │         Generic (3 checks)           │        │
│  └──────────────────────────────────────┘        │
└──────────────────┬───────────────────────────────┘
                   │ browse_website() tool
                   ▼
┌──────────────────────────────────┐
│     TinyFish Web Agent API       │
│  Real browser → real websites    │
│  /run-sse with SSE streaming     │
└──────────────────────────────────┘
                   │
                   ▼
        Evidence-backed verdict
     (green / yellow / red per check)
```

## Skills

Each skill is an autonomous OpenAI Agent with access to TinyFish web agents. Skills encode domain-specific verification criteria and scoring rules.

### Job Scam Verifier (6 checks)
| Check | What it does | Data sources |
|-------|-------------|--------------|
| Company Website | Navigates to company site, evaluates content depth | Direct navigation |
| Job Listing Cross-Match | Verifies role exists on company careers page + job boards | Company careers, Indeed |
| Domain Trust | WHOIS lookup for domain age and registrar | whois.com |
| Salary Reality Check | Compares offered salary against market benchmarks | Glassdoor, Levels.fyi |
| LinkedIn Presence | Verifies company and recruiter profiles | LinkedIn (stealth) |
| Review & Reputation | Checks reviews and scam reports | Glassdoor, ScamAdviser, Google |

### Phishing Detector (5 checks)
| Check | What it does | Data sources |
|-------|-------------|--------------|
| URL Analysis | Typosquatting, homoglyphs, suspicious TLDs | URL pattern analysis |
| Domain Trust | Domain age and registration details | whois.com |
| SSL Certificate | Certificate validity and organization match | Direct navigation |
| Page Content | Login forms + urgency language + brand impersonation | Direct navigation |
| Known Brand Match | Compares against official brand domains | Brand comparison |

### Dropship Markup Detector (4 checks)
| Check | What it does | Data sources |
|-------|-------------|--------------|
| Source Price Check | Finds the product on AliExpress/Alibaba | AliExpress, Alibaba |
| Seller Price Check | Extracts seller price and evaluates claims | Seller's site |
| Seller Reputation | Evaluates store legitimacy indicators | ScamAdviser, Trustpilot |
| Domain Trust | Domain age for the seller's website | whois.com |

### Generic Scam Analyzer (3 checks)
Catches romance scams, investment fraud, lottery scams, tech support scams, and more.

## Live Test Results

All tests run against real TinyFish + OpenAI APIs:

| Scenario | Verdict | Score | Checks | Time |
|----------|---------|-------|--------|------|
| **Job Scam** — WhatsApp recruiter, $185k, no experience, gmail | likely_scam | 0.99 | 6/6 RED | 779s |
| **Phishing** — Fake DBS Bank SMS with spoofed URL | likely_scam | 0.99 | 5/5 RED | 518s |
| **Dropship** — Italian chair store, $399 vs $45 AliExpress | likely_scam | 0.98 | 3 RED, 1 YELLOW | 1279s |
| **Dropship** — LED strips, $49.99 vs $3.47 (1,340% markup) | likely_scam | 0.99 | 3 RED, 1 YELLOW | 1541s |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite + TypeScript + Tailwind CSS + Framer Motion |
| **Backend** | FastAPI + Python |
| **Orchestration** | OpenAI Agents SDK (gpt-4.1) with `as_tool()` pattern |
| **Web Agents** | TinyFish `/run-sse` API with SSE streaming |
| **Deployment** | Vercel (frontend) |

## Features

- **Multi-type scam detection** — Job scams, phishing, dropship markup, generic
- **Skills-based architecture** — Each scam type is a self-contained skill agent, extensible by adding a file
- **Real-time dashboard** — Check cards with green/yellow/red status, animated progress
- **Developer mode** — Toggle to see TinyFish goals, raw API responses, and agent reasoning
- **Conversation history** — Sidebar with past scans, click to replay
- **Chat follow-up** — Ask clarifying questions after a verdict
- **Skills page** — Browse all detection skills and their criteria at `/#/skills`

## Quick Start

```bash
# Clone
git clone https://github.com/lim-4158/anti-fishy-scam.git
cd anti-fishy-scam

# Environment
cp .env.example .env
# Add your TINYFISH_API_KEY and OPENAI_API_KEY to .env

# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python main.py  # runs on :8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev  # runs on :5173
```

## Project Structure

```
anti-fishy-scam/
├── backend/
│   ├── main.py                 # FastAPI app, SSE streaming, conversation persistence
│   ├── config.py               # Environment config
│   ├── models.py               # Pydantic models
│   ├── orchestration/
│   │   └── orchestrator.py     # Main orchestrator agent (classifies + routes)
│   ├── tools/
│   │   └── tinyfish.py         # TinyFish API wrapper (@function_tool)
│   ├── skills/
│   │   ├── job_scam.py         # Job scam skill (6 checks)
│   │   ├── phishing.py         # Phishing skill (5 checks)
│   │   ├── dropship.py         # Dropship skill (4 checks)
│   │   └── generic.py          # Generic scam skill (3 checks)
│   └── tests/
│       ├── test_integration.py # Real API integration tests
│       └── test_api.py         # Unit tests (24 passing)
├── frontend/
│   ├── src/
│   │   ├── components/         # React components (Dashboard, CheckCard, Sidebar, etc.)
│   │   ├── hooks/useAnalysis.ts # SSE streaming state machine
│   │   ├── data/skills.ts      # Skill definitions for skills page
│   │   └── lib/api.ts          # API client with seed data fallback
├── data/conversations/          # Persisted conversation JSON files
├── docs/
│   ├── tinyfish_reference.md   # Consolidated TinyFish API reference
│   └── test_findings.md        # Integration test results
└── API_CONTRACT.md             # Frontend-backend SSE event contract
```
