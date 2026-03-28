# AntiFishy — Don't Get Hooked

Scam detection tool powered by TinyFish web agents + OpenAI. Built for the TinyFish Hackathon 2026.

Paste a suspicious URL, job posting, recruiter message, or deal — AntiFishy dispatches AI web agents to verify it across multiple sources in real-time.

## Features
- Multi-type scam detection (job scams, phishing, dropship markup, generic)
- Real-time verification via TinyFish browser agents
- Parallel checks with live progress dashboard
- Evidence-based verdicts with expandable details

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + OpenAI Agents SDK + TinyFish API
- **Skills**: 4 specialized scam detection agents with 18+ verification checks

## Quick Start
```bash
# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python main.py

# Frontend
cd frontend && npm install && npm run dev
```

## Team
Built at NUS for the TinyFish $2M Pre-Accelerator Hackathon, March 2026.
